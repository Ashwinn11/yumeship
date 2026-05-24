/* ============================================================
   yumeship — template-pages.jsx
   Hand-drawn marker-style template PAGES, in the spirit of
   community templates (washi tape, polaroids, dichotomy
   toggles, attribute sliders, sharing checkboxes).

   Each template is a self-contained page (~580×840) the user
   can fill in and screenshot. Six creators, six aesthetics.
   ============================================================ */

const { YS_Heart: Heart, YS_Sparkle: Sparkle, YS_Sakura: Sakura,
        YS_Star: Star, YS_WashiTape: WashiTape, YS_Seal: Seal,
        YS_Ribbon: Ribbon, YS_Pin: Pin, YS_QuoteMark: QuoteMark,
        YS_Mark: Mark } = window;

// =============================================================
// PRIMITIVES — the marker-style component kit
// =============================================================

const inkColor = "#1f1219";   // a deep wine-black for outlines
const fillGray = "#e9d8cb";   // warm placeholder fill
const fillGrayDark = "#d0bba9";

// Marker card outer shell — black outline, off-white inside
const MarkerCard = ({ children, width = 560, height, style = {}, tint = "var(--paper-soft)" }) => (
  <div style={{
    width, height,
    background: tint,
    border: `2px solid ${inkColor}`,
    borderRadius: 14,
    position: "relative",
    padding: 24,
    fontFamily: "var(--font-marker)",
    color: inkColor,
    boxShadow: "0 6px 0 rgba(31,18,25,0.08), 0 24px 40px rgba(31,18,25,0.06)",
    overflow: "hidden",
    ...style,
  }}>{children}</div>
);

// Chunky marker headline
const MarkerHeader = ({ children, size = 32, style }) => (
  <div style={{
    fontFamily: "var(--font-marker)",
    fontWeight: 700,
    fontSize: size,
    lineHeight: 1,
    letterSpacing: "-0.01em",
    color: inkColor,
    textTransform: "uppercase",
    ...style,
  }}>{children}</div>
);

// Author credit — Caveat italic
const ScriptCredit = ({ by }) => (
  <div style={{
    fontFamily: "var(--font-script)",
    fontWeight: 500,
    fontSize: 16,
    color: inkColor,
    fontStyle: "italic",
  }}>
    template by <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>{by}</span>
  </div>
);

// Filled-in handwritten value (Klee One italic)
const Filled = ({ children, size = 14 }) => (
  <span style={{
    fontFamily: "var(--font-ja)",
    fontSize: size,
    fontWeight: 400,
    color: inkColor,
  }}>{children}</span>
);

// Empty fill pill (gray placeholder bar)
const BlankPill = ({ width = "100%", filled }) => (
  <span style={{
    display: "inline-block",
    width, height: 12,
    background: fillGray,
    border: `1.5px solid ${inkColor}`,
    borderRadius: 999,
    verticalAlign: "middle",
  }} />
);

// Field row: "Age _____"
const Field = ({ label, value, width = 90 }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "var(--font-marker)", fontWeight: 600, fontSize: 13,
    color: inkColor, textTransform: "uppercase", letterSpacing: "0.02em",
  }}>
    {label}
    {value ? (
      <span style={{
        display: "inline-block",
        width, height: 16,
        background: "#fff",
        border: `1.5px solid ${inkColor}`,
        borderRadius: 4,
        padding: "0 6px",
        fontFamily: "var(--font-ja)", fontSize: 13,
        fontWeight: 400, color: inkColor,
        textTransform: "none",
        lineHeight: "13px",
        textAlign: "center",
      }}>{value}</span>
    ) : (
      <BlankPill width={width} />
    )}
  </span>
);

// Circle checkbox
const Check = ({ on, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="6.5" fill="none" stroke={inkColor} strokeWidth="1.6" />
    {on && <circle cx="8" cy="8" r="3.5" fill={inkColor} />}
  </svg>
);

// "Big spoon / Little Spoon ○" line
const Dichotomy = ({ left, right, choice }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 8,
    fontFamily: "var(--font-marker)", fontSize: 12, fontWeight: 500,
    color: inkColor,
  }}>
    <span style={{ fontWeight: choice === "left" ? 700 : 500, textDecoration: choice === "left" ? "underline" : "none" }}>{left}</span>
    <span style={{ opacity: 0.5 }}>/</span>
    <span style={{ fontWeight: choice === "right" ? 700 : 500, textDecoration: choice === "right" ? "underline" : "none", flex: 1 }}>{right}</span>
    <Check on={!!choice} />
  </div>
);

// Sharing yes/no/selective row
const SharingRow = ({ choice }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 14,
    fontFamily: "var(--font-marker)", fontWeight: 700, fontSize: 14,
    textTransform: "uppercase",
    color: inkColor,
  }}>
    <span>♡ Sharing:</span>
    {["Yes", "No", "Selective"].map((c) => (
      <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <Check on={choice === c} />
        <span style={{ fontWeight: choice === c ? 700 : 500 }}>{c}</span>
      </span>
    ))}
  </div>
);

// Attribute slider (Trust, Clingy, Jealousy)
const AttrSlider = ({ label, value = 0.6 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{
      fontFamily: "var(--font-marker)", fontWeight: 600, fontSize: 11,
      color: inkColor, letterSpacing: "0.06em", textTransform: "uppercase",
      textAlign: "center",
    }}>{label}</span>
    <div style={{
      position: "relative",
      height: 8,
      background: "#fff",
      border: `1.5px solid ${inkColor}`,
      borderRadius: 999,
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: `${value * 100}%`,
        background: fillGrayDark,
        borderRadius: 999,
      }} />
      <div style={{
        position: "absolute",
        left: `${value * 100}%`, top: "50%",
        transform: "translate(-50%, -50%)",
        width: 12, height: 12,
        background: "#fff",
        border: `1.5px solid ${inkColor}`,
        borderRadius: 999,
      }} />
    </div>
  </div>
);

// Photo placeholder block (square, slight inner shadow)
const PhotoBox = ({ size = 100, round, style, label }) => (
  <div style={{
    width: size, height: size,
    background: fillGray,
    border: `1.5px solid ${inkColor}`,
    borderRadius: round ? 999 : 6,
    display: "grid", placeItems: "center",
    position: "relative",
    overflow: "hidden",
    ...style,
  }}>
    {label && (
      <span style={{
        fontFamily: "var(--font-marker)", fontSize: 10, color: inkColor,
        opacity: 0.55, textTransform: "uppercase", letterSpacing: "0.1em",
      }}>{label}</span>
    )}
  </div>
);

// Polaroid frame
const Polaroid = ({ size = 130, rotate = -4, caption, tapeColor = "var(--sakura)", style }) => (
  <div style={{
    position: "relative",
    width: size,
    background: "#fff",
    border: `1.5px solid ${inkColor}`,
    padding: 8,
    paddingBottom: caption ? 24 : 36,
    transform: `rotate(${rotate}deg)`,
    boxShadow: "0 6px 0 rgba(31,18,25,0.07), 0 10px 20px rgba(31,18,25,0.08)",
    ...style,
  }}>
    {/* tape diagonal */}
    <div style={{
      position: "absolute", top: -8, left: "50%",
      transform: "translateX(-50%) rotate(-12deg)",
      width: size * 0.5, height: 14,
      background: tapeColor, opacity: 0.7,
      border: `1px solid rgba(31,18,25,0.15)`,
    }} />
    <div style={{
      width: "100%",
      aspectRatio: "1/1",
      background: fillGray,
      border: `1px solid ${inkColor}`,
    }} />
    {caption && (
      <div style={{
        marginTop: 6,
        fontFamily: "var(--font-script)",
        fontSize: 14,
        color: inkColor,
        textAlign: "center",
      }}>{caption}</div>
    )}
  </div>
);

// Window chrome panel (close / min / max)
const WindowFrame = ({ title, children, style }) => (
  <div style={{
    background: "#fff",
    border: `1.5px solid ${inkColor}`,
    borderRadius: 6,
    overflow: "hidden",
    ...style,
  }}>
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "6px 10px",
      borderBottom: `1.5px solid ${inkColor}`,
    }}>
      <span style={{
        fontFamily: "var(--font-marker)", fontWeight: 700, fontSize: 13,
        textTransform: "uppercase", letterSpacing: "0.04em",
        color: inkColor,
      }}>{title}</span>
      <span style={{ display: "flex", gap: 6, alignItems: "center", color: inkColor }}>
        <Heart size={11} color={inkColor} outline />
        <svg width="11" height="11" viewBox="0 0 11 11"><path d="M2 6 L9 6" stroke={inkColor} strokeWidth="1.5" strokeLinecap="round"/></svg>
        <svg width="11" height="11" viewBox="0 0 11 11"><rect x="2" y="2" width="7" height="7" stroke={inkColor} strokeWidth="1.5" fill="none"/></svg>
        <svg width="11" height="11" viewBox="0 0 11 11"><path d="M2 2 L9 9 M9 2 L2 9" stroke={inkColor} strokeWidth="1.5" strokeLinecap="round"/></svg>
      </span>
    </div>
    <div style={{ padding: 12 }}>{children}</div>
  </div>
);

// Music player widget
const MusicPlayer = ({ track }) => (
  <div style={{ padding: "4px 2px" }}>
    {track && (
      <div style={{
        fontFamily: "var(--font-script)", fontSize: 16,
        color: inkColor, marginBottom: 6,
      }}>{track}</div>
    )}
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <div style={{ flex: 1, position: "relative", height: 4, background: "#fff", border: `1.2px solid ${inkColor}`, borderRadius: 999 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "62%", background: fillGrayDark, borderRadius: 999 }} />
        <div style={{ position: "absolute", left: "62%", top: "50%", transform: "translate(-50%, -50%)", width: 8, height: 8, background: "#fff", border: `1.2px solid ${inkColor}`, borderRadius: 999 }} />
      </div>
      <svg width="18" height="18" viewBox="0 0 18 18" fill={inkColor}>
        <path d="M9 1 Q 10 7, 15 7 M9 1 L 9 12 A 3 3 0 1 0 11 14.6 L 11 6 L 15 5 L 15 4 L 9 1 Z" stroke={inkColor} strokeWidth="1.2" fill={inkColor}/>
      </svg>
    </div>
    <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
      {/* loop */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={inkColor} strokeWidth="1.5">
        <path d="M3 8 a5 5 0 0 1 9 -3 M3 5 L 3 8 L 6 8 M 13 8 a5 5 0 0 1 -9 3 M 13 11 L 13 8 L 10 8" strokeLinecap="round" />
      </svg>
      <svg width="16" height="16" viewBox="0 0 16 16" fill={inkColor}>
        <path d="M9 4 L 4 8 L 9 12 Z" /><rect x="2" y="4" width="1.6" height="8" />
      </svg>
      <span style={{ width: 22, height: 22, border: `1.5px solid ${inkColor}`, borderRadius: 999, display: "grid", placeItems: "center" }}>
        <svg width="9" height="9" viewBox="0 0 9 9" fill={inkColor}><path d="M2 1 L 8 4.5 L 2 8 Z" /></svg>
      </span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill={inkColor}>
        <path d="M7 4 L 12 8 L 7 12 Z" /><rect x="12.4" y="4" width="1.6" height="8" />
      </svg>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={inkColor} strokeWidth="1.6" strokeLinecap="round">
        <path d="M3 3 L 13 13 M 13 3 L 3 13" />
      </svg>
    </div>
  </div>
);

// Header banner — "GET TO KNOW MY YUMESHIP"
const TitleHeader = ({ title, subtitle, by }) => (
  <div style={{ marginBottom: 14 }}>
    <MarkerHeader size={26} style={{ lineHeight: 1, maxWidth: 240 }}>
      {title}
    </MarkerHeader>
    {subtitle && (
      <div style={{
        fontFamily: "var(--font-script)", fontSize: 14, color: inkColor,
        marginTop: 4, fontStyle: "italic",
      }}>{subtitle}</div>
    )}
    {by && (
      <div style={{ marginTop: 2 }}>
        <ScriptCredit by={by} />
      </div>
    )}
  </div>
);

// =============================================================
// TEMPLATE 1 — "Get to Know My Yumeship"
// =============================================================
function T_GetToKnow() {
  return (
    <MarkerCard width={520} height={840} tint="#fffbf6">
      {/* Heart sticker */}
      <div style={{ position: "absolute", top: 14, right: 16 }}>
        <Heart size={20} color={inkColor} outline />
      </div>

      {/* Header: portrait + title */}
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
        <PhotoBox size={140} style={{ position: "relative" }}>
          <PhotoBox size={92} round style={{
            position: "absolute", top: 24, left: 24, background: fillGrayDark,
            border: `1.5px solid ${inkColor}`,
          }} />
        </PhotoBox>
        <div style={{ flex: 1, paddingTop: 6 }}>
          <MarkerHeader size={24} style={{ lineHeight: 1 }}>GET TO KNOW</MarkerHeader>
          <MarkerHeader size={24} style={{ lineHeight: 1, marginTop: 4 }}>MY YUMESHIP</MarkerHeader>
          <div style={{ marginTop: 8 }}>
            <ScriptCredit by="@reversiblekisses" />
          </div>
        </div>
      </div>

      {/* Name fields under portrait */}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <BlankPill width="60%" />
        <Heart size={18} color={inkColor} outline />
        <BlankPill width="60%" />
      </div>

      {/* Sharing */}
      <div style={{ marginTop: 14 }}>
        <SharingRow choice="Selective" />
      </div>

      {/* MY profile block */}
      <ProfileBlock who="ME" filled={{
        age: "27", height: "5'4\"",
        occupation: "designer",
        good: "listening, baking, remembering small things",
      }} dicho={{ spoon: "left", energy: "right", pda: "right" }}
        sliders={[ ["TRUST", 0.85], ["CLINGY", 0.55], ["JEALOUSY", 0.3] ]}
        showPhoto
      />

      {/* THEM profile block */}
      <ProfileBlock who="THEM" filled={{
        age: "29", height: "6'1\"",
        occupation: "stellaron hunter",
        good: "knowing what i need before i do",
      }} dicho={{ spoon: "left", energy: "left", pda: "right" }}
        sliders={[ ["TRUST", 0.7], ["CLINGY", 0.4], ["JEALOUSY", 0.65] ]}
      />
    </MarkerCard>
  );
}

const ProfileBlock = ({ who, filled, dicho, sliders, showPhoto }) => (
  <div style={{
    border: `1.5px solid ${inkColor}`,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    display: "flex", gap: 12,
    background: "#fff",
  }}>
    {!showPhoto && (
      <PhotoBox size={92} style={{ flexShrink: 0 }} />
    )}
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
      {/* who label + age/height */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{
          fontFamily: "var(--font-marker)", fontSize: 11, fontWeight: 700,
          color: inkColor, padding: "2px 8px",
          background: fillGray, border: `1.2px solid ${inkColor}`,
          borderRadius: 4, letterSpacing: "0.08em",
        }}>{who}</span>
        <Field label="Age" value={filled.age} width={32} />
        <Field label="Height" value={filled.height} width={42} />
      </div>
      <Field label="Occupation" value={filled.occupation} width={120} />

      {/* dichotomy + sliders row */}
      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          <Dichotomy left="Big spoon" right="Little spoon" choice={dicho.spoon} />
          <Dichotomy left="Confident" right="Shy"          choice={dicho.energy} />
          <Dichotomy left="PDA"       right="Reserved"     choice={dicho.pda} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 2 }}>
        <span style={{
          fontFamily: "var(--font-marker)", fontSize: 11, fontWeight: 600,
          color: inkColor, textTransform: "uppercase", letterSpacing: "0.04em",
        }}>I'm good at</span>
        <span style={{ flex: 1, fontFamily: "var(--font-ja)", fontSize: 12, color: inkColor }}>
          {filled.good}
        </span>
      </div>

      {/* sliders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 6 }}>
        {sliders.map(([l, v]) => <AttrSlider key={l} label={l} value={v} />)}
      </div>
    </div>
  </div>
);

// =============================================================
// TEMPLATE 2 — "My Yumeship Aesthetic"
// =============================================================
function T_Aesthetic() {
  return (
    <MarkerCard width={520} height={840} tint="#fffbf6">
      {/* big window: aesthetic */}
      <WindowFrame title="My Yumeship Aesthetic">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <PhotoBox size={undefined} style={{ width: "100%", height: 100 }} />
          <PhotoBox size={undefined} style={{ width: "100%", height: 100 }} />
          <PhotoBox size={undefined} style={{ width: "100%", height: 100 }} />
        </div>
      </WindowFrame>

      <div style={{ height: 12 }} />

      {/* music window */}
      <WindowFrame title="Our song">
        <MusicPlayer track="Saturn — Sleeping at Last" />
      </WindowFrame>

      <div style={{ height: 12 }} />

      {/* polaroid stack */}
      <div style={{ position: "relative", height: 240, marginTop: 4 }}>
        <Polaroid size={140} rotate={-7} tapeColor="#fadde5"
          caption="rainy tuesday"
          style={{ position: "absolute", top: 10, left: 20 }} />
        <Polaroid size={150} rotate={6} tapeColor="#ece4f7"
          caption="green coat day"
          style={{ position: "absolute", top: 30, left: 160 }} />
        <Polaroid size={130} rotate={-3} tapeColor="#fbecc4"
          caption="first scene"
          style={{ position: "absolute", top: 60, left: 310 }} />
      </div>

      {/* color palette swatches */}
      <WindowFrame title="Palette">
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {["#8b3a4a", "#d77a8d", "#f3b6c4", "#fadde5", "#1f1219"].map((c) => (
            <div key={c} style={{
              width: 28, height: 28, background: c,
              border: `1.5px solid ${inkColor}`, borderRadius: 4,
            }} />
          ))}
          <span style={{ marginLeft: 8, fontFamily: "var(--font-script)", fontSize: 14, color: inkColor }}>
            sakura · wine
          </span>
        </div>
      </WindowFrame>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <ScriptCredit by="@cloudbloom.kr" />
        <Heart size={20} color={inkColor} outline />
      </div>
    </MarkerCard>
  );
}

// =============================================================
// TEMPLATE 3 — "This or That"
// =============================================================
function T_ThisOrThat() {
  const pairs = [
    ["coffee", "tea", "right"],
    ["morning", "night", "right"],
    ["listener", "talker", "left"],
    ["sweet", "savory", "right"],
    ["sun", "moon", "right"],
    ["forehead kiss", "hand kiss", "left"],
    ["loud laugh", "quiet smile", "right"],
    ["letters", "calls", "left"],
    ["winter", "summer", "left"],
    ["roses", "wildflowers", "right"],
  ];
  return (
    <MarkerCard width={520} height={840} tint="#fffbf6">
      <TitleHeader title="THIS or THAT" subtitle="how do they choose?" by="@softfangs" />

      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 6, marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-marker)", fontWeight: 700, fontSize: 13, color: inkColor }}>
          ♡ THEM:
        </span>
        <BlankPill width={120} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {pairs.map(([a, b, choice], i) => (
          <div key={i} style={{
            border: `1.5px solid ${inkColor}`,
            borderRadius: 6,
            padding: "8px 10px",
            background: "#fff",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            <span style={{
              fontFamily: "var(--font-marker)", fontWeight: 600, fontSize: 10,
              color: inkColor, opacity: 0.6, letterSpacing: "0.08em",
            }}>0{i + 1}</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <span style={{
                fontFamily: "var(--font-marker)", fontWeight: choice === "left" ? 700 : 500,
                fontSize: 14, color: inkColor,
                textDecoration: choice === "left" ? "underline" : "none",
                textUnderlineOffset: 2,
              }}>{a}</span>
              <Check on={choice === "left"} size={11} />
              <span style={{ fontFamily: "var(--font-marker)", fontSize: 10, color: inkColor, opacity: 0.5 }}>/</span>
              <Check on={choice === "right"} size={11} />
              <span style={{
                fontFamily: "var(--font-marker)", fontWeight: choice === "right" ? 700 : 500,
                fontSize: 14, color: inkColor,
                textDecoration: choice === "right" ? "underline" : "none",
                textUnderlineOffset: 2,
              }}>{b}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14,
        padding: "10px 12px",
        border: `1.5px dashed ${inkColor}`,
        borderRadius: 6,
        background: "#fff",
        fontFamily: "var(--font-script)", fontSize: 14, color: inkColor,
      }}>
        <span style={{ fontWeight: 700 }}>note:</span> she pretends to be the talker. she's not.
      </div>
    </MarkerCard>
  );
}

// =============================================================
// TEMPLATE 4 — "Love Letter"
// =============================================================
function T_LoveLetter() {
  return (
    <MarkerCard width={520} height={840} tint="#fff5f0">
      {/* big heart watermark */}
      <div style={{ position: "absolute", top: 30, right: 30, opacity: 0.12 }}>
        <Heart size={140} color={inkColor} />
      </div>

      <TitleHeader title="A LOVE LETTER" subtitle="for the one i never got to send" by="@inkdrop.diary" />

      <div style={{
        marginTop: 12,
        padding: "16px 18px",
        border: `1.5px solid ${inkColor}`,
        borderRadius: 8,
        background: "#fff",
        position: "relative",
        minHeight: 320,
      }}>
        <span style={{ position: "absolute", top: -12, left: 16, padding: "0 8px", background: "#fff5f0", fontFamily: "var(--font-marker)", fontWeight: 700, fontSize: 12, color: inkColor, letterSpacing: "0.06em" }}>
          DEAR <span style={{ fontFamily: "var(--font-ja)", fontWeight: 400 }}>kafka</span>,
        </span>

        <div style={{
          fontFamily: "var(--font-ja)", fontSize: 13, color: inkColor,
          lineHeight: 1.7,
        }}>
          you wouldn't have read this. you would have already known.
          <br/><br/>
          today the rain came back and i thought about your hand near mine on the umbrella.
          i was annoyed about the wet sleeve. i wasn't annoyed at all.
          <br/><br/>
          if you ever wonder what i think about when i can't sleep — it's the way you say
          "trust me" with two whole years of evidence behind it.
          <br/><br/>
          <span style={{ fontFamily: "var(--font-script)", fontSize: 18 }}>yours, always —</span>
          <br/>
          <BlankPill width={120} />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <MarkerHeader size={14} style={{ marginBottom: 8 }}>5 THINGS I LOVE</MarkerHeader>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            "her hands when she's lying",
            "the laugh she pretends she didn't",
            "the way she says \"trust me\"",
            "how she puts on her coat",
            "—",
          ].map((t, i) => (
            <div key={i} style={{
              display: "flex", gap: 6, alignItems: "center",
              padding: "6px 8px", background: "#fff",
              border: `1.2px solid ${inkColor}`, borderRadius: 4,
            }}>
              <Heart size={11} color={inkColor} outline={i === 4} />
              <span style={{ fontFamily: "var(--font-ja)", fontSize: 12, color: inkColor, flex: 1 }}>
                {t === "—" ? <BlankPill width="100%" /> : t}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MarkerCard>
  );
}

// =============================================================
// TEMPLATE 5 — "Our Storyline"
// =============================================================
function T_Storyline() {
  const events = [
    { d: "2024.04.11", t: "we met", body: "first cutscene. knew immediately." },
    { d: "2024.05.02", t: "named our song", body: "Saturn — Sleeping at Last" },
    { d: "2024.09.22", t: "first fight", body: "wrote 1,200 words of her leaving. then 2,400 of her coming back." },
    { d: "2025.02.14", t: "first anniv", body: "paired bento. took a polaroid of just the bento." },
    { d: "today", t: "still here", body: "still here." },
  ];
  return (
    <MarkerCard width={520} height={840} tint="#fffbf6">
      <TitleHeader title="OUR STORYLINE" subtitle="the year so far" by="@plumstamps" />

      <div style={{ position: "relative", paddingLeft: 24, marginTop: 16 }}>
        {/* vertical line */}
        <div style={{
          position: "absolute", left: 7, top: 6, bottom: 6,
          width: 0, borderLeft: `1.5px dashed ${inkColor}`,
        }} />

        {events.map((e, i) => (
          <div key={i} style={{
            position: "relative",
            marginBottom: 18,
          }}>
            <div style={{
              position: "absolute", left: -23, top: 4,
              width: 14, height: 14, borderRadius: 999,
              background: i === events.length - 1 ? inkColor : "#fff",
              border: `1.5px solid ${inkColor}`,
            }} />
            <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
              <span style={{
                fontFamily: "var(--font-marker)", fontWeight: 700, fontSize: 11,
                color: inkColor, letterSpacing: "0.06em",
                background: fillGray,
                padding: "2px 7px", borderRadius: 4,
                border: `1.2px solid ${inkColor}`,
              }}>{e.d}</span>
              <MarkerHeader size={18}>{e.t}</MarkerHeader>
              {i === events.length - 1 && <Heart size={14} color={inkColor} />}
            </div>
            <div style={{
              marginTop: 4,
              fontFamily: "var(--font-ja)", fontSize: 13, color: inkColor,
              lineHeight: 1.5,
            }}>{e.body}</div>
          </div>
        ))}
      </div>

      {/* milestone keepsake polaroid */}
      <div style={{
        position: "absolute", bottom: 24, right: 24,
        transform: "rotate(6deg)",
      }}>
        <Polaroid size={120} rotate={0} caption="2024.04.11" tapeColor="#fadde5" />
      </div>
    </MarkerCard>
  );
}

// =============================================================
// TEMPLATE 6 — "Headcanons Index"
// =============================================================
function T_Headcanons() {
  const cats = [
    { ja: "性", name: "PERSONALITY", count: 8,
      items: ["soft voice for animals, sharper for everything else", "counts in his head when nervous"] },
    { ja: "癖", name: "HABITS", count: 5,
      items: ["pretends not to be hungry, then finishes mine", "leaves the lights on, denies it"] },
    { ja: "好", name: "FAVORITES", count: 12,
      items: ["rainy days", "the song that opens with violin", "anything bitter"] },
  ];
  return (
    <MarkerCard width={520} height={840} tint="#fffbf6">
      <TitleHeader title="HEADCANONS" subtitle="the things only I'd notice" by="@daydreamr" />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <Field label="F/O" value="Kafka" width={90} />
        <Field label="Source" value="HSR" width={70} />
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {cats.map((c, i) => (
          <div key={i} style={{
            border: `1.5px solid ${inkColor}`,
            borderRadius: 8,
            background: "#fff",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "8px 12px",
              background: fillGray,
              borderBottom: `1.5px solid ${inkColor}`,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{
                fontFamily: "var(--font-ja)", fontSize: 18, fontWeight: 600,
                color: inkColor,
              }}>{c.ja}</span>
              <MarkerHeader size={14}>{c.name}</MarkerHeader>
              <span style={{
                marginLeft: "auto",
                fontFamily: "var(--font-marker)", fontWeight: 700, fontSize: 11,
                color: inkColor,
                background: "#fff", border: `1px solid ${inkColor}`,
                borderRadius: 999, padding: "2px 8px",
              }}>{c.count}</span>
            </div>
            <div style={{ padding: "8px 12px" }}>
              {c.items.map((it, j) => (
                <div key={j} style={{
                  display: "flex", gap: 8, alignItems: "flex-start",
                  padding: "5px 0",
                  borderBottom: j === c.items.length - 1 ? "none" : `1px dotted ${inkColor}40`,
                }}>
                  <Heart size={10} color={inkColor} outline />
                  <span style={{ fontFamily: "var(--font-ja)", fontSize: 13, color: inkColor, lineHeight: 1.4 }}>
                    {it}
                  </span>
                </div>
              ))}
              {/* blank entry slot */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 0", opacity: 0.5 }}>
                <Check on={false} size={11} />
                <BlankPill width="60%" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </MarkerCard>
  );
}

// =============================================================
// TEMPLATE 7 — "My Yumeship" (Tumblr-style kawaii UI)
//   Pink grid bg, rounded window panels, heart sticker, ribbons
// =============================================================
function T_KawaiiUI() {
  const pinkInk = "#9c2d5a";
  const pinkBg = "#fbe7ee";
  const panel = "#ffffff";
  const panelEdge = "#f3a8c4";
  return (
    <div style={{
      width: 520, height: 840,
      background: `
        repeating-linear-gradient(0deg, transparent 0 19px, rgba(243,168,196,0.18) 19px 20px),
        repeating-linear-gradient(90deg, transparent 0 19px, rgba(243,168,196,0.18) 19px 20px),
        linear-gradient(160deg, #fcd6e2, #f5b3c8)
      `,
      border: `2px solid ${pinkInk}`,
      borderRadius: 18,
      position: "relative",
      padding: 22,
      fontFamily: "var(--font-marker)",
      color: pinkInk,
      overflow: "hidden",
      boxShadow: "0 6px 0 rgba(156,45,90,0.1), 0 24px 40px rgba(156,45,90,0.08)",
    }}>
      {/* corner ribbon decor */}
      <svg style={{ position: "absolute", top: 8, left: 8, width: 60, height: 60 }} viewBox="0 0 60 60">
        <path d="M5 25 Q 15 5, 30 20 Q 45 5, 55 25 L 30 40 Z" fill={pinkInk} opacity="0.8" />
        <path d="M30 40 L 22 56 L 30 50 L 38 56 Z" fill={pinkInk} opacity="0.8" />
      </svg>
      <svg style={{ position: "absolute", top: 8, right: 8, width: 60, height: 60 }} viewBox="0 0 60 60">
        <path d="M5 25 Q 15 5, 30 20 Q 45 5, 55 25 L 30 40 Z" fill={pinkInk} opacity="0.8" />
        <path d="M30 40 L 22 56 L 30 50 L 38 56 Z" fill={pinkInk} opacity="0.8" />
      </svg>

      {/* title */}
      <div style={{
        position: "absolute", top: 14, left: "50%",
        transform: "translateX(-50%)",
        background: pinkInk, color: "#fff",
        padding: "5px 18px",
        borderRadius: 999,
        fontFamily: "var(--font-marker)", fontWeight: 700,
        fontSize: 18, letterSpacing: "0.04em",
        boxShadow: "0 2px 0 #fff, 0 2px 0 4px " + pinkInk,
      }}>
        My YumeShip
      </div>

      {/* top row: 3 small windows */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10,
        marginTop: 58,
      }}>
        {[
          { label: "name", filled: "Kafka", icon: "♡" },
          { label: "from",  filled: "HSR" },
          { label: "type",  filled: "romantic", chip: true },
        ].map((c, i) => (
          <KawaiiPanel key={i} edge={panelEdge} bg={panel}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: pinkInk, opacity: 0.7 }}>{c.label}</div>
            <div style={{
              fontFamily: "var(--font-ja)", fontSize: 16, color: pinkInk, marginTop: 4,
              fontWeight: 400,
            }}>
              {c.icon && <span style={{ marginRight: 4 }}>{c.icon}</span>}
              {c.filled}
            </div>
          </KawaiiPanel>
        ))}
      </div>

      {/* main panel: portrait + info */}
      <KawaiiPanel edge={panelEdge} bg={panel} style={{ marginTop: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{
            width: 110, height: 130,
            background: pinkBg,
            border: `1.5px solid ${panelEdge}`,
            borderRadius: 8,
            position: "relative",
            display: "grid", placeItems: "center",
          }}>
            <Heart size={28} color={pinkInk} outline />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["age", "29"],
              ["birthday", "Dec 28"],
              ["pronouns", "she/her"],
              ["love language", "acts of service"],
              ["mbti", "ENTJ"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: pinkInk, opacity: 0.7, letterSpacing: "0.06em", textTransform: "uppercase", minWidth: 84 }}>{k}</span>
                <span style={{ flex: 1, height: 18, background: pinkBg, border: `1px solid ${panelEdge}`, borderRadius: 4, padding: "0 8px", display: "flex", alignItems: "center", fontFamily: "var(--font-ja)", fontSize: 12, color: pinkInk }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </KawaiiPanel>

      {/* sharing chips with hearts */}
      <KawaiiPanel edge={panelEdge} bg={panel} style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: pinkInk, opacity: 0.7, marginBottom: 6 }}>
          sharing status
        </div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          {[
            ["No sharing", false],
            ["Selective", true],
            ["Ok with sharing", false],
          ].map(([t, on]) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-marker)", fontWeight: on ? 700 : 500, fontSize: 12, color: pinkInk }}>
              {on ? <Heart size={12} color={pinkInk} /> : <Heart size={12} color={pinkInk} outline />}
              {t}
            </span>
          ))}
        </div>
      </KawaiiPanel>

      {/* theme song window */}
      <KawaiiPanel edge={panelEdge} bg={panel} style={{ marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 999,
            background: pinkBg,
            border: `1.5px solid ${panelEdge}`,
            display: "grid", placeItems: "center",
            color: pinkInk,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill={pinkInk}>
              <path d="M6 2 L 12 4 L 12 11 A 2 2 0 1 1 10 9 L 10 5 L 8 4 L 8 12 A 2 2 0 1 1 6 10 Z" />
            </svg>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: pinkInk, opacity: 0.7 }}>theme song</div>
            <div style={{ fontFamily: "var(--font-ja)", fontSize: 14, color: pinkInk, marginTop: 2 }}>♡ Saturn — Sleeping at Last</div>
          </div>
        </div>
      </KawaiiPanel>

      {/* arguments + favorites tags */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <KawaiiPanel edge={panelEdge} bg={panel}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: pinkInk, opacity: 0.7 }}>
            tropes
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {["enemies → lovers", "touch starved", "soft for you only", "the one who knows"].map((t) => (
              <span key={t} style={{
                fontSize: 10, padding: "3px 8px",
                background: pinkBg,
                border: `1px solid ${panelEdge}`,
                color: pinkInk, fontWeight: 600,
                borderRadius: 999,
                fontFamily: "var(--font-marker)",
              }}>♡ {t}</span>
            ))}
          </div>
        </KawaiiPanel>
        <KawaiiPanel edge={panelEdge} bg={panel}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: pinkInk, opacity: 0.7 }}>
            anniversary
          </div>
          <div style={{ fontFamily: "var(--font-ja)", fontSize: 26, color: pinkInk, marginTop: 4, lineHeight: 1 }}>
            1y 47d
          </div>
          <div style={{ fontFamily: "var(--font-marker)", fontSize: 10, color: pinkInk, opacity: 0.7, marginTop: 2 }}>since 2024.04.11</div>
        </KawaiiPanel>
      </div>

      {/* author */}
      <div style={{
        position: "absolute", bottom: 14, left: 0, right: 0,
        textAlign: "center",
        fontFamily: "var(--font-script)", fontSize: 13, color: pinkInk,
        opacity: 0.75,
      }}>
        template ♡ by @cherrypopstamp
      </div>
    </div>
  );
}

const KawaiiPanel = ({ children, edge, bg, style }) => (
  <div style={{
    padding: "10px 12px",
    background: bg,
    border: `1.5px solid ${edge}`,
    borderRadius: 10,
    position: "relative",
    ...style,
  }}>
    {/* tiny corner hearts */}
    {[[6, 6], [6, "auto", "auto", 6], [6, "auto", 6, "auto", "br"]].slice(0, 2).map((p, i) => (
      <span key={i} style={{
        position: "absolute",
        top: p[0], left: p[2] === undefined ? p[1] : "auto",
        right: p[2] === undefined ? "auto" : p[1],
        pointerEvents: "none",
      }} />
    ))}
    {children}
  </div>
);

// =============================================================
// TEMPLATE 8 — Heart Frame (centerpiece heart photo)
// =============================================================
function T_HeartFrame() {
  return (
    <MarkerCard width={520} height={840} tint="#fff5f6">
      <TitleHeader title="GET TO KNOW MY YUMESHIP!!" subtitle="our love in one page" by="@bunny.thoughts" />

      {/* sharing radios */}
      <div style={{ marginTop: 6, marginBottom: 14 }}>
        <SharingRow choice="Selective" />
      </div>

      {/* Heart-shaped photo center */}
      <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 14px" }}>
        <svg width="180" height="160" viewBox="0 0 180 160">
          <defs>
            <clipPath id="heartclip">
              <path d="M90 145 C 30 110, 5 75, 5 45 C 5 22, 25 5, 50 5 C 68 5, 82 16, 90 35 C 98 16, 112 5, 130 5 C 155 5, 175 22, 175 45 C 175 75, 150 110, 90 145 Z" />
            </clipPath>
          </defs>
          <rect x="0" y="0" width="180" height="160" fill={fillGray} clipPath="url(#heartclip)" />
          <path d="M90 145 C 30 110, 5 75, 5 45 C 5 22, 25 5, 50 5 C 68 5, 82 16, 90 35 C 98 16, 112 5, 130 5 C 155 5, 175 22, 175 45 C 175 75, 150 110, 90 145 Z"
            fill="none" stroke={inkColor} strokeWidth="2.2" />
          {/* divider line down the middle */}
          <path d="M90 8 L 90 142" stroke={inkColor} strokeWidth="1.4" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* names */}
      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 12 }}>
        <Field label="me" value="Mae" width={80} />
        <Heart size={16} color={inkColor} />
        <Field label="them" value="Kafka" width={80} />
      </div>

      {/* twin profile cols */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
      }}>
        <TwinProfile who="ME" info={[
          ["age", "27"],
          ["pronouns", "she/her"],
          ["pet name", "love"],
          ["love language", "words"],
        ]} />
        <TwinProfile who="THEM" info={[
          ["age", "29"],
          ["pronouns", "she/her"],
          ["pet name", "trouble"],
          ["love language", "service"],
        ]} />
      </div>

      {/* shared note */}
      <div style={{
        marginTop: 12,
        padding: "10px 14px",
        background: "#fff",
        border: `1.5px solid ${inkColor}`,
        borderRadius: 8,
      }}>
        <div style={{ fontFamily: "var(--font-marker)", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: inkColor, opacity: 0.7, marginBottom: 4 }}>
          how we met
        </div>
        <div style={{ fontFamily: "var(--font-ja)", fontSize: 13, color: inkColor, lineHeight: 1.5 }}>
          first cutscene. she said my name like she'd been saving it.
        </div>
      </div>

      {/* anniversary footer */}
      <div style={{
        marginTop: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px",
        background: fillGray,
        border: `1.5px solid ${inkColor}`,
        borderRadius: 999,
      }}>
        <span style={{ fontFamily: "var(--font-marker)", fontWeight: 700, fontSize: 11, color: inkColor, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          ♡ anniversary
        </span>
        <span style={{ fontFamily: "var(--font-ja)", fontSize: 15, color: inkColor }}>
          2024.04.11 · 1y 47d
        </span>
      </div>
    </MarkerCard>
  );
}

const TwinProfile = ({ who, info }) => (
  <div style={{
    border: `1.5px solid ${inkColor}`,
    borderRadius: 8,
    background: "#fff",
    overflow: "hidden",
  }}>
    <div style={{
      padding: "6px 10px",
      background: fillGray,
      borderBottom: `1.5px solid ${inkColor}`,
      fontFamily: "var(--font-marker)", fontWeight: 700, fontSize: 11,
      color: inkColor, letterSpacing: "0.08em",
    }}>{who}</div>
    <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
      {info.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-marker)", fontWeight: 600, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: inkColor, opacity: 0.7, minWidth: 70 }}>
            {k}
          </span>
          <span style={{ flex: 1, fontFamily: "var(--font-ja)", fontSize: 12, color: inkColor }}>
            {v}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// =============================================================
// TEMPLATE 9 — "Sharing Boundaries" (3-state chart)
// =============================================================
function T_Boundaries() {
  const states = [
    {
      title: "NO SHARING",
      ja: "夢",
      tint: "#ffd6e2",
      stroke: "#c44e75",
      desc: "they're mine. doubles dni.",
      checks: [
        ["doubles interact", false],
        ["fan art with double f/o", false],
        ["double tags / hashtags", false],
        ["RP with double", false],
      ],
    },
    {
      title: "SELECTIVE",
      ja: "限",
      tint: "#fde9c6",
      stroke: "#b58732",
      desc: "case by case. ask me first.",
      checks: [
        ["mutuals only", true],
        ["platonic doubles ok", true],
        ["fan art if tagged", true],
        ["non-shipping discussions", true],
      ],
    },
    {
      title: "OK SHARING",
      ja: "可",
      tint: "#d6ecda",
      stroke: "#3f8157",
      desc: "the more the merrier.",
      checks: [
        ["all doubles welcome", true],
        ["co-headcanons", true],
        ["polyship intros", true],
        ["scenario swaps", true],
      ],
    },
  ];
  return (
    <MarkerCard width={520} height={840} tint="#fffaf1">
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{
          display: "inline-flex", gap: 10, alignItems: "center",
          padding: "6px 18px",
          background: inkColor, color: "#fff",
          fontFamily: "var(--font-marker)", fontWeight: 700, fontSize: 18,
          letterSpacing: "0.06em", textTransform: "uppercase",
          borderRadius: 999,
        }}>
          <span style={{ fontFamily: "var(--font-ja)", fontWeight: 600 }}>夢</span>
          BOUNDARIES
        </div>
        <div style={{ fontFamily: "var(--font-script)", fontSize: 16, color: inkColor, marginTop: 6 }}>
          sharing status &amp; what's ok
        </div>
        <div style={{ marginTop: 2 }}>
          <ScriptCredit by="@petalpressed" />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
        {states.map((s, i) => (
          <div key={i} style={{
            position: "relative",
            background: s.tint,
            border: `2px solid ${s.stroke}`,
            borderRadius: 16,
            padding: "12px 16px",
            display: "flex", gap: 12,
            boxShadow: `0 3px 0 ${s.stroke}40`,
          }}>
            {/* ja seal */}
            <div style={{
              flexShrink: 0,
              width: 48, height: 48, borderRadius: 999,
              background: "#fff",
              border: `2px solid ${s.stroke}`,
              display: "grid", placeItems: "center",
              fontFamily: "var(--font-ja)", fontSize: 24, fontWeight: 600,
              color: s.stroke,
            }}>{s.ja}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--font-marker)", fontWeight: 700, fontSize: 16,
                color: s.stroke, letterSpacing: "0.06em",
              }}>{s.title}</div>
              <div style={{
                fontFamily: "var(--font-script)", fontSize: 14,
                color: inkColor, marginTop: 1,
              }}>{s.desc}</div>

              <div style={{
                marginTop: 6,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 3,
              }}>
                {s.checks.map(([t, on], j) => (
                  <div key={j} style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <svg width="11" height="11" viewBox="0 0 12 12">
                      <rect x="1" y="1" width="10" height="10" rx="2" fill="#fff" stroke={s.stroke} strokeWidth="1.4" />
                      {on && <path d="M3 6 L 5 8.5 L 9 4" stroke={s.stroke} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
                    </svg>
                    <span style={{
                      fontFamily: "var(--font-marker)", fontWeight: 500, fontSize: 10,
                      color: inkColor, opacity: on ? 1 : 0.55,
                    }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* chibi */}
            <div style={{
              flexShrink: 0,
              width: 50, alignSelf: "center",
              textAlign: "center",
            }}>
              <svg width="50" height="60" viewBox="0 0 50 60">
                {/* head */}
                <circle cx="25" cy="18" r="13" fill="#fff" stroke={s.stroke} strokeWidth="1.5" />
                {/* body */}
                <path d="M14 35 L 16 56 L 34 56 L 36 35 Z" fill="#fff" stroke={s.stroke} strokeWidth="1.5" strokeLinejoin="round" />
                {/* face dots */}
                <circle cx="20" cy="18" r="1.2" fill={inkColor} />
                <circle cx="30" cy="18" r="1.2" fill={inkColor} />
                <path d="M22 23 Q 25 25, 28 23" stroke={inkColor} strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14,
        textAlign: "center",
        fontFamily: "var(--font-script)", fontSize: 13, color: inkColor, opacity: 0.7,
      }}>
        let's keep the yumeship community happy ♡
      </div>
    </MarkerCard>
  );
}

// =============================================================
// Gallery wrapper — show all together
// =============================================================
function TemplatePagesGallery() {
  const tileStyle = window.YS_tileStyle;
  const SectionLabel = window.YS_SectionLabel;
  return (
    <div style={tileStyle}>
      <SectionLabel pre="25" name="Template pages" sub="nine creators, nine aesthetics — the community visual language" />
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 24,
        justifyItems: "center",
      }}>
        <T_GetToKnow />
        <T_KawaiiUI />
        <T_HeartFrame />
        <T_Aesthetic />
        <T_ThisOrThat />
        <T_Boundaries />
        <T_LoveLetter />
        <T_Storyline />
        <T_Headcanons />
      </div>
    </div>
  );
}

Object.assign(window, {
  YS_T_GetToKnow: T_GetToKnow,
  YS_T_KawaiiUI: T_KawaiiUI,
  YS_T_HeartFrame: T_HeartFrame,
  YS_T_Aesthetic: T_Aesthetic,
  YS_T_ThisOrThat: T_ThisOrThat,
  YS_T_Boundaries: T_Boundaries,
  YS_T_LoveLetter: T_LoveLetter,
  YS_T_Storyline: T_Storyline,
  YS_T_Headcanons: T_Headcanons,
  YS_TemplatePagesGallery: TemplatePagesGallery,
});
