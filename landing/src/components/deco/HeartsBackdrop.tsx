import { useId } from 'react';

// Web mirror of src/components/deco/HeartsBackdrop.tsx
type Props = {
  width: number;
  height: number;
  color?: string;
};

const HEART_D = 'M6 9.5C3 7.5 2 6 2.8 4.6 3.6 3.2 5.2 4 6 5.2 6.8 4 8.4 3.2 9.2 4.6 10 6 9 7.5 6 9.5Z';

export function HeartsBackdrop({ width, height, color = '#d77a8d' }: Props) {
  const id = 'hearts-' + useId();
  if (width <= 0 || height <= 0) return null;

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d={HEART_D} fill={color} opacity={0.3} />
          <path d={HEART_D} fill={color} opacity={0.3} transform="translate(12,12)" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${id})`} />
    </svg>
  );
}
