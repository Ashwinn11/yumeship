import { useMemo } from 'react';

type Props = {
  width: number;
  height: number;
  color?: string;
};

export function PatternBackdrop({ width, height, color = '#d77a8d' }: Props) {
  const id = useMemo(() => 'patternbg-' + Math.random().toString(36).slice(2, 7), []);
  if (width <= 0 || height <= 0) return null;

  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
    >
      <defs>
        <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="2.2" fill={color} opacity={0.34} />
          <circle cx="15" cy="15" r="2.2" fill={color} opacity={0.34} />
          <circle cx="15" cy="5" r="1" fill={color} opacity={0.24} />
          <circle cx="5" cy="15" r="1" fill={color} opacity={0.24} />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${id})`} />
    </svg>
  );
}
