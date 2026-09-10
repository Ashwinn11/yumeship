import { useId } from 'react';

// Web mirror of src/components/deco/WashBackdrop.tsx
type Props = {
  width: number;
  height: number;
  color?: string;
};

export function WashBackdrop({ width, height, color = '#f3b6c4' }: Props) {
  const id = 'wash-' + useId();
  if (width <= 0 || height <= 0) return null;

  return (
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
      <defs>
        <radialGradient id={id} cx="82%" cy="18%" r="80%">
          <stop offset="0%" stopColor={color} stopOpacity={0.45} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${id})`} />
    </svg>
  );
}
