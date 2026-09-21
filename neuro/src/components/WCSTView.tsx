import React, { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CognitiveLoadConfig,
  ParadigmStats,
  SessionReport,
  WCSTCard,
  WCSTColor,
  WCSTRule,
  WCSTShape,
  WCSTTrial,
} from '../types';
import {
  calculateWCSTStats,
  generateWCSTDeck,
  getMatchedRules,
  RULE_SEQUENCE,
  WCST_REFERENCE_CARDS,
} from '../services/wcstEngine';
import { WCSTCardView } from './WCSTCardView';
import { DistractorOverlay } from './DistractorOverlay';
import { audioFeedback } from '../services/audioService';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useI18n, type MessageKey } from '../i18n';
import { Brain, RotateCcw, AlertTriangle, Award, HelpCircle, Activity, X } from 'lucide-react';

interface Props {
  cognitiveLoad: CognitiveLoadConfig;
  /** Confetti is opt-in (default OFF): it is an arousal confound in a research task. */
  celebrationEnabled: boolean;
  onSessionComplete?: (report: SessionReport<ParadigmStats>) => void;
}

/** Dual-task probe cadence: a digit is issued every N trials and recalled N+4 trials later. */
const WM_PROBE_INTERVAL_TRIALS = 8;
const WM_RETENTION_TRIALS = 4;
/** Inter-trial interval: feedback is shown alone, inputs are locked, then the next card appears. */
const ITI_MS = 420;

type Feedback = { kind: 'correct' | 'incorrect' | 'omission' } | null;

interface WmProbe {
  number: number;
  issuedAtTrial: number;
}

interface WmResult {
  issuedAtTrial: number;
  testedAtTrial: number;
  correct: boolean;
  skipped: boolean;
}

/**
 * Standard Heaton (1993) administration uses 128 cards (two full 64-card decks)
 * with a ceiling of 6 completed categories. A 64-card deck cannot reach 6
 * categories, which would make the "完成分类数 X/6" metric systematically
 * understated — so we always administer the full 128-card deck.
 */
const WCST_DECK_SIZE = 128;
const WCST_MAX_CATEGORIES = 6;

/**
 * Card-attribute and rule names are resolved through the message catalogue so the
 * spoken/visible description follows the selected language.
 */
const WCST_COLOR_KEYS: Record<WCSTColor, MessageKey> = {
  red: 'wcst.card.color.red',
  green: 'wcst.card.color.green',
  yellow: 'wcst.card.color.yellow',
  blue: 'wcst.card.color.blue',
};

const WCST_SHAPE_KEYS: Record<WCSTShape, MessageKey> = {
  triangle: 'wcst.card.shape.triangle',
  star: 'wcst.card.shape.star',
  cross: 'wcst.card.shape.cross',
  circle: 'wcst.card.shape.circle',
};

const WCST_SHAPE_PLURAL_KEYS: Record<WCSTShape, MessageKey> = {
  triangle: 'wcst.card.shape.trianglePlural',
  star: 'wcst.card.shape.starPlural',
  cross: 'wcst.card.shape.crossPlural',
  circle: 'wcst.card.shape.circlePlural',
};

const WCST_RULE_KEYS: Record<WCSTRule, MessageKey> = {
  color: 'wcst.rule.color',
  shape: 'wcst.rule.shape',
  number: 'wcst.rule.number',
};

/** Trial-table headers, rendered from a key array via `tList`. */
const WCST_TABLE_COLUMNS: readonly MessageKey[] = [
  'wcst.table.col.trial',
  'wcst.table.col.card',
  'wcst.table.col.choice',
  'wcst.table.col.rule',
  'wcst.table.col.matched',
  'wcst.table.col.feedback',
  'wcst.table.col.diagnosis',
  'wcst.table.col.rt',
];

export const WCSTView: React.FC<Props> = ({ cognitiveLoad, celebrationEnabled, onSessionComplete }) => {
  const { t, tList } = useI18n();

  /** Bilingual attribute description of a card, e.g. "1 red triangle" / "红色三角形 1 个". */
  const describeCard = (card: WCSTCard): string =>
    t(card.number > 1 ? 'wcst.card.describePlural' : 'wcst.card.describe', {
      color: t(WCST_COLOR_KEYS[card.color]),
      shape: t(card.number > 1 ? WCST_SHAPE_PLURAL_KEYS[card.shape] : WCST_SHAPE_KEYS[card.shape]),
      count: card.number,
    });

  /** Localised name of a matching dimension (colour / shape / number). */
  const ruleLabel = (rule: WCSTRule): string => t(WCST_RULE_KEYS[rule]);

  const [deck, setDeck] = useState<WCSTCard[]>(() => generateWCSTDeck(WCST_DECK_SIZE));
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [activeRuleIndex, setActiveRuleIndex] = useState<number>(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [categoriesCompleted, setCategoriesCompleted] = useState<number>(0);
  const [trials, setTrials] = useState<WCSTTrial[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [timeLeft, setTimeLeft] = useState<number>(cognitiveLoad.timeLimitSeconds);
  /** true while feedback is displayed / between trials; blocks all input. */
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // ---- Dual-task working-memory probe (explicit state machine, not a self-firing effect)
  const [wmProbe, setWmProbe] = useState<WmProbe | null>(null);
  const [wmTest, setWmTest] = useState<WmProbe | null>(null);
  const [wmAnswer, setWmAnswer] = useState<string>('');
  const [wmResults, setWmResults] = useState<WmResult[]>([]);

  const prefersReducedMotion = usePrefersReducedMotion();

  // ---- Refs: timers, per-trial guards, session bookkeeping
  const timerRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const trialStartRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const reportedRef = useRef<boolean>(false);
  /** Trial count at which the last probe was issued — a boundary can only be used once. */
  const probeBoundaryRef = useRef<number>(-1);
  /** Card index that already produced a response (double-click / keyboard lock). */
  const answeredCardRef = useRef<number>(-1);
  /** Card index that already produced a timeout record. */
  const timeoutHandledRef = useRef<number>(-1);
  const wmTestRef = useRef<WmProbe | null>(null);

  useEffect(() => {
    wmTestRef.current = wmTest;
  }, [wmTest]);

  const currentActiveRule = RULE_SEQUENCE[activeRuleIndex % RULE_SEQUENCE.length];
  const previousRule = activeRuleIndex > 0 ? RULE_SEQUENCE[(activeRuleIndex - 1) % RULE_SEQUENCE.length] : null;
  const currentTestCard = deck[cardIndex];
  const isDeckFinished = cardIndex >= deck.length || categoriesCompleted >= WCST_MAX_CATEGORIES;
  const isBoardLocked = isLocked || wmTest !== null || isDeckFinished;

  const stats = calculateWCSTStats(trials, categoriesCompleted);

  // -------------------------------------------------------------------------
  // Inter-trial interval: shows feedback alone, then presents the next card.
  // Deferred while the working-memory probe modal is open.
  // -------------------------------------------------------------------------
  const scheduleAdvance = useCallback(() => {
    setIsLocked(true);
    if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);

    const advance = () => {
      if (wmTestRef.current !== null) {
        advanceTimerRef.current = window.setTimeout(advance, 200);
        return;
      }
      advanceTimerRef.current = null;
      setCardIndex((prev) => prev + 1);
      trialStartRef.current = Date.now();
      setIsLocked(false);
    };

    advanceTimerRef.current = window.setTimeout(advance, ITI_MS);
  }, []);

  // -------------------------------------------------------------------------
  // Omission path (time limit expired with no response).
  // A non-response is recorded as an omission: no fabricated RT, no fake card,
  // and NOT counted as a non-perseverative error.
  // -------------------------------------------------------------------------
  const handleOmission = useCallback(() => {
    if (isDeckFinished || !currentTestCard) return;
    if (answeredCardRef.current === cardIndex) return;

    audioFeedback.playIncorrect();

    const omissionTrial: WCSTTrial = {
      trialNumber: trials.length + 1,
      testCard: currentTestCard,
      chosenReferenceIndex: -1,
      chosenCard: null,
      currentActiveRule,
      matchedRules: [],
      isOmission: true,
      isCorrect: false,
      isPerseverativeResponse: false,
      isPerseverativeError: false,
      isNonPerseverativeError: false,
      reactionTimeMs: null,
      consecutiveCorrect: 0,
      ruleShiftOccurred: false,
    };

    setTrials((prev) => [...prev, omissionTrial]);
    setConsecutiveCorrect(0);
    setFeedback({ kind: 'omission' });
    setTimeLeft(cognitiveLoad.timeLimitSeconds);
    scheduleAdvance();
  }, [
    cardIndex,
    cognitiveLoad.timeLimitSeconds,
    currentActiveRule,
    currentTestCard,
    isDeckFinished,
    scheduleAdvance,
    trials.length,
  ]);

  // -------------------------------------------------------------------------
  // Countdown timer. The updater is PURE (no side effects inside setState) so
  // React StrictMode double-invocation can never duplicate a trial record.
  // Paused while the response lock is on or the WM probe modal is open.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const limit = cognitiveLoad.timeLimitSeconds;
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (limit <= 0 || isDeckFinished || isLocked || wmTest !== null) return;

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
  }, [cardIndex, cognitiveLoad.timeLimitSeconds, isDeckFinished, isLocked, wmTest]);

  // Timeout detection lives OUTSIDE the state updater, guarded per card index.
  useEffect(() => {
    const limit = cognitiveLoad.timeLimitSeconds;
    if (limit <= 0 || isDeckFinished || isLocked || wmTest !== null) return;
    if (timeLeft > 0.05) return;
    if (timeoutHandledRef.current === cardIndex) return;
    timeoutHandledRef.current = cardIndex;
    handleOmission();
  }, [cardIndex, cognitiveLoad.timeLimitSeconds, handleOmission, isDeckFinished, isLocked, timeLeft, wmTest]);

  // -------------------------------------------------------------------------
  // Dual-task WM probe state machine.
  //
  // States: IDLE -> PROBE_ARMED(issuedAtTrial=N) -> TEST_OPEN -> IDLE
  // Guards that make an infinite modal loop impossible:
  //   G1  a test can only open when a probe is armed (wmProbe !== null);
  //   G2  opening the test consumes the probe (wmProbe := null), so the same
  //       trial count can never open a second test;
  //   G3  while a test is open the effect returns early (wmTest !== null);
  //   G4  a twin boundary can only arm a probe once (probeBoundaryRef);
  //   G5  closing the test changes neither trials.length nor the boundary, so
  //       re-arming requires WM_PROBE_INTERVAL_TRIALS *new* trials.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!cognitiveLoad.workingMemoryDistractor) return;
    if (isDeckFinished) return;
    if (wmTest !== null) return; // G3

    const trialCount = trials.length;

    if (wmProbe === null) {
      const isBoundary = trialCount > 0 && trialCount % WM_PROBE_INTERVAL_TRIALS === 0;
      if (isBoundary && probeBoundaryRef.current !== trialCount) {
        probeBoundaryRef.current = trialCount; // G4
        setWmProbe({
          number: 100 + Math.floor(Math.random() * 900),
          issuedAtTrial: trialCount,
        });
      }
      return;
    }

    if (trialCount - wmProbe.issuedAtTrial >= WM_RETENTION_TRIALS) {
      setWmTest(wmProbe); // G1
      setWmProbe(null); // G2
      setWmAnswer('');
    }
  }, [cognitiveLoad.workingMemoryDistractor, isDeckFinished, trials.length, wmProbe, wmTest]);

  /**
   * Closes the probe modal exactly once and always clears both probe states.
   * `submitted = false` is an explicit skip (the participant is never trapped).
   */
  const completeWmTest = useCallback(
    (submitted: boolean) => {
      const test = wmTest;
      if (!test) return;
      const parsed = parseInt(wmAnswer.replace(/\D/g, ''), 10);
      const correct = submitted && Number.isFinite(parsed) && parsed === test.number;
      if (submitted) {
        if (correct) audioFeedback.playCorrect();
        else audioFeedback.playIncorrect();
      }
      setWmResults((prev) => [
        ...prev,
        { issuedAtTrial: test.issuedAtTrial, testedAtTrial: trials.length, correct, skipped: !submitted },
      ]);
      setWmTest(null);
      setWmAnswer('');
    },
    [trials.length, wmAnswer, wmTest]
  );

  const skipWmTest = useCallback(() => completeWmTest(false), [completeWmTest]);
  const { panelRef, handleBackdropMouseDown } = useDialogA11y({ isOpen: wmTest !== null, onClose: skipWmTest });

  // -------------------------------------------------------------------------
  // Card sorting (mouse, keyboard, or the canonical text buttons).
  // -------------------------------------------------------------------------
  const handleCardSort = useCallback(
    (refIndex: number) => {
      if (isDeckFinished || !currentTestCard) return;
      if (isLocked || wmTest !== null) return;
      // Synchronous per-trial lock: a double click/key press cannot record twice.
      if (answeredCardRef.current === cardIndex) return;
      answeredCardRef.current = cardIndex;

      const rt = Date.now() - trialStartRef.current;
      const refCard = WCST_REFERENCE_CARDS[refIndex];
      const matched = getMatchedRules(currentTestCard, refCard);
      const isCorrect = matched.includes(currentActiveRule);

      // Perseverative response: the choice still matches the now-obsolete rule.
      const isPerseverativeResponse = previousRule !== null && matched.includes(previousRule);
      const isPerseverativeError = !isCorrect && isPerseverativeResponse;
      const isNonPerseverativeError = !isCorrect && !isPerseverativeResponse;

      let newConsecutive = isCorrect ? consecutiveCorrect + 1 : 0;
      let ruleShiftOccurred = false;
      let newRuleIdx = activeRuleIndex;
      let newCategories = categoriesCompleted;

      if (isCorrect) {
        audioFeedback.playCorrect();
        // Internal criterion for the covert rule shift (Heaton 1993): 10 in a row.
        // IMPORTANT: the participant is never told that the shift happened, and no
        // shift-specific sound/confetti/toast is emitted — only correct/incorrect.
        if (newConsecutive >= 10) {
          ruleShiftOccurred = true;
          newRuleIdx = activeRuleIndex + 1;
          newCategories = categoriesCompleted + 1;
          newConsecutive = 0;
        }
      } else {
        audioFeedback.playIncorrect();
      }

      const trialRecord: WCSTTrial = {
        trialNumber: trials.length + 1,
        testCard: currentTestCard,
        chosenReferenceIndex: refIndex,
        chosenCard: refCard,
        currentActiveRule,
        matchedRules: matched,
        isOmission: false,
        isCorrect,
        isPerseverativeResponse,
        isPerseverativeError,
        isNonPerseverativeError,
        reactionTimeMs: rt,
        consecutiveCorrect: newConsecutive,
        ruleShiftOccurred,
      };

      setTrials((prev) => [...prev, trialRecord]);
      setFeedback({ kind: isCorrect ? 'correct' : 'incorrect' });
      setConsecutiveCorrect(newConsecutive);
      setActiveRuleIndex(newRuleIdx);
      setCategoriesCompleted(newCategories);
      setTimeLeft(cognitiveLoad.timeLimitSeconds);
      scheduleAdvance();
    },
    [
      activeRuleIndex,
      cardIndex,
      categoriesCompleted,
      cognitiveLoad.timeLimitSeconds,
      consecutiveCorrect,
      currentActiveRule,
      currentTestCard,
      isDeckFinished,
      isLocked,
      previousRule,
      scheduleAdvance,
      trials.length,
      wmTest,
    ]
  );

  // -------------------------------------------------------------------------
  // Session reporting: fires EXACTLY ONCE when the deck is exhausted or six
  // categories are reached — regardless of whether the last trial was a
  // response or a timeout.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isDeckFinished) return;
    if (reportedRef.current) return;
    reportedRef.current = true;

    if (celebrationEnabled && !prefersReducedMotion) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }

    const finalStats = calculateWCSTStats(trials, categoriesCompleted);
    const attempted = wmResults.filter((r) => !r.skipped).length;
    const correctProbes = wmResults.filter((r) => r.correct).length;
    const extraMetrics =
      wmResults.length > 0
        ? {
            [t('wcst.wm.metric.issued')]: wmResults.length,
            [t('wcst.wm.metric.answered')]: attempted,
            [t('wcst.wm.metric.skipped')]: wmResults.length - attempted,
            [t('wcst.wm.metric.correct')]: correctProbes,
            [t('wcst.wm.metric.accuracy')]: attempted > 0 ? Math.round((correctProbes / attempted) * 100) : null,
          }
        : undefined;

    onSessionComplete?.({
      stats: { task: 'wcst', wcst: finalStats },
      durationSeconds: (Date.now() - sessionStartRef.current) / 1000,
      extraMetrics,
    });
  }, [
    categoriesCompleted,
    celebrationEnabled,
    isDeckFinished,
    onSessionComplete,
    prefersReducedMotion,
    t,
    trials,
    wmResults,
  ]);

  // -------------------------------------------------------------------------
  // Keyboard support: 1/2/3/4 sort into the four reference cards.
  // Ignored while the probe modal is open or an input has focus.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (wmTest !== null) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
      const refIndex = map[event.key];
      if (refIndex === undefined) return;
      event.preventDefault();
      handleCardSort(refIndex);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleCardSort, wmTest]);

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

    setDeck(generateWCSTDeck(WCST_DECK_SIZE));
    setCardIndex(0);
    setActiveRuleIndex(0);
    setConsecutiveCorrect(0);
    setCategoriesCompleted(0);
    setTrials([]);
    setFeedback(null);
    setWmProbe(null);
    setWmTest(null);
    setWmAnswer('');
    setWmResults([]);
    setIsLocked(false);
    setTimeLeft(cognitiveLoad.timeLimitSeconds);

    probeBoundaryRef.current = -1;
    answeredCardRef.current = -1;
    timeoutHandledRef.current = -1;
    reportedRef.current = false;
    trialStartRef.current = Date.now();
    sessionStartRef.current = Date.now();
  };

  const feedbackAnnouncement =
    feedback === null
      ? ''
      : feedback.kind === 'correct'
      ? t('wcst.announce.correct')
      : feedback.kind === 'incorrect'
      ? t('wcst.announce.incorrect')
      : t('wcst.announce.omission');

  const tableColumnLabels = tList(WCST_TABLE_COLUMNS);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Academic Context Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {t('wcst.badge')}
              </span>
              <span className="text-xs text-slate-500 font-mono">Grant &amp; Berg (1948) / Heaton (1993)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{t('wcst.title')}</h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
              {t('wcst.intro.lead')}
              <span className="font-semibold text-slate-900">{t('wcst.intro.noRule')}</span>
              {t('wcst.intro.dimensions')}
              <span className="font-semibold text-slate-900">{t('wcst.intro.noShiftHint')}</span>
              {t('wcst.intro.tail')}
              <span className="font-semibold text-rose-600 underline decoration-rose-300">
                {t('wcst.intro.perseverative')}
              </span>
            </p>
          </div>

          <button
            onClick={resetTest}
            className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            {t('wcst.reset')}
          </button>
        </div>

        {/* Real-time Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-4 pt-4 border-t border-slate-100 text-slate-800">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('wcst.metric.progress')}</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {Math.min(cardIndex + 1, deck.length)}
              <span className="text-xs font-normal text-slate-400">/{deck.length}</span>
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('wcst.metric.accuracy')}</span>
            <span className="text-lg font-bold font-mono text-indigo-600">
              {stats.accuracy}
              <span className="text-xs font-normal text-indigo-400">%</span>
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block flex items-center gap-1">
              {t('wcst.metric.categories')}
              <Award className="w-3 h-3 text-amber-500" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold font-mono text-amber-600">
              {categoriesCompleted}
              <span className="text-xs font-normal text-slate-400">/{WCST_MAX_CATEGORIES}</span>
            </span>
          </div>

          <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-100">
            <span className="text-[11px] text-rose-700 block font-medium flex items-center gap-1">
              {t('wcst.metric.perseverativeErrors')}
              <AlertTriangle className="w-3 h-3 text-rose-500" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold font-mono text-rose-700">
              {stats.perseverativeErrors}
              <span className="text-xs font-normal text-rose-500 ml-1">({stats.perseverativeErrorRate}%)</span>
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('wcst.metric.nonPerseverativeErrors')}</span>
            <span className="text-lg font-bold font-mono text-slate-700">{stats.nonPerseverativeErrors}</span>
            <span className="text-[10px] text-slate-400 block">
              {t('wcst.metric.omissionsNote', { count: stats.omissions })}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('wcst.metric.conceptualLevelResponses')}</span>
            <span className="text-lg font-bold font-mono text-emerald-700">{stats.conceptualLevelResponses}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 block">{t('wcst.metric.meanRt')}</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {stats.avgReactionTimeMs === null ? (
                <span className="text-sm text-slate-400">{t('wcst.metric.rtNotMeasured')}</span>
              ) : (
                <>
                  {stats.avgReactionTimeMs}
                  <span className="text-xs font-normal text-slate-400">ms</span>
                </>
              )}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {t('wcst.metric.rtSample', { count: stats.rtSampleCount })}
            </span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-500">
          {t('wcst.keyboard.lead')}{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">1</kbd>{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">2</kbd>{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">3</kbd>{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">4</kbd>{' '}
          {t('wcst.keyboard.action')}
          <span className="ml-1 text-slate-400">{t('wcst.keyboard.note')}</span>
        </p>
      </div>

      {/* Main Testing Arena */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Subtle background mesh grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Working Memory Banner if active */}
        {wmProbe !== null && (
          <div className="mb-4 p-2.5 bg-purple-950/80 border border-purple-500/40 rounded-lg flex items-center justify-between text-purple-200 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Brain className="w-4 h-4 text-purple-400" aria-hidden="true" />
              {t('wcst.wm.banner')}
            </span>
            <span className="font-mono font-bold text-sm bg-purple-900 px-2 py-0.5 rounded text-purple-100 border border-purple-400">
              {wmProbe.number}
            </span>
          </div>
        )}

        {/* Time Pressure Bar */}
        {cognitiveLoad.timeLimitSeconds > 0 && !isDeckFinished && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
              <span>
                {t('wcst.timer.label')}
                {cognitiveLoad.workingMemoryDistractor && wmTest !== null ? t('wcst.timer.paused') : ''}
              </span>
              <span className={timeLeft <= 1.0 ? 'text-rose-400 font-bold' : ''}>{timeLeft.toFixed(1)}s</span>
            </div>
            <div
              className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"
              role="progressbar"
              aria-label={t('wcst.timer.label')}
              aria-valuemin={0}
              aria-valuemax={cognitiveLoad.timeLimitSeconds}
              aria-valuenow={Number(timeLeft.toFixed(1))}
              aria-valuetext={t('wcst.timer.remaining', { seconds: timeLeft.toFixed(1) })}
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

        {/* Benchmark 4 Reference Cards Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>{t('wcst.reference.heading')}</span>
            </div>
            <span className="text-xs text-slate-400">{t('wcst.reference.count')}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 justify-items-center">
            {WCST_REFERENCE_CARDS.map((refCard, index) => (
              <div key={refCard.id} className="flex flex-col items-center gap-2">
                <WCSTCardView
                  card={refCard}
                  isReference
                  referenceIndex={index + 1}
                  onClick={() => handleCardSort(index)}
                  noiseLevel={cognitiveLoad.perceptualNoiseLevel}
                  distractor={cognitiveLoad.distractorInterference}
                  disabled={isBoardLocked}
                  ariaLabel={t('wcst.reference.cardAria', { index: index + 1, card: describeCard(refCard) })}
                />
                <button
                  onClick={() => handleCardSort(index)}
                  disabled={isBoardLocked}
                  className="w-28 sm:w-32 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  {t('wcst.reference.button', { index: index + 1 })}
                  <span className="sr-only">{t('wcst.reference.buttonDetail', { card: describeCard(refCard) })}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Center Divider with Feedback */}
        <div className="my-8 py-3 border-y border-slate-800 flex items-center justify-center">
          <div role="status" aria-live="polite" className="sr-only">
            {feedbackAnnouncement}
          </div>
          {feedback ? (
            <div
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${
                feedback.kind === 'correct'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : feedback.kind === 'incorrect'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              <span className="text-lg" aria-hidden="true">
                {feedback.kind === 'correct' ? '✓' : feedback.kind === 'incorrect' ? '✕' : '⌛'}
              </span>
              <span>
                {feedback.kind === 'correct'
                  ? t('wcst.feedback.correct')
                  : feedback.kind === 'incorrect'
                  ? t('wcst.feedback.incorrect')
                  : t('wcst.feedback.omission')}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
              {t('wcst.hint.idle')}
            </div>
          )}
        </div>

        {/* Current Active Test Card */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t('wcst.currentCard.title')}
          </div>

          {!isDeckFinished && currentTestCard ? (
            <div className="relative group">
              <WCSTCardView
                card={currentTestCard}
                noiseLevel={cognitiveLoad.perceptualNoiseLevel}
                distractor={cognitiveLoad.distractorInterference}
                ariaLabel={t('wcst.currentCard.aria', { card: describeCard(currentTestCard) })}
              />
              {cognitiveLoad.distractorInterference && (
                <DistractorOverlay className="rounded-xl" intensity={cognitiveLoad.perceptualNoiseLevel + 30} />
              )}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-slate-400 whitespace-nowrap">
                {t('wcst.currentCard.hint')}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-xl text-center max-w-sm">
              <Award className="w-10 h-10 text-amber-400 mx-auto mb-2" aria-hidden="true" />
              <h4 className="font-bold text-base text-slate-100">{t('wcst.complete.title')}</h4>
              <p className="text-xs text-slate-300 mt-1">
                {t('wcst.complete.body', {
                  categories: categoriesCompleted,
                  trials: trials.length,
                  omissions: stats.omissions,
                })}
              </p>
              <button
                onClick={resetTest}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {t('wcst.complete.restart')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trial History Stream Table */}
      {trials.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-slate-700" aria-hidden="true" />
              {t('wcst.table.title')}
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {t('wcst.table.count', { count: trials.length })}
            </span>
          </div>

          <div className="overflow-x-auto max-h-56 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">{t('wcst.table.caption')}</caption>
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  {WCST_TABLE_COLUMNS.map((columnKey, columnIndex) => (
                    <th key={columnKey} scope="col" className="py-2 px-3">
                      {tableColumnLabels[columnIndex]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {trials.slice().reverse().map((trial) => (
                  <tr key={trial.trialNumber} className={trial.isPerseverativeError ? 'bg-rose-50/50' : ''}>
                    <td className="py-2 px-3 font-semibold">{trial.trialNumber}</td>
                    <td className="py-2 px-3 font-sans">{describeCard(trial.testCard)}</td>
                    <td className="py-2 px-3">
                      {trial.chosenReferenceIndex >= 0
                        ? t('wcst.table.reference', { index: trial.chosenReferenceIndex + 1 })
                        : t('wcst.table.omission')}
                    </td>
                    <td className="py-2 px-3 text-slate-500 uppercase">{ruleLabel(trial.currentActiveRule)}</td>
                    <td className="py-2 px-3 text-[11px] text-slate-500">
                      {trial.matchedRules.map((rule) => ruleLabel(rule)).join(', ') || t('wcst.table.none')}
                    </td>
                    <td className="py-2 px-3">
                      {trial.isOmission ? (
                        <span className="text-amber-700 font-bold">{t('wcst.table.feedback.omission')}</span>
                      ) : trial.isCorrect ? (
                        <span className="text-emerald-600 font-bold">{t('wcst.table.feedback.correct')}</span>
                      ) : (
                        <span className="text-rose-600 font-bold">{t('wcst.table.feedback.incorrect')}</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {trial.isOmission ? (
                        <span className="text-slate-500 font-sans">{t('wcst.table.diagnosis.omission')}</span>
                      ) : trial.isCorrect ? (
                        <span className="text-slate-400 font-sans">-</span>
                      ) : trial.isPerseverativeError ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-sans font-semibold text-[11px]">
                          <AlertTriangle className="w-3 h-3 text-rose-600" aria-hidden="true" />
                          {t('wcst.table.diagnosis.perseverative')}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-sans">
                          {t('wcst.table.diagnosis.nonPerseverative')}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-500">
                      {trial.reactionTimeMs === null
                        ? t('wcst.metric.rtNotMeasured')
                        : `${trial.reactionTimeMs}ms`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dual-Task Working Memory Retention Modal */}
      {wmTest !== null && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in"
          onMouseDown={handleBackdropMouseDown}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wm-probe-title"
            aria-describedby="wm-probe-desc"
            tabIndex={-1}
            className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 text-slate-800 animate-modal-in outline-none"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 text-purple-700">
                <Brain className="w-5 h-5" aria-hidden="true" />
                <h4 id="wm-probe-title" className="font-bold text-base">
                  {t('wcst.wm.title')}
                </h4>
              </div>
              <button
                onClick={skipWmTest}
                aria-label={t('wcst.wm.close')}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <p id="wm-probe-desc" className="text-xs text-slate-600 mb-4">
              {t('wcst.wm.body.pre')} <strong>{wmTest.issuedAtTrial}</strong> {t('wcst.wm.body.mid')}{' '}
              {trials.length - wmTest.issuedAtTrial} {t('wcst.wm.body.post')}
            </p>
            <label htmlFor="wm-probe-answer" className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t('wcst.wm.answerLabel')}
            </label>
            <input
              id="wm-probe-answer"
              data-autofocus
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={wmAnswer}
              onChange={(e) => setWmAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  completeWmTest(true);
                }
              }}
              placeholder={t('wcst.wm.placeholder')}
              aria-describedby="wm-probe-desc"
              className="w-full text-center text-lg font-mono font-bold tracking-widest py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => completeWmTest(true)}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                {t('wcst.wm.submit')}
              </button>
              <button
                onClick={skipWmTest}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs border border-slate-200 transition-colors"
              >
                {t('wcst.wm.skip')}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">{t('wcst.wm.footnote')}</p>
          </div>
        </div>
      )}
    </div>
  );
};
