type Props = {
  uri: string;
  caption?: string;
  size?: number;
  rotate?: number;
  tapeColor?: string;
  textColor?: string;
};

export function Polaroid({
  uri,
  caption,
  size = 110,
  rotate = -4,
  tapeColor = '#f3b6c4',
  textColor,
}: Props) {
  return (
    <div
      className="polaroid-frame"
      style={{
        width: size,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div
        className="polaroid-tape"
        style={{
          backgroundColor: tapeColor,
          width: size * 0.5,
        }}
      />
      <div className="polaroid-photo-box" style={{ width: size - 16, height: size - 16 }}>
        <img src={uri} alt={caption || ''} className="polaroid-img" loading="lazy" />
      </div>
      {caption && (
        <p className="polaroid-caption" style={textColor ? { color: textColor } : undefined}>
          {caption}
        </p>
      )}
    </div>
  );
}
