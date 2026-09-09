import type { ProfileFlag } from '../../lib/profile';
import { SEXUALITY_OPTIONS } from '../../constants/sexualities';

const BY_KEY = new Map(SEXUALITY_OPTIONS.map((o) => [o.key, o]));

export function FlagIcon({ colors, width = 16, height = 11 }: { colors?: string[]; width?: number; height?: number }) {
  if (!colors || colors.length === 0) return null;
  const stripeH = height / colors.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
      {colors.map((c, i) => (
        <rect key={i} x={0} y={i * stripeH} width={width} height={stripeH + 0.5} fill={c} />
      ))}
    </svg>
  );
}

function FlagMark({ flag }: { flag: string }) {
  if (!flag) return null;
  const known = BY_KEY.get(flag.toLowerCase());
  if (known) return known.colors ? <FlagIcon colors={known.colors} width={16} height={11} /> : null;
  return <span className="flag-chip-glyph">{flag}</span>;
}

export function ProfileFlags({ flags, textColor }: { flags: ProfileFlag[]; textColor?: string }) {
  if (!flags || flags.length === 0) return null;
  return (
    <div className="profile-flags-row">
      {flags.map((f) => (
        <div key={f.id} className="profile-flag-chip">
          {f.imageUrl ? (
            <img src={f.imageUrl} alt="" className="flag-chip-img" />
          ) : (
            <FlagMark flag={f.flag} />
          )}
          {!!f.text && (
            <span className="flag-chip-text" style={textColor ? { color: textColor } : undefined}>
              {f.text}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
