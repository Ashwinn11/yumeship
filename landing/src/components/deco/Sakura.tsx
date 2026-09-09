type Props = {
  size?: number;
  color?: string;
  core?: string;
  className?: string;
  style?: React.CSSProperties;
};

const ROTATIONS = [0, 72, 144, 216, 288];

export function Sakura({ size = 18, color = '#f3b6c4', core = '#f0d189', className, style }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
      {ROTATIONS.map((rot) => (
        <ellipse
          key={rot}
          cx="12"
          cy="6.5"
          rx="3.6"
          ry="5.5"
          fill={color}
          transform={`rotate(${rot} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="1.8" fill={core} />
    </svg>
  );
}
