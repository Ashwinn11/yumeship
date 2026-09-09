type Props = {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function Sparkle({ size = 16, color = '#8b6fc4', className, style }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={style}>
      <path d="M8 0 L9.4 6.6 L16 8 L9.4 9.4 L8 16 L6.6 9.4 L0 8 L6.6 6.6 Z" fill={color} />
    </svg>
  );
}
