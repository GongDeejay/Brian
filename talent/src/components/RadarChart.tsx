import { useState } from "react";
import { DimensionKey } from "../types";
import { DIMENSIONS } from "../data/theories";
import { useLanguage } from "../context/LanguageContext";
import { TRANSLATIONS } from "../utils/translations";

interface RadarChartProps {
  scores: Record<DimensionKey, number>;
  size?: number;
  interactive?: boolean;
  onDimensionClick?: (key: DimensionKey) => void;
}

export function RadarChart({
  scores,
  size = 360,
  onDimensionClick,
}: RadarChartProps) {
  const { lang, isEn } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [hoveredKey, setHoveredKey] = useState<DimensionKey | null>(null);

  const dimensionKeys: DimensionKey[] = [
    "naturalEase",
    "energyFlow",
    "socialMirror",
    "gritTolerance",
    "cognitiveAptitude",
    "latentDesire",
  ];

  const totalAxes = dimensionKeys.length;
  const center = size / 2;
  const radius = (size / 2) - 52; // Padding for outer labels

  // Levels for concentric grid rings: 20%, 40%, 60%, 80%, 100%
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Helper to compute (x, y) coordinates for an angle and radius
  const getCoordinates = (index: number, valueRatio: number) => {
    // Start from top (-Math.PI / 2)
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate path string for polygon
  const polygonPoints = dimensionKeys
    .map((key, index) => {
      const score = scores[key] ?? 50;
      const ratio = Math.max(0.1, Math.min(1.0, score / 100));
      const { x, y } = getCoordinates(index, ratio);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#0891b2" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.55" />
          </linearGradient>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Concentric Polygons / Rings */}
        {levels.map((level, i) => {
          const ringPoints = dimensionKeys
            .map((_, idx) => {
              const { x, y } = getCoordinates(idx, level);
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <g key={`ring-${i}`}>
              <polygon
                points={ringPoints}
                fill={i === levels.length - 1 ? "#f8fafc" : "transparent"}
                stroke="#e2e8f0"
                strokeWidth={i === levels.length - 1 ? "1.5" : "1"}
                strokeDasharray={i < levels.length - 1 ? "3 3" : undefined}
              />
              {/* Level percentage label along the top axis */}
              <text
                x={center}
                y={center - radius * level - 2}
                fontSize="9"
                fill="#94a3b8"
                textAnchor="middle"
                className="font-mono pointer-events-none"
              >
                {Math.round(level * 100)}
              </text>
            </g>
          );
        })}

        {/* Axis Spokes from center to vertex */}
        {dimensionKeys.map((key, idx) => {
          const { x, y } = getCoordinates(idx, 1.0);
          const isHovered = hoveredKey === key;
          return (
            <line
              key={`spoke-${key}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke={isHovered ? "#6366f1" : "#cbd5e1"}
              strokeWidth={isHovered ? "2" : "1"}
              strokeDasharray="2 2"
              className="transition-colors duration-200"
            />
          );
        })}

        {/* Score Data Polygon */}
        <polygon
          points={polygonPoints}
          fill="url(#radarGradient)"
          stroke="#4338ca"
          strokeWidth="2.5"
          filter="url(#radarGlow)"
          className="transition-all duration-300 ease-out"
        />

        {/* Interactive Data Vertex Points */}
        {dimensionKeys.map((key, idx) => {
          const score = scores[key] ?? 50;
          const ratio = Math.max(0.1, Math.min(1.0, score / 100));
          const { x, y } = getCoordinates(idx, ratio);
          const isHovered = hoveredKey === key;

          return (
            <g
              key={`point-${key}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={() => onDimensionClick?.(key)}
            >
              {/* Pulse ring when hovered */}
              {isHovered && (
                <circle
                  cx={x}
                  cy={y}
                  r="10"
                  fill="#818cf8"
                  fillOpacity="0.3"
                  className="animate-ping"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? "6" : "4.5"}
                fill={DIMENSIONS[key].color}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all duration-150 shadow-xs"
              />
            </g>
          );
        })}

        {/* Outer Dimension Labels */}
        {dimensionKeys.map((key, idx) => {
          const { x, y, angle } = getCoordinates(idx, 1.2);
          const dimInfo = DIMENSIONS[key];
          const dimTrans = t.dimensions[key];
          const shortName = dimTrans ? dimTrans.shortName : dimInfo.shortName;
          const score = scores[key] ?? 0;
          const isHovered = hoveredKey === key;

          // Align text based on angle
          let textAnchor: "start" | "middle" | "end" = "middle";
          if (Math.cos(angle) > 0.3) textAnchor = "start";
          else if (Math.cos(angle) < -0.3) textAnchor = "end";

          return (
            <g
              key={`label-${key}`}
              className="cursor-pointer transition-transform duration-150"
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={() => onDimensionClick?.(key)}
            >
              <text
                x={x}
                y={y - 6}
                textAnchor={textAnchor}
                fontSize="11"
                fontWeight={isHovered ? "700" : "600"}
                fill={isHovered ? dimInfo.color : "#334155"}
                className="transition-colors duration-150"
              >
                {shortName}
              </text>
              <text
                x={x}
                y={y + 8}
                textAnchor={textAnchor}
                fontSize="11"
                fontWeight="700"
                fill={dimInfo.color}
                className="font-mono"
              >
                {score} {isEn ? "pts" : "分"}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hovered Tooltip Card */}
      {hoveredKey && (
        <div className="mt-3 max-w-sm rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 text-center shadow-md backdrop-blur-sm transition-all duration-200">
          <div className="flex items-center justify-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: DIMENSIONS[hoveredKey].color }}
            />
            <span className="text-sm font-semibold text-slate-800">
              {t.dimensions[hoveredKey]?.name || DIMENSIONS[hoveredKey].name} ({scores[hoveredKey]} {isEn ? "pts" : "分"})
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {t.dimensions[hoveredKey]?.description || DIMENSIONS[hoveredKey].description}
          </p>
        </div>
      )}
    </div>
  );
}
