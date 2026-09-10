// Web mirror of src/components/deco/SakuraDriftBackdrop.tsx
type Props = {
  width: number;
  height: number;
  color?: string;
};

const PETAL_ANGLES = [0, 72, 144, 216, 288];

const FLOWERS: [number, number, number, number][] = [
  [0.16, 0.19, 1.3, 0.55], [0.67, 0.15, 0.8, 0.35], [0.85, 0.56, 1.6, 0.5],
  [0.37, 0.48, 0.6, 0.3], [0.2, 0.83, 1.1, 0.4], [0.6, 0.85, 0.7, 0.3],
];

function Flower({ cx, cy, scale, opacity, color }: { cx: number; cy: number; scale: number; opacity: number; color: string }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`} opacity={opacity}>
      {PETAL_ANGLES.map((rot) => (
        <ellipse key={rot} cx={0} cy={-4} rx={2} ry={3.2} fill={color} transform={`rotate(${rot})`} />
      ))}
      <circle r={1} fill="#f0d189" />
    </g>
  );
}

export function SakuraDriftBackdrop({ width, height, color = '#f3b6c4' }: Props) {
  if (width <= 0 || height <= 0) return null;

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
      {FLOWERS.map(([x, y, scale, opacity], i) => (
        <Flower key={i} cx={x * width} cy={y * height} scale={scale} opacity={opacity} color={color} />
      ))}
    </svg>
  );
}
