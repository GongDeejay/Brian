import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Calculator, Award, CheckCircle, AlertTriangle, ShieldAlert, Download } from 'lucide-react';
import { OSPANResult, OSPANSet, MathProblem, OSPANItem, TaskFeedbackMode } from '../types/wm';
import { soundManager } from '../utils/audio';
import { shuffled } from '../utils/random';
import { fireConfetti } from '../utils/motion';
import { downloadSessionJson, sessionFileName } from '../utils/exportJson';
import { useTaskTimers } from '../hooks/useTaskTimers';
import { useFocusGuard } from '../hooks/useFocusGuard';
import { ProgressBar } from './ProgressBar';
import { AbortControl } from './AbortControl';

interface OSPANTaskProps {
  onSaveResult: (result: OSPANResult) => void;
}

const POOL_LETTERS = ['F', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'L', 'B', 'M', 'K'];

/** Target letter presentation time (ms). */
const LETTER_DURATION_MS = 1100;
/** Brief pause between sets (ms). */
const INTER_SET_PAUSE_MS = 700;
/** Rough per-item / per-set estimates used only for the remaining-time readout. */
const ITEM_ESTIMATE_MS = 5600;
const RECALL_ESTIMATE_MS = 4000;

// Helper to generate realistic cognitive arithmetic problems: (A op B) op C = D
function generateMathProblem(): MathProblem {
  const op1 = Math.random() > 0.5 ? '×' : '/';
  let a: number, b: number, inter: number;

  if (op1 === '×') {
    a = Math.floor(Math.random() * 6) + 2; // 2..7
    b = Math.floor(Math.random() * 5) + 2; // 2..6
    inter = a * b;
  } else {
    b = Math.floor(Math.random() * 5) + 2; // 2..6
    inter = Math.floor(Math.random() * 6) + 2; // 2..7
    a = b * inter;
  }

  const op2 = Math.random() > 0.5 ? '+' : '-';
  const c = Math.floor(Math.random() * 6) + 1; // 1..6
  const trueResult = op2 === '+' ? inter + c : inter - c;

  const isActuallyCorrect = Math.random() > 0.5;
  let displayedAnswer = trueResult;

  if (!isActuallyCorrect) {
    const deviation = (Math.floor(Math.random() * 3) + 1) * (Math.random() > 0.5 ? 1 : -1);
    displayedAnswer = trueResult + deviation;
  }

  return {
    equation: `(${a} ${op1} ${b}) ${op2} ${c} = ${displayedAnswer}`,
    displayedAnswer,
    isCorrect: isActuallyCorrect,
  };
}

export const OSPANTask = ({ onSaveResult }: OSPANTaskProps) => {
  // Config: spans to test. Default: spans 2, 3, 4, 5
  const [testMode, setTestMode] = useState<'standard' | 'quick'>('standard');

  // Assessment by default: no per-trial correctness feedback (see N-back task).
  const [feedbackMode, setFeedbackMode] = useState<TaskFeedbackMode>('assessment');

  // Task execution state
  // 'idle' | 'math' | 'letter' | 'recall' | 'completed'
  const [taskState, setTaskState] = useState<'idle' | 'math' | 'letter' | 'recall' | 'completed'>('idle');

  // Set management
  const [currentSetIdx, setCurrentSetIdx] = useState<number>(0);
  const [currentItemIdx, setCurrentItemIdx] = useState<number>(0);

  // Current problem & letter
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [currentTargetLetter, setCurrentTargetLetter] = useState<string | null>(null);

  // User input during recall
  const [userRecalledSequence, setUserRecalledSequence] = useState<string[]>([]);

  // Practice-mode feedback text + interaction guards
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [hasAnsweredMath, setHasAnsweredMath] = useState<boolean>(false);
  const [hasSubmittedRecall, setHasSubmittedRecall] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Timing
  const mathStartTime = useRef<number>(0);
  const setsRef = useRef<OSPANSet[]>([]);
  const mathResponsesRef = useRef<{ correct: boolean; rt: number }[]>([]);
  /** Idempotency guards: one answer per item, one submission per set. */
  const mathAnsweredRef = useRef<boolean>(false);
  const recallSubmittedRef = useRef<boolean>(false);
  const finishedRef = useRef<boolean>(false);
  /** Re-arms whatever the focus-loss pause interrupted. */
  const resumeActionRef = useRef<(() => void) | null>(null);

  // Every timer is tracked centrally (cleared on abort, pause and unmount).
  const timers = useTaskTimers();

  // Results
  const [finalResult, setFinalResult] = useState<OSPANResult | null>(null);

  const { validityRef, resetValidity, finalizeValidity } = useFocusGuard({
    active: taskState === 'math' || taskState === 'letter' || taskState === 'recall',
    onInterrupt: () => {
      timers.clearAll();
      setIsPaused(true);
    },
  });

  // Prepare sets sequence
  const prepareSets = useCallback(() => {
    const spanList = testMode === 'quick' ? [2, 3, 4] : [2, 3, 4, 5];
    const generatedSets: OSPANSet[] = spanList.map((span, idx) => {
      // Pick unique random letters for this set (uniform Fisher-Yates sample)
      const shuffledLetters = shuffled(POOL_LETTERS).slice(0, span);
      const items: OSPANItem[] = shuffledLetters.map((letter) => ({
        problem: generateMathProblem(),
        targetLetter: letter,
      }));

      return {
        setIndex: idx,
        spanLength: span,
        items,
        userRecalledLetters: [],
        isAllCorrectRecall: false,
        correctRecallCount: 0,
      };
    });

    setsRef.current = generatedSets;
    mathResponsesRef.current = [];
  }, [testMode]);

  // Start OSPAN
  const startTask = () => {
    timers.clearAll();
    finishedRef.current = false;
    mathAnsweredRef.current = false;
    recallSubmittedRef.current = false;
    setHasAnsweredMath(false);
    setHasSubmittedRecall(false);
    setIsPaused(false);
    setLastFeedback(null);
    setFinalResult(null);
    resetValidity();

    prepareSets();
    setCurrentSetIdx(0);
    setCurrentItemIdx(0);
    setUserRecalledSequence([]);

    // Launch first item of first set
    startMathStep(0, 0);
  };

  // Step 1: Show Math problem
  const startMathStep = (setIdx: number, itemIdx: number) => {
    const currentSet = setsRef.current[setIdx];
    if (!currentSet) return;
    const item = currentSet.items[itemIdx];
    if (!item) return;

    mathAnsweredRef.current = false;
    recallSubmittedRef.current = false;
    setHasAnsweredMath(false);
    setHasSubmittedRecall(false);
    setLastFeedback(null);

    setCurrentSetIdx(setIdx);
    setCurrentItemIdx(itemIdx);
    setCurrentProblem(item.problem);
    setCurrentTargetLetter(null);
    setTaskState('math');
    mathStartTime.current = performance.now();
    resumeActionRef.current = () => startMathStep(setIdx, itemIdx);
    soundManager.playStimulusOnset();
  };

  // Step 2: User responds to math equation
  const handleMathAnswer = (userSaidTrue: boolean) => {
    // The idempotency guard keeps a double key press / double tap from pushing
    // two responses and starting two letter-advance timer chains.
    if (taskState !== 'math' || isPaused || !currentProblem || mathAnsweredRef.current) return;

    mathAnsweredRef.current = true;
    setHasAnsweredMath(true);

    const rt = performance.now() - mathStartTime.current;
    const isMathCorrect = userSaidTrue === currentProblem.isCorrect;

    // Correctness feedback is suppressed in assessment mode.
    if (feedbackMode === 'practice') {
      if (isMathCorrect) {
        soundManager.playSuccess();
        setLastFeedback('✓ 运算正确');
      } else {
        soundManager.playError();
        setLastFeedback('✗ 运算失误');
      }
    }

    // Save math performance
    mathResponsesRef.current.push({ correct: isMathCorrect, rt });
    const currentSet = setsRef.current[currentSetIdx];
    currentSet.items[currentItemIdx].userAnsweredCorrectMath = isMathCorrect;
    currentSet.items[currentItemIdx].mathResponseTimeMs = rt;

    // Transition to target letter presentation
    showLetterThenAdvance(currentSetIdx, currentItemIdx);
  };

  // Present the target letter for this item, then advance (or move to recall).
  const showLetterThenAdvance = (setIdx: number, itemIdx: number) => {
    const currentSet = setsRef.current[setIdx];
    if (!currentSet) return;

    setCurrentTargetLetter(currentSet.items[itemIdx].targetLetter);
    setTaskState('letter');
    resumeActionRef.current = () => showLetterThenAdvance(setIdx, itemIdx);
    soundManager.playStimulusOnset();

    // Show letter for 1000ms then advance
    timers.schedule(() => {
      if (itemIdx + 1 < currentSet.spanLength) {
        // Next item in the same set
        startMathStep(setIdx, itemIdx + 1);
      } else {
        // End of set -> Recall phase
        startRecallStep();
      }
    }, LETTER_DURATION_MS);
  };

  // Step 3: Recall phase
  const startRecallStep = () => {
    // Nothing pending to re-arm: a pause during recall must not replay a letter.
    resumeActionRef.current = null;
    recallSubmittedRef.current = false;
    setHasSubmittedRecall(false);
    setTaskState('recall');
    setUserRecalledSequence([]);
    soundManager.playTick();
  };

  // Letter button click during recall
  const handleSelectLetter = (letter: string) => {
    if (isPaused || hasSubmittedRecall) return;
    const currentSet = setsRef.current[currentSetIdx];
    if (!currentSet || userRecalledSequence.length >= currentSet.spanLength) return;

    soundManager.playTick();
    setUserRecalledSequence((prev) => [...prev, letter]);
  };

  // Undo last recall letter
  const handleUndoLetter = () => {
    if (isPaused || hasSubmittedRecall) return;
    setUserRecalledSequence((prev) => prev.slice(0, -1));
  };

  // Submit recall sequence
  const handleSubmitRecall = () => {
    // Double submission would evaluate the same set twice and schedule two
    // "next set" timers, so it is blocked explicitly.
    if (taskState !== 'recall' || isPaused || recallSubmittedRef.current) return;
    recallSubmittedRef.current = true;
    setHasSubmittedRecall(true);

    const currentSet = setsRef.current[currentSetIdx];
    if (!currentSet) return;

    const targetLetters = currentSet.items.map((it) => it.targetLetter);
    currentSet.userRecalledLetters = [...userRecalledSequence];

    // Check serial recall precision
    let correctCount = 0;
    let allMatch = userRecalledSequence.length === targetLetters.length;

    for (let i = 0; i < targetLetters.length; i++) {
      if (userRecalledSequence[i] === targetLetters[i]) {
        correctCount++;
      } else {
        allMatch = false;
      }
    }

    currentSet.correctRecallCount = correctCount;
    currentSet.isAllCorrectRecall = allMatch;

    // Set-level correctness feedback is suppressed in assessment mode.
    if (feedbackMode === 'practice') {
      if (allMatch) {
        soundManager.playSuccess();
        setLastFeedback('✓ 本序列完全正确');
      } else {
        soundManager.playError();
        setLastFeedback(`✗ 序位正确 ${correctCount} / ${targetLetters.length}`);
      }
    }

    // Check if more sets remain
    if (currentSetIdx + 1 < setsRef.current.length) {
      const nextSetIdx = currentSetIdx + 1;
      setCurrentSetIdx(nextSetIdx);
      setCurrentItemIdx(0);
      setUserRecalledSequence([]);
      resumeActionRef.current = () => startMathStep(nextSetIdx, 0);
      // Start next set after brief pause
      timers.schedule(() => {
        startMathStep(nextSetIdx, 0);
      }, INTER_SET_PAUSE_MS);
    } else {
      // Completed all sets!
      finishTask();
    }
  };

  // Resume after an interruption
  const handleResume = () => {
    setIsPaused(false);
    validityRef.current.trialRestarts += 1;
    resumeActionRef.current?.();
  };

  // Abort: stop all timers and return to setup without saving partial data.
  const handleAbort = () => {
    timers.clearAll();
    resumeActionRef.current = null;
    finishedRef.current = false;
    mathAnsweredRef.current = false;
    recallSubmittedRef.current = false;
    setHasAnsweredMath(false);
    setHasSubmittedRecall(false);
    setIsPaused(false);
    setLastFeedback(null);
    setCurrentProblem(null);
    setCurrentTargetLetter(null);
    setUserRecalledSequence([]);
    setTaskState('idle');
  };

  // Keyboard shortcut listener for Math phase
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (taskState !== 'math' || isPaused) return;
      if (e.key === 'y' || e.key === 'Y' || e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleMathAnswer(true);
      } else if (e.key === 'n' || e.key === 'N' || e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleMathAnswer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [taskState, isPaused, handleMathAnswer]);

  // Calculate final OSPAN metrics
  const finishTask = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    resumeActionRef.current = null;
    timers.clearAll();
    setIsPaused(false);

    setTaskState('completed');
    const allSets = setsRef.current;

    let absoluteScore = 0;
    let totalScore = 0;
    let maxPossibleScore = 0;

    allSets.forEach((s) => {
      maxPossibleScore += s.spanLength;
      totalScore += s.correctRecallCount;
      if (s.isAllCorrectRecall) {
        absoluteScore += s.spanLength;
      }
    });

    const mathResponses = mathResponsesRef.current;
    const mathCorrectCount = mathResponses.filter((m) => m.correct).length;
    const mathAccuracy = mathResponses.length > 0 ? mathCorrectCount / mathResponses.length : 1;
    const totalMathRT = mathResponses.reduce((acc, cur) => acc + cur.rt, 0);
    const meanMathRT = mathResponses.length > 0 ? totalMathRT / mathResponses.length : 0;

    const result: OSPANResult = {
      date: new Date().toLocaleDateString('zh-CN'),
      absoluteScore,
      totalScore,
      maxPossibleScore,
      mathAccuracy,
      meanMathRT,
      sets: allSets.map((s) => ({
        spanLength: s.spanLength,
        targetLetters: s.items.map((i) => i.targetLetter),
        recalledLetters: s.userRecalledLetters,
        allCorrect: s.isAllCorrectRecall,
      })),
      validity: finalizeValidity(),
    };

    setFinalResult(result);
    onSaveResult(result);
    soundManager.playComplete();

    if (maxPossibleScore > 0 && absoluteScore / maxPossibleScore >= 0.6) {
      fireConfetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  // Export this session as JSON (metrics + config snapshot + timestamp)
  const handleExport = () => {
    if (!finalResult) return;
    downloadSessionJson(sessionFileName('ospan'), {
      app: '工作记忆训练与评估平台',
      task: 'ospan',
      exportedAt: new Date().toISOString(),
      sessionDate: finalResult.date,
      feedbackMode,
      config: {
        testMode,
        spans: setsRef.current.map((s) => s.spanLength),
        letterDurationMs: LETTER_DURATION_MS,
        interSetPauseMs: INTER_SET_PAUSE_MS,
      },
      validity: finalResult.validity ?? null,
      result: finalResult,
    });
  };

  const totalSetsCount = setsRef.current.length || (testMode === 'quick' ? 3 : 4);
  const currentSpan = setsRef.current[currentSetIdx]?.spanLength || 2;
  const totalItems = setsRef.current.reduce((acc, s) => acc + s.spanLength, 0);
  const completedItems =
    setsRef.current.slice(0, currentSetIdx).reduce((acc, s) => acc + s.spanLength, 0) +
    currentItemIdx +
    (taskState === 'recall' ? 1 : 0);
  const etaMs =
    Math.max(0, totalItems - completedItems) * ITEM_ESTIMATE_MS +
    Math.max(0, setsRef.current.length - currentSetIdx) * RECALL_ESTIMATE_MS;
  const liveMessage = isPaused
    ? '实验已暂停，等待继续'
    : taskState === 'math'
    ? `第 ${currentSetIdx + 1} 轮，跨度 ${currentSpan}，算题阶段第 ${currentItemIdx + 1} 题`
    : taskState === 'letter'
    ? '请记住当前字母'
    : taskState === 'recall'
    ? `第 ${currentSetIdx + 1} 轮回忆阶段，跨度 ${currentSpan}`
    : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Paradigm Intro Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                范式 2 · 高负荷信息加工与存储
              </span>
              <span className="text-xs text-slate-400 font-mono">Turner & Engle (1989)</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">复杂运算跨度任务 (OSPAN)</h2>
            <p className="text-xs text-slate-400 mt-1">
              经典双任务范式（Dual-task）：一边做算术验算（加工负荷），一边记忆伴随字母（存储负荷），并严格按顺序回忆。流体智力 ($G_f$) 强预测指标。
            </p>
          </div>

          {taskState === 'idle' && (
            <button
              id="btn-start-ospan"
              onClick={startTask}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition shadow-lg shadow-cyan-600/25 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>开始 OSPAN 评估</span>
            </button>
          )}
        </div>
      </div>

      {/* Idle / Configuration Screen */}
      {taskState === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
              测试模式选择
            </h3>

            <div className="space-y-2">
              <button
                id="btn-ospan-mode-std"
                onClick={() => setTestMode('standard')}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  testMode === 'standard'
                    ? 'bg-cyan-600/20 border-cyan-500 text-white'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-semibold text-xs text-cyan-300">标准学术评估模式</div>
                <div className="text-[11px] text-slate-400 mt-0.5">跨度梯度 Span 2 → 5 (共4轮)</div>
              </button>

              <button
                id="btn-ospan-mode-quick"
                onClick={() => setTestMode('quick')}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  testMode === 'quick'
                    ? 'bg-cyan-600/20 border-cyan-500 text-white'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-semibold text-xs text-cyan-300">快速练习模式</div>
                <div className="text-[11px] text-slate-400 mt-0.5">跨度梯度 Span 2 → 4 (共3轮)</div>
              </button>
            </div>

            <div className="space-y-1.5" role="group" aria-label="逐试次反馈模式">
              <label className="text-xs text-slate-400 font-medium">逐试次反馈 (Feedback)</label>
              <div className="grid grid-cols-2 gap-2">
                {(['assessment', 'practice'] as TaskFeedbackMode[]).map((mode) => (
                  <button
                    key={mode}
                    id={`btn-ospan-feedback-${mode}`}
                    aria-pressed={feedbackMode === mode}
                    onClick={() => setFeedbackMode(mode)}
                    className={`py-2 text-xs rounded-xl border transition ${
                      feedbackMode === mode
                        ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200 font-semibold'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'assessment' ? '评估模式（默认）' : '练习模式'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                评估模式不给出算式与序列的即时对错反馈（标准范式做法），避免诱发策略改变与情绪唤醒；练习模式保留完整的对错文本与音效。
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>学术规范说明 (Engle 准则)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                受试者必须认真运算每一道题，运算正确率需<strong>达到 85% 以上</strong>，评估结果方才符合学术有效性。切勿放弃运算专心背字母！
              </p>
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[320px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Calculator className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-white">两段式双任务交替机制</h3>
            <div className="max-w-md text-xs text-slate-400 mt-2 space-y-2 text-left bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <span><strong>运算阶段：</strong>判断算式是否正确，按键盘【Y/正确】或【N/错误】。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <span><strong>存储阶段：</strong>紧接着屏幕闪烁 1 个目标字母（持续1秒），存入记忆。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <span><strong>回忆阶段：</strong>每轮结束后，按精确的先后出现顺序点击键盘回忆。</span>
              </div>
            </div>

            <button
              id="btn-ospan-idle-start"
              onClick={startTask}
              className="mt-6 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition shadow-lg shadow-cyan-600/20"
            >
              准备就绪，开始测试
            </button>
          </div>
        </div>
      )}

      {/* Task Phase 1: Math Equation Verification */}
      {taskState === 'math' && currentProblem && (
        <div className="task-surface bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-8 flex flex-col items-center min-h-[400px] sm:min-h-[440px]">
          {/* Header Progress */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800 pb-3 mb-4">
            <div>
              轮次: <span className="font-semibold text-cyan-300">{currentSetIdx + 1} / {totalSetsCount}</span>
              <span className="text-slate-500 mx-2" aria-hidden="true">|</span>
              跨度负荷: <span className="text-white font-mono font-bold">Span {currentSpan}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 font-medium">
                算题阶段 ({currentItemIdx + 1} / {currentSpan})
              </span>
              <AbortControl onAbort={handleAbort} accent="cyan" />
            </div>
          </div>

          <ProgressBar current={completedItems} total={totalItems} etaMs={isPaused ? null : etaMs} accent="cyan" className="mb-4" />
          <div className="sr-only" aria-live="polite">{liveMessage}</div>

          {isPaused && (
            <div role="alert" className="w-full mb-4 p-4 rounded-xl bg-amber-950/40 border border-amber-700/40 text-xs text-amber-200 space-y-2 text-center">
              <p className="font-semibold">检测到页面失去焦点，实验已暂停</p>
              <p className="leading-relaxed">中断次数与累计离开时长会作为数据有效性指标随结果一并报告。</p>
              <button
                id="btn-ospan-resume"
                onClick={handleResume}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition cursor-pointer"
              >
                继续实验
              </button>
            </div>
          )}

          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">
            请迅速验证等式是否成立
          </div>

          {feedbackMode === 'practice' && lastFeedback && (
            <p className="text-xs font-semibold text-cyan-300 mb-2 animate-fade-in">{lastFeedback}</p>
          )}

          {/* Math Equation display */}
          <div className="flex-1 flex flex-col items-center justify-center my-4">
            <div className="px-6 py-5 sm:px-8 sm:py-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl">
              <span className="text-3xl sm:text-5xl font-mono font-bold text-white tracking-wider">
                {currentProblem.equation}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              思考并做出判断，请勿为了背诵而故意放弃计算
            </p>
          </div>

          {/* Choice Buttons */}
          <div className="w-full max-w-md grid grid-cols-2 gap-3 sm:gap-4 mt-2">
            <button
              id="btn-math-correct"
              onClick={() => handleMathAnswer(true)}
              disabled={hasAnsweredMath || isPaused}
              aria-keyshortcuts="Y 1"
              className={`py-4 rounded-xl text-white font-bold text-sm sm:text-base transition shadow-lg flex flex-col items-center justify-center ${
                hasAnsweredMath || isPaused
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-emerald-600/90 hover:bg-emerald-500 shadow-emerald-600/20 cursor-pointer active:scale-[0.98]'
              }`}
            >
              <span>等式正确 [ 是 ]</span>
              <span className="text-[11px] font-normal opacity-80 mt-0.5">快捷键: Y 或 1</span>
            </button>
            <button
              id="btn-math-incorrect"
              onClick={() => handleMathAnswer(false)}
              disabled={hasAnsweredMath || isPaused}
              aria-keyshortcuts="N 2"
              className={`py-4 rounded-xl text-white font-bold text-sm sm:text-base transition shadow-lg flex flex-col items-center justify-center ${
                hasAnsweredMath || isPaused
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-rose-600/90 hover:bg-rose-500 shadow-rose-600/20 cursor-pointer active:scale-[0.98]'
              }`}
            >
              <span>等式错误 [ 否 ]</span>
              <span className="text-[11px] font-normal opacity-80 mt-0.5">快捷键: N 或 2</span>
            </button>
          </div>
        </div>
      )}

      {/* Task Phase 2: Memorize Target Letter */}
      {taskState === 'letter' && (
        <div className="task-surface bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center min-h-[400px] sm:min-h-[440px] text-center">
          <div className="w-full flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800 pb-3 mb-4">
            <span>
              轮次: <span className="font-semibold text-cyan-300">{currentSetIdx + 1} / {totalSetsCount}</span>
              <span className="text-slate-500 mx-2" aria-hidden="true">|</span>
              跨度负荷: <span className="text-white font-mono font-bold">Span {currentSpan}</span>
            </span>
            <AbortControl onAbort={handleAbort} accent="cyan" />
          </div>

          <ProgressBar current={completedItems} total={totalItems} etaMs={isPaused ? null : etaMs} accent="cyan" className="mb-6" />
          <div className="sr-only" aria-live="polite">{liveMessage}</div>

          {isPaused && (
            <div role="alert" className="w-full mb-4 p-4 rounded-xl bg-amber-950/40 border border-amber-700/40 text-xs text-amber-200 space-y-2 text-center">
              <p className="font-semibold">检测到页面失去焦点，实验已暂停</p>
              <p className="leading-relaxed">继续后当前字母会重新呈现一次，以避免编码被中断的残缺刺激。</p>
              <button
                id="btn-ospan-resume-letter"
                onClick={handleResume}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition cursor-pointer"
              >
                继续实验（重新呈现当前字母）
              </button>
            </div>
          )}

          <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-3">
            牢记此字母 (第 {currentItemIdx + 1} / {currentSpan} 个)
          </div>

          <div className="w-36 h-36 rounded-3xl bg-slate-950 border-2 border-cyan-500/50 flex items-center justify-center shadow-2xl shadow-cyan-500/10 animate-scale-in">
            <span className="text-7xl font-mono font-extrabold text-cyan-300">
              {currentTargetLetter}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-6">
            存入工作记忆暂存区...
          </p>
        </div>
      )}

      {/* Task Phase 3: Serial Sequence Recall Pad */}
      {taskState === 'recall' && (
        <div className="task-surface bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-8 flex flex-col items-center min-h-[420px] sm:min-h-[460px]">
          <div className="w-full flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800 pb-3 mb-4">
            <span className="text-cyan-300 font-semibold">
              序列回忆阶段 · 跨度负荷: Span {currentSpan}
            </span>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline">请按【出现顺序】依次点击对应字母</span>
              <AbortControl onAbort={handleAbort} accent="cyan" />
            </div>
          </div>

          <ProgressBar current={completedItems} total={totalItems} etaMs={isPaused ? null : etaMs} accent="cyan" className="mb-4" />
          <div className="sr-only" aria-live="polite">{liveMessage}</div>

          {isPaused && (
            <div role="alert" className="w-full mb-4 p-4 rounded-xl bg-amber-950/40 border border-amber-700/40 text-xs text-amber-200 space-y-2 text-center">
              <p className="font-semibold">检测到页面失去焦点，实验已暂停</p>
              <p className="leading-relaxed">中断次数与累计离开时长会作为数据有效性指标随结果一并报告。</p>
              <button
                id="btn-ospan-resume-recall"
                onClick={handleResume}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition cursor-pointer"
              >
                继续回忆与作答
              </button>
            </div>
          )}

          {feedbackMode === 'practice' && lastFeedback && (
            <p className="text-xs font-semibold text-cyan-300 mb-2 animate-fade-in">{lastFeedback}</p>
          )}

          {/* Slots display */}
          <div className="w-full max-w-md my-4">
            <div className="text-[11px] text-slate-400 mb-2 flex justify-between">
              <span>已记录序列 ({userRecalledSequence.length} / {currentSpan})</span>
              {userRecalledSequence.length > 0 && (
                <button
                  id="btn-ospan-undo"
                  onClick={handleUndoLetter}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  撤销上一个
                </button>
              )}
            </div>
            <div className="flex gap-2 justify-center p-3 bg-slate-950 rounded-2xl border border-slate-800 min-h-[64px] items-center">
              {Array.from({ length: currentSpan }).map((_, slotIdx) => {
                const letter = userRecalledSequence[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl font-bold font-mono transition-all ${
                      letter
                        ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200'
                        : 'border-dashed border-slate-700 bg-slate-900/40 text-slate-600'
                    }`}
                  >
                    {letter || slotIdx + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Letter Selection Grid */}
          <div className="w-full max-w-md my-2">
            <div className="grid grid-cols-4 gap-2.5">
              {POOL_LETTERS.map((letter) => {
                const countInSeq = userRecalledSequence.filter((l) => l === letter).length;
                return (
                  <button
                    key={letter}
                    id={`btn-recall-letter-${letter}`}
                    onClick={() => handleSelectLetter(letter)}
                    disabled={userRecalledSequence.length >= currentSpan || hasSubmittedRecall || isPaused}
                    className={`py-3 rounded-xl border text-base font-mono font-bold transition cursor-pointer ${
                      countInSeq > 0
                        ? 'bg-slate-800/80 border-slate-700 text-slate-400'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700/80 text-white hover:border-cyan-500/50 active:scale-95'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="w-full max-w-md mt-6">
            <button
              id="btn-submit-recall"
              onClick={handleSubmitRecall}
              disabled={userRecalledSequence.length === 0 || hasSubmittedRecall || isPaused}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition shadow-lg cursor-pointer ${
                userRecalledSequence.length === 0 || hasSubmittedRecall || isPaused
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/25'
              }`}
            >
              {hasSubmittedRecall
                ? '已提交本序列'
                : `提交该轮回忆 (${userRecalledSequence.length} / ${currentSpan})`}
            </button>
          </div>
        </div>
      )}

      {/* Task Completed Screen */}
      {taskState === 'completed' && finalResult && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  复杂运算跨度 (OSPAN) 评估报告
                </h3>
                <p className="text-xs text-slate-400">
                  Turner & Engle (1989) 经典流体智力容量量化
                </p>
              </div>
            </div>
            <button
              id="btn-ospan-restart"
              onClick={startTask}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>重新测试</span>
            </button>
          </div>

          {/* Data-validity indicator */}
          <div
            className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
              finalResult.validity && !finalResult.validity.isValid
                ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              {finalResult.validity && !finalResult.validity.isValid ? (
                <>
                  数据有效性提示：本会话记录到 <strong>{finalResult.validity.interruptions}</strong> 次页面失去焦点，
                  累计离开 <strong>{(finalResult.validity.totalAwayMs / 1000).toFixed(1)} 秒</strong>，
                  其中 {finalResult.validity.trialRestarts} 个项目被重新呈现。解释结果时请考虑这些中断。
                </>
              ) : (
                <>数据有效性：整个会话未发生中断，焦点保持良好（反馈模式：{feedbackMode === 'assessment' ? '评估模式' : '练习模式'}）。</>
              )}
            </span>
          </div>

          {/* Validity banner */}
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              finalResult.mathAccuracy >= 0.85
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
            }`}
          >
            {finalResult.mathAccuracy >= 0.85 ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold text-sm block">
                {finalResult.mathAccuracy >= 0.85 ? '学术有效性：有效评估 (Valid OSPAN)' : '学术有效性警告：运算正确率低于 85%'}
              </span>
              <p className="opacity-90 mt-1">
                运算阶段正确率为 <strong>{(finalResult.mathAccuracy * 100).toFixed(0)}%</strong>。
                {finalResult.mathAccuracy >= 0.85
                  ? '符合 Engle 心理测量学双任务标准，表明受试者在充分加工的同时保持了高负荷存储。'
                  : '心理测量学标准要求运算正确率达 85% 以上，以确保没有通过牺牲加工负荷来单边增加记忆得分。'}
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">绝对 OSPAN 得分</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {finalResult.absoluteScore}
                <span className="text-xs text-slate-400 font-normal ml-1">/ {finalResult.maxPossibleScore}</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">全对序列跨度和</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">总回忆项目数</span>
              <span className="text-2xl font-bold font-mono text-indigo-400">
                {finalResult.totalScore}
                <span className="text-xs text-slate-400 font-normal ml-1">/ {finalResult.maxPossibleScore}</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">序位完全正确项</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">运算加工正确率</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {(finalResult.mathAccuracy * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">标准阈值 ≥85%</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">算术平均决策耗时</span>
              <span className="text-2xl font-bold font-mono text-amber-400">
                {Math.round(finalResult.meanMathRT)}
                <span className="text-xs text-slate-400 font-normal ml-1">ms</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">加工速度指标</span>
            </div>
          </div>

          {/* Sets Breakdown Details */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-3">
            <h4 className="font-semibold text-slate-200">各跨度序列回忆复盘：</h4>
            <div className="space-y-2">
              {finalResult.sets.map((set, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-cyan-300">Span {set.spanLength}</span>
                    <div className="flex gap-1.5 items-center">
                      <span className="text-slate-400">目标:</span>
                      <span className="font-mono text-white font-semibold">[{set.targetLetters.join(' - ')}]</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5 items-center">
                      <span className="text-slate-400">你回忆:</span>
                      <span className="font-mono text-slate-200">[{set.recalledLetters.join(' - ')}]</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        set.allCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {set.allCorrect ? '完全正确' : '部分/失误'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              id="btn-ospan-export-json"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>导出结果 (JSON)</span>
            </button>
            <button
              id="btn-ospan-return-idle"
              onClick={() => setTaskState('idle')}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              完成并返回模式选择
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
