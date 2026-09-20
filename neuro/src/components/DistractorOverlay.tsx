import React from 'react';

interface Props {
  /** Visual size of the overlay is inherited from the parent (absolute inset-0). */
  className?: string;
  /** 0-100, mapped from the cognitive-load panel intensity. */
  intensity?: number;
}

/**
 * Real, deterministic irrelevant-feature overlay used when the
 * `distractorInterference` load switch is enabled.
 *
 * It is deliberately static (no animation) so that a trial remains reproducible
 * and so that it never fights the `prefers-reduced-motion` setting.
 * Purely decorative: hidden from assistive technology and click-transparent.
 */
export const DistractorOverlay: React.FC<Props> = ({ className = '', intensity = 45 }) => {
  const opacity = Math.min(0.5, Math.max(0.08, intensity / 200));

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <svg viewBox="0 0 200 200" preserveAspectRatio="none" className="w-full h-full">
        <g stroke="#f8fafc" strokeWidth="1.5" fill="none">
          <polygon points="10,10 60,10 35,45" />
          <polygon points="150,20 190,20 170,60 130,60" />
          <polygon points="20,150 70,150 45,190" />
          <circle cx="100" cy="100" r="34" strokeDasharray="6 5" />
          <circle cx="100" cy="100" r="18" />
          <path d="M0 60 L200 120" strokeDasharray="4 6" />
          <path d="M0 140 L200 80" strokeDasharray="4 6" />
          <rect x="120" y="130" width="50" height="40" />
          <rect x="30" y="70" width="34" height="26" />
        </g>
        <g fill="#f1f5f9">
          <rect x="8" y="120" width="8" height="8" />
          <rect x="180" y="100" width="8" height="8" />
          <rect x="95" y="185" width="8" height="8" />
          <rect x="60" y="30" width="8" height="8" />
        </g>
      </svg>
    </div>
  );
};
