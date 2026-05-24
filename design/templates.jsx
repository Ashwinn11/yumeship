/* ============================================================
   yumeship — templates.jsx (spec-aligned)
   The 9 template types from SPEC.md:
     1 · Meet My F/O         2 · F/O Infodump       3 · This or That
     4 · Headcanons List     5 · Selfship Q&A       6 · Valentine's
     7 · F/Ovember           8 · Milestone          9 · Polycule Intro

   Plus: filler form (fill-in screen) and result card (the rendered
   scrapbook page the user can save to Photos).
   ============================================================ */

const { YS_tileStyle: tileStyle, YS_SectionLabel: SectionLabel,
        YS_Row: Row, YS_Stack: Stack, YS_Chip: Chip, YS_I: I,
        YS_Btn: Btn, YS_Field: Field, YS_ph: ph,
        YS_Heart: Heart, YS_Sparkle: Sparkle, YS_SparkleCluster: SparkleCluster,
        YS_Sakura: Sakura, YS_Star: Star, YS_Ribbon: Ribbon,
        YS_WashiTape: WashiTape, YS_Seal: Seal, YS_QuoteMark: QuoteMark,
        YS_Cloud: Cloud } = window;

// ============================================================
// 9 template gallery — the chooser
// ============================================================
const TEMPLATES = [
  { kind: "intro",      ja: "紹介", title: "Meet My F/O",      body: "Introduction profile — name, fandom, first impression, why I love them.",  tint: "var(--sakura-deep)", fields: 5,  icon: "heart" },
  { kind: "infodump",   ja: "詳細", title: "F/O Infodump",     body: "Deep dive: personality, appearance, quirks, favorites, 5 headcanons.",     tint: "var(--lavender-deep)", fields: 9, icon: "spark" },
  { kind: "preference", ja: "選択", title: "This or That",     body: "10 preference pairs — coffee/tea, morning/night, listener/talker.",         tint: "var(--butter-deep)", fields: 10, icon: "star" },
  { kind: "headcanons", ja: "妄想", title: "Headcanons List",  body: "Category-grouped — Personality, Habits, Favorites, How We Met, Random.",   tint: "var(--peach-deep)", fields: "open", icon: "sakura" },
  { kind: "q&a",        ja: "問答", title: "Selfship Q&A",     body: "10 classic community questions — answer them all or just the ones that matter.", tint: "var(--sage-deep)", fields: 10, icon: "quote" },
  { kind: "letter",     ja: "愛",   title: "Valentine's",      body: "A love letter + favorite memory + 5 things I love about them.",            tint: "var(--sakura-deep)", fields: 7, icon: "heart", featured: true },
  { kind: "gratitude",  ja: "感謝", title: "F/Ovember",        body: "30 days of small gratitudes. A community tradition.",                       tint: "var(--butter-deep)", fields: 30, icon: "star" },
  { kind: "milestone",  ja: "節目", title: "Milestone",        body: "Celebrate an anniversary — message, best memories, next chapter.",         tint: "var(--peach-deep)", fields: 6, icon: "spark" },
  { kind: "polycule",   ja: "群",   title: "Polycule Intro",   body: "Introduce a polycule — group name, members, dynamics, notes.",             tint: "var(--plum)", fields: "varies", icon: "sakura" },
];

function TemplatesGallery() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="22" name="Templates" sub="9 fill-in cards — produce a scrapbook page you can save to Photos" />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 14,
      }}>
        {TEMPLATES.map((t, i) => <TemplateTile key={i} {...t} />)}
      </div>
    </div>
  );
}

function TemplateTile({ kind, ja, title, body, tint, fields, icon, featured }) {
  const Icon = ({ kind }) => {
    switch (kind) {
      case "heart":  return <Heart size={16} color={tint} />;
      case "spark":  return <Sparkle size={16} color={tint} />;
      case "star":   return <Star size={14} color={tint} />;
      case "sakura": return <Sakura size={18} color={tint} core={tint} />;
      case "quote":  return <QuoteMark size={20} color={tint} />;
      default:       return null;
    }
  };

  return (
    <div style={{
      padding: 18,
      background: featured
        ? `linear-gradient(160deg, ${"var(--sakura-soft)"}, var(--vellum))`
        : "var(--vellum)",
      border: `1px solid ${featured ? tint : "var(--line)"}`,
      borderRadius: "var(--r-4)",
      display: "flex", flexDirection: "column", gap: 10,
      position: "relative",
      boxShadow: featured ? "var(--shadow-2)" : "var(--shadow-1)",
      overflow: "hidden",
    }}>
      {/* watermark ja kanji */}
      <span className="ys-ja" style={{
        position: "absolute",
        right: -10, top: -16,
        fontSize: 84, lineHeight: 1,
        color: tint, opacity: 0.08,
        fontWeight: 600,
      }}>{ja}</span>

      <Row gap={8} align="center" style={{ justifyContent: "space-between", position: "relative" }}>
        <Row gap={8} align="center">
          <Icon kind={icon} />
          <span className="ys-mono" style={{
            fontSize: 10, color: tint, letterSpacing: "0.14em",
            textTransform: "uppercase", fontWeight: 600,
          }}>{kind}</span>
        </Row>
        {featured && <Sparkle size={11} color={tint} />}
      </Row>

      <div className="ys-serif" style={{
        fontSize: 22, lineHeight: 1.1, fontStyle: "italic",
        letterSpacing: "-0.01em", position: "relative",
      }}>{title}</div>

      <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5, minHeight: 48, position: "relative" }}>
        {body}
      </div>

      <Row gap={8} align="center" style={{ justifyContent: "space-between", marginTop: 4, position: "relative" }}>
        <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
          {fields} {typeof fields === "number" ? "fields" : ""}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: tint }}>
          fill in ›
        </span>
      </Row>
    </div>
  );
}

// ============================================================
// Template filler — the form
// ============================================================
function TemplateFiller() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="23" name="Filler" sub="fill the prompts → preview → save to Photos" />

      <Row gap={20} align="flex-start" style={{ flex: 1 }}>
        <div style={{
          flex: 1,
          background: "var(--vellum)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-4)",
          padding: "24px 28px",
          position: "relative",
        }}>
          <Row gap={10} align="center" style={{ marginBottom: 16 }}>
            <Heart size={16} color="var(--sakura-deep)" />
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--sakura-deep)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
              meet my F/O
            </span>
          </Row>

          <div className="ys-serif" style={{ fontSize: 28, fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.01em", marginBottom: 18 }}>
            Introduce them.
          </div>

          <Stack gap={14}>
            <FillRow label="Their name"      value="Kafka" filled />
            <FillRow label="Fandom"          value="Honkai Star Rail" filled />
            <FillRow label="Type"            value="Romantic" filled chip tint="var(--sakura-deep)" />
            <FillRow label="First impression" placeholder="how did you feel when you saw them?" />
            <FillRow label="Why I love them" placeholder="three things, at minimum" multi />
          </Stack>

          <Row gap={10} style={{ marginTop: 22 }}>
            <Btn variant="primary" icon={I.bookmark}>preview</Btn>
            <Btn variant="ghost">save draft</Btn>
          </Row>
        </div>

        <Stack gap={14} style={{ width: 220, flexShrink: 0 }}>
          <Stack gap={6}>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              progress
            </span>
            <Row gap={3}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 999,
                  background: i < 3 ? "var(--sakura-deep)" : "var(--paper-deep)",
                }} />
              ))}
            </Row>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>3 of 5 — almost there</span>
          </Stack>

          <div style={{
            padding: "14px 16px",
            background: "var(--sakura-soft)",
            border: "1px solid var(--sakura)",
            borderRadius: "var(--r-3)",
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 13,
            color: "var(--sakura-ink)",
            lineHeight: 1.5,
            position: "relative",
          }}>
            <span style={{ position: "absolute", top: -8, right: 10 }}>
              <Heart size={14} color="var(--sakura-deep)" />
            </span>
            "Take your time. The blank ones leave room for them to surprise you."
          </div>

          <Stack gap={6}>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              card output
            </span>
            <span style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.5 }}>
              Saves as a 1080×1350 PNG to your Camera Roll. Nothing leaves the device.
            </span>
          </Stack>
        </Stack>
      </Row>
    </div>
  );
}

const FillRow = ({ label, value, placeholder, filled, multi, chip, tint }) => (
  <Stack gap={4}>
    <span className="ys-mono" style={{
      fontSize: 10, color: "var(--ink-3)",
      letterSpacing: "0.1em", textTransform: "uppercase",
    }}>{label}</span>
    {chip ? (
      <Chip color={tint} bg={`${tint}1f`} active>♡ {value}</Chip>
    ) : (
      <div style={{
        borderBottom: `1px solid ${filled ? "var(--line-strong)" : "var(--line)"}`,
        padding: "6px 0 8px",
        minHeight: multi ? 44 : 28,
        fontFamily: filled ? "var(--font-display)" : "var(--font-ui)",
        fontStyle: filled ? "italic" : "normal",
        fontSize: filled ? 19 : 13,
        color: filled ? "var(--ink)" : "var(--ink-3)",
      }}>
        {filled ? value : <span style={{ opacity: 0.6 }}>{placeholder}</span>}
      </div>
    )}
  </Stack>
);

// ============================================================
// Template Result Card — the rendered scrapbook page
// ============================================================
function TemplateResult() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="24" name="Result card" sub="the rendered scrapbook page — save to Photos · 1080×1350" />

      <Row gap={20} align="flex-start">
        {/* Phone-aspect card */}
        <ResultCard />

        <Stack gap={10} style={{ flex: 1, maxWidth: 280 }}>
          <Stack gap={4}>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              composition rules
            </span>
            <span style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 }}>
              Every result card uses the same scrapbook grammar — washi tape, a kawaii seal stamp, sakura confetti corner, hand-lettered display italic, and a discreet yumeship watermark.
            </span>
          </Stack>

          <Stack gap={8} style={{ marginTop: 8 }}>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              variations
            </span>
            <Row gap={6} wrap>
              <Chip color="var(--sakura-deep)" bg="var(--sakura-soft)" active>blush</Chip>
              <Chip color="var(--lavender-deep)" bg="var(--lavender-soft)">dream</Chip>
              <Chip color="var(--sage-deep)" bg="var(--sage-soft)">moss</Chip>
              <Chip color="var(--butter-deep)" bg="var(--butter-soft)">honey</Chip>
              <Chip color="var(--peach-deep)" bg="var(--peach-soft)">peach</Chip>
              <Chip color="var(--ink)" bg="var(--paper-deep)">ink</Chip>
            </Row>
          </Stack>

          <div style={{
            padding: "12px 14px",
            background: "var(--paper-deep)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-3)",
            fontSize: 11, color: "var(--ink-2)", lineHeight: 1.5,
          }}>
            <Row gap={6} align="center" style={{ marginBottom: 4 }}>
              <Sparkle size={10} color="var(--sakura-deep)" />
              <span className="ys-mono" style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                privacy
              </span>
            </Row>
            All composition happens on-device. The PNG is yours alone unless you share it.
          </div>
        </Stack>
      </Row>
    </div>
  );
}

function ResultCard({ width = 280 }) {
  return (
    <div style={{
      width, aspectRatio: "1080 / 1350",
      background: "linear-gradient(170deg, var(--vellum) 0%, var(--sakura-soft) 100%)",
      border: "1px solid var(--sakura)",
      borderRadius: "var(--r-4)",
      padding: 26,
      position: "relative",
      overflow: "hidden",
      boxShadow: "var(--shadow-3)",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--font-ui)",
    }}>
      {/* Corner confetti */}
      <svg viewBox="0 0 200 200" preserveAspectRatio="none" style={{
        position: "absolute", top: -10, right: -10,
        width: 130, height: 130, opacity: 0.55,
      }}>
        {[[40,20,8],[80,40,12],[30,70,10],[120,30,7],[100,90,11],[60,110,8],[140,80,9]].map(([x,y,r],i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${i*40})`}>
            {[0, 72, 144, 216, 288].map((rot) => (
              <ellipse key={rot} cx="0" cy={-r * 0.4} rx={r * 0.4} ry={r * 0.6} fill="var(--sakura-deep)" opacity={0.5}
                transform={`rotate(${rot} 0 0)`} />
            ))}
          </g>
        ))}
      </svg>

      {/* Washi tape — top */}
      <div style={{ position: "absolute", top: -4, left: 50 }}>
        <WashiTape width={90} height={20} pattern="heart" color="var(--sakura-deep)" rotate={-4} />
      </div>

      {/* Seal — top right */}
      <div style={{ position: "absolute", top: 14, right: 14 }}>
        <Seal size={48} color="var(--plum)" ja="夢" label="yume" rotate={-12} />
      </div>

      {/* Header */}
      <div style={{ marginTop: 18 }}>
        <Row gap={6} align="center">
          <Heart size={12} color="var(--sakura-deep)" />
          <span className="ys-mono" style={{ fontSize: 9, color: "var(--sakura-deep)", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
            meet my F/O
          </span>
        </Row>
      </div>

      {/* Big name */}
      <div className="ys-serif" style={{
        fontSize: 44, lineHeight: 0.95,
        fontStyle: "italic", letterSpacing: "-0.02em",
        marginTop: 12,
        color: "var(--ink)",
      }}>
        Kafka<br/>
        <span style={{ fontSize: 22, color: "var(--sakura-deep)" }}>my whole problem</span>
      </div>

      {/* From */}
      <div className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", marginTop: 8 }}>
        FROM · HONKAI STAR RAIL
      </div>

      {/* Body */}
      <div style={{
        marginTop: 14,
        padding: "12px 14px",
        background: "rgba(255,255,255,0.6)",
        border: "1px solid rgba(215,122,141,0.3)",
        borderRadius: "var(--r-2)",
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 13,
        color: "var(--ink-2)",
        lineHeight: 1.45,
        flex: 1,
      }}>
        "the way she said my name — like she'd been saving it for a year and only had one chance to say it right."
        <div style={{ textAlign: "right", marginTop: 8, fontSize: 11, color: "var(--ink-3)" }}>
          — first impression
        </div>
      </div>

      {/* 3 things I love */}
      <div style={{ marginTop: 12 }}>
        <span className="ys-mono" style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
          three things i love
        </span>
        <Stack gap={3} style={{ marginTop: 6 }}>
          {[
            "her hands when she's lying",
            "the laugh she pretends she didn't",
            "the way she says \"trust me\"",
          ].map((t, i) => (
            <Row key={i} gap={6} align="baseline">
              <Heart size={9} color="var(--sakura-deep)" />
              <span className="ys-serif" style={{ fontSize: 13, fontStyle: "italic", color: "var(--ink)" }}>{t}</span>
            </Row>
          ))}
        </Stack>
      </div>

      {/* Watermark */}
      <Row gap={4} align="center" style={{ marginTop: 14, justifyContent: "flex-end" }}>
        <span className="ys-mono" style={{ fontSize: 8, color: "var(--ink-3)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          yumeship · 2026
        </span>
      </Row>
    </div>
  );
}

Object.assign(window, {
  YS_TemplatesGallery: TemplatesGallery,
  YS_TemplateFiller: TemplateFiller,
  YS_TemplateResult: TemplateResult,
  YS_ResultCard: ResultCard,
});
