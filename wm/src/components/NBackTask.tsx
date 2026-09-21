import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Award, Zap, Info, Settings2, Download } from 'lucide-react';
import { NBackConfig, NBackResult, NBackStimulusMode, NBackTrial, TaskFeedbackMode } from '../types/wm';
import { calculateDPrime } from '../utils/statistics';
import { soundManager } from '../utils/audio';
import { shuffled } from '../utils/random';
import { fireConfetti } from '../utils/motion';
import { downloadSessionJson, sessionFileName } from '../utils/exportJson';
import { useTaskTimers } from '../hooks/useTaskTimers';
import { useFocusGuard } from '../hooks/useFocusGuard';
import { useI18n } from '../i18n';
import { ProgressBar } from './ProgressBar';
import { AbortControl } from './AbortControl';

interface NBackTaskProps {
  onSaveResult: (result: NBackResult) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'H', 'J', 'K', 'M', 'Q', 'R', 'T', 'X'];
const SYMBOLS = ['◆', '▲', '●', '■', '★', '✚', '✦', '⬢'];

/** Countdown ticks (900ms each) before the first trial. */
const COUNTDOWN_START = 3;
const COUNTDOWN_STEP_MS = 900;

/** 难度级别 [1, 2, 3] 的说明文案，顺序与按钮一一对应。 */
const LEVEL_HINT_KEYS = ['nback.level1Hint', 'nback.level2Hint', 'nback.level3Hint'] as const;

export const NBackTask = ({ onSaveResult }: NBackTaskProps) => {
  const { t, tList, lang } = useI18n();
  const levelHints = tList(LEVEL_HINT_KEYS);

  // Config state
  const [config, setConfig] = useState<NBackConfig>({
    n: 2,
    stimulusMode: 'spatial',
    totalTrials: 20,
    stimulusDuration: 600,
    isiDuration: 1400,
    targetRatio: 0.35,
  });

  // Assessment by default: per-trial correctness feedback contaminates the
  // measurement (strategy change, emotional arousal), so it is opt-in.
  const [feedbackMode, setFeedbackMode] = useState<TaskFeedbackMode>('assessment');

  // Task execution states
  // 'idle' | 'countdown' | 'running' | 'completed'
  const [taskState, setTaskState] = useState<'idle' | 'countdown' | 'running' | 'completed'>('idle');
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_START);
  const [currentTrialIdx, setCurrentTrialIdx] = useState<number>(0);
  const [currentStimulus, setCurrentStimulus] = useState<string | number | null>(null);
  const [isStimulusVisible, setIsStimulusVisible] = useState<boolean>(false);
  const [lastActionFeedback, setLastActionFeedback] = useState<string | null>(null);
  const [hasResponded, setHasResponded] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Buffer and records
  const trialsRef = useRef<NBackTrial[]>([]);
  const currentTrialStartTime = useRef<number>(0);
  const respondedInCurrentTrial = useRef<boolean>(false);
  /** Guards against finishing/saving the same session twice. */
  const finishedRef = useRef<boolean>(false);
  /** Re-arms whatever the pause interrupted (countdown tick or current trial). */
  const resumeActionRef = useRef<(() => void) | null>(null);

  // Every timeout goes through the tracked timer manager: nothing survives an
  // unmount, an abort or the focus-loss pause.
  const timers = useTaskTimers();

  // Result state
  const [finalResult, setFinalResult] = useState<NBackResult | null>(null);

  // Pre-generate trial sequence
  const generateTrialSequence = useCallback(() => {
    const total = config.totalTrials;
    const n = config.n;
    const targetCount = Math.round((total - n) * config.targetRatio);

    // Target positions in trials (index >= n)
    const possibleTargetIndices: number[] = [];
    for (let i = n; i < total; i++) {
      possibleTargetIndices.push(i);
    }
    // Uniformly pick target indices (Fisher-Yates, not the biased sort trick)
    const targetIndices = new Set<number>(shuffled(possibleTargetIndices).slice(0, targetCount));

    const sequence: (string | number)[] = [];
    for (let i = 0; i < total; i++) {
      if (targetIndices.has(i)) {
        // Target: must equal the stimulus at i - n
        sequence.push(sequence[i - n]);
      } else {
        // Non-target: pick randomly ensuring it does NOT equal sequence[i - n] (if i >= n)
        let candidate: string | number;
        do {
          if (config.stimulusMode === 'spatial') {
            candidate = Math.floor(Math.random() * 9); // 0-8 for 3x3 grid
          } else if (config.stimulusMode === 'letter') {
            candidate = LETTERS[Math.floor(Math.random() * LETTERS.length)];
          } else {
            candidate = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          }
        } while (i >= n && candidate === sequence[i - n]);
        sequence.push(candidate);
      }
    }

    const trials: NBackTrial[] = sequence.map((stim, idx) => ({
      trialIndex: idx,
      stimulus: stim,
      isTarget: idx >= n && stim === sequence[idx - n],
      userResponded: false,
      userSaidMatch: false,
      responseTimeMs: null,
      result: 'correct_rejection',
    }));

    trialsRef.current = trials;
  }, [config]);

  const { validityRef, resetValidity, finalizeValidity } = useFocusGuard({
    // Only a genuinely running session is guarded.
    active: taskState === 'running' || taskState === 'countdown',
    onInterrupt: () => {
      // Clear every pending timer, then let the participant resume explicitly.
      timers.clearAll();
      setIsPaused(true);
    },
  });

  // Countdown chain (self-rescheduling, so it is pausable and cancellable)
  const runCountdown = (from: number) => {
    setCountdown(from);
    soundManager.playTick();
    resumeActionRef.current = () => runCountdown(from);
    timers.schedule(() => {
      if (from > 1) {
        runCountdown(from - 1);
      } else {
        setTaskState('running');
        runTrial(0);
      }
    }, COUNTDOWN_STEP_MS);
  };

  // Start countdown
  const startTask = () => {
    timers.clearAll();
    finishedRef.current = false;
    respondedInCurrentTrial.current = false;
    setHasResponded(false);
    setIsPaused(false);
    setLastActionFeedback(null);
    setFinalResult(null);
    resetValidity();

    generateTrialSequence();
    setTaskState('countdown');
    setCountdown(COUNTDOWN_START);
    runCountdown(COUNTDOWN_START);
  };

  // Run individual trial
  const runTrial = (trialIndex: number) => {
    if (finishedRef.current) return;
    if (trialIndex >= config.totalTrials) {
      finishTask();
      return;
    }

    const trial = trialsRef.current[trialIndex];
    if (!trial) {
      finishTask();
      return;
    }

    setCurrentTrialIdx(trialIndex);
    setCurrentStimulus(trial.stimulus);
    setIsStimulusVisible(true);
    respondedInCurrentTrial.current = false;
    setHasResponded(false);
    // Practice feedback from an earlier trial must never linger on screen.
    setLastActionFeedback(null);
    currentTrialStartTime.current = performance.now();
    resumeActionRef.current = () => runTrial(trialIndex);

    // Stimulus onset cue is kept in both modes (it is an attention cue, not
    // correctness feedback).
    soundManager.playStimulusOnset();

    // Stimulus display timer
    timers.schedule(() => {
      setIsStimulusVisible(false);

      // ISI duration timer (inter-stimulus interval)
      timers.schedule(() => {
        // If trial ended and user didn't respond
        evaluateTrialEnd(trialIndex);
        runTrial(trialIndex + 1);
      }, config.isiDuration);
    }, config.stimulusDuration);
  };

  // Evaluate when trial finishes without response or with response
  const evaluateTrialEnd = (trialIdx: number) => {
    const trial = trialsRef.current[trialIdx];
    if (!trial || trial.userResponded) return;

    if (trial.isTarget) {
      trial.result = 'miss';
      if (feedbackMode === 'practice') setLastActionFeedback(t('nback.feedbackMiss'));
    } else {
      trial.result = 'correct_rejection';
    }
  };

  // Resume after an interruption: the interrupted trial is presented again from
  // the start so that no partial stimulus is scored.
  const handleResume = () => {
    setIsPaused(false);
    validityRef.current.trialRestarts += 1;
    const action = resumeActionRef.current;
    if (action) action();
    else setTaskState('idle');
  };

  // Abort: stop everything and return to setup without saving partial data.
  const handleAbort = () => {
    timers.clearAll();
    resumeActionRef.current = null;
    finishedRef.current = false;
    respondedInCurrentTrial.current = false;
    setHasResponded(false);
    setIsPaused(false);
    setIsStimulusVisible(false);
    setCurrentStimulus(null);
    setCountdown(COUNTDOWN_START);
    setLastActionFeedback(null);
    setTaskState('idle');
  };

  // User press match
  const handleUserMatch = useCallback(() => {
    if (taskState !== 'running' || isPaused || respondedInCurrentTrial.current) return;

    const trialIdx = currentTrialIdx;
    const trial = trialsRef.current[trialIdx];
    if (!trial) return;

    respondedInCurrentTrial.current = true;
    setHasResponded(true);
    trial.userResponded = true;
    trial.userSaidMatch = true;
    trial.responseTimeMs = performance.now() - currentTrialStartTime.current;

    if (trial.isTarget) {
      trial.result = 'hit';
      if (feedbackMode === 'practice') {
        setLastActionFeedback(t('nback.feedbackHit'));
        soundManager.playSuccess();
      }
    } else {
      trial.result = 'false_alarm';
      if (feedbackMode === 'practice') {
        setLastActionFeedback(t('nback.feedbackFalseAlarm'));
        soundManager.playError();
      }
    }
  }, [taskState, currentTrialIdx, isPaused, feedbackMode, t]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only intercept the space bar while a trial is actually running —
      // otherwise space must stay free to activate focused buttons.
      if (taskState !== 'running' || isPaused) return;
      if (e.code === 'Space' || e.code === 'KeyJ') {
        e.preventDefault();
        handleUserMatch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [taskState, isPaused, handleUserMatch]);

  // Finish task and compute statistics
  const finishTask = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    resumeActionRef.current = null;
    timers.clearAll();

    setTaskState('completed');
    setCurrentStimulus(null);
    setIsStimulusVisible(false);
    setIsPaused(false);

    const allTrials = trialsRef.current;
    const evaluatedTrials = allTrials.slice(config.n); // Only trials after N are evaluation targets

    let hits = 0;
    let misses = 0;
    let falseAlarms = 0;
    let correctRejections = 0;
    let totalRT = 0;
    let rtCount = 0;

    evaluatedTrials.forEach((t) => {
      if (t.isTarget) {
        if (t.result === 'hit') {
          hits++;
          if (t.responseTimeMs) {
            totalRT += t.responseTimeMs;
            rtCount++;
          }
        } else {
          misses++;
        }
      } else {
        if (t.result === 'false_alarm') {
          falseAlarms++;
        } else {
          correctRejections++;
        }
      }
    });

    const targetCount = hits + misses;
    const nonTargetCount = falseAlarms + correctRejections;
    const accuracy = evaluatedTrials.length > 0 ? (hits + correctRejections) / evaluatedTrials.length : 0;
    const dPrime = calculateDPrime(hits, targetCount, falseAlarms, nonTargetCount);
    const meanReactionTimeMs = rtCount > 0 ? totalRT / rtCount : 0;

    const resultData: NBackResult = {
      date: new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US'),
      n: config.n,
      mode: config.stimulusMode,
      totalTrials: config.totalTrials,
      hits,
      misses,
      falseAlarms,
      correctRejections,
      accuracy,
      dPrime,
      meanReactionTimeMs,
      validity: finalizeValidity(),
    };

    setFinalResult(resultData);
    onSaveResult(resultData);
    soundManager.playComplete();

    // Trigger celebration if accuracy is good (skipped under reduced motion)
    if (accuracy >= 0.75) {
      fireConfetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  // Export this session as JSON (metrics + config snapshot + timestamp)
  const handleExport = () => {
    if (!finalResult) return;
    downloadSessionJson(sessionFileName('nback'), {
      app: t('nback.exportApp'),
      task: 'nback',
      exportedAt: new Date().toISOString(),
      sessionDate: finalResult.date,
      feedbackMode,
      config,
      validity: finalResult.validity ?? null,
      result: finalResult,
      trials: trialsRef.current.map((t) => ({
        trialIndex: t.trialIndex,
        stimulus: t.stimulus,
        isTarget: t.isTarget,
        userResponded: t.userResponded,
        userSaidMatch: t.userSaidMatch,
        responseTimeMs: t.responseTimeMs,
        result: t.result,
      })),
    });
  };

  // Running-view derived values: progress and estimated remaining time
  const perTrialMs = config.stimulusDuration + config.isiDuration;
  const etaMs =
    Math.max(0, config.totalTrials - (currentTrialIdx + 1)) * perTrialMs +
    (isStimulusVisible ? config.stimulusDuration : 0);
  const liveMessage = isPaused
    ? t('nback.livePaused')
    : t('nback.liveTrial', {
        current: currentTrialIdx + 1,
        total: config.totalTrials,
        phase: isStimulusVisible ? t('nback.phaseStimulus') : t('nback.phaseIsi'),
      });

  // Mode word used inside the "ready" headline (kept separate so that word
  // order can differ between languages).
  const readyMode =
    config.stimulusMode === 'spatial'
      ? t('nback.readySpatial')
      : config.stimulusMode === 'letter'
        ? t('nback.readyLetter')
        : t('nback.readySymbol');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Paradigm Intro Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {t('nback.badge')}
              </span>
              <span className="text-xs text-slate-400 font-mono">Kirchner (1958)</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">{t('nback.title')}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {t('nback.introPre')}
              <strong>{config.n}</strong>
              {t('nback.introPost')}
            </p>
          </div>

          {taskState === 'idle' && (
            <button
              id="btn-start-nback"
              onClick={startTask}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('nback.start')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Task Area */}
      {taskState === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Config panel */}
          <div className="md:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
              <Settings2 className="w-4 h-4 text-indigo-400" />
              <span>{t('nback.configTitle')}</span>
            </div>

            {/* N-back level selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">{t('nback.levelLabel')}</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    id={`btn-nback-select-${num}`}
                    onClick={() => setConfig((prev) => ({ ...prev, n: num }))}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      config.n === num
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {num}-Back
                    <span className="block text-[10px] font-normal opacity-75">
                      {levelHints[num - 1]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stimulus Mode */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">{t('nback.stimulusModeLabel')}</label>
              <div className="grid grid-cols-3 gap-2">
                {(['spatial', 'letter', 'symbol'] as NBackStimulusMode[]).map((mode) => (
                  <button
                    key={mode}
                    id={`btn-nback-mode-${mode}`}
                    onClick={() => setConfig((prev) => ({ ...prev, stimulusMode: mode }))}
                    className={`py-2 text-xs rounded-xl border transition ${
                      config.stimulusMode === mode
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-semibold'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'spatial'
                      ? t('nback.modeSpatial')
                      : mode === 'letter'
                        ? t('nback.modeLetter')
                        : t('nback.modeSymbol')}
                  </button>
                ))}
              </div>
            </div>

            {/* Trials count */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">{t('nback.trialsLabel')}</label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 25, 40].map((count) => (
                  <button
                    key={count}
                    id={`btn-nback-trials-${count}`}
                    onClick={() => setConfig((prev) => ({ ...prev, totalTrials: count }))}
                    className={`py-1.5 text-xs rounded-xl border transition ${
                      config.totalTrials === count
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-semibold'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t('nback.trialsCount', { count })}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback mode: assessment (default) vs practice */}
            <div className="space-y-1.5" role="group" aria-label={t('nback.feedbackGroupAria')}>
              <label className="text-xs text-slate-400 font-medium">{t('nback.feedbackLabel')}</label>
              <div className="grid grid-cols-2 gap-2">
                {(['assessment', 'practice'] as TaskFeedbackMode[]).map((mode) => (
                  <button
                    key={mode}
                    id={`btn-nback-feedback-${mode}`}
                    aria-pressed={feedbackMode === mode}
                    onClick={() => setFeedbackMode(mode)}
                    className={`py-2 text-xs rounded-xl border transition ${
                      feedbackMode === mode
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-semibold'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'assessment' ? t('nback.modeAssessment') : t('nback.modePractice')}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {t('nback.feedbackNote')}
              </p>
            </div>

            {/* Scientific hint box */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <Info className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('nback.guideTitle')}</span>
              </div>
              <p>
                {t('nback.guidePre')}
                <strong>{t('nback.guideNBack', { n: config.n })}</strong>
                {t('nback.guidePost')}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">
                  {t('nback.guideKeySpace')}
                </kbd>
                {t('nback.guideTail')}
              </p>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[340px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-white">
              {t('nback.readyTitle', { n: config.n, mode: readyMode })}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mt-1.5 leading-relaxed">
              {t('nback.readyDetail', {
                total: config.totalTrials,
                stimulus: config.stimulusDuration,
                isi: config.isiDuration,
              })}
            </p>
            <button
              id="btn-preview-start"
              onClick={startTask}
              className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/20"
            >
              {t('nback.startNow')}
            </button>
          </div>
        </div>
      )}

      {/* Countdown View */}
      {taskState === 'countdown' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[380px] text-center">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            {t('nback.countdownLabel', { n: config.n })}
          </div>
          <div className="w-24 h-24 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center text-5xl font-bold text-white shadow-xl shadow-indigo-500/20 motion-safe:animate-pulse">
            {countdown}
          </div>
          <p className="text-xs text-slate-400 mt-6">
            {t('nback.countdownFocus')}
          </p>
          <div className="sr-only" aria-live="polite">
            {t('nback.countdownSr', { n: config.n, seconds: countdown })}
          </div>
        </div>
      )}

      {/* Running Trial View */}
      {taskState === 'running' && (
        <div className="task-surface bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center min-h-[400px] sm:min-h-[460px]">
          {/* Top trial status bar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-indigo-300">
                {t('nback.trialCounter', { current: currentTrialIdx + 1, total: config.totalTrials })}
              </span>
              <span className="text-slate-500" aria-hidden="true">|</span>
              <span>{t('nback.levelInline', { n: config.n })}</span>
            </div>
            <div className="flex items-center gap-3">
              {lastActionFeedback && (
                <span className="text-xs font-medium text-indigo-400 animate-fade-in">
                  {lastActionFeedback}
                </span>
              )}
              <AbortControl onAbort={handleAbort} accent="indigo" />
            </div>
          </div>

          {/* Overall progress + estimated remaining time */}
          <ProgressBar
            current={currentTrialIdx + 1}
            total={config.totalTrials}
            etaMs={isPaused ? null : etaMs}
            accent="indigo"
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
              <p className="font-semibold">{t('nback.pausedTitle')}</p>
              <p className="leading-relaxed">
                {t('nback.pausedBody')}
              </p>
              <button
                id="btn-nback-resume"
                onClick={handleResume}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition cursor-pointer"
              >
                {t('nback.resume')}
              </button>
            </div>
          )}

          {/* Stimulus display center */}
          <div className="flex-1 flex items-center justify-center w-full my-3">
            {config.stimulusMode === 'spatial' ? (
              /* 3x3 Spatial Grid */
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cellIdx) => {
                  const isActive = isStimulusVisible && currentStimulus === cellIdx;
                  return (
                    <div
                      key={cellIdx}
                      className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl border transition-all duration-150 flex items-center justify-center ${
                        isActive
                          ? 'bg-indigo-500 border-indigo-300 shadow-lg shadow-indigo-500/50 scale-105'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      {isActive && <div className="w-4 h-4 rounded-full bg-white shadow-sm" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Character or Symbol Stimulus */
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                {isStimulusVisible && (
                  <span className="text-5xl sm:text-6xl font-bold font-mono text-indigo-300 tracking-wider transition-all scale-110">
                    {currentStimulus}
                  </span>
                )}
                {/* Steady fixation point: a pulsing target is inappropriate for
                    these paradigms because it is itself a visual transient. */}
                {!isStimulusVisible && (
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                )}
              </div>
            )}
          </div>

          {/* Interactive Response Controls */}
          <div className="w-full max-w-md mt-4 space-y-3">
            <button
              id="btn-nback-respond-match"
              onClick={handleUserMatch}
              disabled={hasResponded || isPaused}
              aria-keyshortcuts="Space J"
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                hasResponded || isPaused
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-[0.98]'
              }`}
            >
              <span>{t('nback.matchButton', { n: config.n })}</span>
              <kbd className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-indigo-700/80 border border-indigo-400/30 text-white">
                {t('nback.keySpaceOrJ')}
              </kbd>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              {t('nback.noResponseHint', {
                ms: config.stimulusDuration + config.isiDuration,
              })}
            </p>
          </div>
        </div>
      )}

      {/* Completed Results View */}
      {taskState === 'completed' && finalResult && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {t('nback.resultTitle', { n: finalResult.n })}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('nback.resultSubtitle')}
                </p>
              </div>
            </div>
            <button
              id="btn-nback-restart"
              onClick={startTask}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('nback.restart')}</span>
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
                t('nback.validityWarn', {
                  interruptions: finalResult.validity.interruptions,
                  seconds: (finalResult.validity.totalAwayMs / 1000).toFixed(1),
                  restarts: finalResult.validity.trialRestarts,
                })
              ) : (
                t('nback.validityOk', {
                  mode:
                    feedbackMode === 'assessment'
                      ? t('nback.modeAssessment')
                      : t('nback.modePractice'),
                })
              )}
            </span>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">{t('nback.dprimeLabel')}</span>
              <span className="text-2xl font-bold font-mono text-indigo-400">{finalResult.dPrime}</span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {finalResult.dPrime >= 2.5
                  ? t('nback.dprimeHigh')
                  : finalResult.dPrime >= 1.5
                    ? t('nback.dprimeGood')
                    : t('nback.dprimeFair')}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">{t('nback.accuracyLabel')}</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {(finalResult.accuracy * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {t('nback.accuracyHint')}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">{t('nback.meanRtLabel')}</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {Math.round(finalResult.meanReactionTimeMs)}
                <span className="text-xs text-slate-400 ml-1">ms</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">{t('nback.meanRtHint')}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1">{t('nback.inhibitionErrorsLabel')}</span>
              <span className="text-2xl font-bold font-mono text-amber-400">{finalResult.falseAlarms}</span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {t('nback.inhibitionErrorsHint')}
              </span>
            </div>
          </div>

          {/* Detailed breakdown table */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-3">
            <h4 className="font-semibold text-slate-200">{t('nback.sdTitle')}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                <span className="text-emerald-400 block font-bold text-base">{finalResult.hits}</span>
                <span className="text-slate-400 text-[11px]">{t('nback.sdHits')}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20">
                <span className="text-rose-400 block font-bold text-base">{finalResult.misses}</span>
                <span className="text-slate-400 text-[11px]">{t('nback.sdMisses')}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20">
                <span className="text-amber-400 block font-bold text-base">{finalResult.falseAlarms}</span>
                <span className="text-slate-400 text-[11px]">{t('nback.sdFalseAlarms')}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-300 block font-bold text-base">{finalResult.correctRejections}</span>
                <span className="text-slate-400 text-[11px]">{t('nback.sdCorrectRejections')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              id="btn-nback-export-json"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('nback.export')}</span>
            </button>
            <button
              id="btn-nback-return-idle"
              onClick={() => setTaskState('idle')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              {t('nback.backToConfig')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
