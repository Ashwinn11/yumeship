/* kit.jsx — refined yumeship UI kit
   Drop in: <script type="text/babel" src="kit.jsx"></script>
   Exports: Icons, WashiTape, Paper variants, Callouts, Bullets, Stickers, swatches */

// ─── Icons ─────────────────────────────────────────────────────
// Reference-aligned: rounded, friendly, slightly chunkier strokes (1.5–1.6),
// gentle radii. All sized via `size`, colored via `color` or currentColor.

const ic = (props) => ({
  width: props.size || 18, height: props.size || 18,
  viewBox: '0 0 24 24', fill: 'none',
  stroke: props.color || 'currentColor',
  strokeWidth: props.stroke || 1.6,
  strokeLinecap: 'round', strokeLinejoin: 'round',
});

const IconHome = (p) => (
  <svg {...ic(p)}>
    <path d="M4 11.2 12 4.5l8 6.7V19a1 1 0 0 1-1 1h-3.5v-5.5a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1V20H5a1 1 0 0 1-1-1v-7.8Z"/>
  </svg>
);
const IconBook = (p) => (
  <svg {...ic(p)}>
    <path d="M12 6.2C10.2 4.9 7.7 4.5 4.5 4.5v13c3.2 0 5.7.4 7.5 1.7M12 6.2c1.8-1.3 4.3-1.7 7.5-1.7v13c-3.2 0-5.7.4-7.5 1.7M12 6.2v13"/>
  </svg>
);
const IconMail = (p) => (
  <svg {...ic(p)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/>
    <path d="M3.5 7 12 13l8.5-6"/>
  </svg>
);
const IconPencil = (p) => (
  <svg {...ic(p)}>
    <path d="M4 20l1.5-4.5L16 5l3 3L8.5 18.5 4 20Z"/>
    <path d="M14 7l3 3"/>
  </svg>
);
const IconHeart = (p) => (
  <svg {...ic(p)}>
    <path d="M12 19.5c-6-3.8-8.5-6.7-8.5-10A4 4 0 0 1 7.5 5.5C9.2 5.5 10.7 6.3 12 8c1.3-1.7 2.8-2.5 4.5-2.5A4 4 0 0 1 20.5 9.5c0 3.3-2.5 6.2-8.5 10Z"/>
  </svg>
);
const IconSearch = (p) => (
  <svg {...ic(p)}>
    <circle cx="10.5" cy="10.5" r="6"/>
    <path d="M15 15l4.5 4.5"/>
  </svg>
);
const IconBell = (p) => (
  <svg {...ic(p)}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2.5h-15L6 16Z"/>
    <path d="M10 19.5a2 2 0 0 0 4 0"/>
  </svg>
);
const IconPlus = (p) => (
  <svg {...ic(p)}>
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconBookmark = (p) => (
  <svg {...ic(p)}>
    <path d="M5 4h14v17l-7-4.5L5 21V4Z"/>
  </svg>
);
const IconStar = (p) => (
  <svg {...ic(p)}>
    <path d="M12 4l2.5 5.2L20 10l-4 3.8L17 20l-5-2.8L7 20l1-6.2L4 10l5.5-.8L12 4Z"/>
  </svg>
);
const IconDownload = (p) => (
  <svg {...ic(p)}>
    <path d="M12 4v11M7 10l5 5 5-5M5 19h14"/>
  </svg>
);
const IconTrash = (p) => (
  <svg {...ic(p)}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>
);
const IconGear = (p) => (
  <svg {...ic(p)}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20M6.3 6.3l1.8 1.8M15.9 15.9l1.8 1.8M6.3 17.7l1.8-1.8M15.9 8.1l1.8-1.8"/>
  </svg>
);
const IconUser = (p) => (
  <svg {...ic(p)}>
    <circle cx="12" cy="8.5" r="3.5"/>
    <path d="M5 20a7 7 0 0 1 14 0"/>
  </svg>
);
const IconSend = (p) => (
  <svg {...ic(p)}>
    <path d="M3.5 11.5 20.5 4 14 21 11 13 3.5 11.5Z"/>
  </svg>
);
const IconCamera = (p) => (
  <svg {...ic(p)}>
    <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/>
    <circle cx="12" cy="13" r="3.5"/>
  </svg>
);
const IconCalendar = (p) => (
  <svg {...ic(p)}>
    <rect x="4" y="5" width="16" height="15" rx="2.5"/>
    <path d="M4 10h16M9 3v4M15 3v4"/>
  </svg>
);
const IconFlower = (p) => (
  <svg {...ic(p)}>
    <circle cx="12" cy="12" r="2"/>
    <path d="M12 4a3 3 0 0 1 0 6M12 14a3 3 0 0 1 0 6M4 12a3 3 0 0 1 6 0M14 12a3 3 0 0 1 6 0"/>
  </svg>
);
const IconQuote = (p) => (
  <svg {...ic(p)}>
    <path d="M7 7c-2 0-3 1.5-3 3.5S5 14 7 14v3l3-3v-3.5C10 8.5 9 7 7 7ZM17 7c-2 0-3 1.5-3 3.5S15 14 17 14v3l3-3v-3.5C20 8.5 19 7 17 7Z"/>
  </svg>
);
const IconLock = (p) => (
  <svg {...ic(p)}>
    <rect x="5" y="11" width="14" height="9" rx="2"/>
    <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
  </svg>
);

const Icons = { IconHome, IconBook, IconMail, IconPencil, IconHeart, IconSearch, IconBell, IconPlus, IconBookmark, IconStar, IconDownload, IconTrash, IconGear, IconUser, IconSend, IconCamera, IconCalendar, IconFlower, IconQuote, IconLock };

// ─── Washi tape variations ─────────────────────────────────────
// Patterns: stripe, dot, heart, check, floral, lace, grid, bow, gingham, polka
function WashiTape({ width = 90, height = 18, pattern = 'heart', color, rotate = -4, style = {} }) {
  const c = color || 'var(--primary-tint)';
  const id = 'w' + Math.random().toString(36).slice(2, 7);
  const pat = (() => {
    switch (pattern) {
      case 'stripe':
        return <pattern id={id} width="6" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="10" fill={c}/></pattern>;
      case 'dot':
        return <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.5" fill={c}/></pattern>;
      case 'heart':
        return <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M6 9.5C3 7.5 2 6 2.8 4.6 3.6 3.2 5.2 4 6 5.2 6.8 4 8.4 3.2 9.2 4.6 10 6 9 7.5 6 9.5Z" fill={c}/></pattern>;
      case 'check':
        return <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill={c}/><rect x="4" y="4" width="4" height="4" fill={c}/></pattern>;
      case 'floral':
        return <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
          {[0, 72, 144, 216, 288].map(r => <ellipse key={r} cx="7" cy="4" rx="1.6" ry="2.6" fill={c} transform={`rotate(${r} 7 7)`}/>)}
          <circle cx="7" cy="7" r="0.9" fill="#fff8" />
        </pattern>;
      case 'lace':
        return <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="1.2" fill="none" stroke={c} strokeWidth="0.7"/>
          <circle cx="0" cy="0" r="1.2" fill="none" stroke={c} strokeWidth="0.7"/>
          <circle cx="10" cy="10" r="1.2" fill="none" stroke={c} strokeWidth="0.7"/>
        </pattern>;
      case 'grid':
        return <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M6 0v6M0 6h6" stroke={c} strokeWidth="0.7"/>
        </pattern>;
      case 'gingham':
        return <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill={c} opacity="0.7"/>
          <rect x="4" y="4" width="4" height="4" fill={c} opacity="0.7"/>
          <rect x="4" width="4" height="4" fill={c} opacity="0.3"/>
          <rect y="4" width="4" height="4" fill={c} opacity="0.3"/>
        </pattern>;
      case 'star':
        return <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M7 2l1.3 3.4L11.7 6 9 8.4 9.7 12 7 10.2 4.3 12 5 8.4 2.3 6l3.4-.6L7 2Z" fill={c}/>
        </pattern>;
      default: return null;
    }
  })();
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
         style={{ transform: `rotate(${rotate}deg)`, opacity: 0.92, ...style }}>
      <defs>{pat}</defs>
      <rect width={width} height={height} fill={`url(#${id})`} opacity="0.6"/>
      <rect width={width} height={height} fill={c} opacity="0.22"/>
      <rect width={width} height="2" fill="rgba(255,255,255,0.25)"/>
      <rect y={height - 2} width={width} height="2" fill="rgba(0,0,0,0.05)"/>
    </svg>
  );
}

// ─── Papers / Frames ─────────────────────────────────────────
// Lined paper, scalloped, polaroid, grid paper, clipped, torn

function PaperLined({ width = 110, height = 130, lines = 5, children, style = {} }) {
  return (
    <div style={{
      width, height, position: 'relative',
      background: 'var(--vellum)',
      borderRadius: 4,
      boxShadow: '0 2px 8px rgba(110,58,90,0.08)',
      ...style,
    }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: lines }).map((_, i) => (
          <line key={i} x1="10" x2={width - 10} y1={26 + i * 16} y2={26 + i * 16}
                stroke="var(--line)" strokeWidth="1"/>
        ))}
        <line x1="22" x2="22" y1="6" y2={height - 6} stroke="var(--primary-tint)" strokeWidth="1" opacity="0.6"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, padding: '14px 12px 12px 28px', fontFamily: 'var(--font-script)', fontSize: 15, lineHeight: '16px', color: 'var(--ink-2)' }}>
        {children}
      </div>
    </div>
  );
}

function PaperScalloped({ width = 100, height = 130, children, color, style = {} }) {
  const c = color || 'var(--primary-soft)';
  // scalloped edges via SVG mask
  const scallop = 5; // bumps
  const r = width / (scallop * 2);
  return (
    <div style={{
      width, height, position: 'relative',
      filter: 'drop-shadow(0 2px 6px rgba(110,58,90,0.10))',
      ...style,
    }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="scallop-clip">
            <path d={`
              M 0 ${r}
              ${Array.from({ length: scallop }).map((_, i) =>
                `A ${r} ${r} 0 0 1 ${(i * 2 + 2) * r} ${r}`).join(' ')}
              L ${width} ${height - r}
              ${Array.from({ length: scallop }).map((_, i) =>
                `A ${r} ${r} 0 0 1 ${width - (i * 2 + 2) * r} ${height - r}`).join(' ')}
              Z
            `}/>
          </clipPath>
        </defs>
        <rect width={width} height={height} fill={c} clipPath="url(#scallop-clip)"/>
      </svg>
      <div style={{ position: 'absolute', inset: '14px 12px', fontFamily: 'var(--font-script)', fontSize: 14, color: 'var(--primary-ink)', lineHeight: '16px' }}>
        {children}
      </div>
      <div style={{ position: 'absolute', bottom: 8, right: 12, color: 'var(--primary-ink)', opacity: 0.6, fontSize: 12 }}>♡</div>
    </div>
  );
}

function PaperPolaroid({ width = 92, height = 120, rotate = 4, children, style = {} }) {
  return (
    <div style={{
      width, height, padding: '8px 8px 24px', background: 'white',
      transform: `rotate(${rotate}deg)`,
      boxShadow: '0 4px 10px rgba(110,58,90,0.12)',
      position: 'relative', ...style,
    }}>
      <div style={{ width: '100%', height: '100%', background: 'var(--primary-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundImage: 'linear-gradient(135deg, var(--primary-tint), var(--primary))',
      }}>
        {children}
      </div>
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-script)', fontSize: 12, color: 'var(--ink-2)' }}>♡</div>
    </div>
  );
}

function PaperGrid({ width = 100, height = 130, children, style = {} }) {
  return (
    <div style={{
      width, height, position: 'relative',
      background: 'var(--butter-soft)',
      borderRadius: 4,
      backgroundImage: 'linear-gradient(var(--butter) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--butter) 0.5px, transparent 0.5px)',
      backgroundSize: '10px 10px',
      backgroundPositionX: '50%', backgroundPositionY: '50%',
      boxShadow: '0 2px 8px rgba(110,58,90,0.08)',
      ...style,
    }}>
      <div style={{ position: 'absolute', inset: 14, fontFamily: 'var(--font-script)', fontSize: 14, color: 'var(--butter-deep)', lineHeight: '16px' }}>
        {children}
      </div>
    </div>
  );
}

function ClipBinder({ size = 30, color = 'var(--butter)', rotate = 0, style = {} }) {
  // paperclip
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 20 32" fill="none"
         style={{ transform: `rotate(${rotate}deg)`, ...style }}>
      <path d="M10 2C6 2 3 5 3 9v17a4 4 0 0 0 8 0V9a3 3 0 1 1 6 0v17"
            stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Callouts / Speech bubbles ─────────────────────────────────
// Adapted from yumeship community reference: pink rectangle with quote-marks
// pinned to opposite corners + small notch tail, and a lavender cloud-bubble
// with a tiny sakura flower badge.

function CalloutBubble({ children, tone = 'pink', notch = true, style = {} }) {
  const toneMap = {
    pink:     { bg: '#fadde5', border: '#e8a8b5', color: '#8b3a4a', quote: '#d77a8d' },
    lavender: { bg: '#ece4f7', border: '#c7b5e3', color: '#4d3982', quote: '#8b6fc4' },
    butter:   { bg: '#fbecc4', border: '#e6c989', color: '#6b5114', quote: '#b8902a' },
    paper:    { bg: 'var(--vellum)', border: 'var(--line-strong)', color: 'var(--ink)', quote: 'var(--primary)' },
  };
  const t = toneMap[tone];
  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      <div style={{
        position: 'relative',
        background: t.bg,
        border: `1.6px solid ${t.border}`,
        borderRadius: 22,
        padding: '14px 22px 18px',
        minWidth: 180,
        fontFamily: 'var(--font-script)', fontSize: 17, lineHeight: '20px', color: t.color,
      }}>
        {/* opening quote, top-left */}
        <span style={{
          position: 'absolute', top: 4, left: 12,
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
          fontSize: 22, color: t.quote, lineHeight: 1, opacity: 0.85,
        }}>“</span>
        <div style={{ position: 'relative' }}>{children}</div>
        {/* closing quote, bottom-right (large) */}
        <span style={{
          position: 'absolute', bottom: 0, right: 14,
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
          fontSize: 26, color: t.quote, lineHeight: 1, opacity: 0.9,
        }}>”</span>
      </div>
      {notch && (
        // soft tail nub bottom-right, integrated into bubble outline
        <>
          <div style={{
            position: 'absolute', bottom: -6, right: 30,
            width: 18, height: 18,
            background: t.bg, border: `1.6px solid ${t.border}`,
            borderTop: 'none', borderLeft: 'none',
            borderBottomRightRadius: 6,
            transform: 'rotate(45deg)',
          }}/>
          <div style={{
            // mask the inner seam where the nub meets the bubble
            position: 'absolute', bottom: 0, right: 22,
            width: 24, height: 6, background: t.bg,
          }}/>
        </>
      )}
    </div>
  );
}

function ThoughtCloud({ children, tone = 'lavender', flower = true, style = {} }) {
  const toneMap = {
    lavender: { bg: '#ece4f7', border: '#c7b5e3', color: '#4d3982' },
    pink:     { bg: '#fadde5', border: '#e8a8b5', color: '#8b3a4a' },
  };
  const t = toneMap[tone];
  // Cloud shape via SVG so the bumpy outline is exact
  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      <svg width="220" height="130" viewBox="0 0 220 130" style={{ display: 'block' }}>
        <defs>
          <filter id="cloud-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={t.border} floodOpacity="0.25"/>
          </filter>
        </defs>
        <path
          d="M 30 60
             a 22 22 0 0 1 14 -28
             a 26 26 0 0 1 36 -14
             a 28 28 0 0 1 50 0
             a 26 26 0 0 1 38 12
             a 22 22 0 0 1 12 30
             a 22 22 0 0 1 -16 28
             a 26 26 0 0 1 -36 12
             a 28 28 0 0 1 -50 -2
             a 26 26 0 0 1 -38 -10
             a 22 22 0 0 1 -10 -28 Z"
          fill={t.bg} stroke={t.border} strokeWidth="1.8" filter="url(#cloud-shadow)"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: '22px 36px',
        fontFamily: 'var(--font-script)', fontSize: 17, color: t.color,
        lineHeight: '20px', textAlign: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
      {flower && (
        <div style={{ position: 'absolute', bottom: 6, left: 22 }}>
          {/* tiny sakura badge */}
          <svg width="22" height="22" viewBox="0 0 22 22">
            {[0, 72, 144, 216, 288].map(r =>
              <ellipse key={r} cx="11" cy="6" rx="2.8" ry="4" fill="#f3b6c4" stroke="#d77a8d" strokeWidth="0.6" transform={`rotate(${r} 11 11)`}/>
            )}
            <circle cx="11" cy="11" r="1.6" fill="#b8902a"/>
          </svg>
        </div>
      )}
    </div>
  );
}

// ─── Bullets / Markers ─────────────────────────────────────────
const Bullets = {
  Heart: ({ size = 12, color = 'var(--primary)' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <path d="M8 14 C 3 11 1 8.5 1 5.5 C 1 3.5 2.5 2 4.5 2 C 6 2 7.3 2.9 8 4.3 C 8.7 2.9 10 2 11.5 2 C 13.5 2 15 3.5 15 5.5 C 15 8.5 13 11 8 14 Z"
            fill={color}/>
    </svg>
  ),
  Sakura: ({ size = 12, color = 'var(--primary)' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {[0, 72, 144, 216, 288].map(r =>
        <ellipse key={r} cx="8" cy="4" rx="2" ry="3" fill={color} transform={`rotate(${r} 8 8)`}/>
      )}
      <circle cx="8" cy="8" r="1.2" fill="var(--butter)"/>
    </svg>
  ),
  Star: ({ size = 12, color = 'var(--primary)' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <path d="M8 0 L9.4 6.6 L16 8 L9.4 9.4 L8 16 L6.6 9.4 L0 8 L6.6 6.6 Z" fill={color}/>
    </svg>
  ),
  Dot: ({ size = 12, color = 'var(--primary)' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="5" fill={color}/>
    </svg>
  ),
  Crescent: ({ size = 12, color = 'var(--lavender-deep)' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <path d="M11 2 A6 6 0 1 0 11 14 A4.5 4.5 0 0 1 11 2Z" fill={color}/>
    </svg>
  ),
  Square: ({ size = 11, color = 'var(--primary)' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect x="2" y="2" width="12" height="12" rx="2" fill={color}/>
    </svg>
  ),
  Tape: ({ size = 16, color = 'var(--primary-tint)' }) => (
    <svg width={size + 4} height={size - 4} viewBox="0 0 20 12">
      <rect width="20" height="12" fill={color} opacity="0.6"/>
      <path d="M2 2h2M6 2h2M10 2h2M14 2h2M2 8h2M6 8h2M10 8h2M14 8h2" stroke={color} strokeWidth="1"/>
    </svg>
  ),
  Ribbon: ({ size = 14, color = 'var(--primary)' }) => (
    <svg width={size + 4} height={size} viewBox="0 0 18 14">
      <path d="M0 2 L6 7 L0 12 L4 7 Z M18 2 L12 7 L18 12 L14 7 Z" fill={color} opacity="0.7"/>
      <circle cx="9" cy="7" r="2" fill={color}/>
    </svg>
  ),
};

// ─── Stickers / Illustrations ──────────────────────────────────
// Adapted to match the reference: soft pastel shading, white sticker borders,
// layered details (mauve leaves, embossed wax, moonlit polaroid).

// Sticker wrapper — adds the white border + soft drop shadow that gives
// every illustration the "die-cut sticker" feel from the reference.
function Sticker({ children, w, h, style = {} }) {
  return (
    <div style={{
      width: w, height: h, position: 'relative',
      filter: 'drop-shadow(0 2px 3px rgba(110,58,90,0.18))',
      display: 'inline-block', ...style,
    }}>
      {children}
    </div>
  );
}

// Envelope with heart wax seal — cream body, mauve outline
function StickerEnvelope({ size = 60, style = {} }) {
  const w = size, h = size * 0.78;
  return (
    <Sticker w={w} h={h} style={style}>
      <svg width={w} height={h} viewBox="0 0 60 48">
        {/* white sticker border */}
        <path d="M5 7 Q 5 4, 8 4 L52 4 Q 55 4, 55 7 L55 41 Q 55 44, 52 44 L8 44 Q 5 44, 5 41 Z"
              fill="white" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
        {/* body */}
        <path d="M7 9 Q 7 6, 10 6 L50 6 Q 53 6, 53 9 L53 39 Q 53 42, 50 42 L10 42 Q 7 42, 7 39 Z"
              fill="#fbe8dc" stroke="#a8765c" strokeWidth="1.1"/>
        {/* flap (back, lighter) */}
        <path d="M7 9 L30 26 L53 9" fill="none" stroke="#a8765c" strokeWidth="1.1"/>
        <path d="M7 39 L23 28 M53 39 L37 28" stroke="#a8765c" strokeWidth="0.9" opacity="0.6"/>
        {/* shading on flap */}
        <path d="M7 9 Q 7 6, 10 6 L50 6 Q 53 6, 53 9 L30 25 Z" fill="#fff5ec" opacity="0.6"/>
        {/* heart wax seal */}
        <g transform="translate(30 26)">
          <circle r="5.5" fill="#fadde5" stroke="#a8765c" strokeWidth="0.8" opacity="0.4"/>
          <path d="M0 4 C -3.5 1.5 -4.5 0 -3.8 -1.5 C -3 -2.8 -1.2 -2 0 -0.5 C 1.2 -2 3 -2.8 3.8 -1.5 C 4.5 0 3.5 1.5 0 4 Z"
                fill="#d77a8d" stroke="#8b3a4a" strokeWidth="0.6"/>
        </g>
      </svg>
    </Sticker>
  );
}

// Sakura branch — brown stem, layered shaded flowers, mauve leaves
function StickerSakuraBranch({ size = 70, style = {} }) {
  return (
    <Sticker w={size} h={size} style={style}>
      <svg width={size} height={size} viewBox="0 0 70 70">
        {/* outer sticker border — drawn as wider stroked silhouette underneath */}
        <g stroke="white" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" fill="white">
          <path d="M10 60 Q 22 42 35 32 Q 48 22 58 8"/>
          <ellipse cx="22" cy="50" rx="5" ry="9" transform="rotate(50 22 50)"/>
          <ellipse cx="44" cy="22" rx="5" ry="9" transform="rotate(20 44 22)"/>
          <circle cx="18" cy="58" r="8"/>
          <circle cx="34" cy="32" r="9"/>
          <circle cx="50" cy="14" r="8"/>
          <circle cx="42" cy="42" r="6"/>
        </g>
        {/* Stem */}
        <path d="M10 60 Q 22 42 35 32 Q 48 22 58 8" stroke="#8a5e48" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M22 48 Q 26 45 30 42" stroke="#8a5e48" strokeWidth="1.1" fill="none" opacity="0.7"/>
        <path d="M40 26 Q 44 24 48 22" stroke="#8a5e48" strokeWidth="1.1" fill="none" opacity="0.7"/>
        {/* Mauve leaves */}
        <g>
          <ellipse cx="22" cy="50" rx="3.5" ry="6" fill="#9a7a8a" transform="rotate(50 22 50)"/>
          <path d="M19 55 Q 22 50 25 45" stroke="#7a5b6b" strokeWidth="0.6" fill="none" transform="rotate(50 22 50)"/>
          <ellipse cx="44" cy="22" rx="3.5" ry="6" fill="#9a7a8a" transform="rotate(20 44 22)"/>
          <path d="M41 27 Q 44 22 47 17" stroke="#7a5b6b" strokeWidth="0.6" fill="none" transform="rotate(20 44 22)"/>
        </g>
        {/* Cherry blossoms — clustered with shaded petals */}
        {[[18, 58, 6, 'a'], [34, 32, 7, 'b'], [50, 14, 6, 'c'], [42, 42, 4.5, 'd']].map(([cx, cy, r, k]) => (
          <g key={k} transform={`translate(${cx} ${cy})`}>
            {[0, 72, 144, 216, 288].map((rot, i) =>
              <g key={i} transform={`rotate(${rot})`}>
                <ellipse cx="0" cy={-r * 0.55} rx={r * 0.42} ry={r * 0.65} fill="#f0a8b8" stroke="#c46a82" strokeWidth="0.6"/>
                <ellipse cx="-0.8" cy={-r * 0.7} rx={r * 0.18} ry={r * 0.28} fill="#fadde5" opacity="0.7"/>
              </g>
            )}
            <circle r={r * 0.18} fill="#c46a82"/>
            <circle r={r * 0.08} fill="#8b3a4a"/>
          </g>
        ))}
      </svg>
    </Sticker>
  );
}

// Polaroid with moonlit landscape
function StickerPolaroid({ size = 64, style = {} }) {
  const w = size, h = size * 1.18;
  return (
    <Sticker w={w} h={h} style={style}>
      <svg width={w} height={h} viewBox="0 0 64 76">
        <g transform="rotate(-5 32 38)">
          {/* white sticker outer */}
          <rect x="4" y="4" width="56" height="68" rx="2" fill="white" stroke="white" strokeWidth="3"/>
          {/* polaroid frame */}
          <rect x="6" y="6" width="52" height="64" fill="#fffaf5" stroke="#a8765c" strokeWidth="0.8"/>
          {/* photo */}
          <defs>
            <linearGradient id="moon-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a2a5e"/>
              <stop offset="0.5" stopColor="#7a6092"/>
              <stop offset="1" stopColor="#c7a8c0"/>
            </linearGradient>
          </defs>
          <rect x="9" y="9" width="46" height="44" fill="url(#moon-sky)"/>
          {/* moon */}
          <circle cx="42" cy="18" r="3.5" fill="#fff3e0"/>
          <circle cx="42.8" cy="17.4" r="3.2" fill="#3a2a5e"/>
          <circle cx="41.6" cy="18.4" r="3.5" fill="#fff3e0" opacity="0.6"/>
          {/* stars */}
          <circle cx="14" cy="13" r="0.7" fill="#fff3e0"/>
          <circle cx="22" cy="11" r="0.5" fill="#fff3e0"/>
          <circle cx="30" cy="16" r="0.6" fill="#fff3e0"/>
          <circle cx="50" cy="13" r="0.5" fill="#fff3e0"/>
          {/* mountain silhouette */}
          <path d="M9 53 L 17 42 L 23 47 L 30 38 L 37 44 L 46 36 L 55 44 L 55 53 Z" fill="#5a3a6e" opacity="0.85"/>
          {/* clouds */}
          <ellipse cx="20" cy="24" rx="6" ry="1.4" fill="#c7a8c0" opacity="0.6"/>
          <ellipse cx="36" cy="26" rx="5" ry="1.2" fill="#c7a8c0" opacity="0.55"/>
        </g>
      </svg>
    </Sticker>
  );
}

// Ticket with washi tape on top + small flower
function StickerTicket({ size = 60, style = {} }) {
  const w = size * 1.5, h = size * 0.75;
  return (
    <Sticker w={w} h={h} style={style}>
      <svg width={w} height={h} viewBox="0 0 90 45">
        <path d="M2 8 Q 2 4, 6 4 L84 4 Q 88 4, 88 8 L88 16 Q 86 19, 86 22.5 Q 86 26, 88 29 L88 37 Q 88 41, 84 41 L60 41 L60 36 L54 36 L54 41 L6 41 Q 2 41, 2 37 L2 29 Q 4 26, 4 22.5 Q 4 19, 2 16 Z"
              fill="white" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M4 9 Q 4 6, 7 6 L83 6 Q 86 6, 86 9 L86 17 Q 84 20, 84 22.5 Q 84 25, 86 28 L86 36 Q 86 39, 83 39 L62 39 L62 34 L52 34 L52 39 L7 39 Q 4 39, 4 36 L4 28 Q 6 25, 6 22.5 Q 6 20, 4 17 Z"
              fill="#fadde5" stroke="#a8765c" strokeWidth="0.9"/>
        {/* dashed perforation */}
        <path d="M58 6 V 14 M58 18 V 22 M58 26 V 30 M58 34 V 39" stroke="#a8765c" strokeWidth="0.8" strokeDasharray="2 2"/>
        {/* washi tape on top */}
        <g transform="rotate(-4 40 8)">
          <rect x="20" y="-2" width="40" height="11" fill="#f3b6c4" opacity="0.85" stroke="#a8765c" strokeWidth="0.4"/>
          {[24, 30, 36, 42, 48, 54].map(x => <circle key={x} cx={x} cy="3.5" r="0.8" fill="#d77a8d"/>)}
        </g>
        {/* tiny flower stamp */}
        <g transform="translate(28 25)">
          {[0, 72, 144, 216, 288].map(r =>
            <ellipse key={r} cx="0" cy="-3" rx="1.8" ry="2.8" fill="#d77a8d" transform={`rotate(${r})`}/>
          )}
          <circle r="0.9" fill="#b8902a"/>
        </g>
        <path d="M40 22 H 76 M40 27 H 70" stroke="#a8765c" strokeWidth="0.5" strokeDasharray="1.5 2"/>
      </svg>
    </Sticker>
  );
}

// Wax seal — darker outer ring with embossed heart
function StickerWaxSeal({ size = 48, style = {} }) {
  return (
    <Sticker w={size} h={size} style={style}>
      <svg width={size} height={size} viewBox="0 0 48 48">
        {/* white sticker bg */}
        <g>
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(r =>
            <ellipse key={r} cx="24" cy="8" rx="4" ry="6" fill="white" stroke="white" strokeWidth="3" transform={`rotate(${r} 24 24)`}/>
          )}
          <circle cx="24" cy="24" r="16" fill="white" stroke="white" strokeWidth="3"/>
        </g>
        {/* scalloped wax edge */}
        {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(r =>
          <ellipse key={r} cx="24" cy="9" rx="3.5" ry="5.5" fill="#a83a52" transform={`rotate(${r} 24 24)`}/>
        )}
        {/* outer darker ring */}
        <circle cx="24" cy="24" r="14" fill="#a83a52"/>
        {/* inner lighter face */}
        <circle cx="24" cy="24" r="11" fill="#c4566a"/>
        {/* embossed heart */}
        <path d="M24 31 C 18 27 16 24 16 21 C 16 19 17.5 18 19 18 C 21 18 23 19 24 21 C 25 19 27 18 29 18 C 30.5 18 32 19 32 21 C 32 24 30 27 24 31 Z"
              fill="#8b3a4a"/>
        {/* highlight on heart */}
        <path d="M18 21 Q 19 19 21 19" stroke="#e8a8b5" strokeWidth="0.8" fill="none" opacity="0.6"/>
        {/* outer wax highlight */}
        <path d="M14 14 Q 18 10 24 9" stroke="#e8a8b5" strokeWidth="1" fill="none" opacity="0.5"/>
      </svg>
    </Sticker>
  );
}

// Heart patch — stitched dashed border
function StickerHeartPatch({ size = 42, style = {} }) {
  return (
    <Sticker w={size} h={size} style={style}>
      <svg width={size} height={size} viewBox="0 0 42 42">
        {/* white sticker outline */}
        <path d="M21 37 C 9 28 4 22 4 14 C 4 8 8 5 12 5 C 15 5 18 7 21 11 C 24 7 27 5 30 5 C 34 5 38 8 38 14 C 38 22 33 28 21 37 Z"
              fill="white" stroke="white" strokeWidth="4" strokeLinejoin="round"/>
        {/* heart body */}
        <path d="M21 36 C 10 27 5 22 5 14 C 5 9 9 6 13 6 C 16 6 19 8 21 12 C 23 8 26 6 29 6 C 33 6 37 9 37 14 C 37 22 32 27 21 36 Z"
              fill="#f8c4d0"/>
        {/* inner dashed stitch */}
        <path d="M21 33 C 12 25 8 21 8 15 C 8 11 11 9 14 9 C 17 9 19 11 21 14 C 23 11 25 9 28 9 C 31 9 34 11 34 15 C 34 21 30 25 21 33 Z"
              fill="none" stroke="#c46a82" strokeWidth="0.9" strokeDasharray="2 2"/>
      </svg>
    </Sticker>
  );
}

// Single sakura flower (large)
function StickerSakuraFlower({ size = 40, style = {} }) {
  return (
    <Sticker w={size} h={size} style={style}>
      <svg width={size} height={size} viewBox="0 0 40 40">
        {/* white border */}
        <g stroke="white" strokeWidth="4" strokeLinejoin="round" fill="white">
          {[0, 72, 144, 216, 288].map(r =>
            <ellipse key={r} cx="20" cy="8" rx="5.5" ry="9" transform={`rotate(${r} 20 20)`}/>
          )}
          <circle cx="20" cy="20" r="3"/>
        </g>
        {/* mauve leaf behind */}
        <ellipse cx="32" cy="32" rx="3" ry="5" fill="#9a7a8a" transform="rotate(40 32 32)"/>
        {/* petals */}
        {[0, 72, 144, 216, 288].map(r =>
          <g key={r} transform={`rotate(${r} 20 20)`}>
            <ellipse cx="20" cy="9" rx="5" ry="8" fill="#f0a8b8" stroke="#c46a82" strokeWidth="0.7"/>
            <ellipse cx="18" cy="6" rx="2" ry="3.5" fill="#fadde5" opacity="0.7"/>
          </g>
        )}
        {/* center */}
        <circle cx="20" cy="20" r="2.5" fill="#fff3e0"/>
        <circle cx="20" cy="20" r="1.5" fill="#c46a82"/>
        {/* stamens */}
        {[20, 80, 140, 200, 260, 320].map(r => {
          const x = 20 + Math.cos(r * Math.PI / 180) * 1.8;
          const y = 20 + Math.sin(r * Math.PI / 180) * 1.8;
          return <circle key={r} cx={x} cy={y} r="0.5" fill="#b8902a"/>;
        })}
      </svg>
    </Sticker>
  );
}

// Leaf branch (no flowers) — mauve leaves only
function StickerLeafBranch({ size = 56, style = {} }) {
  return (
    <Sticker w={size * 0.7} h={size} style={style}>
      <svg width={size * 0.7} height={size} viewBox="0 0 40 56">
        <g stroke="white" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" fill="white">
          <path d="M20 54 Q 20 30 22 8"/>
          {[[12, 46, -45], [28, 38, 35], [12, 30, -40], [28, 22, 35], [16, 12, -30]].map(([cx, cy, rot], i) =>
            <ellipse key={i} cx={cx} cy={cy} rx="4" ry="7" transform={`rotate(${rot} ${cx} ${cy})`}/>
          )}
        </g>
        <path d="M20 54 Q 20 30 22 8" stroke="#8a5e48" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        {[[12, 46, -45], [28, 38, 35], [12, 30, -40], [28, 22, 35], [16, 12, -30]].map(([cx, cy, rot], i) => (
          <g key={i} transform={`rotate(${rot} ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy} rx="3" ry="5.5" fill="#9a7a8a"/>
            <path d={`M${cx} ${cy - 4} Q ${cx} ${cy} ${cx} ${cy + 4}`} stroke="#7a5b6b" strokeWidth="0.5" opacity="0.7"/>
          </g>
        ))}
      </svg>
    </Sticker>
  );
}

function StickerSparkle({ size = 16, color = '#d77a8d', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={style}>
      <path d="M8 0 L9.4 6.6 L16 8 L9.4 9.4 L8 16 L6.6 9.4 L0 8 L6.6 6.6 Z" fill={color}/>
    </svg>
  );
}

function StickerBow({ size = 36, color, style = {} }) {
  const c = color || '#f3b6c4';
  return (
    <Sticker w={size} h={size * 0.7} style={style}>
      <svg width={size} height={size * 0.7} viewBox="0 0 36 26">
        <g stroke="white" strokeWidth="3" strokeLinejoin="round" fill="white">
          <path d="M2 13 C 2 6 8 4 14 8 L18 13 L14 18 C 8 22 2 20 2 13 Z"/>
          <path d="M34 13 C 34 6 28 4 22 8 L18 13 L22 18 C 28 22 34 20 34 13 Z"/>
          <circle cx="18" cy="13" r="3"/>
        </g>
        <path d="M2 13 C 2 6 8 4 14 8 L18 13 L14 18 C 8 22 2 20 2 13 Z" fill={c} stroke="#c46a82" strokeWidth="0.8"/>
        <path d="M34 13 C 34 6 28 4 22 8 L18 13 L22 18 C 28 22 34 20 34 13 Z" fill={c} stroke="#c46a82" strokeWidth="0.8"/>
        <circle cx="18" cy="13" r="3" fill="#d77a8d" stroke="#8b3a4a" strokeWidth="0.7"/>
        {/* highlights */}
        <path d="M5 11 Q 8 9 12 9" stroke="#fadde5" strokeWidth="0.8" fill="none" opacity="0.7"/>
        <path d="M24 9 Q 28 9 31 11" stroke="#fadde5" strokeWidth="0.8" fill="none" opacity="0.7"/>
      </svg>
    </Sticker>
  );
}

const Stickers = { StickerEnvelope, StickerSakuraBranch, StickerPolaroid, StickerTicket, StickerWaxSeal, StickerHeartPatch, StickerSakuraFlower, StickerLeafBranch, StickerSparkle, StickerBow };

// ─── Palette swatches ──────────────────────────────────────────
const PALETTES = [
  { id: 'sakura', name: 'sakura', hue: '#d77a8d', soft: '#fadde5', tint: '#f3b6c4' },
  { id: 'lavender', name: 'lavender', hue: '#8b6fc4', soft: '#ece4f7', tint: '#c7b5e3' },
  { id: 'sage', name: 'sage', hue: '#6e8762', soft: '#e0ebd4', tint: '#b4c8a5' },
  { id: 'butter', name: 'butter', hue: '#b8902a', soft: '#fbecc4', tint: '#f0d189' },
  { id: 'peach', name: 'peach', hue: '#b76b48', soft: '#fde0ce', tint: '#f4b89a' },
  { id: 'plum', name: 'plum', hue: '#6e3a5a', soft: '#ecd6e0', tint: '#b88aa1' },
];

Object.assign(window, {
  Icons, ...Icons, WashiTape,
  PaperLined, PaperScalloped, PaperPolaroid, PaperGrid, ClipBinder,
  CalloutBubble, ThoughtCloud,
  Bullets,
  Stickers, ...Stickers,
  PALETTES,
});
