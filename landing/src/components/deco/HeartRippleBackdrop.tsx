import { useId } from 'react';

// Web mirror of src/components/deco/HeartRippleBackdrop.tsx
type Props = {
  width: number;
  height: number;
  color?: string;
};

const HEART_D = 'M0,-2 C-3,-6 -7,-6 -7,-2 C-7,1 -3,4 0,8 C3,4 7,1 7,-2 C7,-6 3,-6 0,-2 Z';
const RINGS: [number, number, number][] = [
  [1, 0.65, 1.4], [1.9, 0.5, 1.3], [2.8, 0.38, 1.3], [3.7, 0.26, 1.2], [4.6, 0.15, 1.1],
];

export function HeartRippleBackdrop({ width, height, color = '#d77a8d' }: Props) {
  const id = 'heartripple-' + useId();
  if (width <= 0 || height <= 0) return null;

  const cx = width * 0.78;
  const cy = height * 0.8;

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#c7b5e3" />
          <stop offset="100%" stopColor="#f3b6c4" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${id})`} opacity={0.5} />
      <rect width={width} height={height} fill="#fffaf5" opacity={0.3} />
      <g stroke={color} fill="none">
        {RINGS.map(([scale, opacity, strokeWidth], i) => (
          <path
            key={i}
            d={HEART_D}
            transform={`translate(${cx} ${cy}) scale(${scale})`}
            strokeWidth={strokeWidth}
            opacity={opacity}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      <circle cx={width * 0.2} cy={height * 0.22} r={1.3} fill="#fffaf5" opacity={0.8} />
      <circle cx={width * 0.35} cy={height * 0.13} r={0.9} fill="#fffaf5" opacity={0.65} />
      <circle cx={width * 0.12} cy={height * 0.42} r={1} fill="#fffaf5" opacity={0.7} />
    </svg>
  );
}
