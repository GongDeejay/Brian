import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Eye, Award, HelpCircle, Activity, Zap, Settings2, Sparkles, Info, Download } from 'lucide-react';
import { ChangeDetectionConfig, ChangeDetectionResult, ChangeDetectionTrial, ColorSquare, TaskFeedbackMode } from '../types/wm';
import { calculateCowanK, evaluateKScore } from '../utils/statistics';
import { soundManager } from '../utils/audio';
import { shuffled } from '../utils/random';
import { sampleMemoryColors, pickChangeColor } from '../utils/color';
import { fireConfetti } from '../utils/motion';
import { downloadSessionJson, sessionFileName } from '../utils/exportJson';
import { useTaskTimers } from '../hooks/useTaskTimers';
import { useFocusGuard } from '../hooks/useFocusGuard';
import { ProgressBar } from './ProgressBar';
import { AbortControl } from './AbortControl';

interface ChangeDetectionTaskProps {
  onSaveResult: (result: ChangeDetectionResult) => void;
}

/** Fixation preview duration before each memory array (ms). */
const FIXATION_MS = 500;
/** Inter-trial pause after a response (ms). */
const FEEDBACK_PAUSE_MS = 600;
/** Rough response-time allowance used only for the remaining-time readout. */
const RESPONSE_ALLOWANCE_MS = 1000;

// Predefined difficulty presets for visual change detection
const DIFFICULTY_PRESETS = [
  {
    id: 'easy',
    name: '新手入门',
    tag: '容易',
    sampleDurationMs: 600, // 600ms long flash
    delayDurationMs: 600, // shorter delay
    setSizes: [3, 4, 5],
    trialsPerSetSize: 4,
    description: '延长至 600ms 观察时间，较小阵列，适合初次体验与习惯流程',
  },
  {
    id: 'standard',
    name: '经典学术',
    tag: '标准',
    sampleDurationMs: 250, // 250ms comfortable
    delayDurationMs: 900,
    setSizes: [4, 6, 8],
    trialsPerSetSize: 4,
    description: '约 250ms 闪烁，经典 Cowan (2001) 阵列标准',
  },
  {
    id: 'hard',
    name: '极速极限',
    tag: '极难',
    sampleDurationMs: 120, // 120ms ultra fast
    delayDurationMs: 1000,
    setSizes: [4, 6, 8],
    trialsPerSetSize: 4,
    description: '仅 120ms 超快速瞬时呈现，考验高阶神经感知与表征编码',
  },
] as const;

// Colour pool lives in utils/color.ts: it holds at least 2x the maximum set
// size, so a change probe colour that is absent from the memory array always
// exists (see pickChangeColor).

// Generate non-overlapping positions for N squares
function generateSquarePositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const minDistance = 18; // percent distance to prevent clutter

  let attempts = 0;
  while (positions.length < count && attempts < 500) {
    attempts++;
    const x = Math.floor(Math.random() * 70) + 15; // 15% - 85%
    const y = Math.floor(Math.random() * 65) + 18; // 18% - 83%

    const tooClose = positions.some(
      (pos) => Math.hypot(pos.x - x, pos.y - y) < minDistance
    );

    if (!tooClose) {
      positions.push({ x, y });
    }
  }

  // Fallback grid if randomized placement takes too many attempts
  if (positions.length < count) {
    const gridCols = 4;
    for (let i = positions.length; i < count; i++) {
      const row = Math.floor(i / gridCols);
      const col = i % gridCols;
      positions.push({
        x: 20 + col * 20,
        y: 25 + row * 25,
      });
    }
  }

  return positions;
}

export const ChangeDetectionTask = ({ onSaveResult }: ChangeDetectionTaskProps) => {
  const [config, setConfig] = useState<ChangeDetectionConfig>({
    setSizes: [4, 6, 8],
    trialsPerSetSize: 4, // 12 total trials (balance speed & accuracy)
    sampleDurationMs: 350, // default friendly duration (was 180ms)
    delayDurationMs: 900, // 900ms blank retention
    difficultyPreset: 'standard',
  });

  // Assessment by default: no per-trial correctness feedback (see N-back task).
  const [feedbackMode, setFeedbackMode] = useState<TaskFeedbackMode>('assessment');

  // 'idle' | 'fixation' | 'sample' | 'delay' | 'test' | 'completed'
  const [taskState, setTaskState] = useState<'idle' | 'fixation' | 'sample' | 'delay' | 'test' | 'completed'>('idle');

  const [currentTrialIdx, setCurrentTrialIdx] = useState<number>(0);
  const [currentTrial, setCurrentTrial] = useState<ChangeDetectionTrial | null>(null);
  const [trialFeedbacks, setTrialFeedbacks] = useState<string | null>(null);
  const [hasResponded, setHasResponded] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const trialsRef = useRef<ChangeDetectionTrial[]>([]);
  const testPhaseStartTime = useRef<number>(0);
  /**
   * Idempotency guard for the current trial (mirrors NBackTask's
   * `respondedInCurrentTrial`). Reset at the start of every trial; once true, no
   * further answer for that trial can be registered.
   */
  const respondedRef = useRef<boolean>(false);
  /** Guards against finishing/saving the same session twice. */
  const finishedRef = useRef<boolean>(false);
  /** Re-arms whatever the pause interrupted. */
  const resumeActionRef = useRef<(() => void) | null>(null);

  // All timers (including the 600ms feedback pause) are tracked centrally, so
  // abort / pause / unmount cancel every one of them.
  const timers = useTaskTimers();

  // Result state
  const [finalResult, setFinalResult] = useState<ChangeDetectionResult | null>(null);

  const { validityRef, resetValidity, finalizeValidity } = useFocusGuard({
    active: taskState === 'fixation' || taskState === 'sample' || taskState === 'delay' || taskState === 'test',
    onInterrupt: () => {
      timers.clearAll();
      setIsPaused(true);
    },
  });

  // Pre-generate all balanced trials (50% change, 50% same across set sizes)
  const generateTrials = useCallback(() => {
    const trialList: ChangeDetectionTrial[] = [];
    let trialCounter = 0;

    config.setSizes.forEach((setSize) => {
      for (let i = 0; i < config.trialsPerSetSize; i++) {
        // 50% change trials
        const isChanged = i % 2 === 1;

        // Distinct set-size colours (unbiased Fisher-Yates sample of the pool)
        const memoryColors = sampleMemoryColors(setSize);
        const positions = generateSquarePositions(setSize);

        const memorySquares: ColorSquare[] = positions.map((pos, idx) => ({
          id: idx,
          x: pos.x,
          y: pos.y,
          color: memoryColors[idx] ?? '#64748b',
        }));

        // Select probe index
        const probeIndex = Math.floor(Math.random() * setSize);

        // Test squares: clone memory squares, change colour of probe if isChanged
        const testSquares: ColorSquare[] = memorySquares.map((sq, idx) => {
          if (idx === probeIndex && isChanged) {
            // pickChangeColor guarantees a colour that is not present anywhere in
            // the memory array, so the change is always visible and never
            // introduces a duplicate square. The old fallback ('#ffffff') made
            // ~10% of change trials no-ops and ~90% of arrays contain a duplicate
            // white square at set size 10.
            const newColor = pickChangeColor(memorySquares.map((s) => s.color));
            return { ...sq, color: newColor };
          }
          return { ...sq };
        });

        trialList.push({
          trialIndex: trialCounter++,
          setSize,
          memorySquares,
          testSquares,
          changedIndex: isChanged ? probeIndex : null,
          probeIndex,
          isChanged,
          userResponseChanged: null,
          responseTimeMs: null,
          isCorrect: false,
          isHit: false,
          isFalseAlarm: false,
        });
      }
    });

    // Shuffle the trials across set sizes (uniform Fisher-Yates, not the biased
    // `sort(() => Math.random() - 0.5)`; the old shuffle made the first trial
    // come from one set size ~43% of the time instead of 33.3%).
    trialsRef.current = shuffled(trialList);
  }, [config]);

  // Start task
  const startTask = () => {
    timers.clearAll();
    finishedRef.current = false;
    respondedRef.current = false;
    setHasResponded(false);
    setIsPaused(false);
    setTrialFeedbacks(null);
    resetValidity();

    generateTrials();
    setCurrentTrialIdx(0);
    setFinalResult(null);
    runTrial(0);
  };

  // Run single trial sequence: Fixation -> Sample -> Delay -> Test
  const runTrial = (trialIndex: number) => {
    if (finishedRef.current) return;
    if (trialIndex >= trialsRef.current.length) {
      finishTask();
      return;
    }

    const trial = trialsRef.current[trialIndex];
    if (!trial) {
      finishTask();
      return;
    }

    setCurrentTrialIdx(trialIndex);
    setCurrentTrial(trial);
    setTrialFeedbacks(null);
    // A fresh trial may accept exactly one answer.
    respondedRef.current = false;
    setHasResponded(false);
    resumeActionRef.current = () => runTrial(trialIndex);

    // 1. Fixation phase (500ms)
    setTaskState('fixation');
    soundManager.playTick();

    timers.schedule(() => {
      // 2. Memory Sample phase (flash)
      setTaskState('sample');
      soundManager.playStimulusOnset();

      timers.schedule(() => {
        // 3. Retention Delay phase
        setTaskState('delay');

        timers.schedule(() => {
          // 4. Test probe phase (wait for response)
          setTaskState('test');
          testPhaseStartTime.current = performance.now();
        }, config.delayDurationMs);
      }, config.sampleDurationMs);
    }, FIXATION_MS);
  };

  // Handle user response: Changed or Same
  const handleUserAnswer = useCallback((userSaidChanged: boolean) => {
    // CRITICAL: `taskState` alone is not an idempotency guard, because it stays
    // 'test' for the whole 600ms feedback pause. Without this check a second
    // answer would overwrite the first response for this trial AND schedule a
    // SECOND runTrial(currentTrialIdx + 1) timer — two parallel trial chains,
    // every trial presented twice, finishTask()/onSaveResult firing twice and two
    // history records sharing one id.
    if (taskState !== 'test' || isPaused || !currentTrial || respondedRef.current) return;

    respondedRef.current = true;
    setHasResponded(true);

    const rt = performance.now() - testPhaseStartTime.current;
    const trial = trialsRef.current[currentTrialIdx];
    if (!trial) return;

    const isHit = trial.isChanged && userSaidChanged;
    const isFalseAlarm = !trial.isChanged && userSaidChanged;
    const isCorrect = userSaidChanged === trial.isChanged;

    trial.userResponseChanged = userSaidChanged;
    trial.responseTimeMs = rt;
    trial.isCorrect = isCorrect;
    trial.isHit = isHit;
    trial.isFalseAlarm = isFalseAlarm;

    // Correctness feedback only in practice mode.
    if (feedbackMode === 'practice') {
      if (isCorrect) {
        soundManager.playSuccess();
        setTrialFeedbacks('✓ 正确判定');
      } else {
        soundManager.playError();
        setTrialFeedbacks('✗ 判定失误');
      }
    }

    // The trial is answered: a pause from here on resumes at the next trial
    // rather than replaying this one (which could accept a second answer).
    resumeActionRef.current = () => runTrial(currentTrialIdx + 1);

    // Brief inter-trial pause then next (tracked: cleared by abort/pause/unmount)
    timers.schedule(() => {
      runTrial(currentTrialIdx + 1);
    }, FEEDBACK_PAUSE_MS);
  }, [taskState, isPaused, currentTrial, currentTrialIdx, feedbackMode, timers]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (taskState === 'test' && !isPaused) {
        if (e.key === 'f' || e.key === 'F' || e.key === '1' || e.key === 'ArrowLeft') {
          e.preventDefault();
          handleUserAnswer(false); // Same / 未改变
        } else if (e.key === 'j' || e.key === 'J' || e.key === '2' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleUserAnswer(true); // Changed / 已改变
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [taskState, isPaused, handleUserAnswer]);

  // Resume after an interruption
  const handleResume = () => {
    setIsPaused(false);
    validityRef.current.trialRestarts += 1;
    const action = resumeActionRef.current;
    if (action) action();
    else runTrial(currentTrialIdx);
  };

  // Abort: stop every timer (including the untracked 600ms feedback timer that
  // used to re-enter the experiment ~0.6s after 中断调参) and drop the data.
  const handleAbort = () => {
    timers.clearAll();
    resumeActionRef.current = null;
    finishedRef.current = false;
    respondedRef.current = false;
    setHasResponded(false);
    setIsPaused(false);
    setTrialFeedbacks(null);
    setCurrentTrial(null);
    setTaskState('idle');
  };

  // Finish task and compute Cowan's K
  const finishTask = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    resumeActionRef.current = null;
    timers.clearAll();
    setIsPaused(false);

    setTaskState('completed');
    const allTrials = trialsRef.current;

    let totalHits = 0;
    let totalFalseAlarms = 0;
    let totalChanged = 0;
    let totalSame = 0;
    let totalRT = 0;

    const breakdown = config.setSizes.map((setSize) => {
      const setTrials = allTrials.filter((t) => t.setSize === setSize);
      let hits = 0;
      let misses = 0;
      let fas = 0;
      let crs = 0;

      setTrials.forEach((t) => {
        if (t.responseTimeMs) totalRT += t.responseTimeMs;
        if (t.isChanged) {
          totalChanged++;
          if (t.userResponseChanged === true) {
            hits++;
            totalHits++;
          } else {
            misses++;
          }
        } else {
          totalSame++;
          if (t.userResponseChanged === true) {
            fas++;
            totalFalseAlarms++;
          } else {
            crs++;
          }
        }
      });

      const { cowanK, hitRate, faRate } = calculateCowanK(
        setSize,
        hits,
        hits + misses,
        fas,
        fas + crs
      );

      return {
        setSize,
        trials: setTrials.length,
        hits,
        misses,
        falseAlarms: fas,
        correctRejections: crs,
        hitRate,
        falseAlarmRate: faRate,
        cowanK,
      };
    });

    // Overall Cowan's K is the mean across tested set sizes
    const meanK = breakdown.length > 0
      ? breakdown.reduce((acc, cur) => acc + cur.cowanK, 0) / breakdown.length
      : 0;
    const correctCount = allTrials.filter((t) => t.isCorrect).length;
    const overallAccuracy = allTrials.length > 0 ? correctCount / allTrials.length : 0;
    const meanReactionTimeMs = allTrials.length > 0 ? totalRT / allTrials.length : 0;

    const result: ChangeDetectionResult = {
      date: new Date().toLocaleDateString('zh-CN'),
      totalTrials: allTrials.length,
      overallAccuracy,
      meanCowanK: Number(meanK.toFixed(2)),
      breakdownBySetSize: breakdown,
      meanReactionTimeMs,
      validity: finalizeValidity(),
    };

    setFinalResult(result);
    onSaveResult(result);
    soundManager.playComplete();

    if (meanK >= 3.0) {
      fireConfetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  // Export this session as JSON (metrics + config snapshot + timestamp)
  const handleExport = () => {
    if (!finalResult) return;
    downloadSessionJson(sessionFileName('change_detection'), {
      app: '工作记忆训练与评估平台',
      task: 'change_detection',
      exportedAt: new Date().toISOString(),
      sessionDate: finalResult.date,
      feedbackMode,
      config,
      validity: finalResult.validity ?? null,
      result: finalResult,
      trials: trialsRef.current.map((t) => ({
        trialIndex: t.trialIndex,
        setSize: t.setSize,
        isChanged: t.isChanged,
        probeIndex: t.probeIndex,
        memoryColors: t.memorySquares.map((s) => s.color),
        probeColor: t.testSquares[t.probeIndex]?.color ?? null,
        userResponseChanged: t.userResponseChanged,
        responseTimeMs: t.responseTimeMs,
        isCorrect: t.isCorrect,
      })),
    });
  };

  const totalTrialsCount = trialsRef.current.length || (config.setSizes.length * config.trialsPerSetSize);
  // Set sizes actually used in this session (never hardcoded: the presets differ).
  const setSizeLabel = config.setSizes.join(' / ');
  const perTrialMs = FIXATION_MS + config.sampleDurationMs + config.delayDurationMs + RESPONSE_ALLOWANCE_MS + FEEDBACK_PAUSE_MS;
  const remainingTrials = Math.max(0, totalTrialsCount - (currentTrialIdx + 1));
  const etaMs = currentTrialIdx >= totalTrialsCount ? 0 : remainingTrials * perTrialMs + perTrialMs;
  const liveMessage = isPaused
    ? '实验已暂停，等待继续'
    : `第 ${currentTrialIdx + 1} 试次，共 ${totalTrialsCount} 试次，${taskState === 'fixation' ? '注视十字' : taskState === 'sample' ? '记忆阵列呈现中' : taskState === 'delay' ? '维持期' : '请判断探针颜色是否改变'}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Paradigm Intro Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                范式 3 · 视空间工作记忆容量极限 (K值)
              </span>
              <span className="text-xs text-slate-400 font-mono">Cowan (2001) / Luck & Vogel (1997)</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">视觉变化检测任务 (Change Detection)</h2>
            <p className="text-xs text-slate-400 mt-1">
              短瞬间闪烁多色方块阵列（可调节 100ms~1000ms），经历维持期间后重新呈现，判断目标方块颜色是否改变。通过公式 <strong>K = N × (H - F)</strong> 精准测定纯视觉表征容量极限。
            </p>
          </div>

          {taskState === 'idle' && (
            <button
              id="btn-start-change-detection"
              onClick={startTask}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow-lg shadow-amber-600/25 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>开始 K值 测定</span>
            </button>
          )}
        </div>
      </div>

      {/* Task Idle Screen */}
      {taskState === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Config panel */}
          <div className="md:col-span-5 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Settings2 className="w-4 h-4 text-amber-400" />
                <span>任务参数与难度配置</span>
              </div>
              <span className="text-[11px] text-amber-400/90 font-mono">自由调节</span>
            </div>

            {/* Difficulty Presets */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">难度预设 (Presets)</span>
                {config.difficultyPreset && (
                  <span className="text-[10px] text-amber-400 font-mono">
                    {config.difficultyPreset === 'easy' ? '推荐初学者' : config.difficultyPreset === 'standard' ? '学术基准' : '极限挑战'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTY_PRESETS.map((preset) => {
                  const isSelected = config.difficultyPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      id={`btn-cd-preset-${preset.id}`}
                      onClick={() => {
                        setConfig((prev) => ({
                          ...prev,
                          difficultyPreset: preset.id,
                          sampleDurationMs: preset.sampleDurationMs,
                          delayDurationMs: preset.delayDurationMs,
                          setSizes: [...preset.setSizes],
                          trialsPerSetSize: preset.trialsPerSetSize,
                        }));
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{preset.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                            preset.id === 'easy'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : preset.id === 'standard'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {preset.tag}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        闪烁 {preset.sampleDurationMs}ms
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sample Duration Slider (Flash Duration) */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>刺激呈现闪烁时长 (Flash Duration)</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {config.sampleDurationMs} ms
                </span>
              </div>
              <input
                id="range-cd-sample-duration"
                type="range"
                min="100"
                max="1000"
                step="50"
                value={config.sampleDurationMs}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setConfig((prev) => ({
                    ...prev,
                    sampleDurationMs: val,
                    difficultyPreset: 'custom',
                  }));
                }}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>100ms (极限超快)</span>
                <span>350ms (温和)</span>
                <span>600ms (充裕)</span>
                <span>1000ms (轻松)</span>
              </div>
              {/* Quick shortcut tags for common durations */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400">快捷预选:</span>
                {[150, 250, 400, 600, 800].map((dur) => (
                  <button
                    key={dur}
                    id={`btn-cd-duration-${dur}`}
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        sampleDurationMs: dur,
                        difficultyPreset: 'custom',
                      }))
                    }
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                      config.sampleDurationMs === dur
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {dur}ms
                  </button>
                ))}
              </div>
            </div>

            {/* Retention Delay Slider */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>维持期空白间隔 (Retention Delay)</span>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {config.delayDurationMs} ms
                </span>
              </div>
              <input
                id="range-cd-delay-duration"
                type="range"
                min="300"
                max="2000"
                step="100"
                value={config.delayDurationMs}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setConfig((prev) => ({
                    ...prev,
                    delayDurationMs: val,
                    difficultyPreset: 'custom',
                  }));
                }}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>300ms (极短)</span>
                <span>900ms (标准维持)</span>
                <span>2000ms (长时衰减)</span>
              </div>
            </div>

            {/* Set Size Configuration */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">阵列方块数量 (Set Sizes)</span>
                <span className="text-[11px] font-mono text-amber-300 font-bold">
                  {config.setSizes.join(', ')} 个方块
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '小阵列 [3, 4, 5]', sizes: [3, 4, 5], desc: '难度较低' },
                  { label: '经典 [4, 6, 8]', sizes: [4, 6, 8], desc: '标准学术' },
                  { label: '挑战 [6, 8, 10]', sizes: [6, 8, 10], desc: '高负荷' },
                ].map((item, idx) => {
                  const isCurrent =
                    config.setSizes.length === item.sizes.length &&
                    config.setSizes.every((v, i) => v === item.sizes[i]);
                  return (
                    <button
                      key={idx}
                      id={`btn-cd-setsizes-${idx}`}
                      onClick={() => {
                        setConfig((prev) => ({
                          ...prev,
                          setSizes: [...item.sizes],
                          difficultyPreset: 'custom',
                        }));
                      }}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-600/20 border-amber-500 text-amber-200 font-semibold'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback mode: assessment (default) vs practice */}
            <div className="space-y-1.5" role="group" aria-label="逐试次反馈模式">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">逐试次反馈 (Feedback)</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {feedbackMode === 'assessment' ? '评估模式（默认）' : '练习模式'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['assessment', 'practice'] as TaskFeedbackMode[]).map((mode) => (
                  <button
                    key={mode}
                    id={`btn-cd-feedback-${mode}`}
                    aria-pressed={feedbackMode === mode}
                    onClick={() => setFeedbackMode(mode)}
                    className={`py-1.5 text-xs rounded-xl border transition cursor-pointer ${
                      feedbackMode === mode
                        ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-semibold'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'assessment' ? '评估模式' : '练习模式'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                评估模式不显示逐试次正误对错（标准范式做法），以免策略调整与情绪唤醒污染 K 值；练习模式保留完整的对错文本与音效。
              </p>
            </div>

            {/* Trials per set size */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">每种阵列试次数目</span>
                <span className="text-[11px] text-slate-300 font-mono">
                  共计 {config.setSizes.length * config.trialsPerSetSize} 试次
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[2, 4, 6].map((count) => (
                  <button
                    key={count}
                    id={`btn-cd-trials-${count}`}
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        trialsPerSetSize: count,
                        difficultyPreset: 'custom',
                      }))
                    }
                    className={`py-1.5 text-xs rounded-xl border transition cursor-pointer ${
                      config.trialsPerSetSize === count
                        ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-semibold'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {count} 次 / 规模 ({count * config.setSizes.length} 轮)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right side: Instructions & Real-time Visualizer */}
          <div className="md:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">实验交互流程与按键说明</h3>
                  <p className="text-xs text-slate-400">
                    当前闪烁时长设为 <strong className="text-amber-300 font-mono">{config.sampleDurationMs} ms</strong>，若仍感觉吃力可继续在左侧延长。
                  </p>
                </div>
              </div>

              {/* Step by step timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">1</span>
                    <span>十字注视</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    盯着画面中央 <span className="text-amber-400 font-mono font-bold">+</span> 注视点预备 (500ms)。
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                    <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-200 flex items-center justify-center text-[10px]">2</span>
                    <span>记忆闪现</span>
                  </div>
                  <div className="text-[11px] text-amber-200/80">
                    方块阵列闪现 <strong className="text-amber-300 font-mono">{config.sampleDurationMs}ms</strong>，迅速扫视并脑中快照。
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">3</span>
                    <span>探针比对</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    经 {config.delayDurationMs}ms 保持后，判断带 <span className="text-amber-400 font-bold">「?」</span> 探针方块颜色是否变化。
                  </div>
                </div>
              </div>

              {/* Keyboard shortcuts tips */}
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>快捷键提示：</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>颜色未改变 / 相同:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold">F 或 1</kbd>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>颜色已改变 / 不同:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold">J 或 2</kbd>
                  </div>
                </div>
              </div>

              {/* Academic Formula Explainer */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Cowan's K 公式说明</span>
                </div>
                <p className="leading-relaxed">
                  容量极限 <span className="font-mono text-amber-300 font-bold">K = N × (H - F)</span>。通过扣除虚报率 (False Alarm)，消除瞎猜猜测效应。成人常模一般为 3.0 ~ 4.5 个客体。
                </p>
              </div>
            </div>

            <button
              id="btn-cd-idle-start"
              onClick={startTask}
              className="mt-6 w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>按当前配置开始实验 ({totalTrialsCount} 试次)</span>
            </button>
          </div>
        </div>
      )}

      {/* Running Experiment Stages */}
      {taskState !== 'idle' && taskState !== 'completed' && currentTrial && (
        <div className="task-surface bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center min-h-[400px] sm:min-h-[460px]">
          {/* Header Progress */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span>试次: <strong className="text-amber-300 font-mono">{currentTrialIdx + 1} / {totalTrialsCount}</strong></span>
              <span className="text-slate-600" aria-hidden="true">|</span>
              <span>阵列: <strong className="text-white font-mono">{currentTrial.setSize} 项</strong></span>
              <span className="text-slate-600 hidden sm:inline" aria-hidden="true">|</span>
              <span className="hidden sm:inline text-amber-400/80 font-mono">闪烁: {config.sampleDurationMs}ms</span>
            </div>
            <div className="flex items-center gap-3">
              {trialFeedbacks ? (
                <span className="text-amber-400 font-semibold animate-fade-in">{trialFeedbacks}</span>
              ) : (
                <span className="text-slate-400">
                  {taskState === 'fixation' && '注视十字点...'}
                  {taskState === 'sample' && `记忆彩色方块阵列 (${config.sampleDurationMs}ms)...`}
                  {taskState === 'delay' && '大脑维持保持期...'}
                  {taskState === 'test' && '探针位置颜色改变了吗？'}
                </span>
              )}
              <AbortControl onAbort={handleAbort} accent="amber" />
            </div>
          </div>

          {/* Overall progress + estimated remaining time */}
          <ProgressBar
            current={currentTrialIdx + 1}
            total={totalTrialsCount}
            etaMs={isPaused ? null : etaMs}
            accent="amber"
            className="mb-4"
          />

          {/* Screen-reader announcements for phase transitions */}
          <div className="sr-only" aria-live="polite">{liveMessage}</div>

          {/* Focus-loss pause notice */}
          {isPaused && (
            <div
              role="alert"
              className="w-full mb-4 p-4 rounded-xl bg-amber-950/40 border border-amber-700/40 text-xs text-amber-200 space-y-2 text-center"
            >
              <p className="font-semibold">检测到页面失去焦点，实验已暂停</p>
              <p className="leading-relaxed">
                为保障测量有效性，被中断的试次将从「注视十字」阶段重新呈现；若该试次已作答，则直接进入下一试次。中断次数与累计离开时长会作为数据有效性指标随结果一并报告。
              </p>
              <button
                id="btn-cd-resume"
                onClick={handleResume}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition cursor-pointer"
              >
                继续实验
              </button>
            </div>
          )}

          {/* Experiment Canvas Stage */}
          <div className="relative w-full max-w-lg h-56 sm:h-80 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner overflow-hidden flex items-center justify-center">
            {/* Fixation Cross (steady: a pulsing fixation point is itself a visual
                transient and is inappropriate for these paradigms) */}
            {(taskState === 'fixation' || taskState === 'delay') && (
              <div className="text-3xl font-light font-mono text-slate-500 select-none">
                +
              </div>
            )}

            {/* Sample Phase: Memory Squares */}
            {taskState === 'sample' && (
              <>
                {currentTrial.memorySquares.map((sq) => (
                  <div
                    key={sq.id}
                    className="absolute w-7 h-7 sm:w-8 sm:h-8 rounded-md shadow-md transition-none"
                    style={{
                      left: `${sq.x}%`,
                      top: `${sq.y}%`,
                      backgroundColor: sq.color,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </>
            )}

            {/* Test Phase: Probe Array */}
            {taskState === 'test' && (
              <>
                {currentTrial.testSquares.map((sq, idx) => {
                  const isProbe = idx === currentTrial.probeIndex;
                  return (
                    <div
                      key={sq.id}
                      className={`absolute w-7 h-7 sm:w-8 sm:h-8 rounded-md shadow-md transition-all ${
                        isProbe ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-110 z-10' : 'opacity-80'
                      }`}
                      style={{
                        left: `${sq.x}%`,
                        top: `${sq.y}%`,
                        backgroundColor: sq.color,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {isProbe && (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-950">
                          ?
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Interactive Response Controls (Visible during test phase) */}
          <div className="w-full max-w-md mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                id="btn-cd-answer-same"
                onClick={() => handleUserAnswer(false)}
                disabled={taskState !== 'test' || hasResponded || isPaused}
                aria-keyshortcuts="F 1"
                className={`py-3.5 rounded-xl font-bold text-sm flex flex-col items-center justify-center transition cursor-pointer ${
                  taskState === 'test' && !hasResponded && !isPaused
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-[0.98]'
                    : 'bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <span>颜色【未改变 / 相同】</span>
                <span className="text-[10px] font-normal opacity-70 mt-0.5">快捷键: F 或 1</span>
              </button>

              <button
                id="btn-cd-answer-changed"
                onClick={() => handleUserAnswer(true)}
                disabled={taskState !== 'test' || hasResponded || isPaused}
                aria-keyshortcuts="J 2"
                className={`py-3.5 rounded-xl font-bold text-sm flex flex-col items-center justify-center transition cursor-pointer ${
                  taskState === 'test' && !hasResponded && !isPaused
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 active:scale-[0.98]'
                    : 'bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <span>颜色【已改变 / 不同】</span>
                <span className="text-[10px] font-normal opacity-70 mt-0.5">快捷键: J 或 2</span>
              </button>
            </div>
            <p className="text-[11px] text-center text-slate-400">
              {hasResponded
                ? '已记录本题作答，请等待下一试次'
                : <>请仅关注带 <strong className="text-amber-400">黄色光环「?」</strong> 的目标方块颜色</>}
            </p>
          </div>
        </div>
      )}

      {/* Task Completed Screen */}
      {taskState === 'completed' && finalResult && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  视觉空间容量极限 (Cowan's K) 评估报告
                </h3>
                <p className="text-xs text-slate-400">
                  Cowan (2001) 经典视觉工作记忆独立槽位测定
                </p>
              </div>
            </div>
            <button
              id="btn-cd-restart"
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
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              {finalResult.validity && !finalResult.validity.isValid ? (
                <>
                  数据有效性提示：本会话记录到 <strong>{finalResult.validity.interruptions}</strong> 次页面失去焦点，
                  累计离开 <strong>{(finalResult.validity.totalAwayMs / 1000).toFixed(1)} 秒</strong>，
                  其中 {finalResult.validity.trialRestarts} 个试次被重新呈现。解释 K 值时请考虑这些中断。
                </>
              ) : (
                <>数据有效性：整个会话未发生中断，焦点保持良好（反馈模式：{feedbackMode === 'assessment' ? '评估模式' : '练习模式'}）。</>
              )}
            </span>
          </div>

          {/* Qualitative Evaluation Banner */}
          {(() => {
            const evalObj = evaluateKScore(finalResult.meanCowanK);
            return (
              <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${evalObj.badgeColor}`}>
                <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm block">
                    评估等级：{evalObj.rating} (K = {finalResult.meanCowanK.toFixed(2)})
                  </span>
                  <p className="opacity-90 mt-1">{evalObj.description}</p>
                </div>
              </div>
            );
          })()}

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">Cowan's K 容量极限</span>
              <span className="text-2xl font-bold font-mono text-amber-400">{finalResult.meanCowanK.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 block mt-1">典型健康常模 3.0~4.5</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">综合辨别准确率</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {(finalResult.overallAccuracy * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">命中率与正确拒绝</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">平均判定反应时</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {Math.round(finalResult.meanReactionTimeMs)}
                <span className="text-xs text-slate-400 font-normal ml-1">ms</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">提取与比对延迟</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">测试试次总数</span>
              <span className="text-2xl font-bold font-mono text-indigo-400">{finalResult.totalTrials}</span>
              <span className="text-[10px] text-slate-400 block mt-1">覆盖 Set Size {setSizeLabel}</span>
            </div>
          </div>

          {/* Breakdown by Set Size Table & Capacity Curve */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-3">
            <h4 className="font-semibold text-slate-200">不同阵列规模 (Set Size) 下的 K 值表现：</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {finalResult.breakdownBySetSize.map((b) => (
                <div key={b.setSize} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                    <span className="font-semibold text-white">阵列大小 N = {b.setSize}</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">K = {b.cowanK.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>命中率 (H):</span>
                      <span className="text-slate-200 font-mono">{b.hitRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>虚报率 (F):</span>
                      <span className="text-slate-200 font-mono">{b.falseAlarmRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              id="btn-cd-export-json"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>导出结果 (JSON)</span>
            </button>
            <button
              id="btn-cd-return-idle"
              onClick={() => setTaskState('idle')}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              完成并返回设置
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
