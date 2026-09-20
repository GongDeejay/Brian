import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CognitiveLoadConfig, GaborStimulus, GaborTaskType, GaborTrial, ParadigmStats, SessionReport } from '../types';
import { calculateGaborStats, GABOR_SIZE_PX, generateGaborStimulus, renderGaborOnCanvas } from '../services/gaborEngine';
import { DistractorOverlay } from './DistractorOverlay';
import { audioFeedback } from '../services/audioService';
import { RotateCcw, Brain, Eye, CheckCircle2, XCircle, AlertTriangle, Database } from 'lucide-react';

interface Props {
  cognitiveLoad: CognitiveLoadConfig;
  onSessionComplete?: (report: SessionReport<ParadigmStats>) => void;
}

/** Feedback is shown alone; inputs stay locked during this interval. */
const ITI_MS = 450;
/** Minimum number of new trials before a block can be recorded. */
const MIN_TRIALS_PER_SUBMISSION = 10;

export const GaborView: React.FC<Props> = ({ cognitiveLoad, onSessionComplete }) => {
  const [taskType, setTaskType] = useState<GaborTaskType>('information_integration');
  const [currentStimulus, setCurrentStimulus] = useState<GaborStimulus>(() =>
    generateGaborStimulus('information_integration')
  );
  const [trials, setTrials] = useState<GaborTrial[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean } | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [renderFailed, setRenderFailed] = useState<boolean>(false);
  const [submittedCount, setSubmittedCount] = useState<number>(0);
  /** Researcher-only view: displays the stimulus feature values and the rule. */
  const [showResearcherView, setShowResearcherView] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const trialStartRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const answeredStimulusRef = useRef<string>('');

  // Render the current Gabor at device-pixel resolution.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentStimulus) return;

    const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
    const backingSize = Math.round(GABOR_SIZE_PX * dpr);
    if (canvas.width !== backingSize || canvas.height !== backingSize) {
      canvas.width = backingSize;
      canvas.height = backingSize;
    }
    canvas.style.width = `${GABOR_SIZE_PX}px`;
    canvas.style.height = `${GABOR_SIZE_PX}px`;

    const ok = renderGaborOnCanvas(
      canvas,
      currentStimulus.spatialFrequency,
      currentStimulus.orientationDegrees,
      cognitiveLoad.perceptualNoiseLevel,
      currentStimulus.noiseSeed
    );
    setRenderFailed(!ok);
    if (!ok) return;

    // The stimulus is now painted: this is the moment the RT clock starts.
    trialStartRef.current = Date.now();
  }, [currentStimulus, cognitiveLoad.perceptualNoiseLevel]);

  const handleChoice = useCallback(
    (choice: 'A' | 'B') => {
      if (!currentStimulus || isLocked) return;
      // Synchronous per-trial lock: a double click cannot append two identical trials.
      if (answeredStimulusRef.current === currentStimulus.id) return;
      answeredStimulusRef.current = currentStimulus.id;

      const isCorrect = choice === currentStimulus.category;

      if (isCorrect) audioFeedback.playCorrect();
      else audioFeedback.playIncorrect();

      const trial: GaborTrial = {
        trialNumber: trials.length + 1,
        taskType,
        stimulus: currentStimulus,
        userChoice: choice,
        isCorrect,
        // Real measured RT (stimulus paint -> response); never a constant.
        reactionTimeMs: Date.now() - trialStartRef.current,
      };

      setTrials((prev) => [...prev, trial]);
      setLastFeedback({ isCorrect });

      // Feedback alone, then the next Gabor patch.
      setIsLocked(true);
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = window.setTimeout(() => {
        advanceTimerRef.current = null;
        setCurrentStimulus(generateGaborStimulus(taskType));
        setIsLocked(false);
      }, ITI_MS);
    },
    [currentStimulus, isLocked, taskType, trials.length]
  );

  // Keyboard: A / B.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const key = event.key.toLowerCase();
      if (key === 'a') {
        event.preventDefault();
        handleChoice('A');
      } else if (key === 'b') {
        event.preventDefault();
        handleChoice('B');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleChoice]);

  useEffect(
    () => () => {
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    },
    []
  );

  const currentTypeTrials = trials.filter((t) => t.taskType === taskType);
  const correctCount = currentTypeTrials.filter((t) => t.isCorrect).length;
  const accuracy = currentTypeTrials.length > 0 ? Math.round((correctCount / currentTypeTrials.length) * 100) : 0;

  /** Trials completed since the last recorded block (each record covers distinct trials). */
  const pendingTrials = trials.slice(submittedCount);
  const pendingStats = calculateGaborStats(pendingTrials);
  const overallStats = calculateGaborStats(trials);
  const canSubmit = pendingTrials.length >= MIN_TRIALS_PER_SUBMISSION;

  const handleSubmit = () => {
    if (!canSubmit || !onSessionComplete) return;
    onSessionComplete({
      stats: { task: 'gabor', gabor: pendingStats },
      durationSeconds: (Date.now() - sessionStartRef.current) / 1000,
    });
    setSubmittedCount(trials.length);
  };

  const resetTest = () => {
    if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = null;
    setTrials([]);
    setLastFeedback(null);
    setIsLocked(false);
    setSubmittedCount(0);
    answeredStimulusRef.current = '';
    sessionStartRef.current = Date.now();
    setCurrentStimulus(generateGaborStimulus(taskType));
  };

  const switchTaskType = (next: GaborTaskType) => {
    if (isLocked) return;
    setTaskType(next);
    setLastFeedback(null);
    answeredStimulusRef.current = '';
    setCurrentStimulus(generateGaborStimulus(next));
  };

  const covisGap =
    overallStats.rb.accuracy !== null && overallStats.ii.accuracy !== null
      ? overallStats.rb.accuracy - overallStats.ii.accuracy
      : null;

  const feedbackAnnouncement =
    lastFeedback === null ? '' : lastFeedback.isCorrect ? '分类正确' : '分类错误';

  return (
    <div className="flex flex-col gap-6">
      {/* Header Context Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
                认知双系统竞争 (COVIS Model)
              </span>
              <span className="text-xs text-slate-500 font-mono">Ashby &amp; Maddox (2005, 2011)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Gabor斑 规则分类 vs. 信息整合分类 (RB vs. II Task)
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
              认知心理学经典的条纹斑块分类测验。基于连续两维刺激：
              <span className="font-semibold text-slate-900">空间条纹频率 (Cycles)</span> 与
              <span className="font-semibold text-slate-900">倾斜朝向角 (Orientation)</span>。
              对比显式可言语规则 (Rule-Based) 与不可言语化的对角信息整合 (Information-Integration)。
              为保持效度，
              <span className="font-semibold text-slate-900">刺激的具体特征值默认对受试者隐藏</span>
              。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResearcherView((v) => !v)}
              aria-pressed={showResearcherView}
              title="研究者视图：显示刺激特征值与分类规则（对受试者显示会破坏信息整合条件的效度）"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                showResearcherView
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              {showResearcherView ? '关闭研究者视图' : '研究者视图'}
            </button>

            <button
              onClick={resetTest}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              清空重置
            </button>
          </div>
        </div>

        {showResearcherView && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 font-mono">
            <div className="font-sans font-bold mb-1">研究者视图（以下数值不得展示给受试者）：</div>
            <div>
              当前刺激 → 条纹频率 {currentStimulus.spatialFrequency}（像素相对单位，未按视角标定） · 朝向{' '}
              {currentStimulus.orientationDegrees}° · 刺激噪声种子 {currentStimulus.noiseSeed} · 正确类别{' '}
              {currentStimulus.category}
            </div>
            <div className="mt-1">
              RB 规则：频率 ≥ 5.0 → B，否则 A ｜ II 规则：10×频率 + 朝向 ≥ 95 → B，否则 A
            </div>
          </div>
        )}

        {/* Task Mode Switch Tabs */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100" role="group" aria-label="任务模式切换">
          <button
            onClick={() => switchTaskType('information_integration')}
            aria-pressed={taskType === 'information_integration'}
            className={`flex-1 py-2.5 px-3 text-xs rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all ${
              taskType === 'information_integration'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-200'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <div>
              <div>非言语信息整合 (Information-Integration)</div>
              <div className="text-[10px] font-normal text-slate-500">对角决策面 · 基底核尾状体网络 · 无法言语归纳</div>
            </div>
          </button>

          <button
            onClick={() => switchTaskType('rule_based')}
            aria-pressed={taskType === 'rule_based'}
            className={`flex-1 py-2.5 px-3 text-xs rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all ${
              taskType === 'rule_based'
                ? 'border-cyan-600 bg-cyan-50 text-cyan-900 ring-2 ring-cyan-200'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-4 h-4 text-cyan-600" aria-hidden="true" />
            <div>
              <div>显式单维规则 (Rule-Based)</div>
              <div className="text-[10px] font-normal text-slate-500">正交单维界限 · 前额叶言语工作记忆主导</div>
            </div>
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">当前模式试验次数</span>
            <span className="text-lg font-bold font-mono text-slate-900">{currentTypeTrials.length}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">当前模式准确率</span>
            <span className="text-lg font-bold font-mono text-indigo-600">
              {currentTypeTrials.length === 0 ? '未测得' : `${accuracy}%`}
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">平均反应时</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {overallStats.avgReactionTimeMs === null ? (
                <span className="text-sm text-slate-400">未测得</span>
              ) : (
                <>
                  {overallStats.avgReactionTimeMs}
                  <span className="text-xs font-normal text-slate-400">ms</span>
                </>
              )}
            </span>
            <span className="text-[10px] text-slate-400 block">基于 {overallStats.rtSampleCount} 次作答</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">刺激特征（受试者视图）</span>
            <span className="text-xs text-slate-500 block mt-1">已隐藏</span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-500">
          键盘操作：按 <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">A</kbd> 归入类别 A，按{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">B</kbd> 归入类别 B。
          <span className="ml-1 text-slate-400">
            已知局限：条纹频率为像素相对单位，未按视角 (cycles/degree) 标定，屏幕尺寸与观看距离不受控，因此不具备跨设备可比性；本任务也未实现阶梯法阈值测量。
          </span>
        </p>
      </div>

      {/* Main Testing Arena */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col items-center">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          实时数学合成 Gabor 斑刺激 (Mathematical Gabor Patch)
        </div>

        {/* Canvas Display */}
        <div className="relative p-2 bg-slate-950 rounded-2xl border-2 border-slate-700 shadow-xl mb-6">
          {renderFailed ? (
            <div
              className="flex flex-col items-center justify-center text-center px-6"
              style={{ width: GABOR_SIZE_PX, height: GABOR_SIZE_PX }}
              role="alert"
            >
              <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" aria-hidden="true" />
              <p className="text-xs text-amber-200 font-semibold">无法绘制刺激：当前浏览器未提供可用的 2D 画布上下文</p>
              <p className="text-[11px] text-slate-400 mt-1">请更换浏览器或关闭画布硬件加速限制后重试；此情况下不应继续作答。</p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={GABOR_SIZE_PX}
              height={GABOR_SIZE_PX}
              style={{ width: GABOR_SIZE_PX, height: GABOR_SIZE_PX }}
              className="rounded-xl block"
              role="img"
              aria-label="Gabor 斑刺激（条纹频率与朝向已隐藏）"
            />
          )}
          {cognitiveLoad.distractorInterference && !renderFailed && (
            <DistractorOverlay className="rounded-xl" intensity={cognitiveLoad.perceptualNoiseLevel + 25} />
          )}
        </div>

        {/* Decision Action Buttons */}
        <div className="flex items-center gap-4 w-full max-w-sm mb-6">
          <button
            onClick={() => handleChoice('A')}
            disabled={isLocked || renderFailed}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm text-white shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            归入类别 A (Category A)
          </button>

          <button
            onClick={() => handleChoice('B')}
            disabled={isLocked || renderFailed}
            className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-sm text-white shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            归入类别 B (Category B)
          </button>
        </div>

        {/* Feedback Section */}
        <div role="status" aria-live="polite">
          <span className="sr-only">{feedbackAnnouncement}</span>
          {lastFeedback && (
            <div className="pt-4 border-t border-slate-800 w-full text-center">
              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs ${
                  lastFeedback.isCorrect
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {lastFeedback.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <XCircle className="w-4 h-4" aria-hidden="true" />
                )}
                {lastFeedback.isCorrect ? '分类正确！' : '分类错误！'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recording panel: a Gabor run is open-ended, so the block is recorded explicitly */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              记录本轮结果
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              本任务为开放式试次，需手动提交才会写入认知画像。每次提交只记录上次提交之后新完成的试次（当前待记录{' '}
              {pendingTrials.length} 次，已记录 {submittedCount} 次）。至少需 {MIN_TRIALS_PER_SUBMISSION} 次才能形成可解释的样本。
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            提交并记录 {pendingTrials.length} 次试验
          </button>
        </div>

        {trials.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">II 条件正确率</span>
              <span className="text-base font-bold font-mono text-indigo-700">
                {overallStats.ii.accuracy === null ? '未测得' : `${overallStats.ii.accuracy}%`}
                <span className="text-[10px] font-normal text-slate-400 ml-1">({overallStats.ii.trials} 次)</span>
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">RB 条件正确率</span>
              <span className="text-base font-bold font-mono text-cyan-700">
                {overallStats.rb.accuracy === null ? '未测得' : `${overallStats.rb.accuracy}%`}
                <span className="text-[10px] font-normal text-slate-400 ml-1">({overallStats.rb.trials} 次)</span>
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">RB − II 差值 (COVIS 指标)</span>
              <span className="text-base font-bold font-mono text-slate-800">
                {covisGap === null ? '未测得' : `${covisGap > 0 ? '+' : ''}${covisGap}pp`}
              </span>
              <span className="text-[10px] text-slate-400 block">需两种条件各有样本才有意义</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">总试验数</span>
              <span className="text-base font-bold font-mono text-slate-800">{trials.length}</span>
            </div>
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-3">
          说明：RB − II 差值为 COVIS 双系统理论中常用的分离指标，但本实现未做等化难度匹配，两条件的经验难度未必等价，因此该差值仅供内部参考。
        </p>
      </div>
    </div>
  );
};
