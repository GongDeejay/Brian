/** Client-side JSON export so results are not trapped inside localStorage. */

export interface SessionExportPayload {
  app: string;
  task: 'nback' | 'ospan' | 'change_detection';
  exportedAt: string;
  sessionDate: string;
  feedbackMode: 'practice' | 'assessment';
  /** Configuration snapshot of the session that produced the result. */
  config: unknown;
  /** Focus-loss / interruption indicators (null when not applicable). */
  validity: unknown;
  /** Aggregate metrics of the session. */
  result: unknown;
  /** Optional compact per-trial detail. */
  trials?: unknown[];
}

/** Triggers a browser download of `payload` as pretty-printed JSON. */
export function downloadSessionJson(filename: string, payload: SessionExportPayload): boolean {
  try {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

/** Stable, human-readable file name, e.g. `wm-nback-2026-09-20.json`. */
export function sessionFileName(task: SessionExportPayload['task']): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
  return `wm-${task.replace(/_/g, '-')}-${stamp}.json`;
}
