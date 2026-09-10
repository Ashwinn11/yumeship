import { useId } from 'react';

// Web mirror of src/components/deco/MixedBackdrop.tsx
type Props = {
  width: number;
  height: number;
  color?: string;
};

const HEART_D = 'M6 9.5C3 7.5 2 6 2.8 4.6 3.6 3.2 5.2 4 6 5.2 6.8 4 8.4 3.2 9.2 4.6 10 6 9 7.5 6 9.5Z';
const STAR_D = 'M7 2l1.3 3.4L11.7 6 9 8.4 9.7 12 7 10.2 4.3 12 5 8.4 2.3 6l3.4-.6L7 2Z';

export function MixedBackdrop({ width, height, color = '#d77a8d' }: Props) {
  const id = 'mixed-' + useId();
  if (width <= 0 || height <= 0) return null;

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
      <defs>
        <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2" fill={color} opacity={0.3} />
          <path d={HEART_D} fill={color} opacity={0.32} transform="translate(14,2) rotate(-8 6 6)" />
          <path d={STAR_D} fill={color} opacity={0.3} transform="translate(2,16) rotate(10 7 7)" />
          <circle cx="22" cy="22" r="1.4" fill={color} opacity={0.24} />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${id})`} />
    </svg>
  );
}
