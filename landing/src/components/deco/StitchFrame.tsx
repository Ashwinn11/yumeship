// Web mirror of src/components/deco/StitchFrame.tsx
type Props = {
  width: number;
  height: number;
  radius?: number;
  inset?: number;
  color?: string;
};

export function StitchFrame({ width, height, radius = 18, inset = 8, color = '#d77a8d' }: Props) {
  if (width < inset * 3 || height < inset * 3) return null;

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 2 }}>
      <rect
        x={inset} y={inset}
        width={width - inset * 2} height={height - inset * 2}
        rx={Math.max(0, radius - inset)}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeDasharray="5 5"
        opacity={0.6}
      />
    </svg>
  );
}
