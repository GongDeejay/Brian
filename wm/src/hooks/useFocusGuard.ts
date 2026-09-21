import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { SessionValidityRecord } from '../types/wm';
import { translate, type Lang } from '../i18n';

/** Same key the i18n provider persists the participant's choice under. */
const LANG_STORAGE_KEY = 'brian.lang';

/**
 * A hook is not a component and cannot call `useI18n()`, and the unload warning
 * must be readable even if it fires while the React tree is being torn down.
 * The language is therefore resolved at the moment the event fires, with the
 * same precedence as the provider and ErrorBoundary:
 *
 *   1. the persisted `brian.lang` choice,
 *   2. `<html lang>` (kept in sync by the provider),
 *   3. the browser's own language, and finally Chinese, the source catalogue.
 *
 * Every step is wrapped so unavailable storage (private mode, blocked cookies)
 * degrades silently instead of throwing inside an unload handler.
 */
function detectLang(): Lang {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') return stored;
  } catch {
    // Storage unavailable — fall through to the document language.
  }
  const documentLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
  if (documentLang) return documentLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'zh';
  return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export interface SessionValidityStats {
  interruptions: number;
  totalAwayMs: number;
  /** Trials re-presented from the start because of an interruption. */
  trialRestarts: number;
}

const createStats = (): SessionValidityStats => ({
  interruptions: 0,
  totalAwayMs: 0,
  trialRestarts: 0,
});

/**
 * Data-validity guard for running paradigms.
 *
 * While a task is running:
 *   - losing page focus (tab switch, app switch, window blur) pauses the task
 *     and notifies the caller, so no trial silently continues unattended;
 *   - the number of interruptions and the total time away from the page are
 *     accumulated, and are reported with the result as a validity indicator;
 *   - navigating away is discouraged through `beforeunload`.
 *
 * The caller is responsible for actually pausing (clearing timers) inside
 * `onInterrupt` and for showing an explanation to the participant.
 */
export function useFocusGuard({
  active,
  onInterrupt,
}: {
  active: boolean;
  onInterrupt: () => void;
}): {
  validityRef: RefObject<SessionValidityStats>;
  resetValidity: () => void;
  finalizeValidity: () => SessionValidityRecord;
} {
  const validityRef = useRef<SessionValidityStats>(createStats());
  const onInterruptRef = useRef(onInterrupt);

  useEffect(() => {
    onInterruptRef.current = onInterrupt;
  }, [onInterrupt]);

  const resetValidity = useCallback(() => {
    validityRef.current = createStats();
  }, []);

  const finalizeValidity = useCallback((): SessionValidityRecord => {
    const stats = validityRef.current;
    return {
      interruptions: stats.interruptions,
      totalAwayMs: Math.round(stats.totalAwayMs),
      trialRestarts: stats.trialRestarts,
      isValid: stats.interruptions === 0,
    };
  }, []);

  useEffect(() => {
    if (!active) return;

    let awayStart: number | null = null;

    const markHidden = () => {
      if (awayStart !== null) return; // visibilitychange + blur may both fire
      awayStart = performance.now();
      validityRef.current.interruptions += 1;
      onInterruptRef.current();
    };

    const markVisible = () => {
      if (awayStart === null) return;
      validityRef.current.totalAwayMs += performance.now() - awayStart;
      awayStart = null;
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') markHidden();
      else markVisible();
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = translate(detectLang(), 'focus.leaveWarning');
      return event.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', markHidden);
    window.addEventListener('focus', markVisible);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      markVisible();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', markHidden);
      window.removeEventListener('focus', markVisible);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [active]);

  return { validityRef, resetValidity, finalizeValidity };
}
