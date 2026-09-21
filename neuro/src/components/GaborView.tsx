import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CognitiveLoadConfig, GaborStimulus, GaborTaskType, GaborTrial, ParadigmStats, SessionReport } from '../types';
import { calculateGaborStats, GABOR_SIZE_PX, generateGaborStimulus, renderGaborOnCanvas } from '../services/gaborEngine';
import { DistractorOverlay } from './DistractorOverlay';
import { audioFeedback } from '../services/audioService';
import { useI18n, type MessageKey } from '../i18n';
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
  const { t, tList, lang } = useI18n();
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

  /** Renders a key array as one paragraph (no separator in Chinese, a space in English). */
  const joinList = (keys: readonly MessageKey[]) => tList(keys).join(lang === 'zh' ? '' : ' ');

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
    lastFeedback === null ? '' : lastFeedback.isCorrect ? t('gabor.a11y.correct') : t('gabor.a11y.incorrect');

  return (
    <div className="flex flex-col gap-6">
      {/* Header Context Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
                {t('gabor.badge')}
              </span>
              <span className="text-xs text-slate-500 font-mono">Ashby &amp; Maddox (2005, 2011)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{t('gabor.title')}</h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
              {t('gabor.intro.a')}
              <span className="font-semibold text-slate-900">{t('gabor.intro.freq')}</span>
              {t('gabor.intro.mid')}
              <span className="font-semibold text-slate-900">{t('gabor.intro.orient')}</span>
              {t('gabor.intro.b')}
              <span className="font-semibold text-slate-900">{t('gabor.intro.hidden')}</span>
              {t('gabor.intro.c')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResearcherView((v) => !v)}
              aria-pressed={showResearcherView}
              title={t('gabor.researcher.title')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                showResearcherView
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              {showResearcherView ? t('gabor.researcher.hide') : t('gabor.researcher.show')}
            </button>

            <button
              onClick={resetTest}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              {t('gabor.action.reset')}
            </button>
          </div>
        </div>

        {showResearcherView && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 font-mono">
            <div className="font-sans font-bold mb-1">{t('gabor.researcher.warning')}</div>
            <div>
              {t('gabor.researcher.stimulus', {
                frequency: currentStimulus.spatialFrequency,
                orientation: currentStimulus.orientationDegrees,
                seed: currentStimulus.noiseSeed,
                category: currentStimulus.category,
              })}
            </div>
            <div className="mt-1">{t('gabor.researcher.rules')}</div>
          </div>
        )}

        {/* Task Mode Switch Tabs */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100" role="group" aria-label={t('gabor.mode.aria')}>
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
              <div>{t('gabor.mode.ii.title')}</div>
              <div className="text-[10px] font-normal text-slate-500">{t('gabor.mode.ii.sub')}</div>
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
              <div>{t('gabor.mode.rb.title')}</div>
              <div className="text-[10px] font-normal text-slate-500">{t('gabor.mode.rb.sub')}</div>
            </div>
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('gabor.stat.modeTrials')}</span>
            <span className="text-lg font-bold font-mono text-slate-900">{currentTypeTrials.length}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('gabor.stat.modeAccuracy')}</span>
            <span className="text-lg font-bold font-mono text-indigo-600">
              {currentTypeTrials.length === 0 ? t('gabor.stat.notMeasured') : `${accuracy}%`}
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('gabor.stat.avgRt')}</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {overallStats.avgReactionTimeMs === null ? (
                <span className="text-sm text-slate-400">{t('gabor.stat.notMeasured')}</span>
              ) : (
                <>
                  {overallStats.avgReactionTimeMs}
                  <span className="text-xs font-normal text-slate-400">ms</span>
                </>
              )}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {t('gabor.stat.rtSamples', { count: overallStats.rtSampleCount })}
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('gabor.stat.features')}</span>
            <span className="text-xs text-slate-500 block mt-1">{t('gabor.stat.hidden')}</span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-500">
          {t('gabor.keyboard.intro')}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">A</kbd>
          {t('gabor.keyboard.a')}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">B</kbd>
          {t('gabor.keyboard.b')}
          <span className="ml-1 text-slate-400">{joinList(['gabor.note.limitA', 'gabor.note.limitB'])}</span>
        </p>
      </div>

      {/* Main Testing Arena */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col items-center">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('gabor.stimulus.title')}</div>

        {/* Canvas Display */}
        <div className="relative p-2 bg-slate-950 rounded-2xl border-2 border-slate-700 shadow-xl mb-6">
          {renderFailed ? (
            <div
              className="flex flex-col items-center justify-center text-center px-6"
              style={{ width: GABOR_SIZE_PX, height: GABOR_SIZE_PX }}
              role="alert"
            >
              <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" aria-hidden="true" />
              <p className="text-xs text-amber-200 font-semibold">{t('gabor.renderFailed.title')}</p>
              <p className="text-[11px] text-slate-400 mt-1">{t('gabor.renderFailed.body')}</p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={GABOR_SIZE_PX}
              height={GABOR_SIZE_PX}
              style={{ width: GABOR_SIZE_PX, height: GABOR_SIZE_PX }}
              className="rounded-xl block"
              role="img"
              aria-label={t('gabor.stimulus.aria')}
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
            {t('gabor.choice.a')}
          </button>

          <button
            onClick={() => handleChoice('B')}
            disabled={isLocked || renderFailed}
            className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-sm text-white shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('gabor.choice.b')}
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
                {lastFeedback.isCorrect ? t('gabor.feedback.correct') : t('gabor.feedback.incorrect')}
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
              {t('gabor.record.title')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('gabor.record.body', {
                pending: pendingTrials.length,
                submitted: submittedCount,
                minTrials: MIN_TRIALS_PER_SUBMISSION,
              })}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('gabor.record.submit', { count: pendingTrials.length })}
          </button>
        </div>

        {trials.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t('gabor.record.iiAccuracy')}</span>
              <span className="text-base font-bold font-mono text-indigo-700">
                {overallStats.ii.accuracy === null ? t('gabor.stat.notMeasured') : `${overallStats.ii.accuracy}%`}
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  {t('gabor.record.trialCount', { count: overallStats.ii.trials })}
                </span>
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t('gabor.record.rbAccuracy')}</span>
              <span className="text-base font-bold font-mono text-cyan-700">
                {overallStats.rb.accuracy === null ? t('gabor.stat.notMeasured') : `${overallStats.rb.accuracy}%`}
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  {t('gabor.record.trialCount', { count: overallStats.rb.trials })}
                </span>
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t('gabor.record.covisGap')}</span>
              <span className="text-base font-bold font-mono text-slate-800">
                {covisGap === null ? t('gabor.stat.notMeasured') : `${covisGap > 0 ? '+' : ''}${covisGap}pp`}
              </span>
              <span className="text-[10px] text-slate-400 block">{t('gabor.record.covisGapNote')}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t('gabor.record.totalTrials')}</span>
              <span className="text-base font-bold font-mono text-slate-800">{trials.length}</span>
            </div>
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-3">
          {joinList(['gabor.record.covisNoteA', 'gabor.record.covisNoteB'])}
        </p>
      </div>
    </div>
  );
};
