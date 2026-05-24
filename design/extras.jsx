/* ============================================================
   yumeship — extras.jsx
   Sticker sheet, persona switcher, empty states — three smaller
   features, one file.
   ============================================================ */

const { IOSDevice } = window;
const { YS_Mark: Mark, YS_I: I, YS_Heart: Heart, YS_Sparkle: Sparkle,
        YS_SparkleCluster: SparkleCluster, YS_Sakura: Sakura,
        YS_WashiTape: WashiTape, YS_Seal: Seal, YS_Star: Star,
        YS_Ribbon: Ribbon, YS_Pin: Pin, YS_Cloud: Cloud,
        YS_QuoteMark: QuoteMark, YS_Chip: Chip,
        YS_tileStyle: tileStyle, YS_SectionLabel: SectionLabel,
        YS_Btn: Btn, YS_ph: ph } = window;

const Stack = ({ children, gap = 12, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>{children}</div>
);

const Row = ({ children, gap = 10, align = "center", style, wrap }) => (
  <div style={{
    display: "flex", gap, alignItems: align,
    flexWrap: wrap ? "wrap" : "nowrap",
    ...style,
  }}>{children}</div>
);

// =============================================================
// STICKER SHEET — picker + applied to a photo
// =============================================================
function StickerSheet() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="27" name="Sticker sheet" sub="kawaii stamps · seals · washi · drag onto albums" />

      <Row gap={24} align="flex-start">
        {/* Applied photo */}
        <Stack gap={10}>
          <span className="ys-mono" style={{
            fontSize: 10, color: "var(--ink-3)",
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}>in use</span>
          <DecoratedPhoto />
        </Stack>

        {/* Sticker picker */}
        <Stack gap={10} style={{ flex: 1 }}>
          <span className="ys-mono" style={{
            fontSize: 10, color: "var(--ink-3)",
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}>sheet</span>

          {/* Category tabs */}
          <Row gap={4} wrap>
            <CatTab ja="心" name="hearts" active />
            <CatTab ja="花" name="sakura" />
            <CatTab ja="星" name="sparkles" />
            <CatTab ja="帯" name="washi" />
            <CatTab ja="印" name="seals" />
            <CatTab ja="蝶" name="ribbons" />
            <CatTab ja="付" name="memo" />
          </Row>

          {/* Sticker grid */}
          <div style={{
            padding: 14,
            background: "var(--vellum)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-3)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
          }}>
            <StickerCell><Heart size={28} color="var(--sakura-deep)" /></StickerCell>
            <StickerCell><Heart size={28} color="var(--plum)" outline /></StickerCell>
            <StickerCell><Heart size={28} color="var(--peach-deep)" /></StickerCell>
            <StickerCell><Heart size={28} color="var(--butter-deep)" outline /></StickerCell>
            <StickerCell><Heart size={28} color="var(--lavender-deep)" /></StickerCell>

            <StickerCell><Sakura size={32} color="var(--sakura)" core="var(--butter)" /></StickerCell>
            <StickerCell><Sakura size={32} color="var(--peach)" core="var(--sakura-deep)" /></StickerCell>
            <StickerCell><Sparkle size={26} color="var(--butter-deep)" /></StickerCell>
            <StickerCell><Star size={26} color="var(--butter-deep)" /></StickerCell>
            <StickerCell><Sparkle size={20} color="var(--lavender-deep)" /></StickerCell>

            <StickerCell tall>
              <WashiTape width={56} height={14} pattern="heart" color="var(--sakura-deep)" rotate={0} />
            </StickerCell>
            <StickerCell tall>
              <WashiTape width={56} height={14} pattern="stripe" color="var(--lavender-deep)" rotate={0} />
            </StickerCell>
            <StickerCell tall>
              <WashiTape width={56} height={14} pattern="dot" color="var(--sage-deep)" rotate={0} />
            </StickerCell>
            <StickerCell tall>
              <WashiTape width={56} height={14} pattern="check" color="var(--peach-deep)" rotate={0} />
            </StickerCell>
            <StickerCell tall>
              <Ribbon size={24} color="var(--sakura-deep)" />
            </StickerCell>

            <StickerCell><Seal size={42} color="var(--plum)" ja="夢" label="yume" rotate={-8} /></StickerCell>
            <StickerCell><Seal size={42} color="var(--sakura-deep)" ja="愛" label="ai" rotate={6} /></StickerCell>
            <StickerCell><Seal size={42} color="var(--lavender-deep)" ja="秘" label="himitsu" rotate={-12} /></StickerCell>
            <StickerCell><Pin size={28} color="var(--sakura-deep)" /></StickerCell>
            <StickerCell><Cloud size={28} color="var(--paper-deep)" /></StickerCell>
          </div>

          {/* Counts */}
          <Row gap={10} style={{ justifyContent: "space-between" }}>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em" }}>
              48 STICKERS · 7 CATEGORIES
            </span>
            <Chip color="var(--sakura-deep)" bg="var(--sakura-soft)">
              ♡ pro · more packs
            </Chip>
          </Row>
        </Stack>
      </Row>
    </div>
  );
}

const CatTab = ({ ja, name, active }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 10px",
    background: active ? "var(--sakura-deep)" : "var(--vellum)",
    color: active ? "var(--vellum)" : "var(--ink-2)",
    border: active ? "none" : "1px solid var(--line)",
    borderRadius: 999,
    fontSize: 11, fontWeight: active ? 600 : 500,
  }}>
    <span className="ys-ja" style={{ fontSize: 11, opacity: active ? 1 : 0.6 }}>{ja}</span>
    {name}
  </span>
);

const StickerCell = ({ children, tall }) => (
  <div style={{
    aspectRatio: tall ? "16/9" : "1/1",
    background: "var(--paper-soft)",
    border: "1px solid var(--line)",
    borderRadius: 8,
    display: "grid", placeItems: "center",
    cursor: "grab",
  }}>{children}</div>
);

function DecoratedPhoto() {
  return (
    <div style={{
      width: 240, height: 280,
      background: "#fff",
      border: "1px solid var(--ink)",
      padding: 12,
      paddingBottom: 36,
      position: "relative",
      boxShadow: "var(--shadow-3)",
      transform: "rotate(-2deg)",
      fontFamily: "var(--font-script)",
    }}>
      {/* tape */}
      <div style={{ position: "absolute", top: -8, left: "30%", transform: "rotate(-8deg)" }}>
        <WashiTape width={84} height={18} pattern="heart" color="var(--sakura-deep)" rotate={0} />
      </div>

      {/* photo */}
      <div style={{
        width: "100%", height: 200,
        background: "linear-gradient(160deg, #dca8c2, #6b3d5b)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div className="placeholder-stripe" style={{ position: "absolute", inset: 0, opacity: 0.18 }} />
        <span style={{
          position: "absolute", inset: 0,
          display: "grid", placeItems: "center",
          color: "rgba(255,255,255,0.9)",
          fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 80, lineHeight: 1,
        }}>K</span>

        {/* applied stickers */}
        <div style={{ position: "absolute", top: 10, right: 14 }}>
          <Heart size={26} color="var(--sakura)" />
        </div>
        <div style={{ position: "absolute", top: 30, right: 38 }}>
          <Sparkle size={14} color="var(--butter)" />
        </div>
        <div style={{ position: "absolute", bottom: 12, left: 10 }}>
          <Seal size={48} color="var(--vellum)" ja="夢" label="yume" rotate={-15} />
        </div>
        <div style={{ position: "absolute", top: 100, left: 14 }}>
          <Sakura size={22} color="var(--sakura)" />
        </div>
      </div>

      {/* caption */}
      <div style={{
        marginTop: 8, textAlign: "center",
        fontSize: 17, color: "var(--ink)",
      }}>
        my whole problem ♡
      </div>
    </div>
  );
}

// =============================================================
// PERSONA SWITCHER
// =============================================================
function PersonaSwitcher() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="28" name="Persona switcher" sub="multiple selves — for users with many s/is" />

      <Row gap={24} align="flex-start">
        {/* sheet */}
        <Stack gap={10} style={{ width: 320, flexShrink: 0 }}>
          <span className="ys-mono" style={{
            fontSize: 10, color: "var(--ink-3)",
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}>switcher · bottom sheet</span>

          <div style={{
            background: "var(--vellum)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-5)",
            padding: 16,
            boxShadow: "var(--shadow-3)",
            position: "relative",
          }}>
            {/* drag handle */}
            <div style={{
              width: 36, height: 4, borderRadius: 999,
              background: "var(--line-strong)",
              margin: "0 auto 12px",
            }} />

            <Stack gap={3}>
              <span className="ys-mono" style={{
                fontSize: 9, color: "var(--ink-3)",
                letterSpacing: "0.14em", textTransform: "uppercase",
              }}>your selves · 3</span>
              <div className="ys-serif" style={{
                fontSize: 22, fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.01em",
              }}>switch who you are.</div>
            </Stack>

            <Stack gap={6} style={{ marginTop: 12 }}>
              <PersonaRow name="Mae" pronouns="she/her" world="HSR · gentle" color="var(--sakura-deep)" initial="M" active />
              <PersonaRow name="Ren" pronouns="they/them" world="OMORI · quiet" color="var(--sage-deep)" initial="R" />
              <PersonaRow name="Lior" pronouns="he/him" world="Genshin · sharp" color="var(--peach-deep)" initial="L" />

              {/* add new */}
              <div style={{
                padding: "12px 14px",
                background: "transparent",
                border: "1px dashed var(--line-strong)",
                borderRadius: "var(--r-3)",
                display: "flex", alignItems: "center", gap: 12,
                color: "var(--ink-2)",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 999,
                  background: "var(--paper-deep)",
                  display: "grid", placeItems: "center",
                  color: "var(--ink-2)",
                }}>{I.plus}</div>
                <Stack gap={1}>
                  <span className="ys-serif" style={{ fontSize: 14, fontStyle: "italic", lineHeight: 1 }}>new self</span>
                  <span style={{ fontSize: 10, color: "var(--ink-3)" }}>another world, another you</span>
                </Stack>
              </div>
            </Stack>
          </div>
        </Stack>

        {/* persona profile */}
        <Stack gap={10} style={{ flex: 1 }}>
          <span className="ys-mono" style={{
            fontSize: 10, color: "var(--ink-3)",
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}>persona profile</span>
          <PersonaProfile />
        </Stack>
      </Row>
    </div>
  );
}

const PersonaRow = ({ name, pronouns, world, color, initial, active }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 12px",
    background: active ? `${color}1a` : "var(--paper-soft)",
    border: `1px solid ${active ? color : "var(--line)"}`,
    borderRadius: "var(--r-3)",
    cursor: "pointer",
    position: "relative",
  }}>
    <div style={{
      width: 38, height: 38, borderRadius: 999,
      background: `${color}30`,
      border: `1.5px solid ${color}`,
      display: "grid", placeItems: "center",
      color, fontFamily: "var(--font-display)", fontStyle: "italic",
      fontSize: 18, fontWeight: 600,
      flexShrink: 0,
    }}>{initial}</div>
    <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
      <Row gap={6} align="baseline">
        <span className="ys-serif" style={{ fontSize: 18, fontStyle: "italic", lineHeight: 1, color: active ? color : "var(--ink)" }}>{name}</span>
        <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{pronouns}</span>
      </Row>
      <span style={{ fontSize: 11, color: "var(--ink-2)", fontStyle: "italic", fontFamily: "var(--font-display)" }}>{world}</span>
    </Stack>
    {active ? (
      <Sparkle size={12} color={color} />
    ) : (
      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>›</span>
    )}
  </div>
);

function PersonaProfile() {
  return (
    <div style={{
      padding: 18,
      background: "var(--vellum)",
      border: "1px solid var(--line)",
      borderRadius: "var(--r-4)",
      position: "relative",
    }}>
      {/* heart sticker */}
      <div style={{ position: "absolute", top: -6, right: 16 }}>
        <Heart size={16} color="var(--sakura-deep)" />
      </div>

      <Row gap={14} align="center" style={{ marginBottom: 14 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 999,
          background: "linear-gradient(140deg, var(--sakura), var(--sakura-deep))",
          display: "grid", placeItems: "center",
          color: "#fff",
          fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 26,
          flexShrink: 0,
          border: "2px solid var(--sakura-deep)",
        }}>M</div>
        <Stack gap={3}>
          <Row gap={6} align="baseline">
            <span className="ys-serif" style={{ fontSize: 24, fontStyle: "italic", lineHeight: 1 }}>Mae</span>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>she/her · 27</span>
          </Row>
          <span style={{ fontSize: 12, color: "var(--sakura-deep)", fontWeight: 500 }}>
            "the one she calls when she shouldn't"
          </span>
        </Stack>
      </Row>

      {/* facts */}
      <Stack gap={6}>
        {[
          ["lives in", "Honkai Star Rail · the Astral Express"],
          ["good at", "listening, baking, remembering small things"],
          ["scared of", "being too much"],
          ["love language", "words written down"],
        ].map(([k, v]) => (
          <Row key={k} gap={10} align="baseline" style={{ padding: "6px 0", borderBottom: "1px dotted var(--line)" }}>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 90 }}>{k}</span>
            <span className="ys-serif" style={{ fontSize: 14, fontStyle: "italic", color: "var(--ink)", flex: 1 }}>{v}</span>
          </Row>
        ))}
      </Stack>

      <Row gap={6} style={{ marginTop: 14 }}>
        <Chip color="var(--sakura-deep)" bg="var(--sakura-soft)">3 ships</Chip>
        <Chip color="var(--lavender-deep)" bg="var(--lavender-soft)">142 entries</Chip>
        <Chip color="var(--plum)" bg="rgba(110,58,90,0.12)">1 polycule</Chip>
      </Row>
    </div>
  );
}

// =============================================================
// EMPTY STATES — four polished blank-slate moments
// =============================================================
function EmptyStates() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="29" name="Empty states" sub="the moments before — never blank, always inviting" />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 16,
      }}>
        <EmptyTile
          ja="船"
          title="no ships yet."
          quote="every yumeship started with one moment. yours is waiting."
          cta="meet your first F/O"
          icon={<Mark size={36} />}
          tint="var(--sakura-deep)"
          tintSoft="var(--sakura-soft)"
        />
        <EmptyTile
          ja="話"
          title="no scenarios written."
          quote="what would happen if she walked into the room right now?"
          cta="start with a prompt"
          icon={<QuoteMark size={36} color="var(--lavender-deep)" />}
          tint="var(--lavender-deep)"
          tintSoft="var(--lavender-soft)"
        />
        <EmptyTile
          ja="便"
          title="quiet on this thread."
          quote="text yourself what you wish they'd say."
          cta="write the first message"
          icon={<Heart size={36} color="var(--peach-deep)" outline />}
          tint="var(--peach-deep)"
          tintSoft="var(--peach-soft)"
        />
        <EmptyTile
          ja="日"
          title="no anniversaries set."
          quote="when did you know? mark the day, you'll want to remember."
          cta="add a date"
          icon={<Sakura size={42} color="var(--butter-deep)" core="var(--vellum)" />}
          tint="var(--butter-deep)"
          tintSoft="var(--butter-soft)"
        />
      </div>
    </div>
  );
}

function EmptyTile({ ja, title, quote, cta, icon, tint, tintSoft }) {
  return (
    <div style={{
      padding: "28px 20px 22px",
      background: `linear-gradient(170deg, var(--vellum), ${tintSoft})`,
      border: `1px solid ${tint}40`,
      borderRadius: "var(--r-4)",
      position: "relative",
      overflow: "hidden",
      textAlign: "center",
    }}>
      {/* corner ja watermark */}
      <span className="ys-ja" style={{
        position: "absolute",
        top: -10, right: -8,
        fontSize: 84, lineHeight: 1, fontWeight: 600,
        color: tint, opacity: 0.1,
      }}>{ja}</span>

      <span style={{ position: "absolute", top: 14, left: 16 }}>
        <Sparkle size={11} color={tint} />
      </span>
      <span style={{ position: "absolute", top: 30, left: 28 }}>
        <Sparkle size={7} color={tint} opacity={0.6} />
      </span>

      {/* big icon */}
      <div style={{
        display: "inline-grid",
        placeItems: "center",
        width: 76, height: 76,
        borderRadius: 999,
        background: "var(--vellum)",
        border: `1.5px dashed ${tint}80`,
        marginTop: 8, marginBottom: 14,
        position: "relative",
      }}>
        {icon}
      </div>

      <div className="ys-serif" style={{
        fontSize: 22, lineHeight: 1.1,
        fontStyle: "italic", letterSpacing: "-0.01em",
        color: tint, marginBottom: 6,
      }}>{title}</div>

      <div style={{
        fontFamily: "var(--font-display)", fontStyle: "italic",
        fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5,
        maxWidth: 240, margin: "0 auto 14px",
      }}>
        "{quote}"
      </div>

      <button style={{
        padding: "8px 18px",
        background: tint, color: "var(--vellum)",
        border: "none", borderRadius: 999,
        fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600,
        letterSpacing: "0.02em",
        display: "inline-flex", alignItems: "center", gap: 6,
        boxShadow: "var(--shadow-1)",
        cursor: "pointer",
      }}>
        <Heart size={11} color="var(--vellum)" />
        {cta}
      </button>
    </div>
  );
}

Object.assign(window, {
  YS_StickerSheet: StickerSheet,
  YS_PersonaSwitcher: PersonaSwitcher,
  YS_EmptyStates: EmptyStates,
});
