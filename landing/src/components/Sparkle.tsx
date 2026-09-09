import React from 'react';

type Props = {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
};

export const Sparkle: React.FC<Props> = ({ size = 16, color = '#d77a8d', style }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={style} aria-hidden="true">
      <path d="M8 0 L9.4 6.6 L16 8 L9.4 9.4 L8 16 L6.6 9.4 L0 8 L6.6 6.6 Z" fill={color} />
    </svg>
  );
};
