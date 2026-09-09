type Props = {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

// YumeShip Mark — two intersecting circles: filled = S/I (you), outline = F/O (them)
export function Mark({ size = 24, color, className, style }: Props) {
  const isDefault = color === undefined;
  const fillColor = isDefault ? '#f3b6c4' : color;
  const strokeColor = isDefault ? '#2b1a26' : color;
  const dotColor = isDefault ? '#fffaf5' : '#fdf3ee';

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} style={{ display: 'inline-block', flexShrink: 0, ...style }}>
      <circle cx="18" cy="24" r="13" fill={fillColor} opacity={0.85} />
      <circle cx="30" cy="24" r="13" fill="none" stroke={strokeColor} strokeWidth="1.5" />
      <circle cx="24" cy="24" r="1.2" fill={dotColor} />
    </svg>
  );
}
