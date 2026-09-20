import { Timer } from 'lucide-react';

type Accent = 'indigo' | 'cyan' | 'amber';

const ACCENTS: Record<Accent, { bar: string; text: string }> = {
  indigo: { bar: 'bg-indigo-500', text: 'text-indigo-300' },
  cyan: { bar: 'bg-cyan-500', text: 'text-cyan-300' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-300' },
};

/** Formats a duration as `约 1 分 05 秒` / `约 42 秒`. */
export function formatEta(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return '—';
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `约 ${totalSeconds} 秒`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `约 ${minutes} 分 ${String(seconds).padStart(2, '0')} 秒`;
}

interface ProgressBarProps {
  current: number;
  total: number;
  etaMs: number | null;
  accent?: Accent;
  label?: string;
  className?: string;
}

/**
 * Overall progress + estimated remaining time for a running paradigm.
 * Previously each running view showed only a bare `试次: x / y` counter.
 */
export const ProgressBar = ({
  current,
  total,
  etaMs,
  accent = 'indigo',
  label = '总体进度',
  className = '',
}: ProgressBarProps) => {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 1;
  const safeCurrent = Math.min(Math.max(Number.isFinite(current) ? current : 0, 0), safeTotal);
  const percent = Math.round((safeCurrent / safeTotal) * 100);
  const tone = ACCENTS[accent];

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
        <span>
          {label} <span className={`font-mono font-semibold ${tone.text}`}>{safeCurrent} / {safeTotal}</span>
          <span className="ml-1 text-slate-500">({percent}%)</span>
        </span>
        <span className="flex items-center gap-1 font-mono">
          <Timer className="w-3 h-3" aria-hidden="true" />
          <span>预计剩余 {formatEta(etaMs)}</span>
        </span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
        aria-label={`${label}：已完成 ${safeCurrent} / ${safeTotal}`}
      >
        <div
          className={`h-full ${tone.bar} transition-[width] duration-300 motion-reduce:transition-none`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
