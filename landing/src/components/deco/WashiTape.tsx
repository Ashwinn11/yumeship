import { useMemo } from 'react';

export type TapePattern =
  | 'stripe'
  | 'dot'
  | 'heart'
  | 'check'
  | 'floral'
  | 'lace'
  | 'grid'
  | 'gingham'
  | 'star'
  | 'solid';

type Props = {
  width?: number;
  height?: number;
  pattern?: TapePattern;
  color?: string;
  rotate?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function WashiTape({
  width = 80,
  height = 18,
  pattern = 'heart',
  color = '#f3b6c4',
  rotate = -4,
  className,
  style = {},
}: Props) {
  const id = useMemo(() => 'wt-' + Math.random().toString(36).slice(2, 7), []);

  const renderPattern = () => {
    switch (pattern) {
      case 'stripe':
        return (
          <pattern id={id} width="6" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="3" height="10" fill={color} />
          </pattern>
        );
      case 'dot':
        return (
          <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.5" fill={color} />
          </pattern>
        );
      case 'heart':
        return (
          <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse">
            <path
              d="M6 9.5C3 7.5 2 6 2.8 4.6 3.6 3.2 5.2 4 6 5.2 6.8 4 8.4 3.2 9.2 4.6 10 6 9 7.5 6 9.5Z"
              fill={color}
            />
          </pattern>
        );
      case 'check':
        return (
          <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill={color} />
            <rect x="4" y="4" width="4" height="4" fill={color} />
          </pattern>
        );
      case 'floral':
        return (
          <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse
                key={r}
                cx="7"
                cy="4"
                rx="1.6"
                ry="2.6"
                fill={color}
                transform={`rotate(${r} 7 7)`}
              />
            ))}
            <circle cx="7" cy="7" r="0.9" fill="#fff" opacity={0.5} />
          </pattern>
        );
      case 'lace':
        return (
          <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="1.2" fill="none" stroke={color} strokeWidth="0.7" />
            <circle cx="0" cy="0" r="1.2" fill="none" stroke={color} strokeWidth="0.7" />
            <circle cx="10" cy="10" r="1.2" fill="none" stroke={color} strokeWidth="0.7" />
          </pattern>
        );
      case 'grid':
        return (
          <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M6 0v6M0 6h6" stroke={color} strokeWidth="0.7" />
          </pattern>
        );
      case 'gingham':
        return (
          <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill={color} opacity="0.7" />
            <rect x="4" y="4" width="4" height="4" fill={color} opacity="0.7" />
            <rect x="4" width="4" height="4" fill={color} opacity="0.3" />
            <rect y="4" width="4" height="4" fill={color} opacity="0.3" />
          </pattern>
        );
      case 'star':
        return (
          <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
            <path
              d="M7 2l1.3 3.4L11.7 6 9 8.4 9.7 12 7 10.2 4.3 12 5 8.4 2.3 6l3.4-.6L7 2Z"
              fill={color}
            />
          </pattern>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{
        transform: `rotate(${rotate}deg)`,
        opacity: 0.92,
        flexShrink: 0,
        display: 'block',
        ...style,
      }}
    >
      <defs>{renderPattern()}</defs>
      {/* patterned layer */}
      <rect
        width={width}
        height={height}
        fill={pattern === 'solid' ? color : `url(#${id})`}
        opacity={0.6}
      />
      {/* base translucent layer */}
      <rect width={width} height={height} fill={color} opacity={0.22} />
      {/* highlights */}
      <rect width={width} height={2} fill="rgba(255,255,255,0.25)" />
      <rect y={height - 2} width={width} height={2} fill="rgba(0,0,0,0.05)" />
    </svg>
  );
}
