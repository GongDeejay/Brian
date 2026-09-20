import React, { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { CognitiveLoadConfig, IDEDStage, IDEDTrial, ParadigmStats, SessionReport } from '../types';
import {
  calculateIDEDStats,
  describeIDEDStimulus,
  getStimuliForStage,
  IDED_STAGES_CONFIG,
  IDEDStimulusVisual,
  MAX_TRIALS_PER_STAGE,
} from '../services/idedEngine';
import { DistractorOverlay } from './DistractorOverlay';
import { audioFeedback } from '../services/audioService';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { RotateCcw, ShieldAlert, CheckCircle2, Award, Eye } from 'lucide-react';

interface Props {
  cognitiveLoad: CognitiveLoadConfig;
  celebrationEnabled: boolean;
  onSessionComplete?: (report: SessionReport<ParadigmStats>) => void;
}

/** Feedback is shown alone; inputs stay locked during this interval. */
const ITI_MS = 420;

interface Presented {
  stimuli: [IDEDStimulusVisual, IDEDStimulusVisual];
  /** Display position (0 = 左侧) of the reinforced stimulus on THIS trial. */
  reinforcedSide: 0 | 1;
}

export const IDEDView: React.FC<Props> = ({ cognitiveLoad, celebrationEnabled, onSessionComplete }) => {
  const [stagesCompleted, setStagesCompleted] = useState<number>(0);
  const [stageTrialIndex, setStageTrialIndex] = useState<number>(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [trials, setTrials] = useState<IDEDTrial[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; stageAdvanced: boolean } | null>(null);
  const [failedStage, setFailedStage] = useState<IDEDStage | null>(null);
  const [presented, setPresented] = useState<Presented | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  /** Researcher-only view: shows the dimension-revealing stage descriptions. */
  const [showResearcherView, setShowResearcherView] = useState<boolean>(false);

  const prefersReducedMotion = usePrefersReducedMotion();

  const advanceTimerRef = useRef<number | null>(null);
  const trialStartRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const reportedRef = useRef<boolean>(false);
  /** Key of the trial that already produced a response (double-click lock). */
  const answeredKeyRef = useRef<string>('');

  const currentStageDef = stagesCompleted < IDED_STAGES_CONFIG.length ? IDED_STAGES_CONFIG[stagesCompleted] : null;
  const isFinished = stagesCompleted >= IDED_STAGES_CONFIG.length || failedStage !== null;
  const stats = calculateIDEDStats(trials, stagesCompleted, failedStage);

  /** Presents one trial: fixes the relevant exemplars, varies the irrelevant dimension,
   *  and randomises the reinforced left/right position. */
  const presentTrial = useCallback((stageIdx: number, trialInStage: number) => {
    const def = IDED_STAGES_CONFIG[stageIdx];
    if (!def) {
      setPresented(null);
      return;
    }
    const pair = getStimuliForStage(def.stage, trialInStage);
    const flip = Math.random() < 0.5; // per-trial position randomisation
    const stimuli: [IDEDStimulusVisual, IDEDStimulusVisual] = flip ? [pair[1], pair[0]] : [pair[0], pair[1]];
    const reinforcedIndexInPair = def.reinforcedIndexInPair;
    const reinforcedSide = (flip ? 1 - reinforcedIndexInPair : reinforcedIndexInPair) as 0 | 1;

    setPresented({ stimuli, reinforcedSide });
    trialStartRef.current = Date.now();
  }, []);

  // First trial
  useEffect(() => {
    presentTrial(0, 0);
  }, [presentTrial]);

  const handleSelect = useCallback(
    (side: 0 | 1) => {
      if (!presented || isFinished || isLocked || !currentStageDef) return;
      const trialKey = `${stagesCompleted}:${stageTrialIndex}`;
      // Synchronous per-trial lock: three fast clicks can no longer advance a stage.
      if (answeredKeyRef.current === trialKey) return;
      answeredKeyRef.current = trialKey;

      const isCorrect = side === presented.reinforcedSide;
      const newConsecutive = isCorrect ? consecutiveCorrect + 1 : 0;
      const stagePassed = isCorrect && newConsecutive >= currentStageDef.consecutiveRequired;
      const stageTrialCount = stageTrialIndex + 1;
      const stageCapped = !stagePassed && stageTrialCount >= MAX_TRIALS_PER_STAGE;

      if (isCorrect) audioFeedback.playCorrect();
      else audioFeedback.playIncorrect();

      const chosenStimulus = presented.stimuli[side];
      const reinforcedStimulus = presented.stimuli[presented.reinforcedSide];

      const trial: IDEDTrial = {
        trialNumber: trials.length + 1,
        stage: currentStageDef.stage,
        chosenIndex: side,
        reinforcedSide: presented.reinforcedSide,
        chosenStimulusId: chosenStimulus.id,
        reinforcedStimulusId: reinforcedStimulus.id,
        isCorrect,
        reactionTimeMs: Date.now() - trialStartRef.current,
        consecutiveCorrectInStage: newConsecutive,
      };

      setTrials((prev) => [...prev, trial]);
      setLastFeedback({ isCorrect, stageAdvanced: stagePassed });

      // Feedback alone, then the next trial / next stage.
      setIsLocked(true);
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = window.setTimeout(() => {
        advanceTimerRef.current = null;

        if (stagePassed) {
          const nextStage = stagesCompleted + 1;
          setStagesCompleted(nextStage);
          setConsecutiveCorrect(0);
          setStageTrialIndex(0);
          setIsLocked(false);
          if (nextStage >= IDED_STAGES_CONFIG.length) {
            setPresented(null);
            if (celebrationEnabled && !prefersReducedMotion) {
              confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
            }
          } else {
            presentTrial(nextStage, 0);
          }
          return;
        }

        if (stageCapped) {
          setFailedStage(currentStageDef.stage);
          setPresented(null);
          setIsLocked(false);
          return;
        }

        setConsecutiveCorrect(newConsecutive);
        setStageTrialIndex(stageTrialCount);
        setIsLocked(false);
        presentTrial(stagesCompleted, stageTrialCount);
      }, ITI_MS);
    },
    [
      celebrationEnabled,
      consecutiveCorrect,
      currentStageDef,
      isFinished,
      isLocked,
      prefersReducedMotion,
      presentTrial,
      presented,
      stageTrialIndex,
      stagesCompleted,
      trials.length,
    ]
  );

  // Report the session exactly once when all stages pass or a stage hits the cap.
  useEffect(() => {
    if (!isFinished) return;
    if (reportedRef.current) return;
    reportedRef.current = true;

    const finalStats = calculateIDEDStats(trials, stagesCompleted, failedStage);
    const leftReinforced = trials.filter((t) => t.reinforcedSide === 0).length;
    const rightReinforced = trials.length - leftReinforced;

    onSessionComplete?.({
      stats: { task: 'ided', ided: finalStats },
      durationSeconds: (Date.now() - sessionStartRef.current) / 1000,
      extraMetrics: {
        '强化侧为左侧的试次数': leftReinforced,
        '强化侧为右侧的试次数': rightReinforced,
        '左侧强化占比 (%)': trials.length > 0 ? Math.round((leftReinforced / trials.length) * 100) : null,
      },
    });
  }, [failedStage, isFinished, onSessionComplete, stagesCompleted, trials]);

  // Keyboard: ← / A select the left stimulus, → / B the right one.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      const key = event.key.toLowerCase();
      if (event.key === 'ArrowLeft' || key === 'a') {
        event.preventDefault();
        handleSelect(0);
      } else if (event.key === 'ArrowRight' || key === 'b') {
        event.preventDefault();
        handleSelect(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSelect]);

  // Clear the pending timer on unmount.
  useEffect(
    () => () => {
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    },
    []
  );

  const resetTest = () => {
    if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = null;
    setStagesCompleted(0);
    setStageTrialIndex(0);
    setConsecutiveCorrect(0);
    setTrials([]);
    setLastFeedback(null);
    setFailedStage(null);
    setIsLocked(false);
    answeredKeyRef.current = '';
    reportedRef.current = false;
    sessionStartRef.current = Date.now();
    presentTrial(0, 0);
  };

  const renderVisualStimulus = (stimulus: IDEDStimulusVisual) => {
    return (
      <div
        className="relative w-36 h-36 sm:w-44 sm:h-44 bg-slate-800 rounded-2xl border-2 border-slate-700 flex items-center justify-center p-3 select-none"
        aria-hidden="true"
      >
        {/* Base Shape */}
        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-md" aria-hidden="true" focusable="false">
          {stimulus.shapeType === 'oval' && <ellipse cx="50" cy="50" rx="36" ry="24" fill={stimulus.color} />}
          {stimulus.shapeType === 'polygon' && <polygon points="50,15 85,80 15,80" fill={stimulus.color} />}
          {stimulus.shapeType === 'star' && (
            <polygon
              points="50,10 61,35 88,35 66,52 75,78 50,62 25,78 34,52 12,35 39,35"
              fill={stimulus.color}
            />
          )}
          {stimulus.shapeType === 'crescent' && (
            <path d="M35 15 A 35 35 0 0 0 70 85 A 45 45 0 0 1 35 15 Z" fill={stimulus.color} />
          )}
          {stimulus.shapeType === 'hex' && <polygon points="50,15 82,32 82,68 50,85 18,68 18,32" fill={stimulus.color} />}
          {stimulus.shapeType === 'cross' && (
            <polygon
              points="40,15 60,15 60,40 85,40 85,60 60,60 60,85 40,85 40,60 15,60 15,40 40,40"
              fill={stimulus.color}
            />
          )}
        </svg>

        {/* Overlaid Distractor Line (if the stage includes lines) */}
        {stimulus.lineType !== 'none' && (
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" focusable="false">
            {stimulus.lineType === 'wavy' && (
              <path d="M 15 50 Q 30 20, 50 50 T 85 50" fill="none" stroke={stimulus.lineColor} strokeWidth="4" strokeLinecap="round" />
            )}
            {stimulus.lineType === 'zigzag' && (
              <polyline
                points="15,40 35,65 55,35 75,65 85,40"
                fill="none"
                stroke={stimulus.lineColor}
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}
            {stimulus.lineType === 'dashed' && (
              <line x1="15" y1="50" x2="85" y2="50" stroke={stimulus.lineColor} strokeWidth="4" strokeDasharray="6 4" />
            )}
            {stimulus.lineType === 'dots' && (
              <circle cx="50" cy="50" r="32" fill="none" stroke={stimulus.lineColor} strokeWidth="3.5" strokeDasharray="3 5" />
            )}
            {stimulus.lineType === 'spiral' && (
              <path
                d="M 50 50 m -20, 0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0"
                fill="none"
                stroke={stimulus.lineColor}
                strokeWidth="4"
              />
            )}
            {stimulus.lineType === 'crosshatch' && (
              <g stroke={stimulus.lineColor} strokeWidth="3">
                <line x1="25" y1="25" x2="75" y2="75" />
                <line x1="25" y1="75" x2="75" y2="25" />
              </g>
            )}
          </svg>
        )}

        {/* Cognitive load noise */}
        {cognitiveLoad.perceptualNoiseLevel > 0 && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
              backgroundSize: '8px 8px',
            }}
          />
        )}
      </div>
    );
  };

  const feedbackAnnouncement =
    lastFeedback === null
      ? ''
      : `${lastFeedback.isCorrect ? '反应正确' : '反应错误'}${
          lastFeedback.stageAdvanced ? '；已晋级下一阶段' : ''
        }`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Context Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                注意定势转移 (CANTAB ID/ED)
              </span>
              <span className="text-xs text-slate-500 font-mono">Robbins et al. (1998) / Cambridge Cognition</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              维度内/维度间定势转移测验 (Intra/Extra-Dimensional Set Shifting)
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
              共 7 个阶段，每阶段需
              <span className="font-semibold text-slate-900">连续 6 次答对</span>
              才能晋级；每阶段最多 {MAX_TRIALS_PER_STAGE} 次试验，达到上限即判定该阶段未通过。
              系统<span className="font-semibold text-slate-900">不会告知哪一维度相关</span>
              ，左右位置每试次随机，请仅依据“正确/错误”反馈逐步学习。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResearcherView((v) => !v)}
              aria-pressed={showResearcherView}
              title="研究者视图：显示各阶段相关维度等会泄露规则的说明"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                showResearcherView
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              研究者视图
            </button>

            <button
              onClick={resetTest}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              重置任务 (Reset)
            </button>
          </div>
        </div>

        {showResearcherView && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
            <strong>研究者视图已开启（以下信息会泄露规则，勿让受试者看到）：</strong>
            <div className="mt-2 space-y-1">
              {IDED_STAGES_CONFIG.map((stg) => (
                <div key={stg.stage} className="font-mono">
                  {stg.stage} · 相关维度：{stg.relevantDimension === 'shape' ? '图形' : '线条'} · 强化项位于配对索引{' '}
                  {stg.reinforcedIndexInPair}（屏幕左右位置每试次随机） · {stg.description}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage Timeline */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>阶段演进 (Stages Progression)</span>
            <span className="font-mono text-indigo-600">
              {failedStage
                ? `已在 ${failedStage} 阶段达到 ${MAX_TRIALS_PER_STAGE} 次上限`
                : `阶段 ${Math.min(stagesCompleted + 1, 7)} / 7`}
            </span>
          </div>

          <ol className="grid grid-cols-7 gap-1.5 list-none p-0 m-0">
            {IDED_STAGES_CONFIG.map((stg, idx) => {
              const isPast = idx < stagesCompleted;
              const isCurrent = idx === stagesCompleted && !failedStage;
              const isFailed = failedStage === stg.stage;
              const isEDS = stg.stage === 'EDS';

              return (
                <li
                  key={stg.stage}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    isFailed
                      ? 'border-rose-600 bg-rose-100 text-rose-950 font-bold'
                      : isCurrent
                      ? isEDS
                        ? 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-200 font-bold'
                        : 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-200 font-bold'
                      : isPast
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  <div className="text-[11px] font-mono">{stg.stage}</div>
                  <div className="text-[9px] truncate mt-0.5">
                    {isFailed ? '✕ 未通过' : isPast ? '✓ 达成' : isCurrent ? '当前进行' : '未开始'}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Real-time stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">总错误数</span>
            <span className="text-lg font-bold font-mono text-slate-900">{stats.totalErrors}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">IDS 维度内错误</span>
            <span className="text-lg font-bold font-mono text-slate-700">{stats.idsErrors}</span>
          </div>
          <div className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-100">
            <span className="text-[11px] text-rose-700 block font-medium">EDS 维度间错误</span>
            <span className="text-lg font-bold font-mono text-rose-700">{stats.edsErrors}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">EDS 定势转移代价</span>
            <span className="text-lg font-bold font-mono text-indigo-700">{stats.edsShiftCost}</span>
            <span className="text-[10px] text-slate-400 block">EDS 错误 − IDS 错误</span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-500">
          键盘操作：<kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">←</kbd> /{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">A</kbd> 选择左侧，
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] ml-1">→</kbd> /{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">B</kbd> 选择右侧。
          <span className="ml-1 text-slate-400">
            注：转移代价为 EDS 错误数减去 IDS 错误数，当受试者在两个阶段都几乎不出错（或都停留在随机水平）时该差值会接近 0，需结合 EDS 是否通过一起判读。
          </span>
        </p>
      </div>

      {/* Main Testing Arena */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden text-center">
        <div role="status" aria-live="polite" className="sr-only">
          {feedbackAnnouncement}
        </div>

        {!isFinished && currentStageDef ? (
          <div>
            {/* Stage info (no rule-revealing copy for participants) */}
            <div className="mb-6 inline-flex flex-col items-center">
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-indigo-300 border border-slate-700 mb-1.5">
                第 {stagesCompleted + 1} / 7 阶段 · {currentStageDef.stage}
              </span>
              <p className="text-xs text-slate-400 max-w-md">
                请依据“正确 / 错误”反馈学习本阶段应选择哪一个刺激；正确的一侧（左或右）每试次随机改变。
              </p>
            </div>

            {/* Stage progress towards 6 consecutive correct + cap */}
            <div className="max-w-md mx-auto mb-6">
              <div
                className="flex items-center justify-center gap-1.5"
                role="progressbar"
                aria-label="本阶段晋级进度（连续正确次数）"
                aria-valuemin={0}
                aria-valuemax={currentStageDef.consecutiveRequired}
                aria-valuenow={consecutiveCorrect}
                aria-valuetext={`连续正确 ${consecutiveCorrect} / ${currentStageDef.consecutiveRequired}`}
              >
                <span className="text-xs text-slate-400 mr-2">晋级进度:</span>
                {Array.from({ length: currentStageDef.consecutiveRequired }).map((_, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className={`w-5 h-2.5 rounded-sm transition-colors ${
                      i < consecutiveCorrect ? 'bg-emerald-500' : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                ))}
                <span className="text-xs font-mono text-slate-300 ml-2">
                  {consecutiveCorrect}/{currentStageDef.consecutiveRequired}
                </span>
              </div>
              <div
                className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"
                role="progressbar"
                aria-label="本阶段已用试验数"
                aria-valuemin={0}
                aria-valuemax={MAX_TRIALS_PER_STAGE}
                aria-valuenow={stats.trialsInCurrentStage}
                aria-valuetext={`本阶段已用 ${stats.trialsInCurrentStage} / ${MAX_TRIALS_PER_STAGE} 次试验`}
              >
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${(stats.trialsInCurrentStage / MAX_TRIALS_PER_STAGE) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                本阶段已用 {stats.trialsInCurrentStage} / {MAX_TRIALS_PER_STAGE} 次试验（达上限即判定本阶段未通过）
              </p>
            </div>

            {/* Stimuli Display: Two choices */}
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 my-4 p-3 rounded-2xl">
              {([0, 1] as const).map((side) => {
                const stimulus = presented?.stimuli[side];
                if (!stimulus) return null;
                const positionName = side === 0 ? '左侧' : '右侧';
                return (
                  <div key={side} className="flex flex-col items-center gap-3">
                    <div
                      role="button"
                      tabIndex={isLocked ? -1 : 0}
                      aria-disabled={isLocked}
                      aria-label={`选择${positionName}刺激：${describeIDEDStimulus(stimulus)}`}
                      onClick={() => handleSelect(side)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleSelect(side);
                        }
                      }}
                      className={`rounded-2xl transition-all ${
                        isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:scale-[1.03]'
                      } focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400`}
                    >
                      {renderVisualStimulus(stimulus)}
                    </div>
                    <button
                      onClick={() => handleSelect(side)}
                      disabled={isLocked}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-indigo-600 rounded-lg text-xs font-semibold text-slate-200 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      选择{positionName}刺激 ({side === 0 ? 'A' : 'B'})
                    </button>
                  </div>
                );
              })}
              {cognitiveLoad.distractorInterference && (
                <DistractorOverlay className="rounded-2xl" intensity={cognitiveLoad.perceptualNoiseLevel + 25} />
              )}
            </div>

            {/* Feedback */}
            <div aria-live="polite" className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 min-h-[32px]">
              {lastFeedback ? (
                lastFeedback.isCorrect ? (
                  <span className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> 反应正确 (Correct)
                    {lastFeedback.stageAdvanced && <span className="ml-2 text-indigo-300">已晋级下一阶段</span>}
                  </span>
                ) : (
                  <span className="text-rose-400 text-sm font-bold flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" aria-hidden="true" /> 反应错误 (Incorrect)
                  </span>
                )
              ) : (
                <span className="text-xs text-slate-500">等待您的第一次选择…</span>
              )}
            </div>
          </div>
        ) : failedStage ? (
          <div className="py-10">
            <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-xl font-bold text-slate-100">测验终止：{failedStage} 阶段达到 {MAX_TRIALS_PER_STAGE} 次试验上限</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto mt-2">
              该阶段在 {MAX_TRIALS_PER_STAGE} 次试验内未能达到“连续 6 次正确”的晋级标准，按 CANTAB 规则判定本阶段未通过，测验到此结束。
              已完成的阶段与错误数已记入数据。
            </p>
            <div className="mt-4 inline-grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                已完成阶段 <span className="font-mono font-bold">{stats.stagesCompleted}/7</span>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                总错误 <span className="font-mono font-bold">{stats.totalErrors}</span>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                失败阶段错误 <span className="font-mono font-bold">{stats.failedStageErrors ?? '—'}</span>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                EDS 错误 <span className="font-mono font-bold">{stats.edsErrors}</span>
              </div>
            </div>
            <button
              onClick={resetTest}
              className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
            >
              重新演练 ID/ED 任务
            </button>
          </div>
        ) : (
          <div className="py-10">
            <Award className="w-12 h-12 text-emerald-400 mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-xl font-bold text-slate-100">全部 7 阶段注意定势转移通关！</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto mt-2">
              您在第 6 阶段完成了 Extra-Dimensional Shift (EDS)，即把注意从原相关维度转移到另一维度。
              本结果仅为该测验内部指标，不构成临床判读。
            </p>
            <button
              onClick={resetTest}
              className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
            >
              重新演练 ID/ED 任务
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
