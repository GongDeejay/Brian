import { Timer } from 'lucide-react';
import { translate, useI18n, type Lang } from '../i18n';

type Accent = 'indigo' | 'cyan' | 'amber';

const ACCENTS: Record<Accent, { bar: string; text: string }> = {
  indigo: { bar: 'bg-indigo-500', text: 'text-indigo-300' },
  cyan: { bar: 'bg-cyan-500', text: 'text-cyan-300' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-300' },
};

/**
 * Formats a duration as `约 1 分 05 秒` / `约 42 秒` (zh) or
 * `~1 min 05 s` / `~42 s` (en). The caller's language must be passed in
 * explicitly because this helper is also usable outside React.
 */
export function formatEta(ms: number | null, lang: Lang): string {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return translate(lang, 'progress.etaUnknown');
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) {
    return translate(lang, 'progress.etaUnderMinute', { seconds: totalSeconds });
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return translate(lang, 'progress.etaMinutes', {
    minutes,
    seconds: String(seconds).padStart(2, '0'),
  });
}

interface ProgressBarProps {
  current: number;
  total: number;
  etaMs: number | null;
  accent?: Accent;
  /** Defaults to the localized "总体进度" / "Overall progress". */
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
  label,
  className = '',
}: ProgressBarProps) => {
  const { t, lang } = useI18n();
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 1;
  const safeCurrent = Math.min(Math.max(Number.isFinite(current) ? current : 0, 0), safeTotal);
  const percent = Math.round((safeCurrent / safeTotal) * 100);
  const tone = ACCENTS[accent];
  const displayLabel = label ?? t('progress.defaultLabel');
  const etaText = formatEta(etaMs, lang);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
        <span>
          {displayLabel} <span className={`font-mono font-semibold ${tone.text}`}>{safeCurrent} / {safeTotal}</span>
          <span className="ml-1 text-slate-500">({percent}%)</span>
        </span>
        <span className="flex items-center gap-1 font-mono">
          <Timer className="w-3 h-3" aria-hidden="true" />
          <span>{t('progress.remaining', { time: etaText })}</span>
        </span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
        aria-label={t('progress.aria', {
          label: displayLabel,
          current: safeCurrent,
          total: safeTotal,
        })}
      >
        <div
          className={`h-full ${tone.bar} transition-[width] duration-300 motion-reduce:transition-none`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
