import React, { useEffect, useRef, useState } from 'react';
import type { PieSegment } from '../../types/index';
import styles from './PieChart.module.css';

interface Props {
  segments: PieSegment[];
  size?: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  segment: PieSegment | null;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

const PieChart: React.FC<Props> = ({ segments, size = 240 }) => {
  const [progress, setProgress] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, segment: null });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const DURATION = 1000;

  useEffect(() => {
    startRef.current = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;
  const innerR = outerR * 0.52; // donut hole

  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cumulative = 0;

  const arcs = segments.map((seg, i) => {
    const startAngle = (cumulative / total) * 360 * progress;
    const endAngle = ((cumulative + seg.value) / total) * 360 * progress;
    cumulative += seg.value;
    const midAngle = (startAngle + endAngle) / 2;
    const labelR = (outerR + innerR) / 2;
    const labelPos = polarToCartesian(cx, cy, labelR, midAngle);
    const isHovered = hoveredIdx === i;

    return {
      seg,
      path: buildArcPath(cx, cy, isHovered ? outerR + 6 : outerR, startAngle, endAngle),
      labelPos,
      midAngle,
      isHovered,
    };
  });

  const handleMouseMove = (e: React.MouseEvent<SVGElement>, seg: PieSegment, idx: number) => {
    const rect = (e.currentTarget as SVGElement).closest('svg')!.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      segment: seg,
    });
    setHoveredIdx(idx);
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, segment: null });
    setHoveredIdx(null);
  };

  return (
    <div className={styles.chartWrapper} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {/* Shadow filter */}
        <defs>
          <filter id="arcShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(45,27,78,0.3)" />
          </filter>
        </defs>

        {arcs.map(({ seg, path, isHovered }, i) => (
          <path
            key={i}
            d={path}
            fill={seg.color}
            stroke="#fff"
            strokeWidth={2}
            filter={isHovered ? 'url(#arcShadow)' : undefined}
            style={{
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              transformOrigin: `${cx}px ${cy}px`,
            }}
            onMouseMove={(e) => handleMouseMove(e, seg, i)}
            onMouseLeave={handleMouseLeave}
          />
        ))}

        {/* Donut hole */}
        <circle cx={cx} cy={cy} r={innerR} fill="#f5f0e8" />

        {/* Center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" className={styles.centerValue}>
          {Math.round(segments[0].value)}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className={styles.centerLabel}>
          Match Score
        </text>
      </svg>

      {/* Tooltip */}
      {tooltip.visible && tooltip.segment && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}
        >
          <div className={styles.tooltipHeader}>
            <span
              className={styles.tooltipDot}
              style={{ background: tooltip.segment.color }}
            />
            <span className={styles.tooltipLabel}>{tooltip.segment.label}</span>
          </div>
          <div className={styles.tooltipValue}>{tooltip.segment.value}%</div>
          <div className={styles.tooltipDesc}>{tooltip.segment.description}</div>
        </div>
      )}
    </div>
  );
};

export default PieChart;
