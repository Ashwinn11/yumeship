import { useId } from 'react';

// Web mirror of src/components/deco/LatticeFrame.tsx
type Props = {
  width: number;
  height: number;
  radius?: number;
  bandWidth?: number;
  cell?: number;
  color?: string;
};

function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x + rr} ${y} H${x + w - rr} A${rr} ${rr} 0 0 1 ${x + w} ${y + rr} V${y + h - rr} A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h} H${x + rr} A${rr} ${rr} 0 0 1 ${x} ${y + h - rr} V${y + rr} A${rr} ${rr} 0 0 1 ${x + rr} ${y} Z`;
}

export function LatticeFrame({ width, height, radius = 18, bandWidth = 14, cell = 13, color = '#d77a8d' }: Props) {
  const id = 'lattice-' + useId();
  if (width < bandWidth * 3 || height < bandWidth * 3) return null;

  const outer = roundedRectPath(0, 0, width, height, radius);
  const inner = roundedRectPath(bandWidth, bandWidth, width - bandWidth * 2, height - bandWidth * 2, Math.max(0, radius - bandWidth));

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 2 }}>
      <defs>
        <pattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={cell / 2.6} y1={0} x2={cell / 2.6} y2={cell} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
          <line x1={0} y1={cell / 2.6} x2={cell} y2={cell / 2.6} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
          <circle cx={cell / 2.6} cy={cell / 2.6} r={1.6} fill="#f0d189" opacity={0.85} />
        </pattern>
      </defs>
      <path d={`${outer} ${inner}`} fill={`url(#${id})`} fillRule="evenodd" />
    </svg>
  );
}
