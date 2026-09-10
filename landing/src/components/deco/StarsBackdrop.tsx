import { useId } from 'react';

// Web mirror of src/components/deco/StarsBackdrop.tsx
type Props = {
  width: number;
  height: number;
  color?: string;
};

const STAR_D = 'M7 2l1.3 3.4L11.7 6 9 8.4 9.7 12 7 10.2 4.3 12 5 8.4 2.3 6l3.4-.6L7 2Z';

export function StarsBackdrop({ width, height, color = '#b8902a' }: Props) {
  const id = 'stars-' + useId();
  if (width <= 0 || height <= 0) return null;

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
      <defs>
        <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
          <path d={STAR_D} fill={color} opacity={0.32} />
          <path d={STAR_D} fill={color} opacity={0.32} transform="translate(13,13)" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${id})`} />
    </svg>
  );
}
