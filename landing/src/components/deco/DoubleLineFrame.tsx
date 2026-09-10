// Web mirror of src/components/deco/DoubleLineFrame.tsx
type Props = {
  width: number;
  height: number;
  radius?: number;
  color?: string;
};

export function DoubleLineFrame({ width, height, radius = 18, color = '#d77a8d' }: Props) {
  if (width < 40 || height < 40) return null;

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 2 }}>
      <rect x={7} y={7} width={width - 14} height={height - 14} rx={radius} fill="none" stroke={color} strokeWidth={1.1} opacity={0.55} />
      <rect x={13} y={13} width={width - 26} height={height - 26} rx={Math.max(0, radius - 6)} fill="none" stroke={color} strokeWidth={1.1} opacity={0.4} />
    </svg>
  );
}
