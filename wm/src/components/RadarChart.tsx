interface RadarAxis {
  label: string;
  value: number; // 0 to 100
}

interface RadarChartProps {
  axes: RadarAxis[];
  size?: number;
}

/** Clamps to 0..100 and turns NaN / Infinity into 0 so paths never break. */
function safeValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export const RadarChart = ({ axes, size = 300 }: RadarChartProps) => {
  // A radar needs at least three axes to enclose an area; with fewer measured
  // dimensions the caller must show an explicit empty state instead of a
  // degenerate polygon.
  if (!Array.isArray(axes) || axes.length < 3) return null;

  const center = size / 2;
  const radius = size * 0.38;
  const totalAxes = axes.length;
  const values = axes.map((axis) => safeValue(axis.value));

  // Compute coordinates on regular polygon
  const getCoordinates = (index: number, val: number) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = (val / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Background concentric polygon levels: 25%, 50%, 75%, 100%
  const levels = [25, 50, 75, 100];

  // User polygon path
  const points = values
    .map((value, i) => {
      const { x, y } = getCoordinates(i, value);
      return `${x},${y}`;
    })
    .join(' ');

  const accessibleSummary = axes
    .map((axis, i) => `${axis.label} ${Math.round(values[i])} 分`)
    .join('，');

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        role="img"
        aria-label={`认知维度雷达图：${accessibleSummary}`}
        className="overflow-visible select-none drop-shadow-md"
      >
        <title>{`认知维度雷达图（${totalAxes} 维）：${accessibleSummary}`}</title>

        {/* Concentric grid rings */}
        {levels.map((level) => {
          const ringPoints = axes
            .map((_, i) => {
              const { x, y } = getCoordinates(i, level);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={level}
              points={ringPoints}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray={level === 100 ? 'none' : '3 3'}
              opacity={0.6}
            />
          );
        })}

        {/* Axis lines radiating from center */}
        {axes.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={points}
          fill="rgba(99, 102, 241, 0.25)"
          stroke="#818cf8"
          strokeWidth="2.5"
          className="motion-safe:transition-all motion-safe:duration-500 ease-out"
        />

        {/* Data vertices */}
        {values.map((value, i) => {
          const { x, y } = getCoordinates(i, value);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              className="fill-indigo-400 stroke-slate-900 stroke-2"
            />
          );
        })}

        {/* Axis labels positioned outside */}
        {axes.map((axis, i) => {
          const labelAngle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
          const labelDist = radius + 24;
          const lx = center + labelDist * Math.cos(labelAngle);
          const ly = center + labelDist * Math.sin(labelAngle);

          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[11px] font-medium fill-slate-300 select-none"
            >
              {axis.label}
              <tspan
                x={lx}
                dy="13"
                className="text-[10px] font-mono fill-indigo-400 font-bold"
              >
                {Math.round(values[i])}分
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
};
