import type { ProfileFlag } from '../../lib/profile';

export const SEXUALITY_OPTIONS: { key: string; label: string; colors?: string[] }[] = [
  { key: 'gay', label: 'Gay', colors: ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004CFF', '#732982'] },
  { key: 'lesbian', label: 'Lesbian', colors: ['#D52D00', '#EF7627', '#FF9A56', '#FFFFFF', '#D162A4', '#B55690', '#A30262'] },
  { key: 'bisexual', label: 'Bisexual', colors: ['#D60270', '#9B4F96', '#0038A8'] },
  { key: 'pansexual', label: 'Pansexual', colors: ['#FF218C', '#FFD800', '#21B1FF'] },
  { key: 'asexual', label: 'Asexual', colors: ['#000000', '#A3A3A3', '#FFFFFF', '#800080'] },
  { key: 'aromantic', label: 'Aromantic', colors: ['#3DA542', '#A7D379', '#FFFFFF', '#A9A9A9', '#000000'] },
  { key: 'polysexual', label: 'Polysexual', colors: ['#F714BA', '#01D66A', '#1594F6'] },
  { key: 'omnisexual', label: 'Omnisexual', colors: ['#FE9ACE', '#FF53BF', '#200044', '#6760FE', '#8EA6FF'] },
  { key: 'queer', label: 'Queer', colors: ['#000000', '#99D9EA', '#00A2E8', '#B5E61D', '#FFFFFF', '#FFC90E', '#FD6666', '#FFAEC9'] },
  { key: 'transgender', label: 'Transgender', colors: ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA'] },
  { key: 'nonbinary', label: 'Non-binary', colors: ['#FCF434', '#FFFFFF', '#9C59D1', '#2C2C2C'] },
  { key: 'genderfluid', label: 'Genderfluid', colors: ['#FF76A4', '#FFFFFF', '#C011D7', '#000000', '#2F3CBE'] },
  { key: 'genderqueer', label: 'Genderqueer', colors: ['#B57EDC', '#FFFFFF', '#4A8123'] },
  { key: 'agender', label: 'Agender', colors: ['#000000', '#BCC4C7', '#FFFFFF', '#B7F684', '#FFFFFF', '#BCC4C7', '#000000'] },
  { key: 'bigender', label: 'Bigender', colors: ['#C479A2', '#EDA5CD', '#D6C7E8', '#FFFFFF', '#D6C7E8', '#9AC7E8', '#6D82D1'] },
  { key: 'demigirl', label: 'Demigirl', colors: ['#7F7F7F', '#C4C4C4', '#FDADC8', '#FFFFFF', '#FDADC8', '#C4C4C4', '#7F7F7F'] },
  { key: 'demiboy', label: 'Demiboy', colors: ['#7F7F7F', '#C4C4C4', '#9DD7EA', '#FFFFFF', '#9DD7EA', '#C4C4C4', '#7F7F7F'] },
  { key: 'straight', label: 'Straight' },
  { key: 'questioning', label: 'Questioning' },
  { key: 'fictosexual', label: 'Fictosexual' },
  { key: 'fictoromantic', label: 'Fictoromantic' },
  { key: 'fictorose', label: 'Fictorose' },
];

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
