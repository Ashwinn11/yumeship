// Web mirror of src/components/deco/FlourishCorners.tsx
type Props = {
  width: number;
  height: number;
  size?: number;
  inset?: number;
  color?: string;
};

const CURL_D = 'M2,20 C2,8 12,2 20,6 C14,3 6,8 8,14 C10,20 16,18 16,12';

export function FlourishCorners({ width, height, size = 22, inset = 10, color = '#d77a8d' }: Props) {
  if (width < size * 2 + inset * 2 || height < size * 2 + inset * 2) return null;

  const corners = [
    { x: inset, y: inset, scaleX: 1, scaleY: 1 },
    { x: width - inset, y: inset, scaleX: -1, scaleY: 1 },
    { x: inset, y: height - inset, scaleX: 1, scaleY: -1 },
    { x: width - inset, y: height - inset, scaleX: -1, scaleY: -1 },
  ];

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 2 }}>
      {corners.map((c, i) => (
        <path
          key={i}
          d={CURL_D}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.65}
          transform={`translate(${c.x} ${c.y}) scale(${c.scaleX * (size / 22)} ${c.scaleY * (size / 22)})`}
        />
      ))}
    </svg>
  );
}
