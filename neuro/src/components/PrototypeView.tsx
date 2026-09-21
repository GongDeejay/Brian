import React, { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { CognitiveLoadConfig, DotPattern, ParadigmStats, PrototypeTrial, SessionReport } from '../types';
import {
  calculatePrototypeStats,
  generateLearningPattern,
  generatePrototypeTestSequence,
  LEARNING_TRIAL_COUNT,
  MIN_LEARNING_BEFORE_EARLY_TEST,
  TEST_TRIAL_COUNT,
} from '../services/prototypeEngine';
import { DistractorOverlay } from './DistractorOverlay';
import { audioFeedback } from '../services/audioService';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useI18n, type MessageKey } from '../i18n';
import { RotateCcw, CheckCircle2, XCircle, Award, Play, AlertTriangle } from 'lucide-react';

interface Props {
  cognitiveLoad: CognitiveLoadConfig;
  celebrationEnabled: boolean;
  onSessionComplete?: (report: SessionReport<ParadigmStats>) => void;
}

/** Feedback / phase banner is shown alone; inputs stay locked during this interval. */
const ITI_MS = 450;
const PROTOTYPE_CANVAS_PX = 200;

/** Deterministic PRNG for the perceptual-noise specks (same pattern => same noise). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export const PrototypeView: React.FC<Props> = ({ cognitiveLoad, celebrationEnabled, onSessionComplete }) => {
  const { t, tList, lang } = useI18n();
  const [phase, setPhase] = useState<'learning' | 'test'>('learning');
  const [learningIndex, setLearningIndex] = useState<number>(0);
  const [testIndex, setTestIndex] = useState<number>(0);
  const [testSequence, setTestSequence] = useState<DotPattern[]>(() => generatePrototypeTestSequence(TEST_TRIAL_COUNT));
  const [currentPattern, setCurrentPattern] = useState<DotPattern | null>(() => generateLearningPattern(0));
  const [trials, setTrials] = useState<PrototypeTrial[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean } | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [renderFailed, setRenderFailed] = useState<boolean>(false);
  /** Message key of the current phase notice, so it follows the language switcher. */
  const [phaseNotice, setPhaseNotice] = useState<MessageKey | ''>('');

  const prefersReducedMotion = usePrefersReducedMotion();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const trialStartRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const reportedRef = useRef<boolean>(false);
  const answeredPatternRef = useRef<string>('');
  const trialsRef = useRef<PrototypeTrial[]>([]);
  trialsRef.current = trials;

  const isTestComplete = phase === 'test' && testIndex >= testSequence.length;

  /** Renders a key array as one paragraph (no separator in Chinese, a space in English). */
  const joinList = (keys: readonly MessageKey[], vars?: Record<string, string | number>) =>
    (vars ? keys.map((key) => t(key, vars)) : tList(keys)).join(lang === 'zh' ? '' : ' ');

  // ---------------------------------------------------------------------------
  // Canvas drawing (with DPR scaling, deterministic perceptual noise, fallback)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPattern) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setRenderFailed(true);
      return;
    }
    setRenderFailed(false);

    const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
    const backing = Math.round(PROTOTYPE_CANVAS_PX * dpr);
    if (canvas.width !== backing || canvas.height !== backing) {
      canvas.width = backing;
      canvas.height = backing;
    }
    canvas.style.width = `${PROTOTYPE_CANVAS_PX}px`;
    canvas.style.height = `${PROTOTYPE_CANVAS_PX}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, PROTOTYPE_CANVAS_PX, PROTOTYPE_CANVAS_PX);

    // Subtle dark background grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 20; x < PROTOTYPE_CANVAS_PX; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, PROTOTYPE_CANVAS_PX);
      ctx.stroke();
    }
    for (let y = 20; y < PROTOTYPE_CANVAS_PX; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(PROTOTYPE_CANVAS_PX, y);
      ctx.stroke();
    }

    // Perceptual noise (cognitive-load switch) — deterministic per pattern.
    if (cognitiveLoad.perceptualNoiseLevel > 0) {
      const rng = mulberry32(hashString(currentPattern.id));
      const specks = Math.round(cognitiveLoad.perceptualNoiseLevel * 8);
      ctx.fillStyle = 'rgba(226, 232, 240, 0.55)';
      for (let i = 0; i < specks; i++) {
        const x = rng() * PROTOTYPE_CANVAS_PX;
        const y = rng() * PROTOTYPE_CANVAS_PX;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Draw 9 dots with subtle glow
    currentPattern.dots.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 7, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

    // The stimulus is painted: start the RT clock here.
    trialStartRef.current = Date.now();
  }, [currentPattern, cognitiveLoad.perceptualNoiseLevel]);

  // ---------------------------------------------------------------------------
  // Response handling
  // ---------------------------------------------------------------------------
  const handleChoice = useCallback(
    (choice: 'A' | 'B') => {
      if (!currentPattern || isLocked || isTestComplete) return;
      // Synchronous per-trial lock: no double trial record, no double sound/stimulus.
      if (answeredPatternRef.current === currentPattern.id) return;
      answeredPatternRef.current = currentPattern.id;

      const isCorrect = choice === currentPattern.category;
      const phaseAtResponse = phase;

      // Feedback is provided ONLY in the learning phase (the original paradigm
      // gives no feedback during the transfer test, otherwise feedback-driven
      // online learning contaminates the prototype-advantage effect).
      if (phaseAtResponse === 'learning') {
        if (isCorrect) audioFeedback.playCorrect();
        else audioFeedback.playIncorrect();
      }

      const trial: PrototypeTrial = {
        trialNumber: trials.length + 1,
        phase: phaseAtResponse,
        pattern: currentPattern,
        userChoice: choice,
        isCorrect,
        reactionTimeMs: Date.now() - trialStartRef.current,
      };

      const nextTrials = [...trials, trial];
      setTrials(nextTrials);
      setLastFeedback(phaseAtResponse === 'learning' ? { isCorrect } : null);

      setIsLocked(true);
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = window.setTimeout(() => {
        advanceTimerRef.current = null;

        if (phaseAtResponse === 'learning') {
          const nextLearningIndex = learningIndex + 1;
          if (nextLearningIndex >= LEARNING_TRIAL_COUNT) {
            // Learning finished -> start the fixed test sequence.
            setPhase('test');
            setTestIndex(0);
            setPhaseNotice('proto.notice.learningDone');
            setCurrentPattern(testSequence[0] ?? null);
          } else {
            setLearningIndex(nextLearningIndex);
            setCurrentPattern(generateLearningPattern(nextLearningIndex));
          }
          setIsLocked(false);
          return;
        }

        const nextTestIndex = testIndex + 1;
        setTestIndex(nextTestIndex);
        setCurrentPattern(nextTestIndex < testSequence.length ? testSequence[nextTestIndex] : null);
        setIsLocked(false);
      }, ITI_MS);
    },
    [currentPattern, isLocked, isTestComplete, learningIndex, phase, testIndex, testSequence, trials]
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

  // Report the session exactly once when the fixed test sequence is finished.
  useEffect(() => {
    if (!isTestComplete) return;
    if (reportedRef.current) return;
    reportedRef.current = true;

    if (celebrationEnabled && !prefersReducedMotion) {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    }

    onSessionComplete?.({
      stats: { task: 'prototype', prototype: calculatePrototypeStats(trialsRef.current) },
      durationSeconds: (Date.now() - sessionStartRef.current) / 1000,
    });
  }, [celebrationEnabled, isTestComplete, onSessionComplete, prefersReducedMotion]);

  const stats = calculatePrototypeStats(trials);
  const learningCount = stats.learningTrialCount;
  const testCount = stats.testTrialCount;

  const startTestPhaseEarly = () => {
    if (phase !== 'learning' || learningCount < MIN_LEARNING_BEFORE_EARLY_TEST) return;
    setPhase('test');
    setTestIndex(0);
    setPhaseNotice('proto.notice.earlyTest');
    setCurrentPattern(testSequence[0] ?? null);
    answeredPatternRef.current = '';
  };

  const resetTest = () => {
    if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = null;
    setPhase('learning');
    setLearningIndex(0);
    setTestIndex(0);
    setTestSequence(generatePrototypeTestSequence(TEST_TRIAL_COUNT));
    setTrials([]);
    setLastFeedback(null);
    setIsLocked(false);
    setPhaseNotice('');
    answeredPatternRef.current = '';
    reportedRef.current = false;
    sessionStartRef.current = Date.now();
    setCurrentPattern(generateLearningPattern(0));
  };

  const canStartEarly = phase === 'learning' && learningCount >= MIN_LEARNING_BEFORE_EARLY_TEST;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Context Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {t('proto.badge')}
              </span>
              <span className="text-xs text-slate-500 font-mono">Posner &amp; Keele (1968) / Knowlton &amp; Squire (1993)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{t('proto.title')}</h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
              {t('proto.intro.a', { count: LEARNING_TRIAL_COUNT })}
              <span className="font-semibold text-rose-600">{t('proto.intro.neverPrototype')}</span>
              {t('proto.intro.b', { count: TEST_TRIAL_COUNT })}
              <span className="font-semibold text-slate-900">{t('proto.intro.noFeedback')}</span>
              {t('proto.intro.c')}
              <span className="font-semibold text-indigo-600">{t('proto.intro.novelPrototype')}</span>
              {t('proto.intro.d')}
            </p>
          </div>

          <button
            onClick={resetTest}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            {t('proto.action.reset')}
          </button>
        </div>

        {/* Phase progress banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                phase === 'learning'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
              }`}
            >
              {phase === 'learning' ? t('proto.phase.learning') : t('proto.phase.test')}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {phase === 'learning'
                ? t('proto.progress.learning', {
                    current: Math.min(learningCount, LEARNING_TRIAL_COUNT),
                    total: LEARNING_TRIAL_COUNT,
                  })
                : t('proto.progress.test', {
                    current: Math.min(testCount, testSequence.length),
                    total: testSequence.length,
                  })}
            </span>
          </div>

          {canStartEarly && (
            <button
              onClick={startTestPhaseEarly}
              className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              {t('proto.action.startTestEarly')}
            </button>
          )}
        </div>

        <div role="status" aria-live="polite" className="sr-only">
          {phase === 'learning'
            ? t('proto.a11y.learningTrial', { current: learningCount + 1 })
            : t('proto.a11y.testTrial', {
                current: Math.min(testCount + 1, testSequence.length),
                total: testSequence.length,
              })}
        </div>

        {phaseNotice && (
          <p className="mt-3 text-[11px] text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
            {t(phaseNotice)}
          </p>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('proto.stat.learningAccuracy')}</span>
            <span className="text-lg font-bold font-mono text-slate-800">
              {learningCount === 0 ? t('proto.stat.notMeasured') : `${stats.learningAccuracy}%`}
            </span>
          </div>
          <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100">
            <span className="text-[11px] text-indigo-700 block font-semibold">{t('proto.stat.prototypeAccuracy')}</span>
            <span className="text-lg font-bold font-mono text-indigo-700">
              {stats.prototypeTrialCount === 0 ? t('proto.stat.notMeasured') : `${stats.prototypeAccuracy}%`}
              <span className="text-[10px] font-normal text-slate-400 ml-1">
                {t('proto.stat.trialCount', { count: stats.prototypeTrialCount })}
              </span>
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('proto.stat.novelDistortionAccuracy')}</span>
            <span className="text-lg font-bold font-mono text-slate-700">
              {stats.novelDistortionTrialCount === 0
                ? t('proto.stat.notMeasured')
                : `${stats.novelDistortionAccuracy}%`}
              <span className="text-[10px] font-normal text-slate-400 ml-1">
                {t('proto.stat.trialCount', { count: stats.novelDistortionTrialCount })}
              </span>
            </span>
          </div>
          <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
            <span className="text-[11px] text-emerald-800 block font-semibold flex items-center gap-1">
              {t('proto.stat.enhancement')}
              <Award className="w-3 h-3 text-emerald-600" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold font-mono text-emerald-700">
              {stats.prototypeTrialCount === 0 || stats.novelDistortionTrialCount === 0
                ? t('proto.stat.notMeasured')
                : `${stats.prototypeEnhancementEffect > 0 ? '+' : ''}${stats.prototypeEnhancementEffect}%`}
            </span>
            <span className="text-[10px] text-slate-400 block">{t('proto.stat.enhancementFormula')}</span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-500">
          {t('proto.keyboard.intro')}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">A</kbd>
          {t('proto.keyboard.a')}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">B</kbd>
          {t('proto.keyboard.b')}
          <span className="ml-1 text-slate-400">
            {joinList(['proto.note.testSequenceA', 'proto.note.testSequenceB'])}
          </span>
        </p>
      </div>

      {/* Main Testing Arena */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col items-center">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {phase === 'learning' ? t('proto.stimulus.learningTitle') : t('proto.stimulus.testTitle')}
        </div>

        {/* Canvas Display */}
        <div className="relative p-2 bg-slate-950 rounded-2xl border-2 border-slate-700 shadow-xl mb-6">
          {renderFailed ? (
            <div
              className="flex flex-col items-center justify-center text-center px-6"
              style={{ width: PROTOTYPE_CANVAS_PX, height: PROTOTYPE_CANVAS_PX }}
              role="alert"
            >
              <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" aria-hidden="true" />
              <p className="text-xs text-amber-200 font-semibold">{t('proto.renderFailed.title')}</p>
              <p className="text-[11px] text-slate-400 mt-1">{t('proto.renderFailed.body')}</p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={PROTOTYPE_CANVAS_PX}
              height={PROTOTYPE_CANVAS_PX}
              style={{ width: PROTOTYPE_CANVAS_PX, height: PROTOTYPE_CANVAS_PX }}
              className="rounded-xl block"
              role="img"
              aria-label={phase === 'learning' ? t('proto.stimulus.learningAria') : t('proto.stimulus.testAria')}
            />
          )}
          {cognitiveLoad.distractorInterference && !renderFailed && (
            <DistractorOverlay className="rounded-xl" intensity={cognitiveLoad.perceptualNoiseLevel + 25} />
          )}
        </div>

        {/* Decision Buttons */}
        <div className="flex items-center gap-4 w-full max-w-sm mb-6">
          <button
            onClick={() => handleChoice('A')}
            disabled={isLocked || isTestComplete || renderFailed}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm text-white shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('proto.choice.a')}
          </button>

          <button
            onClick={() => handleChoice('B')}
            disabled={isLocked || isTestComplete || renderFailed}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm text-white shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('proto.choice.b')}
          </button>
        </div>

        {/* Feedback Section — learning phase only */}
        <div role="status" aria-live="polite">
          {phase === 'learning' && lastFeedback && (
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
                {lastFeedback.isCorrect ? t('proto.feedback.correct') : t('proto.feedback.incorrect')}
              </span>
            </div>
          )}
          {phase === 'test' && !isTestComplete && (
            <p className="pt-4 border-t border-slate-800 w-full text-center text-xs text-slate-400">
              {t('proto.feedback.noFeedbackTest', { current: testCount, total: testSequence.length })}
            </p>
          )}
        </div>
      </div>

      {/* Completion summary */}
      {isTestComplete && (
        <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            {t('proto.complete.title')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t('proto.stat.learningAccuracy')}</span>
              <span className="text-base font-bold font-mono text-slate-800">
                {t('proto.complete.learningValue', {
                  accuracy: stats.learningAccuracy,
                  count: stats.learningTrialCount,
                })}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t('proto.complete.prototypeVsNovel')}</span>
              <span className="text-base font-bold font-mono text-indigo-700">
                {stats.prototypeAccuracy}% / {stats.novelDistortionAccuracy}%
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t('proto.stat.enhancement')}</span>
              <span className="text-base font-bold font-mono text-emerald-700">
                {stats.prototypeEnhancementEffect > 0 ? '+' : ''}
                {stats.prototypeEnhancementEffect}pp
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{t('proto.stat.avgRt')}</span>
              <span className="text-base font-bold font-mono text-slate-800">
                {stats.avgReactionTimeMs === null ? t('proto.stat.notMeasured') : `${stats.avgReactionTimeMs}ms`}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {t('proto.stat.rtSamples', { count: stats.rtSampleCount })}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            {joinList(['proto.complete.noteA', 'proto.complete.noteB'], {
              perType: Math.floor(testSequence.length / 3),
            })}
          </p>
          <button
            onClick={resetTest}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {t('proto.action.restart')}
          </button>
        </div>
      )}
    </div>
  );
};
