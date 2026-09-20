import React from 'react';
import { WCSTCard, WCSTColor, WCSTShape } from '../types';

interface Props {
  card: WCSTCard;
  isSelected?: boolean;
  onClick?: () => void;
  isReference?: boolean;
  referenceIndex?: number;
  noiseLevel?: number;
  /** Extra irrelevant-feature overlay (cognitive-load `distractorInterference`). */
  distractor?: boolean;
  /** Accessible name for interactive cards. */
  ariaLabel?: string;
  /** Interactive cards become inert (still visible) when true. */
  disabled?: boolean;
}

const COLOR_NAMES: Record<WCSTColor, string> = {
  red: '红色',
  green: '绿色',
  yellow: '黄色',
  blue: '蓝色',
};

const SHAPE_NAMES: Record<WCSTShape, string> = {
  triangle: '三角形',
  star: '星形',
  cross: '十字形',
  circle: '圆形',
};

export const describeWCSTCard = (card: WCSTCard): string =>
  `${COLOR_NAMES[card.color]}${SHAPE_NAMES[card.shape]} ${card.number} 个`;

export const WCSTCardView: React.FC<Props> = ({
  card,
  isSelected,
  onClick,
  isReference,
  referenceIndex,
  noiseLevel = 0,
  distractor = false,
  ariaLabel,
  disabled = false,
}) => {
  // Color palette with high-contrast accessibility
  const getColorHex = (color: WCSTColor): string => {
    switch (color) {
      case 'red':
        return '#dc2626'; // Red 600
      case 'green':
        return '#16a34a'; // Green 600
      case 'yellow':
        return '#ca8a04'; // Amber 600 for contrast on white
      case 'blue':
        return '#2563eb'; // Blue 600
      default:
        return '#475569';
    }
  };

  const renderShapeIcon = (shape: WCSTShape, colorHex: string, keyIdx: number) => {
    switch (shape) {
      case 'triangle':
        return (
          <svg key={keyIdx} viewBox="0 0 40 40" className="w-9 h-9 drop-shadow-xs" aria-hidden="true" focusable="false">
            <polygon points="20,4 37,34 3,34" fill={colorHex} stroke="#0f172a" strokeWidth="1" />
          </svg>
        );
      case 'star':
        return (
          <svg key={keyIdx} viewBox="0 0 40 40" className="w-9 h-9 drop-shadow-xs" aria-hidden="true" focusable="false">
            <polygon
              points="20,2 25,14 38,14 27,22 31,35 20,27 9,35 13,22 2,14 15,14"
              fill={colorHex}
              stroke="#0f172a"
              strokeWidth="1"
            />
          </svg>
        );
      case 'cross':
        return (
          <svg key={keyIdx} viewBox="0 0 40 40" className="w-9 h-9 drop-shadow-xs" aria-hidden="true" focusable="false">
            <polygon
              points="14,2 26,2 26,14 38,14 38,26 26,26 26,38 14,38 14,26 2,26 2,14 14,14"
              fill={colorHex}
              stroke="#0f172a"
              strokeWidth="1"
            />
          </svg>
        );
      case 'circle':
        return (
          <svg key={keyIdx} viewBox="0 0 40 40" className="w-9 h-9 drop-shadow-xs" aria-hidden="true" focusable="false">
            <circle cx="20" cy="20" r="16" fill={colorHex} stroke="#0f172a" strokeWidth="1" />
          </svg>
        );
    }
  };

  const colorHex = getColorHex(card.color);

  // Layout arrangement for number of shapes (1, 2, 3, 4)
  const renderShapesLayout = () => {
    const shapes = Array.from({ length: card.number }).map((_, i) => renderShapeIcon(card.shape, colorHex, i));

    if (card.number === 1) {
      return <div className="flex items-center justify-center w-full h-full">{shapes[0]}</div>;
    }
    if (card.number === 2) {
      return <div className="flex flex-col items-center justify-around w-full h-full py-2">{shapes}</div>;
    }
    if (card.number === 3) {
      return (
        <div className="flex flex-col items-center justify-around w-full h-full py-1">
          {shapes[0]}
          <div className="flex justify-around w-full">{shapes.slice(1)}</div>
        </div>
      );
    }
    // 4 shapes in a 2x2 grid
    return (
      <div className="grid grid-cols-2 gap-2 place-items-center w-full h-full p-2">
        {shapes}
      </div>
    );
  };

  const isInteractive = Boolean(onClick);
  const accessibleName = ariaLabel ?? (isReference ? `基准卡片 ${referenceIndex}：${describeWCSTCard(card)}` : describeWCSTCard(card));

  return (
    <div
      onClick={isInteractive && !disabled ? onClick : undefined}
      role={isInteractive ? 'button' : 'img'}
      aria-label={accessibleName}
      aria-disabled={isInteractive ? disabled : undefined}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      onKeyDown={
        isInteractive && !disabled
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`relative w-28 h-36 sm:w-32 sm:h-44 bg-white rounded-xl border-2 transition-all flex flex-col items-center justify-center select-none ${
        isInteractive && !disabled ? 'cursor-pointer hover:scale-[1.03] active:scale-[0.98]' : ''
      } ${
        isSelected
          ? 'border-indigo-600 shadow-md ring-3 ring-indigo-200/70'
          : 'border-slate-300 shadow-xs hover:border-slate-400'
      } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400`}
    >
      {/* Reference card badge */}
      {isReference && (
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono font-bold border border-slate-200">
          基准 #{referenceIndex}
        </div>
      )}

      {/* Shapes */}
      <div className="w-full h-full p-2 flex items-center justify-center">
        {renderShapesLayout()}
      </div>

      {/* Visual noise overlay if cognitive load applied */}
      {noiseLevel > 0 && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-xl pointer-events-none opacity-30 mix-blend-multiply"
          style={{
            backgroundImage: `radial-gradient(#64748b 1px, transparent 1px)`,
            backgroundSize: `${Math.max(4, 12 - noiseLevel / 10)}px ${Math.max(4, 12 - noiseLevel / 10)}px`,
          }}
        />
      )}

      {/* Irrelevant-feature distractor overlay (does not participate in the rule) */}
      {distractor && (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 100 140"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full rounded-xl pointer-events-none opacity-30"
        >
          <g stroke="#475569" strokeWidth="1.5" fill="none">
            <path d="M0 30 L100 70" strokeDasharray="4 4" />
            <path d="M0 100 L100 60" strokeDasharray="4 4" />
            <rect x="6" y="8" width="16" height="12" />
            <circle cx="88" cy="120" r="8" />
          </g>
        </svg>
      )}
    </div>
  );
};
