// Web mirror of src/components/deco/ScatterBackdrop.tsx
type Props = {
  width: number;
  height: number;
  color?: string;
};

const DOTS: [number, number, number, number][] = [
  [0.09, 0.17, 1.6, 0.5], [0.27, 0.08, 1, 0.35], [0.42, 0.28, 2.1, 0.45],
  [0.64, 0.13, 1.3, 0.5], [0.81, 0.24, 1, 0.3], [0.13, 0.48, 1, 0.4],
  [0.37, 0.56, 1.7, 0.4], [0.57, 0.44, 1, 0.35], [0.75, 0.57, 2, 0.45],
  [0.9, 0.46, 1.2, 0.4], [0.2, 0.8, 1.3, 0.45], [0.45, 0.87, 1, 0.3],
  [0.67, 0.81, 1.8, 0.4], [0.85, 0.89, 1, 0.35],
];

export function ScatterBackdrop({ width, height, color = '#d77a8d' }: Props) {
  if (width <= 0 || height <= 0) return null;

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
      {DOTS.map(([x, y, r, o], i) => (
        <circle key={i} cx={x * width} cy={y * height} r={r} fill={color} opacity={o} />
      ))}
    </svg>
  );
}
