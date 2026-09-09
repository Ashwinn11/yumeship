type StickerProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

// Cassette tape — for "theme song" moments, matching mobile app StickerCassette
export function StickerCassette({ size = 48, className, style }: StickerProps) {
  const w = size * 1.4;
  const h = size;
  return (
    <div
      className={className}
      style={{
        width: w,
        height: h,
        filter: 'drop-shadow(0 2px 3px rgba(110, 58, 90, 0.18))',
        flexShrink: 0,
        display: 'inline-block',
        ...style,
      }}
    >
      <svg width={w} height={h} viewBox="0 0 70 50">
        <rect x="1" y="1" width="68" height="48" rx="7" fill="white" stroke="white" strokeWidth="3" />
        <rect x="2.5" y="2.5" width="65" height="45" rx="6" fill="#e9c7a8" stroke="#a8765c" strokeWidth="1" />
        <rect x="8" y="8" width="54" height="21" rx="3" fill="#fdf6ee" stroke="#a8765c" strokeWidth="0.8" />
        <g>
          <circle cx="21" cy="18.5" r="7.4" fill="none" stroke="#a8765c" strokeWidth="1" />
          <circle cx="21" cy="18.5" r="3.2" fill="#f3b6c4" stroke="#a8765c" strokeWidth="0.7" />
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <path
              key={r}
              d="M21 15.3 V 12.3"
              stroke="#a8765c"
              strokeWidth="0.7"
              strokeLinecap="round"
              transform={`rotate(${r} 21 18.5)`}
            />
          ))}
          <circle cx="49" cy="18.5" r="7.4" fill="none" stroke="#a8765c" strokeWidth="1" />
          <circle cx="49" cy="18.5" r="3.2" fill="#f3b6c4" stroke="#a8765c" strokeWidth="0.7" />
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <path
              key={r}
              d="M49 15.3 V 12.3"
              stroke="#a8765c"
              strokeWidth="0.7"
              strokeLinecap="round"
              transform={`rotate(${r} 49 18.5)`}
            />
          ))}
          <path d="M27 18.5 H 43" stroke="#a8765c" strokeWidth="0.7" strokeDasharray="1.5,1.8" />
        </g>
        <rect x="14" y="34" width="42" height="7.5" rx="2" fill="#f8ddb0" stroke="#a8765c" strokeWidth="0.7" />
        <path d="M18 37.7 H 40 M18 39.7 H 34" stroke="#a8765c" strokeWidth="0.7" strokeDasharray="1.4,1.6" />
        <circle cx="8.5" cy="41.5" r="1.3" fill="none" stroke="#a8765c" strokeWidth="0.8" />
        <circle cx="61.5" cy="41.5" r="1.3" fill="none" stroke="#a8765c" strokeWidth="0.8" />
        <circle cx="8.5" cy="8.5" r="1.3" fill="none" stroke="#a8765c" strokeWidth="0.8" />
        <circle cx="61.5" cy="8.5" r="1.3" fill="none" stroke="#a8765c" strokeWidth="0.8" />
      </svg>
    </div>
  );
}
