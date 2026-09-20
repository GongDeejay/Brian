import { useCallback, useEffect, useRef } from 'react';

/**
 * Every timer used by a paradigm task must be created through this hook.
 *
 * The previous implementation stored only one pending timeout in a single ref
 * (and in OSPAN stored none at all), so:
 *   - the untracked 600 ms feedback timer re-entered the experiment ~0.6 s after
 *     the user pressed "中断调参";
 *   - the N-back countdown `setInterval` survived unmount and started a whole
 *     trial chain on an unmounted component;
 *   - the OSPAN letter/next-set timers kept running after switching tabs.
 *
 * `clearAll()` fixes all of those; `pauseAll()` / `resumeAll()` additionally
 * support the focus-loss guard by freezing pending delays.
 */

export interface PendingTimer {
  callback: () => void;
  /** Native timeout handle (null while paused or already fired). */
  handle: number | null;
  /** Total delay originally requested. */
  delay: number;
  /** performance.now() when the current wait started. */
  startedAt: number;
  /** Milliseconds still owed; recomputed on pause. */
  remaining: number;
}

export interface TaskTimers {
  schedule: (callback: () => void, delayMs: number) => PendingTimer;
  cancel: (timer: PendingTimer) => void;
  clearAll: () => void;
  pauseAll: () => void;
  resumeAll: () => void;
}

export function useTaskTimers(): TaskTimers {
  const activeRef = useRef<Set<PendingTimer>>(new Set());
  const pausedRef = useRef<PendingTimer[]>([]);

  const cancel = useCallback((timer: PendingTimer) => {
    if (timer.handle !== null) {
      window.clearTimeout(timer.handle);
      timer.handle = null;
    }
    activeRef.current.delete(timer);
    const idx = pausedRef.current.indexOf(timer);
    if (idx >= 0) pausedRef.current.splice(idx, 1);
  }, []);

  const schedule = useCallback((callback: () => void, delayMs: number) => {
    const now = performance.now();
    const timer: PendingTimer = {
      callback,
      handle: null,
      delay: delayMs,
      startedAt: now,
      remaining: delayMs,
    };
    timer.handle = window.setTimeout(() => {
      timer.handle = null;
      activeRef.current.delete(timer);
      callback();
    }, delayMs);
    activeRef.current.add(timer);
    return timer;
  }, []);

  const clearAll = useCallback(() => {
    activeRef.current.forEach((timer) => {
      if (timer.handle !== null) {
        window.clearTimeout(timer.handle);
        timer.handle = null;
      }
    });
    activeRef.current.clear();
    pausedRef.current = [];
  }, []);

  const pauseAll = useCallback(() => {
    const now = performance.now();
    activeRef.current.forEach((timer) => {
      if (timer.handle !== null) {
        window.clearTimeout(timer.handle);
        timer.handle = null;
      }
      timer.remaining = Math.max(0, timer.remaining - (now - timer.startedAt));
      pausedRef.current.push(timer);
    });
    activeRef.current.clear();
  }, []);

  const resumeAll = useCallback(() => {
    const queue = pausedRef.current;
    pausedRef.current = [];
    const now = performance.now();
    queue.forEach((timer) => {
      const delay = Math.max(0, timer.remaining);
      timer.startedAt = now;
      timer.remaining = delay;
      timer.handle = window.setTimeout(() => {
        timer.handle = null;
        activeRef.current.delete(timer);
        timer.callback();
      }, delay);
      activeRef.current.add(timer);
    });
  }, []);

  // Unmount safety net: no timer may outlive the component.
  useEffect(() => clearAll, [clearAll]);

  return { schedule, cancel, clearAll, pauseAll, resumeAll };
}
