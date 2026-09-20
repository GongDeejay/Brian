import { useState } from 'react';
import { LogOut } from 'lucide-react';

interface AbortControlProps {
  /** Called only after the participant confirms; must stop timers and drop data. */
  onAbort: () => void;
  /** Visual tone of the resting button. */
  accent?: 'indigo' | 'cyan' | 'amber';
  className?: string;
}

const ACCENTS = {
  indigo: 'hover:text-rose-300 hover:border-rose-900/50',
  cyan: 'hover:text-rose-300 hover:border-rose-900/50',
  amber: 'hover:text-rose-300 hover:border-rose-900/50',
} as const;

/**
 * Consistent "中断/退出" control shared by all three paradigms.
 *
 * Previously OSPANTask had no exit at all (the only escape was switching tabs,
 * which discarded everything silently) and the other two tasks differed from
 * each other. This asks for an inline confirmation before abandoning the run, so
 * no bogus partial result is ever saved.
 */
export const AbortControl = ({ onAbort, accent = 'indigo', className = '' }: AbortControlProps) => {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        id="btn-task-abort"
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="中断当前任务并放弃本次数据"
        className={`flex items-center gap-1 text-[11px] text-slate-400 border border-slate-800 rounded px-2 py-0.5 transition cursor-pointer ${ACCENTS[accent]} ${className}`}
      >
        <LogOut className="w-3 h-3" aria-hidden="true" />
        <span>中断/退出</span>
      </button>
    );
  }

  return (
    <span
      role="group"
      aria-label="确认中断"
      className={`flex items-center gap-1.5 text-[11px] ${className}`}
    >
      <span className="text-rose-300">中断并放弃本次数据？</span>
      <button
        id="btn-task-abort-confirm"
        type="button"
        onClick={() => {
          setConfirming(false);
          onAbort();
        }}
        className="px-2 py-0.5 rounded border border-rose-700/60 bg-rose-950/50 text-rose-200 hover:bg-rose-900/60 transition cursor-pointer"
      >
        确认中断
      </button>
      <button
        id="btn-task-abort-cancel"
        type="button"
        onClick={() => setConfirming(false)}
        className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
      >
        继续实验
      </button>
    </span>
  );
};
