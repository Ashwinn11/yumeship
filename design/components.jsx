/* ============================================================
   yumeship — components.jsx
   Design-system tiles. Each component is self-contained and
   demonstrates a slice of the system on its own DCArtboard.
   ============================================================ */

// ---------- shared helpers ----------
const ph = (label, w, h, ratio = "1/1") => (
  <div
    className="placeholder-stripe ys-mono"
    style={{
      width: w || "100%",
      height: h || "100%",
      aspectRatio: !h ? ratio : undefined,
      borderRadius: "var(--r-3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--ink-3)",
      fontSize: 10,
      letterSpacing: "0.04em",
      textTransform: "lowercase",
      border: "1px solid var(--line)",
    }}
  >
    {label}
  </div>
);

const Field = ({ label, children, hint }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div
      className="ys-mono"
      style={{
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: "var(--ink-3)",
      }}
    >
      {label}
    </div>
    {children}
    {hint && (
      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{hint}</div>
    )}
  </div>
);

const Row = ({ children, gap = 16, align = "center", wrap = false, style }) => (
  <div
    style={{
      display: "flex",
      gap,
      alignItems: align,
      flexWrap: wrap ? "wrap" : "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

const Stack = ({ children, gap = 16, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>{children}</div>
);

const tileStyle = {
  background: "var(--paper-soft)",
  border: "1px solid var(--line)",
  borderRadius: "var(--r-4)",
  padding: 28,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 20,
  fontFamily: "var(--font-ui)",
  color: "var(--ink)",
};

// ---------- BRAND ----------
const Mark = ({ size = 48, color = "var(--ink)" }) => (
  // Two intersecting circles — the s/i + the F/O
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="18" cy="24" r="13" fill={color === "var(--ink)" ? "var(--sakura)" : color} opacity="0.85" />
    <circle cx="30" cy="24" r="13" fill="none" stroke={color} strokeWidth="1.5" />
    <circle cx="24" cy="24" r="1.2" fill={color === "var(--ink)" ? "var(--vellum)" : "var(--paper)"} />
  </svg>
);

function Brand() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="01" name="Brand" />

      <Row gap={32} align="flex-start" style={{ flex: 1 }}>
        {/* Main lockup */}
        <Stack gap={20} style={{ flex: 1 }}>
          <Row gap={14}>
            <Mark size={56} />
            <div
              className="ys-serif"
              style={{
                fontSize: 56,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                fontStyle: "italic",
              }}
            >
              yumeship
            </div>
          </Row>
          <div
            className="ys-ja"
            style={{ fontSize: 18, color: "var(--ink-2)", letterSpacing: "0.1em" }}
          >
            夢 ・ ゆめしっぷ
          </div>
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.55,
              color: "var(--ink-2)",
              maxWidth: 360,
              fontStyle: "italic",
              fontFamily: "var(--font-display)",
            }}
          >
            “A quiet place to keep them. Notes, outfits, the things
            you imagined this morning — held close, like a letter
            you never sent.”
          </div>
        </Stack>

        {/* Mark variations */}
        <Stack gap={14} style={{ width: 220 }}>
          <div
            className="ys-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--ink-3)",
            }}
          >
            Mark — two souls
          </div>
          <Row gap={12} wrap>
            <MarkTile bg="var(--vellum)"><Mark size={40} /></MarkTile>
            <MarkTile bg="var(--ink)"><Mark size={40} color="var(--paper)" /></MarkTile>
            <MarkTile bg="var(--sakura)"><Mark size={40} color="var(--ink)" /></MarkTile>
            <MarkTile bg="var(--plum)"><Mark size={40} color="var(--paper)" /></MarkTile>
          </Row>
          <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
            Filled circle is you. Open circle is them.
            The intersection is the world you keep.
          </div>
        </Stack>
      </Row>
    </div>
  );
}

const MarkTile = ({ children, bg }) => (
  <div
    style={{
      width: 64,
      height: 64,
      background: bg,
      borderRadius: "var(--r-3)",
      display: "grid",
      placeItems: "center",
      border: "1px solid var(--line)",
    }}
  >
    {children}
  </div>
);

const SectionLabel = ({ pre, name, sub }) => (
  <Row gap={12} align="baseline">
    <div
      className="ys-mono"
      style={{
        fontSize: 11,
        color: "var(--ink-3)",
        letterSpacing: "0.15em",
      }}
    >
      {pre}
    </div>
    <div
      className="ys-serif"
      style={{ fontSize: 32, letterSpacing: "-0.01em", lineHeight: 1 }}
    >
      {name}
    </div>
    {sub && (
      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{sub}</div>
    )}
    <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
  </Row>
);

// ---------- COLOR ----------
function ColorPalette() {
  const swatches = [
    ["Paper",        "var(--paper)",        "#f8f1ea", "primary bg"],
    ["Paper deep",   "var(--paper-deep)",   "#f1e7dc", "secondary bg"],
    ["Vellum",       "var(--vellum)",       "#fffaf3", "popover"],
    ["Ink",          "var(--ink)",          "#2b1a26", "text · 100"],
    ["Ink 2",        "var(--ink-2)",        "#5a3f53", "text · 70"],
    ["Ink 3",        "var(--ink-3)",        "#8a7383", "meta · 50"],
  ];
  const sentiment = [
    ["Sakura",       "var(--sakura)",       "#f3b6c4", "romantic"],
    ["Sakura deep",  "var(--sakura-deep)",  "#d77a8d", "primary action"],
    ["Peach",        "var(--peach)",        "#f4b89a", "familial"],
    ["Lavender",     "var(--lavender)",     "#c7b5e3", "mirror · share"],
    ["Sage",         "var(--sage)",         "#b4c8a5", "platonic"],
    ["Butter",       "var(--butter)",       "#f0d189", "anniversary"],
    ["Plum",         "var(--plum)",         "#6e3a5a", "polycule"],
    ["Ember",        "var(--ember)",        "#d4694a", "sharing NG"],
  ];
  const softs = [
    ["Sakura soft",   "var(--sakura-soft)",   "#fadde5", "romantic fill"],
    ["Peach soft",    "var(--peach-soft)",    "#fde0ce", "familial fill"],
    ["Lavender soft", "var(--lavender-soft)", "#ece4f7", "mirror fill"],
    ["Sage soft",     "var(--sage-soft)",     "#e0ebd4", "platonic fill"],
    ["Butter soft",   "var(--butter-soft)",   "#fbecc4", "anniversary fill"],
  ];

  const Swatch = ({ name, color, hex, role, dark }) => (
    <Stack gap={6} style={{ width: 132 }}>
      <div
        style={{
          height: 96,
          background: color,
          borderRadius: "var(--r-3)",
          border: "1px solid var(--line)",
        }}
      />
      <Row gap={6} align="baseline" style={{ justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
        <div className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
          {hex}
        </div>
      </Row>
      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{role}</div>
    </Stack>
  );

  return (
    <div style={tileStyle}>
      <SectionLabel pre="02" name="Palette" sub="warm cream foundation; sentiment as accent" />

      <Stack gap={8}>
        <div
          className="ys-mono"
          style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}
        >
          Foundation
        </div>
        <Row gap={16} wrap>
          {swatches.map((s) => <Swatch key={s[0]} name={s[0]} color={s[1]} hex={s[2]} role={s[3]} />)}
        </Row>
      </Stack>

      <Stack gap={8}>
        <div
          className="ys-mono"
          style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}
        >
          Sentiment · relationship type · sharing
        </div>
        <Row gap={16} wrap>
          {sentiment.map((s) => <Swatch key={s[0]} name={s[0]} color={s[1]} hex={s[2]} role={s[3]} />)}
        </Row>
      </Stack>

      <Stack gap={8}>
        <div
          className="ys-mono"
          style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}
        >
          Soft fills — chip backgrounds
        </div>
        <Row gap={16} wrap>
          {softs.map((s) => <Swatch key={s[0]} name={s[0]} color={s[1]} hex={s[2]} role={s[3]} />)}
        </Row>
      </Stack>
    </div>
  );
}

// ---------- TYPOGRAPHY ----------
function Typography() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="03" name="Type" sub="Instrument Serif · DM Sans · Klee One · JetBrains Mono" />

      <Row gap={40} align="flex-start" style={{ flex: 1 }}>
        <Stack gap={20} style={{ flex: 1.4 }}>
          <Row gap={12} align="baseline">
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em" }}>DISPLAY · 96</span>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>Instrument Serif Italic</span>
          </Row>
          <div className="ys-serif" style={{ fontSize: 96, lineHeight: 0.95, letterSpacing: "-0.025em", fontStyle: "italic" }}>
            you, & them
          </div>

          <Row gap={12} align="baseline" style={{ marginTop: 12 }}>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em" }}>H2 · 48</span>
          </Row>
          <div className="ys-serif" style={{ fontSize: 48, lineHeight: 1, letterSpacing: "-0.015em" }}>
            A scene from Tuesday evening.
          </div>

          <Row gap={12} align="baseline" style={{ marginTop: 12 }}>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em" }}>BODY · 15 / 1.55</span>
          </Row>
          <div style={{ fontSize: 15, lineHeight: 1.55, maxWidth: 520, color: "var(--ink-2)" }}>
            Body copy is DM Sans — kept light and quiet so the serifs can carry the warmth.
            We use it for everything except headlines, marks, and quotes from your storyline,
            where the italic display face takes over.
          </div>
        </Stack>

        <Stack gap={20} style={{ flex: 1, borderLeft: "1px solid var(--line)", paddingLeft: 32 }}>
          <Stack gap={6}>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em" }}>JAPANESE ACCENT · Klee One</span>
            <div className="ys-ja" style={{ fontSize: 30, lineHeight: 1.4 }}>夢の人</div>
            <div className="ys-ja" style={{ fontSize: 18, color: "var(--ink-2)" }}>ゆめのひと · the one you dream of</div>
          </Stack>

          <Stack gap={6}>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em" }}>UI LABEL · 13 / 0.04em</span>
            <Row gap={20} wrap>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Add scenario</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--sakura-deep)" }}>Devoted</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Storyline</span>
            </Row>
          </Stack>

          <Stack gap={6}>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em" }}>MONO · tokens · meta · counts</span>
            <div className="ys-mono" style={{ fontSize: 13, color: "var(--ink-2)" }}>
              042 entries · since 2024.04.11
            </div>
          </Stack>

          <Stack gap={6}>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em" }}>SCALE</span>
            <Row gap={6} align="baseline" wrap>
              {[
                ["96", "display"],
                ["64", "h1"],
                ["48", "h2"],
                ["36", "h3"],
                ["28", "h4"],
                ["22", "h5"],
                ["18", "h6"],
                ["17", "lg"],
                ["15", "body"],
                ["13", "meta"],
                ["12", "cap"],
                ["11", "hair"],
              ].map(([n, l]) => (
                <span key={n} className="ys-mono" style={{
                  fontSize: 11, color: "var(--ink-3)",
                  padding: "3px 6px",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                }}>{n} · {l}</span>
              ))}
            </Row>
          </Stack>
        </Stack>
      </Row>
    </div>
  );
}

// ---------- SPACING & RADII & SHADOW ----------
function Spacing() {
  const steps = [
    ["0", 2], ["1", 4], ["2", 8], ["3", 12], ["4", 16],
    ["5", 20], ["6", 24], ["7", 32], ["8", 40], ["9", 56], ["10", 72], ["11", 96],
  ];
  const radii = [["1", 4], ["2", 8], ["3", 12], ["4", 18], ["5", 24], ["6", 32], ["pill", 999]];
  return (
    <div style={tileStyle}>
      <SectionLabel pre="04" name="Spacing · Radii · Shadow" />

      <Stack gap={10}>
        <div className="ys-mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>
          Spacing scale · 4-base
        </div>
        <Row gap={10} align="flex-end" wrap>
          {steps.map(([n, v]) => (
            <Stack key={n} gap={6} style={{ alignItems: "center" }}>
              <div style={{ width: v, height: v, background: "var(--sakura)", borderRadius: 2 }} />
              <div className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                {n}<span style={{ opacity: 0.5 }}> · {v}</span>
              </div>
            </Stack>
          ))}
        </Row>
      </Stack>

      <Stack gap={10}>
        <div className="ys-mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>
          Radii — never sharp
        </div>
        <Row gap={14} wrap>
          {radii.map(([n, v]) => (
            <Stack key={n} gap={6} style={{ alignItems: "center" }}>
              <div style={{
                width: 60, height: 60,
                background: "var(--paper-deep)",
                border: "1px solid var(--line)",
                borderRadius: v,
              }} />
              <div className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>r-{n}</div>
            </Stack>
          ))}
        </Row>
      </Stack>

      <Stack gap={10}>
        <div className="ys-mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>
          Shadows — warm wine, not gray
        </div>
        <Row gap={22} wrap>
          {[1, 2, 3].map((n) => (
            <Stack key={n} gap={8} style={{ alignItems: "center" }}>
              <div style={{
                width: 110, height: 70,
                background: "var(--vellum)",
                borderRadius: "var(--r-3)",
                boxShadow: `var(--shadow-${n})`,
              }} />
              <div className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>shadow-{n}</div>
            </Stack>
          ))}
        </Row>
      </Stack>
    </div>
  );
}

// ---------- BUTTONS ----------
const Btn = ({ variant = "primary", size = "md", children, icon, disabled, full }) => {
  const sizes = {
    sm: { h: 32, px: 14, fs: 13, gap: 6 },
    md: { h: 40, px: 18, fs: 14, gap: 8 },
    lg: { h: 50, px: 24, fs: 16, gap: 10 },
  }[size];
  const variants = {
    primary: {
      background: "var(--sakura-deep)",
      color: "var(--vellum)",
      border: "1px solid var(--sakura-deep)",
      boxShadow: "var(--shadow-1)",
    },
    devoted: {
      background: "var(--plum)",
      color: "var(--vellum)",
      border: "1px solid var(--plum)",
      boxShadow: "var(--shadow-1)",
    },
    soft: {
      background: "var(--paper-deep)",
      color: "var(--ink)",
      border: "1px solid var(--line)",
    },
    ghost: {
      background: "transparent",
      color: "var(--ink)",
      border: "1px solid transparent",
    },
    outline: {
      background: "transparent",
      color: "var(--ink)",
      border: "1px solid var(--line-strong)",
    },
  }[variant];
  return (
    <button
      disabled={disabled}
      style={{
        height: sizes.h,
        padding: `0 ${sizes.px}px`,
        fontSize: sizes.fs,
        fontWeight: 500,
        fontFamily: "var(--font-ui)",
        borderRadius: "var(--r-pill)",
        display: "inline-flex",
        alignItems: "center",
        gap: sizes.gap,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        width: full ? "100%" : undefined,
        justifyContent: full ? "center" : undefined,
        letterSpacing: "0.005em",
        transition: "transform var(--dur-1) var(--ease-soft)",
        ...variants,
      }}
    >
      {icon && <span style={{ display: "inline-flex" }}>{icon}</span>}
      {children}
    </button>
  );
};

// Tiny inline icons (lines, never illustrative)
const I = {
  plus: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  heart: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12C3 9 1.5 7.2 1.5 4.8c0-1.5 1.2-2.8 2.8-2.8 1 0 1.9.5 2.7 1.5C7.8 2.5 8.7 2 9.7 2c1.6 0 2.8 1.3 2.8 2.8C12.5 7.2 11 9 7 12z" stroke="currentColor" strokeWidth="1.3" fill="none" /></svg>,
  bookmark: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 1.5h8v11l-4-2.5-4 2.5v-11z" stroke="currentColor" strokeWidth="1.3" fill="none" /></svg>,
  send: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 7 12.5 1.5 9.5 12.5 7 8 1.5 7z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" /></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11l1-3 7-7 2 2-7 7-3 1zM8.5 2.5l2 2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" /></svg>,
  moon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 8.5A4.5 4.5 0 0 1 5.5 2.5 5 5 0 1 0 11.5 8.5z" stroke="currentColor" strokeWidth="1.3" fill="none" /></svg>,
  bell: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 10V6.5a4 4 0 1 1 8 0V10l1 1.5H2L3 10zM5.5 12.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" /></svg>,
  search: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.2" stroke="currentColor" strokeWidth="1.3" fill="none" /><path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>,
  lock: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2.5" y="6.5" width="9" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" fill="none" /><path d="M4.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" fill="none" /></svg>,
};

function Buttons() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="05" name="Buttons" sub="pill-shaped · five intents · three sizes" />

      <Stack gap={18}>
        <Field label="Intents — md">
          <Row gap={10} wrap>
            <Btn variant="primary" icon={I.plus}>New scenario</Btn>
            <Btn variant="devoted" icon={I.heart}>Add to devotion</Btn>
            <Btn variant="soft" icon={I.bookmark}>Save</Btn>
            <Btn variant="outline">Cancel</Btn>
            <Btn variant="ghost" icon={I.edit}>Edit</Btn>
          </Row>
        </Field>

        <Field label="Sizes — sm · md · lg">
          <Row gap={10} align="center" wrap>
            <Btn variant="primary" size="sm" icon={I.plus}>Add</Btn>
            <Btn variant="primary" size="md" icon={I.plus}>New scenario</Btn>
            <Btn variant="primary" size="lg" icon={I.plus}>Start a new ship</Btn>
          </Row>
        </Field>

        <Field label="States">
          <Row gap={10} wrap>
            <Btn variant="primary">Default</Btn>
            <Btn variant="primary" disabled>Disabled</Btn>
            <Btn variant="soft" icon={I.lock}>Private</Btn>
            <Btn variant="ghost">tap to reveal</Btn>
          </Row>
        </Field>

        <Field label="Icon-only — circular">
          <Row gap={10}>
            {[I.heart, I.bookmark, I.bell, I.search, I.edit].map((ic, i) => (
              <button key={i} style={{
                width: 40, height: 40, borderRadius: 999,
                border: "1px solid var(--line)",
                background: "var(--vellum)",
                color: "var(--ink)",
                display: "grid", placeItems: "center",
                cursor: "pointer",
              }}>{ic}</button>
            ))}
          </Row>
        </Field>
      </Stack>
    </div>
  );
}

// ---------- INPUTS ----------
function Inputs() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="06" name="Forms" />

      <Stack gap={20}>
        <Field label="Text — pen-on-paper feel" hint="Underline only. The page doesn't shout.">
          <input
            defaultValue="Kafka, Honkai Star Rail"
            style={{
              border: "none",
              borderBottom: "1px solid var(--line-strong)",
              background: "transparent",
              padding: "10px 0",
              fontSize: 17,
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              color: "var(--ink)",
              outline: "none",
            }}
          />
        </Field>

        <Field label="Textarea — for headcanons">
          <textarea
            rows={3}
            defaultValue="She makes tea the way her mother did — three measures, never stirred."
            style={{
              border: "1px solid var(--line)",
              borderRadius: "var(--r-3)",
              background: "var(--vellum)",
              padding: 12,
              fontSize: 14,
              fontFamily: "var(--font-ui)",
              color: "var(--ink-2)",
              outline: "none",
              resize: "none",
              lineHeight: 1.55,
            }}
          />
        </Field>

        <Row gap={20}>
          <Field label="Select" hint="">
            <div style={{
              border: "1px solid var(--line)",
              borderRadius: "var(--r-pill)",
              padding: "8px 14px",
              background: "var(--vellum)",
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              width: "fit-content",
            }}>
              From: Honkai Star Rail
              <span style={{ color: "var(--ink-3)" }}>▾</span>
            </div>
          </Field>
          <Field label="Toggle">
            <Toggle on />
          </Field>
          <Field label="Stepper">
            <Row gap={6}>
              <Stepper />
            </Row>
          </Field>
        </Row>

        <Field label="Chips — relationship type">
          <Row gap={8} wrap>
            <Chip color="var(--sakura-deep)" bg="var(--sakura-soft)" active>♡ romantic</Chip>
            <Chip color="var(--sage-deep)" bg="var(--sage-soft)">✸ platonic</Chip>
            <Chip color="var(--peach-deep)" bg="var(--peach-soft)">✪ familial</Chip>
          </Row>
        </Field>

        <Field label="Sharing preference" hint="How open you are to doubles — others who ship the same F/O.">
          <Row gap={8} wrap>
            <Chip color="var(--ember)" bg="#fde0d4">sharing NG</Chip>
            <Chip color="var(--sage-deep)" bg="var(--sage-soft)" active>welcome</Chip>
            <Chip color="var(--lavender-deep)" bg="var(--lavender-soft)">mirror</Chip>
          </Row>
        </Field>

        <Field label="Polycule toggle" hint="Group this F/O with others into a polycule.">
          <Row gap={10} align="center">
            <Toggle on />
            <Chip color="var(--plum)" bg="rgba(110,58,90,0.12)">❖ polycule</Chip>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>3 members</span>
          </Row>
        </Field>
      </Stack>
    </div>
  );
}

const Toggle = ({ on }) => (
  <div style={{
    width: 40, height: 22, borderRadius: 999,
    background: on ? "var(--sakura-deep)" : "var(--line-strong)",
    padding: 2, transition: "background var(--dur-2)",
    display: "flex", alignItems: "center",
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: 999,
      background: "var(--vellum)",
      transform: on ? "translateX(18px)" : "translateX(0)",
      transition: "transform var(--dur-2)",
      boxShadow: "var(--shadow-1)",
    }} />
  </div>
);

const Stepper = () => (
  <div style={{
    display: "inline-flex", alignItems: "center",
    border: "1px solid var(--line)",
    borderRadius: "var(--r-pill)",
    background: "var(--vellum)",
    fontSize: 13,
  }}>
    <button style={btnNak()}>−</button>
    <span style={{ padding: "0 12px", fontFamily: "var(--font-mono)" }}>3</span>
    <button style={btnNak()}>+</button>
  </div>
);
function btnNak() {
  return {
    width: 32, height: 32, border: "none", background: "transparent",
    cursor: "pointer", color: "var(--ink-2)", fontSize: 15,
  };
}

const Chip = ({ children, color, bg, active }) => (
  <span style={{
    fontSize: 12,
    padding: "5px 12px",
    background: bg,
    color,
    borderRadius: "var(--r-pill)",
    border: active ? `1px solid ${color}` : "1px solid transparent",
    fontWeight: active ? 600 : 500,
    letterSpacing: "0.01em",
  }}>{children}</span>
);

const Devotion = ({ value }) => (
  <div style={{ width: "100%" }}>
    <div style={{
      position: "relative", height: 4,
      background: "var(--paper-deep)",
      borderRadius: 999, overflow: "visible",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        width: `${value * 100}%`,
        background: "linear-gradient(90deg, var(--sakura), var(--plum))",
        borderRadius: 999,
      }} />
      <div style={{
        position: "absolute",
        left: `${value * 100}%`,
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 18, height: 18, borderRadius: 999,
        background: "var(--vellum)",
        border: "1.5px solid var(--plum)",
        boxShadow: "var(--shadow-1)",
      }} />
    </div>
    <Row gap={4} align="center" style={{ justifyContent: "space-between", marginTop: 10 }}>
      <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em" }}>casual</span>
      <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em" }}>devoted</span>
      <span className="ys-mono" style={{ fontSize: 10, color: "var(--plum)", letterSpacing: "0.1em", fontWeight: 600 }}>riako</span>
    </Row>
  </div>
);

// Expose to other scripts
Object.assign(window, {
  YS_Brand: Brand,
  YS_Color: ColorPalette,
  YS_Type: Typography,
  YS_Spacing: Spacing,
  YS_Buttons: Buttons,
  YS_Inputs: Inputs,
  // helpers reused by other component files
  YS_tileStyle: tileStyle,
  YS_SectionLabel: SectionLabel,
  YS_Row: Row,
  YS_Stack: Stack,
  YS_Field: Field,
  YS_Btn: Btn,
  YS_Chip: Chip,
  YS_ph: ph,
  YS_I: I,
  YS_Mark: Mark,
});
