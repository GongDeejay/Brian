import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CognitiveLoadConfig,
  ParadigmStats,
  SessionReport,
  WeatherOutcome,
  WPTCardCue,
  WPTTrial,
} from '../types';
import {
  calculateWPTStats,
  generateWPTTrialSequence,
  WPT_CUES,
} from '../services/wptEngine';
import { WPTCardTarot } from './WPTCardTarot';
import { DistractorOverlay } from './DistractorOverlay';
import { audioFeedback } from '../services/audioService';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useI18n, type MessageKey } from '../i18n';
import { CloudRain, Sun, RotateCcw, Brain, BarChart2, CheckCircle2, XCircle, Info, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface Props {
  cognitiveLoad: CognitiveLoadConfig;
  celebrationEnabled: boolean;
  onSessionComplete?: (report: SessionReport<ParadigmStats>) => void;
}

const TOTAL_TRIALS = 50;
/** Feedback is displayed alone; inputs stay locked during this interval. */
const ITI_MS = 800;

/** Short cue names used by the researcher probability table. */
const CUE_SHORT_NAME_KEYS: Record<WPTCardCue['pattern'], MessageKey> = {
  triangular_mosaic: 'wpt.cue.trianglesShort',
  nested_diamonds: 'wpt.cue.diamondsShort',
  radiating_stars: 'wpt.cue.circlesShort',
  geometric_grid: 'wpt.cue.squaresShort',
};

/**
 * Independent rain prior of each cue card (Knowlton 1996), in `WPT_CUES` order,
 * with the cue-strength wording shown beside it in the researcher view.
 */
const PRIOR_ROWS = [
  { value: '75.6%', strengthKey: 'wpt.decoder.strongCue' },
  { value: '57.5%', strengthKey: 'wpt.decoder.weakCue' },
  { value: '42.5%', strengthKey: 'wpt.decoder.weakCue' },
  { value: '24.4%', strengthKey: 'wpt.decoder.strongCue' },
] as const;

export const WPTView: React.FC<Props> = ({ cognitiveLoad, celebrationEnabled, onSessionComplete }) => {
  const { t, tList } = useI18n();

  const [trialList, setTrialList] = useState(() => generateWPTTrialSequence(TOTAL_TRIALS));
  const [trialIndex, setTrialIndex] = useState<number>(0);
  const [trials, setTrials] = useState<WPTTrial[]>([]);
  const [lastResult, setLastResult] = useState<{
    userChoice: WeatherOutcome | null;
    actualOutcome: WeatherOutcome;
    pRain: number;
    isOptimal: boolean;
    isCorrect: boolean;
    isTimeout: boolean;
  } | null>(null);
  const [showProbDecoder, setShowProbDecoder] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(cognitiveLoad.timeLimitSeconds);
  /** Input lock for the inter-trial interval (prevents double-click double-recording). */
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const prefersReducedMotion = usePrefersReducedMotion();

  const timerRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const trialStartRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const reportedRef = useRef<boolean>(false);
  /** Trial index that already produced a response. */
  const answeredIndexRef = useRef<number>(-1);
  /** Trial index that already produced a timeout record. */
  const timeoutHandledRef = useRef<number>(-1);

  /**
   * NO `|| trialList[0]` fallback: after the last trial there is simply no active
   * pattern, and the view shows an explicit completion state instead of silently
   * redisplaying the first trial's cards.
   */
  const currentPreset = trialIndex < trialList.length ? trialList[trialIndex] : null;
  const isFinished = trialIndex >= trialList.length;
  const stats = calculateWPTStats(trials);

  /**
   * Records exactly one trial. `choice === null` means the time limit expired:
   * the trial is stored as a timeout with NO invented user choice and NO invented RT
   * (a random or "optimal" guess would corrupt the optimal-choice rate).
   */
  const recordTrial = useCallback(
    (choice: WeatherOutcome | null) => {
      if (isFinished || !currentPreset) return;
      if (isLocked) return;
      // Synchronous per-trial lock: one click (or keypress) = one trial record.
      if (answeredIndexRef.current === trialIndex) return;
      answeredIndexRef.current = trialIndex;

      const isTimeout = choice === null;
      const rt = isTimeout ? null : Date.now() - trialStartRef.current;
      const { activeCards, pRain } = currentPreset;

      // Mathematical optimal choice
      const optimalChoice: WeatherOutcome = pRain >= 0.5 ? 'rain' : 'sun';
      const isOptimal = !isTimeout && choice === optimalChoice;

      // Sample actual probabilistic outcome (a real event, independent of the response)
      const actualOutcome: WeatherOutcome = Math.random() < pRain ? 'rain' : 'sun';
      const isCorrect = !isTimeout && choice === actualOutcome;

      if (isTimeout || !isCorrect) {
        audioFeedback.playIncorrect();
      } else {
        audioFeedback.playCorrect();
      }

      const currentBlock = Math.floor(trials.length / 10) + 1;

      const record: WPTTrial = {
        trialNumber: trials.length + 1,
        activeCards,
        pRain,
        optimalChoice,
        userChoice: choice,
        actualOutcome,
        isOptimal,
        isCorrect,
        isTimeout,
        reactionTimeMs: rt,
        blockNumber: currentBlock,
      };

      setTrials((prev) => [...prev, record]);
      setLastResult({ userChoice: choice, actualOutcome, pRain, isOptimal, isCorrect, isTimeout });

      // Hold the feedback on screen, then present the next pattern.
      setIsLocked(true);
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = window.setTimeout(() => {
        advanceTimerRef.current = null;
        setTrialIndex((prev) => prev + 1);
        trialStartRef.current = Date.now();
        setIsLocked(false);
      }, ITI_MS);
    },
    [currentPreset, isFinished, isLocked, trialIndex, trials.length]
  );

  const handlePrediction = useCallback(
    (choice: WeatherOutcome) => recordTrial(choice),
    [recordTrial]
  );

  // ---------------------------------------------------------------------------
  // Countdown. The updater is PURE; the timeout action lives in its own effect so
  // React StrictMode re-invocation can never append duplicate trial records.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const limit = cognitiveLoad.timeLimitSeconds;
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (limit <= 0 || isFinished || isLocked) return;

    setTimeLeft(limit);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 0.1));
    }, 100);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cognitiveLoad.timeLimitSeconds, isFinished, isLocked, trialIndex]);

  useEffect(() => {
    const limit = cognitiveLoad.timeLimitSeconds;
    if (limit <= 0 || isFinished || isLocked) return;
    if (timeLeft > 0.05) return;
    if (timeoutHandledRef.current === trialIndex) return;
    timeoutHandledRef.current = trialIndex;
    // A timeout is recorded as a genuine non-response (userChoice = null), never as
    // a random or "optimal" guess attributed to the participant.
    recordTrial(null);
  }, [cognitiveLoad.timeLimitSeconds, isFinished, isLocked, recordTrial, timeLeft, trialIndex]);

  // Report the session exactly once when every trial has been administered.
  useEffect(() => {
    if (!isFinished) return;
    if (reportedRef.current) return;
    reportedRef.current = true;

    if (celebrationEnabled && !prefersReducedMotion) {
      confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
    }

    onSessionComplete?.({
      stats: { task: 'wpt', wpt: calculateWPTStats(trials) },
      durationSeconds: (Date.now() - sessionStartRef.current) / 1000,
    });
  }, [celebrationEnabled, isFinished, onSessionComplete, prefersReducedMotion, trials]);

  // Keyboard: R = rain, S = sun.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const key = event.key.toLowerCase();
      if (key === 'r') {
        event.preventDefault();
        handlePrediction('rain');
      } else if (key === 's') {
        event.preventDefault();
        handlePrediction('sun');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePrediction]);

  // Clear every timer on unmount.
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    },
    []
  );

  const resetTest = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    timerRef.current = null;
    advanceTimerRef.current = null;

    setTrialList(generateWPTTrialSequence(TOTAL_TRIALS));
    setTrialIndex(0);
    setTrials([]);
    setLastResult(null);
    setIsLocked(false);
    setTimeLeft(cognitiveLoad.timeLimitSeconds);
    answeredIndexRef.current = -1;
    timeoutHandledRef.current = -1;
    reportedRef.current = false;
    trialStartRef.current = Date.now();
    sessionStartRef.current = Date.now();
  };

  const learningSlope = useMemo(() => {
    if (stats.blockAccuracies.length < 2) return null;
    return stats.blockAccuracies[stats.blockAccuracies.length - 1].optimalRate - stats.blockAccuracies[0].optimalRate;
  }, [stats.blockAccuracies]);

  const feedbackAnnouncement = lastResult
    ? [
        t('wpt.announce.weather', {
          weather: lastResult.actualOutcome === 'rain' ? t('wpt.announce.rain') : t('wpt.announce.sun'),
        }),
        lastResult.isTimeout
          ? t('wpt.announce.timeout')
          : t(lastResult.isCorrect ? 'wpt.announce.hit' : 'wpt.announce.miss'),
        ...(showProbDecoder
          ? [t('wpt.announce.posterior', { value: (lastResult.pRain * 100).toFixed(1) })]
          : []),
      ].join(t('wpt.announce.separator'))
    : '';

  const [optimalLineName, actualLineName] = tList(['wpt.curve.optimalLine', 'wpt.curve.actualLine']);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Context Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                {t('wpt.badge')}
              </span>
              <span className="text-xs text-slate-500 font-mono">Knowlton, Mangels &amp; Squire (1996)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{t('wpt.title')}</h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
              {t('wpt.intro.lead')}
              <span className="font-semibold text-slate-900">{t('wpt.intro.striatum')}</span>
              {t('wpt.intro.body')}
              {t('wpt.intro.trials', { count: TOTAL_TRIALS })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProbDecoder(!showProbDecoder)}
              aria-pressed={showProbDecoder}
              title={t('wpt.decoder.toggleTitle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                showProbDecoder
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
              {showProbDecoder ? t('wpt.decoder.hide') : t('wpt.decoder.show')}
            </button>

            <button
              onClick={resetTest}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              {t('wpt.reset')}
            </button>
          </div>
        </div>

        {showProbDecoder && (
          <p className="mt-3 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <strong>{t('wpt.decoder.noticeTitle')}</strong>
            {t('wpt.decoder.noticeBody')}
          </p>
        )}

        {/* Real-time Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 pt-4 border-t border-slate-100 text-slate-800">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('wpt.metric.progress')}</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {Math.min(trialIndex + 1, trialList.length)}
              <span className="text-xs font-normal text-slate-400">/{trialList.length}</span>
            </span>
            <span className="text-[10px] text-slate-400 block">
              {t('wpt.metric.noResponseNote', { count: stats.timeouts })}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('wpt.metric.optimalRate')}</span>
            <span className="text-lg font-bold font-mono text-indigo-600">
              {stats.optimalRate}
              <span className="text-xs font-normal text-indigo-400">%</span>
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('wpt.metric.accuracy')}</span>
            <span className="text-lg font-bold font-mono text-blue-600">
              {stats.actualAccuracy}
              <span className="text-xs font-normal text-blue-400">%</span>
            </span>
          </div>

          <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-100">
            <span className="text-[11px] text-purple-800 block font-medium flex items-center gap-1">
              {t('wpt.metric.implicitIndex')}
              <Brain className="w-3 h-3 text-purple-600" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold font-mono text-purple-700">
              {stats.totalTrials === 0 ? '—' : stats.basalGangliaImplicitIndex}
              <span className="text-xs font-normal text-purple-400">/100</span>
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('wpt.metric.meanRt')}</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {stats.avgReactionTimeMs === null ? (
                <span className="text-sm text-slate-400">{t('wpt.metric.rtNotMeasured')}</span>
              ) : (
                <>
                  {stats.avgReactionTimeMs}
                  <span className="text-xs font-normal text-slate-400">ms</span>
                </>
              )}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {t('wpt.metric.rtSample', { count: stats.rtSampleCount })}
            </span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-500">
          {t('wpt.keyboard.lead')}{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">R</kbd>{' '}
          {t('wpt.keyboard.rain')}{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">S</kbd>{' '}
          {t('wpt.keyboard.sun')}
          <span className="ml-1 text-slate-400">{t('wpt.keyboard.note')}</span>
        </p>
      </div>

      {/* Probabilistic Decoder Banner (researcher view) */}
      {showProbDecoder && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
            <Info className="w-4 h-4 text-amber-700" aria-hidden="true" />
            {t('wpt.decoder.bannerTitle')}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono mt-2">
            {PRIOR_ROWS.map((row, index) => {
              const cue = WPT_CUES[index];
              if (!cue) return null;
              return (
                <div key={row.value} className="p-2 bg-white/80 rounded border border-amber-200">
                  {t('wpt.decoder.priorCard', {
                    index: cue.id,
                    name: t(CUE_SHORT_NAME_KEYS[cue.pattern]),
                  })}
                  : <strong>{t('wpt.decoder.priorValue', { value: row.value })}</strong> {t(row.strengthKey)}
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-amber-800 mt-2">{t('wpt.decoder.footnote')}</p>
        </div>
      )}

      {/* Main Tarot Arena */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Time Pressure countdown */}
        {cognitiveLoad.timeLimitSeconds > 0 && !isFinished && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
              <span>{t('wpt.timer.label')}</span>
              <span className={timeLeft <= 1.0 ? 'text-rose-400 font-bold' : ''}>{timeLeft.toFixed(1)}s</span>
            </div>
            <div
              className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"
              role="progressbar"
              aria-label={t('wpt.timer.label')}
              aria-valuemin={0}
              aria-valuemax={cognitiveLoad.timeLimitSeconds}
              aria-valuenow={Number(timeLeft.toFixed(1))}
              aria-valuetext={t('wpt.timer.remaining', { seconds: timeLeft.toFixed(1) })}
            >
              <div
                className={`h-full transition-all duration-100 ${
                  timeLeft <= 1.0 ? 'bg-rose-500' : 'bg-blue-500'
                }`}
                style={{ width: `${(timeLeft / cognitiveLoad.timeLimitSeconds) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 4 Tarot Card Slots */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            {t('wpt.arena.cuePattern')}
          </div>

          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 justify-items-center mb-8 p-2 rounded-xl">
            {currentPreset &&
              WPT_CUES.map((cue) => (
                <WPTCardTarot
                  key={cue.id}
                  cue={cue}
                  isActive={currentPreset.activeCards.includes(cue.id)}
                  noiseLevel={cognitiveLoad.perceptualNoiseLevel}
                />
              ))}
            {cognitiveLoad.distractorInterference && currentPreset && (
              <DistractorOverlay className="rounded-xl" intensity={cognitiveLoad.perceptualNoiseLevel + 25} />
            )}
            {!currentPreset && (
              <div className="col-span-2 sm:col-span-4 text-center py-8">
                <Award className="w-10 h-10 text-amber-400 mx-auto mb-2" aria-hidden="true" />
                <h3 className="text-base font-bold text-slate-100">
                  {t('wpt.arena.allDone', { count: trialList.length })}
                </h3>
              </div>
            )}
          </div>

          {/* User Prediction Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
            <button
              onClick={() => handlePrediction('rain')}
              disabled={isFinished || isLocked}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CloudRain className="w-5 h-5 text-blue-200" aria-hidden="true" />
              {t('wpt.arena.predictRain')}
            </button>

            <button
              onClick={() => handlePrediction('sun')}
              disabled={isFinished || isLocked}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sun className="w-5 h-5 text-slate-950 fill-slate-950" aria-hidden="true" />
              {t('wpt.arena.predictSun')}
            </button>
          </div>
        </div>

        {/* Feedback Section */}
        <div role="status" aria-live="polite">
          <span className="sr-only">{feedbackAnnouncement}</span>
          {lastResult && (
            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <div className="inline-flex flex-wrap items-center justify-center gap-3 px-6 py-2.5 rounded-full bg-slate-800 border border-slate-700">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  {t('wpt.feedback.reveal')}
                  {lastResult.actualOutcome === 'rain' ? (
                    <span className="text-blue-400 flex items-center gap-1 font-bold">
                      <CloudRain className="w-4 h-4" aria-hidden="true" /> {t('wpt.feedback.rain')}
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 font-bold">
                      <Sun className="w-4 h-4" aria-hidden="true" /> {t('wpt.feedback.sun')}
                    </span>
                  )}
                </span>

                <span className="text-slate-500">|</span>

                <span className="text-xs flex items-center gap-1 font-medium">
                  {lastResult.isTimeout ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <XCircle className="w-4 h-4" aria-hidden="true" /> {t('wpt.feedback.timeout')}
                    </span>
                  ) : lastResult.isCorrect ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> {t('wpt.feedback.correct')}
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="w-4 h-4" aria-hidden="true" /> {t('wpt.feedback.incorrect')}
                    </span>
                  )}
                </span>

                {showProbDecoder && !lastResult.isTimeout && (
                  <>
                    <span className="text-slate-500">|</span>
                    <span className="text-xs font-mono text-slate-300">
                      {t('wpt.feedback.posterior', {
                        value: (lastResult.pRain * 100).toFixed(1),
                        verdict: t(lastResult.isOptimal ? 'wpt.feedback.optimal' : 'wpt.feedback.suboptimal'),
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Completion summary */}
      {isFinished && (
        <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            {t('wpt.complete.title')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-slate-800">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t('wpt.complete.trials')}</span>
              <span className="text-lg font-bold font-mono text-slate-900">
                {stats.totalTrials}
                <span className="text-xs font-normal text-slate-400 ml-1">
                  {t('wpt.complete.responded', { count: stats.respondedTrials })}
                </span>
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t('wpt.complete.optimalRate')}</span>
              <span className="text-lg font-bold font-mono text-indigo-600">{stats.optimalRate}%</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t('wpt.complete.accuracy')}</span>
              <span className="text-lg font-bold font-mono text-blue-600">{stats.actualAccuracy}%</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t('wpt.complete.slope')}</span>
              <span className="text-lg font-bold font-mono text-purple-700">
                {learningSlope === null
                  ? t('wpt.complete.slopeNotMeasured')
                  : `${learningSlope > 0 ? '+' : ''}${learningSlope}pp`}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">{t('wpt.complete.note')}</p>
          <button
            onClick={resetTest}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {t('wpt.complete.restart')}
          </button>
        </div>
      )}

      {/* Implicit Learning Curve across Blocks */}
      {stats.blockAccuracies.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                {t('wpt.curve.title')}
              </h3>
              <p className="text-xs text-slate-500">{t('wpt.curve.subtitle')}</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.blockAccuracies} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="block"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => t('wpt.curve.blockTick', { block: val })}
                  stroke="#94a3b8"
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" />
                <Tooltip
                  formatter={(val) => [`${val ?? 0}%`, '']}
                  labelFormatter={(lbl) => {
                    const block = Number(lbl);
                    return t('wpt.curve.blockTooltip', {
                      block: String(lbl),
                      from: (block - 1) * 10 + 1,
                      to: block * 10,
                    });
                  }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="optimalRate"
                  name={optimalLineName}
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#4f46e5' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="actualRate"
                  name={actualLineName}
                  stroke="#0ea5e9"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#0ea5e9' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
