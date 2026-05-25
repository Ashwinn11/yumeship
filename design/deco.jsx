/* ============================================================
   yumeship — deco.jsx
   Kawaii decoration primitives: hearts, sparkles, ribbons,
   washi tape, sakura seals, stars. Used everywhere.
   ============================================================ */

// Sparkle cluster — 4-point twinkle stars in varying sizes
const Sparkle = ({ size = 14, color = "var(--sakura-deep)", opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity }}>
    <path d="M8 0 L9.4 6.6 L16 8 L9.4 9.4 L8 16 L6.6 9.4 L0 8 L6.6 6.6 Z" fill={color} />
  </svg>
);

const SparkleCluster = ({ color = "var(--sakura-deep)", style }) => (
  <div style={{ position: "relative", width: 24, height: 24, ...style }}>
    <div style={{ position: "absolute", top: 0, left: 4 }}>
      <Sparkle size={10} color={color} />
    </div>
    <div style={{ position: "absolute", top: 8, left: 12 }}>
      <Sparkle size={6} color={color} opacity={0.7} />
    </div>
    <div style={{ position: "absolute", top: 14, left: 2 }}>
      <Sparkle size={5} color={color} opacity={0.5} />
    </div>
  </div>
);

// Heart — chunky, soft
const Heart = ({ size = 14, color = "var(--sakura-deep)", outline = false }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <path d="M8 14 C 3 11 1 8.5 1 5.5 C 1 3.5 2.5 2 4.5 2 C 6 2 7.3 2.9 8 4.3 C 8.7 2.9 10 2 11.5 2 C 13.5 2 15 3.5 15 5.5 C 15 8.5 13 11 8 14 Z"
      fill={outline ? "none" : color}
      stroke={color}
      strokeWidth={outline ? 1.4 : 0}
      strokeLinejoin="round"
    />
  </svg>
);

// Sakura — 5-petal flower
const Sakura = ({ size = 18, color = "var(--sakura)", core = "var(--butter)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    {[0, 72, 144, 216, 288].map((rot) => (
      <ellipse
        key={rot}
        cx="12" cy="6.5" rx="3.6" ry="5.5"
        fill={color}
        transform={`rotate(${rot} 12 12)`}
      />
    ))}
    <circle cx="12" cy="12" r="1.8" fill={core} />
  </svg>
);

// Star
const Star = ({ size = 14, color = "var(--butter-deep)" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <path d="M8 1 L9.8 5.8 L15 6.3 L11 9.7 L12.3 14.8 L8 12 L3.7 14.8 L5 9.7 L1 6.3 L6.2 5.8 Z" fill={color} />
  </svg>
);

// Ribbon bow — two loops, knot, tails
const Ribbon = ({ size = 26, color = "var(--sakura-deep)" }) => (
  <svg width={size * 1.6} height={size} viewBox="0 0 40 24" fill={color}>
    <path d="M20 12 C 14 4, 4 4, 4 12 C 4 20, 14 20, 20 12 Z" />
    <path d="M20 12 C 26 4, 36 4, 36 12 C 36 20, 26 20, 20 12 Z" />
    <circle cx="20" cy="12" r="3" />
    <path d="M18 14 L 14 22 L 18 21 Z" />
    <path d="M22 14 L 26 22 L 22 21 Z" />
  </svg>
);

// Washi tape strip — used to "tape down" cards
const WashiTape = ({
  width = 80,
  height = 18,
  pattern = "stripe",
  color = "var(--sakura)",
  rotate = -3,
  style = {},
}) => {
  const id = React.useMemo(() => "wt-" + Math.random().toString(36).slice(2, 7), []);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        opacity: 0.85,
        filter: "drop-shadow(0 1px 0 rgba(110,58,90,0.08))",
        ...style,
      }}
    >
      <defs>
        {pattern === "stripe" && (
          <pattern id={id} width="6" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="3" height="10" fill={color} />
          </pattern>
        )}
        {pattern === "dot" && (
          <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.2" fill={color} />
          </pattern>
        )}
        {pattern === "heart" && (
          <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M5 8 C 2 6, 1.5 4.5, 2.5 3.5 C 3.5 2.5, 5 3.5, 5 4.5 C 5 3.5, 6.5 2.5, 7.5 3.5 C 8.5 4.5, 8 6, 5 8 Z" fill={color} />
          </pattern>
        )}
        {pattern === "check" && (
          <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="3" height="3" fill={color} />
            <rect x="3" y="3" width="3" height="3" fill={color} />
          </pattern>
        )}
      </defs>
      <rect
        width={width}
        height={height}
        fill={pattern === "solid" ? color : `url(#${id})`}
        style={{
          opacity: 0.55,
        }}
      />
      {/* base translucent layer */}
      <rect width={width} height={height} fill={color} opacity="0.25" />
      {/* torn deckle edges */}
      <path d={`M 0 0 L ${width} 0 L ${width} 2 L 0 2 Z`} fill="rgba(255,255,255,0.15)" />
    </svg>
  );
};

// Seal / stamp — circular with text
const Seal = ({
  size = 56,
  color = "var(--sakura-deep)",
  label = "yume",
  ja = "夢",
  rotate = -8,
  style = {},
}) => {
  const id = React.useMemo(() => "seal-" + Math.random().toString(36).slice(2, 7), []);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      <defs>
        <path
          id={id}
          d="M 50 50 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0"
        />
      </defs>
      <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="2 3" />
      <circle cx="50" cy="50" r="32" fill="none" stroke={color} strokeWidth="2" />
      <text fontFamily="DM Sans, sans-serif" fontSize="11" fill={color} fontWeight="600" letterSpacing="2">
        <textPath href={`#${id}`} startOffset="0%">{`★ ${label.toUpperCase()} ・ ${label.toUpperCase()} ・ ${label.toUpperCase()} ・ ${label.toUpperCase()} ・ `}</textPath>
      </text>
      <text x="50" y="58" textAnchor="middle" fill={color}
        style={{ fontFamily: "Klee One, serif", fontSize: 28, fontWeight: 600 }}>
        {ja}
      </text>
    </svg>
  );
};

// Speech-mark quote (decorative kawaii open quote)
const QuoteMark = ({ size = 40, color = "var(--sakura)" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill={color}>
    <path d="M8 22 C 8 14, 12 9, 18 7 L 19 10 C 14 12, 12 15, 12 18 C 13 17, 14 16.5, 15.5 16.5 C 18 16.5, 20 18.5, 20 21 C 20 23.5, 18 25.5, 15.5 25.5 C 11 25.5, 8 23, 8 22 Z" />
    <path d="M24 22 C 24 14, 28 9, 34 7 L 35 10 C 30 12, 28 15, 28 18 C 29 17, 30 16.5, 31.5 16.5 C 34 16.5, 36 18.5, 36 21 C 36 23.5, 34 25.5, 31.5 25.5 C 27 25.5, 24 23, 24 22 Z" />
  </svg>
);

// Pin push-pin
const Pin = ({ size = 16, color = "var(--sakura-deep)" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <ellipse cx="8" cy="5" rx="4" ry="3" fill={color} />
    <ellipse cx="6.5" cy="4" rx="1.2" ry="0.8" fill="rgba(255,255,255,0.5)" />
    <path d="M8 8 L 8 14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// Cloud (used for soft labels)
const Cloud = ({ size = 30, color = "var(--paper-deep)" }) => (
  <svg width={size * 1.5} height={size} viewBox="0 0 45 30" fill={color}>
    <circle cx="11" cy="18" r="9" />
    <circle cx="22" cy="13" r="11" />
    <circle cx="33" cy="18" r="9" />
    <rect x="8" y="18" width="28" height="9" rx="3" />
  </svg>
);

// Decorative pattern background (sakura confetti)
const SakuraConfetti = ({ style }) => (
  <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", ...style }}>
    {[
      [50, 40, 14, "var(--sakura)", 0.3],
      [110, 90, 9, "var(--lavender)", 0.25],
      [200, 60, 18, "var(--sakura)", 0.2],
      [300, 50, 11, "var(--butter)", 0.3],
      [350, 130, 14, "var(--sakura)", 0.25],
      [60, 180, 10, "var(--sage)", 0.3],
      [160, 220, 16, "var(--sakura)", 0.22],
      [260, 200, 12, "var(--lavender)", 0.28],
      [340, 280, 9, "var(--sakura)", 0.3],
      [40, 320, 14, "var(--butter)", 0.25],
      [180, 340, 11, "var(--sakura)", 0.3],
      [280, 350, 9, "var(--lavender)", 0.25],
    ].map(([cx, cy, r, c, o], i) => (
      <g key={i} transform={`translate(${cx},${cy}) rotate(${(i * 37) % 360})`} opacity={o}>
        {[0, 72, 144, 216, 288].map((rot) => (
          <ellipse key={rot} cx="0" cy={-r * 0.4} rx={r * 0.4} ry={r * 0.6} fill={c} transform={`rotate(${rot} 0 0)`} />
        ))}
      </g>
    ))}
  </svg>
);

Object.assign(window, {
  YS_Sparkle: Sparkle,
  YS_SparkleCluster: SparkleCluster,
  YS_Heart: Heart,
  YS_Sakura: Sakura,
  YS_Star: Star,
  YS_Ribbon: Ribbon,
  YS_WashiTape: WashiTape,
  YS_Seal: Seal,
  YS_QuoteMark: QuoteMark,
  YS_Pin: Pin,
  YS_Cloud: Cloud,
  YS_SakuraConfetti: SakuraConfetti,
});
