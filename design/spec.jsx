/* ============================================================
   yumeship — spec.jsx
   Components added to align with SPEC.md:
     · F/O detail sub-tab bar (7 tabs)
     · Headcanon list w/ categories
     · Playlist rows
     · Aesthetic board (mood, not albums)
     · Polycule indicator
     · Upcoming list (global anniversaries)
     · Settings panel
     · Messages thread list
   ============================================================ */

const { YS_tileStyle: tileStyle, YS_SectionLabel: SectionLabel,
        YS_Row: Row, YS_Stack: Stack, YS_Chip: Chip, YS_I: I, YS_ph: ph,
        YS_Btn: Btn, YS_Mark: Mark,
        YS_Sparkle: Sparkle, YS_SparkleCluster: SparkleCluster,
        YS_Heart: Heart, YS_Sakura: Sakura, YS_Star: Star,
        YS_WashiTape: WashiTape, YS_Seal: Seal, YS_Pin: Pin,
        YS_QuoteMark: QuoteMark } = window;

// =============================================================
// F/O Detail sub-tab bar — 7 tabs (Profile, Albums, Scenarios,
//   Storyline, Messages, Outfits, Dates)
// =============================================================
function SubTabBarSection() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="14" name="Detail sub-tabs" sub="seven tabs across one F/O — kawaii horizontal scroller" />

      <Stack gap={20}>
        <div
          className="ys-mono"
          style={{
            fontSize: 10, color: "var(--ink-3)",
            letterSpacing: "0.12em", textTransform: "uppercase",
          }}
        >
          Default — Profile active
        </div>
        <SubTabBar active="profile" />

        <div
          className="ys-mono"
          style={{
            fontSize: 10, color: "var(--ink-3)",
            letterSpacing: "0.12em", textTransform: "uppercase",
            marginTop: 8,
          }}
        >
          Messages active — sparkle indicator
        </div>
        <SubTabBar active="messages" />
      </Stack>
    </div>
  );
}

const TABS = [
  { id: "profile",   ja: "本人", label: "Profile",   icon: I.heart },
  { id: "albums",    ja: "写真", label: "Albums",    icon: I.bookmark },
  { id: "scenarios", ja: "話",   label: "Scenarios", icon: I.edit },
  { id: "storyline", ja: "年表", label: "Storyline", icon: I.moon },
  { id: "messages",  ja: "便り", label: "Messages",  icon: I.send },
  { id: "outfits",   ja: "服",   label: "Outfits",   icon: I.bookmark },
  { id: "dates",     ja: "日",   label: "Dates",     icon: I.bell },
];

function SubTabBar({ active = "profile" }) {
  return (
    <div style={{
      display: "flex",
      gap: 4,
      padding: 5,
      background: "var(--vellum)",
      border: "1px solid var(--line)",
      borderRadius: 999,
      width: "fit-content",
      boxShadow: "var(--shadow-1)",
      maxWidth: "100%",
      overflowX: "auto",
    }}>
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px",
            background: on ? "var(--sakura-deep)" : "transparent",
            color: on ? "var(--vellum)" : "var(--ink-2)",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: on ? 600 : 500,
            cursor: "pointer",
            position: "relative",
            whiteSpace: "nowrap",
          }}>
            {on && (
              <span style={{ position: "absolute", left: -2, top: -4 }}>
                <Sparkle size={10} color="var(--butter)" />
              </span>
            )}
            <span className="ys-ja" style={{ fontSize: 12, opacity: on ? 1 : 0.6 }}>{t.ja}</span>
            <span>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================
// Headcanon list with categories (per spec)
//   Personality · Habits · Favorites · How We Met · In Their World · Random
// =============================================================
function HeadcanonsSection() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="15" name="Headcanons" sub="six categories — the things only you would know" />

      <Row gap={20} align="flex-start" style={{ flex: 1 }}>
        {/* Category nav */}
        <Stack gap={6} style={{ width: 200, flexShrink: 0 }}>
          <CategoryRow ja="性" name="Personality" count={8} color="var(--sakura-deep)" active />
          <CategoryRow ja="癖" name="Habits"      count={5} color="var(--lavender-deep)" />
          <CategoryRow ja="好" name="Favorites"   count={12} color="var(--butter-deep)" />
          <CategoryRow ja="逢" name="How We Met"  count={1} color="var(--peach-deep)" />
          <CategoryRow ja="世" name="In Their World" count={6} color="var(--sage-deep)" />
          <CategoryRow ja="他" name="Random"      count={3} color="var(--ink-3)" />
        </Stack>

        {/* Entries */}
        <Stack gap={10} style={{ flex: 1 }}>
          <Row gap={10} align="center" style={{ justifyContent: "space-between" }}>
            <Row gap={8} align="center">
              <Sakura size={20} />
              <span className="ys-serif" style={{ fontSize: 20, fontStyle: "italic" }}>Personality</span>
            </Row>
            <Btn variant="soft" size="sm" icon={I.plus}>add</Btn>
          </Row>
          <HeadcanonRow text="Has a soft voice for animals and a sharper one for everything else." n="01" />
          <HeadcanonRow text="Pretends not to be hungry until I make him eat. Then he finishes mine too." n="02" featured />
          <HeadcanonRow text="Falls asleep with the lights on. Always swears he didn't." n="03" />
          <HeadcanonRow text="Counts in his head when he's nervous — I can see it in his jaw." n="04" />
        </Stack>
      </Row>
    </div>
  );
}

const CategoryRow = ({ ja, name, count, color, active }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 12px",
    background: active ? `${color}15` : "var(--paper-soft)",
    border: `1px solid ${active ? color + "40" : "var(--line)"}`,
    borderRadius: "var(--r-3)",
    cursor: "pointer",
  }}>
    <span className="ys-ja" style={{
      fontSize: 14, color, fontWeight: 600, minWidth: 16,
    }}>{ja}</span>
    <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 600 : 500, color: active ? color : "var(--ink-2)" }}>
      {name}
    </span>
    <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{count}</span>
  </div>
);

const HeadcanonRow = ({ text, n, featured }) => (
  <div style={{
    padding: "12px 14px",
    background: featured
      ? "linear-gradient(95deg, var(--sakura-soft), var(--vellum))"
      : "var(--vellum)",
    border: featured ? "1px solid var(--sakura)" : "1px solid var(--line)",
    borderRadius: "var(--r-3)",
    display: "flex", alignItems: "flex-start", gap: 12,
    position: "relative",
  }}>
    {featured && (
      <span style={{ position: "absolute", top: -8, right: 8 }}>
        <Heart size={16} color="var(--sakura-deep)" />
      </span>
    )}
    <span className="ys-mono" style={{
      fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em",
      paddingTop: 2, minWidth: 18,
    }}>{n}</span>
    <span className="ys-serif" style={{
      fontSize: 15, lineHeight: 1.45, fontStyle: "italic",
      color: "var(--ink)", flex: 1,
    }}>{text}</span>
    <span style={{ fontSize: 14, color: "var(--ink-3)", cursor: "pointer" }}>{I.edit}</span>
  </div>
);

// =============================================================
// Playlist (per Profile tab spec)
// =============================================================
function PlaylistSection() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="16" name="Playlist" sub="songs that mean them — no streaming API needed" />

      <Stack gap={8}>
        <PlayRow n="01" title="Saturn"           artist="Sleeping at Last" note="this is the one. always" featured />
        <PlayRow n="02" title="Vienna"           artist="Billy Joel"       note="he'd hate that i picked this" />
        <PlayRow n="03" title="Lush Moss"        artist="HSR OST"          note="" />
        <PlayRow n="04" title="Pink + White"     artist="Frank Ocean"      note="morning after song" />
        <PlayRow n="05" title="Linger"           artist="The Cranberries"  note="" />
      </Stack>

      <Row gap={10} style={{ marginTop: "auto" }}>
        <Btn variant="primary" size="sm" icon={I.plus}>add song</Btn>
        <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em", alignSelf: "center" }}>
          5 SONGS · 17m 42s
        </span>
      </Row>
    </div>
  );
}

const PlayRow = ({ n, title, artist, note, featured }) => (
  <Row gap={12} align="center" style={{
    padding: "10px 14px",
    background: featured ? "var(--sakura-soft)" : "var(--vellum)",
    border: `1px solid ${featured ? "var(--sakura)" : "var(--line)"}`,
    borderRadius: "var(--r-3)",
  }}>
    <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", minWidth: 18 }}>{n}</span>
    <div style={{
      width: 36, height: 36, borderRadius: "var(--r-2)",
      background: featured ? "var(--sakura-deep)" : "var(--paper-deep)",
      display: "grid", placeItems: "center",
      color: featured ? "var(--vellum)" : "var(--ink-2)",
      flexShrink: 0,
    }}>
      {featured ? <Heart size={14} color="var(--vellum)" /> : <Star size={12} color="var(--ink-3)" />}
    </div>
    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
      <Row gap={8} align="baseline">
        <span className="ys-serif" style={{ fontSize: 17, fontStyle: "italic", lineHeight: 1, color: "var(--ink)" }}>
          {title}
        </span>
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>— {artist}</span>
      </Row>
      {note && (
        <span style={{ fontSize: 11, color: featured ? "var(--sakura-deep)" : "var(--ink-3)", fontStyle: "italic" }}>
          {note}
        </span>
      )}
    </Stack>
  </Row>
);

// =============================================================
// Aesthetic board (mood, distinct from Albums)
// =============================================================
function AestheticBoardSection() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="17" name="Aesthetic board" sub="vibes & palettes — separate from your photo albums" />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 6,
      }}>
        {[
          { l: "vibe", tint: "var(--sakura-soft)" },
          { l: "palette", tint: "var(--butter-soft)" },
          { l: "outfit ref", tint: "var(--lavender-soft)" },
          { l: "interior", tint: "var(--sage-soft)" },
          { l: "fan art", tint: "var(--peach-soft)" },
          { l: "screencap", tint: "var(--sakura-soft)" },
          { l: "texture", tint: "var(--paper-deep)" },
          { l: "color study", tint: "var(--lavender-soft)" },
          { l: "weather", tint: "var(--sage-soft)" },
        ].map((t, i) => (
          <div key={i} style={{
            aspectRatio: "1/1",
            background: t.tint,
            border: "1px solid var(--line)",
            borderRadius: "var(--r-3)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div className="placeholder-stripe" style={{
              position: "absolute", inset: 0, opacity: 0.45,
            }} />
            <span className="ys-mono" style={{
              position: "absolute", bottom: 6, left: 6,
              fontSize: 9, color: "var(--ink-2)",
              background: "var(--vellum)",
              padding: "2px 6px",
              borderRadius: 4,
              letterSpacing: "0.06em",
            }}>{t.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================
// Polycule view — group ship visualization
// =============================================================
function PolyculeSection() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="18" name="Polycule" sub="group ships — multiple F/Os, one constellation" />

      <Row gap={20} align="flex-start">
        <PolyculeCard />
        <Stack gap={10} style={{ flex: 1 }}>
          <div style={{
            padding: 14,
            background: "var(--vellum)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-3)",
          }}>
            <Row gap={8} align="center">
              <Mark size={20} />
              <span className="ys-serif" style={{ fontSize: 18, fontStyle: "italic" }}>The Hunters</span>
              <Chip color="var(--plum)" bg="rgba(110,58,90,0.12)">✶ polycule · 3</Chip>
            </Row>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 8, lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
              "When she introduced me to the others, it felt like coming home twice."
            </div>
          </div>

          <Stack gap={6}>
            <span className="ys-mono" style={{
              fontSize: 10, color: "var(--ink-3)",
              letterSpacing: "0.12em", textTransform: "uppercase",
            }}>members</span>
            <MemberRow name="Kafka" src="Honkai Star Rail" type="romantic" color="var(--sakura-deep)" initial="K" grad="linear-gradient(140deg,#dca8c2,#7a4567)" />
            <MemberRow name="Silver Wolf" src="Honkai Star Rail" type="romantic" color="var(--sakura-deep)" initial="S" grad="linear-gradient(140deg,#c7b5e3,#5a3f8a)" />
            <MemberRow name="Blade" src="Honkai Star Rail" type="platonic" color="var(--sage-deep)" initial="B" grad="linear-gradient(140deg,#8c9d8a,#3b4a35)" />
          </Stack>
        </Stack>
      </Row>
    </div>
  );
}

function PolyculeCard() {
  return (
    <div style={{
      width: 240, height: 240,
      borderRadius: "var(--r-5)",
      background: "linear-gradient(160deg, var(--sakura-soft), var(--lavender-soft))",
      border: "1px solid var(--sakura)",
      position: "relative",
      padding: 16,
      overflow: "hidden",
    }}>
      <Seal label="polycule" ja="ポリ" color="var(--plum)" rotate={-12}
        style={{ position: "absolute", top: 12, right: 12 }} />

      {/* The three orbs */}
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ position: "relative", width: 160, height: 160 }}>
          <Orb top={0}   left={50} initial="K" grad="linear-gradient(140deg,#dca8c2,#7a4567)" tint="var(--sakura-deep)" />
          <Orb top={90}  left={10} initial="S" grad="linear-gradient(140deg,#c7b5e3,#5a3f8a)" tint="var(--lavender-deep)" />
          <Orb top={90}  left={90} initial="B" grad="linear-gradient(140deg,#8c9d8a,#3b4a35)" tint="var(--sage-deep)" />

          {/* Lines between */}
          <svg width="160" height="160" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path d="M 80 30 L 30 110 M 80 30 L 130 110 M 30 110 L 130 110"
              stroke="var(--plum)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.55" fill="none" />
          </svg>
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 12, left: 16,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <Sparkle size={10} color="var(--plum)" />
        <span className="ys-mono" style={{
          fontSize: 10, color: "var(--plum)", fontWeight: 600,
          letterSpacing: "0.1em",
        }}>THE HUNTERS</span>
      </div>
    </div>
  );
}

const Orb = ({ top, left, initial, grad, tint }) => (
  <div style={{
    position: "absolute", top, left,
    transform: "translate(-50%, -50%)",
    width: 48, height: 48, borderRadius: 999,
    background: grad,
    display: "grid", placeItems: "center",
    color: "var(--vellum)",
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
    fontSize: 22,
    border: `2px solid ${tint}`,
    boxShadow: "var(--shadow-2)",
  }}>{initial}</div>
);

const MemberRow = ({ name, src, type, color, initial, grad }) => (
  <Row gap={10} align="center" style={{
    padding: "8px 10px",
    background: "var(--vellum)",
    border: "1px solid var(--line)",
    borderRadius: "var(--r-2)",
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 999,
      background: grad,
      display: "grid", placeItems: "center",
      color: "var(--vellum)",
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 14,
      flexShrink: 0,
    }}>{initial}</div>
    <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
      <span className="ys-serif" style={{ fontSize: 16, fontStyle: "italic", lineHeight: 1 }}>{name}</span>
      <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{src}</span>
    </Stack>
    <Chip color={color} bg={`${color}1f`}>{type}</Chip>
  </Row>
);

// =============================================================
// Upcoming list — global view across all F/Os (Tab 3)
// =============================================================
function UpcomingSection() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="19" name="Upcoming" sub="anniversaries across every ship" />

      <Stack gap={10}>
        <UpcomingRow days={3} title="Our anniversary" fo="Kafka" src="HSR" date="2026.05.28" tint="var(--sakura-deep)" featured />
        <UpcomingRow days={14} title="The day I found him" fo="Childe" src="Genshin" date="2026.06.08" tint="var(--peach-deep)" />
        <UpcomingRow days={41} title="Our song day" fo="Kafka" src="HSR" date="2026.07.05" tint="var(--lavender-deep)" />
        <UpcomingRow days={78} title="Birthday — Childe" fo="Childe" src="Genshin" date="2026.08.11" tint="var(--butter-deep)" />
        <UpcomingRow days={112} title="In memoriam" fo="Basil" src="OMORI" date="2026.09.14" tint="var(--ember)" muted />
      </Stack>
    </div>
  );
}

const UpcomingRow = ({ days, title, fo, src, date, tint, featured, muted }) => (
  <Row gap={12} align="center" style={{
    padding: "12px 14px",
    background: featured
      ? "linear-gradient(95deg, var(--sakura-soft), var(--vellum))"
      : "var(--vellum)",
    border: `1px solid ${featured ? tint : "var(--line)"}`,
    borderRadius: "var(--r-3)",
    position: "relative",
    opacity: muted ? 0.8 : 1,
  }}>
    {featured && (
      <span style={{ position: "absolute", top: -6, left: 14 }}>
        <Heart size={14} color={tint} />
      </span>
    )}
    <div style={{
      width: 52, textAlign: "center",
      padding: "6px 0",
      background: `${tint}18`,
      border: `1px solid ${tint}40`,
      borderRadius: "var(--r-2)",
      flexShrink: 0,
    }}>
      <div className="ys-serif" style={{ fontSize: 22, lineHeight: 1, color: tint, fontStyle: "italic", fontWeight: 600 }}>{days}</div>
      <div className="ys-mono" style={{ fontSize: 8, color: tint, letterSpacing: "0.1em", marginTop: 2 }}>DAYS</div>
    </div>
    <Stack gap={3} style={{ flex: 1, minWidth: 0 }}>
      <span className="ys-serif" style={{ fontSize: 18, fontStyle: "italic", lineHeight: 1.1 }}>{title}</span>
      <Row gap={6} align="center">
        <span style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 500 }}>{fo}</span>
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>· {src}</span>
        <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", marginLeft: "auto" }}>{date}</span>
      </Row>
    </Stack>
    <span style={{ color: tint }}>
      <Sparkle size={12} color={tint} />
    </span>
  </Row>
);

// =============================================================
// Settings — panel sections (Tab 4)
// =============================================================
function SettingsSection() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="20" name="Settings" sub="lock · notifications · data · pro" />

      <Row gap={14} align="flex-start">
        <Stack gap={14} style={{ flex: 1 }}>
          <SettingsGroup title="App lock" ja="鍵">
            <SettingRow icon={I.lock} label="Enable Face ID lock" trailing={<Toggle on />} />
            <SettingRow label="Lock timeout" trailing={<Trailing value="after 1 min" />} />
          </SettingsGroup>
          <SettingsGroup title="Notifications" ja="便">
            <SettingRow icon={I.bell} label="Allow notifications" trailing={<Toggle on />} />
            <SettingRow label="Scheduled" trailing={<Trailing value="12 reminders" />} />
            <SettingRow label="Discreet preview" hint="Lock screen never reveals what the app is" trailing={<Toggle on />} />
          </SettingsGroup>
        </Stack>

        <Stack gap={14} style={{ flex: 1 }}>
          <SettingsGroup title="Data" ja="蔵" tint="var(--sage-deep)">
            <SettingRow label="Storage used" trailing={<Trailing value="142 MB" />} />
            <SettingRow label="Export all data" trailing={<Trailing value="JSON ›" />} />
            <SettingRow label="Delete all" destructive trailing={<span style={{ color: "var(--ember)", fontSize: 11 }}>›</span>} />
          </SettingsGroup>

          <ProCard />
        </Stack>
      </Row>
    </div>
  );
}

const SettingsGroup = ({ title, ja, tint = "var(--sakura-deep)", children }) => (
  <Stack gap={8}>
    <Row gap={6} align="center">
      <span className="ys-ja" style={{ fontSize: 14, color: tint, fontWeight: 600 }}>{ja}</span>
      <span className="ys-mono" style={{
        fontSize: 10, color: "var(--ink-3)",
        letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
      }}>{title}</span>
    </Row>
    <Stack gap={1} style={{
      background: "var(--vellum)",
      border: "1px solid var(--line)",
      borderRadius: "var(--r-3)",
      overflow: "hidden",
    }}>
      {children}
    </Stack>
  </Stack>
);

const SettingRow = ({ icon, label, hint, trailing, destructive }) => (
  <Row gap={12} align="center" style={{
    padding: "11px 14px",
    background: "var(--vellum)",
    borderBottom: "1px solid var(--paper-deep)",
  }}>
    {icon && (
      <span style={{
        width: 24, height: 24, borderRadius: 6,
        background: "var(--paper-deep)",
        display: "grid", placeItems: "center",
        color: destructive ? "var(--ember)" : "var(--ink-2)",
        flexShrink: 0,
      }}>{icon}</span>
    )}
    <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: 13, color: destructive ? "var(--ember)" : "var(--ink)", fontWeight: 500 }}>{label}</span>
      {hint && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{hint}</span>}
    </Stack>
    {trailing}
  </Row>
);

const Trailing = ({ value }) => (
  <span style={{ fontSize: 12, color: "var(--ink-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
    {value}
  </span>
);

function ProCard() {
  return (
    <div style={{
      padding: "16px 18px",
      background: "linear-gradient(160deg, var(--sakura-soft), var(--lavender-soft))",
      border: "1px solid var(--sakura)",
      borderRadius: "var(--r-4)",
      position: "relative",
      overflow: "hidden",
    }}>
      <span style={{ position: "absolute", top: 10, right: 10 }}>
        <SparkleCluster color="var(--sakura-deep)" />
      </span>
      <Row gap={6} align="center">
        <Heart size={14} color="var(--sakura-deep)" />
        <span className="ys-mono" style={{ fontSize: 10, color: "var(--sakura-deep)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
          yumeship pro
        </span>
      </Row>
      <div className="ys-serif" style={{ fontSize: 22, lineHeight: 1.15, fontStyle: "italic", marginTop: 6, paddingRight: 60 }}>
        Sync across devices.<br/>Coming soon.
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 8, lineHeight: 1.4 }}>
        iCloud backup · cross-device sync · widget pack
      </div>
    </div>
  );
}

// Reuse Toggle from components.jsx
const Toggle = ({ on }) => (
  <div style={{
    width: 38, height: 22, borderRadius: 999,
    background: on ? "var(--sakura-deep)" : "var(--line-strong)",
    padding: 2, display: "flex", alignItems: "center",
    flexShrink: 0,
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: 999,
      background: "var(--vellum)",
      transform: on ? "translateX(16px)" : "translateX(0)",
      transition: "transform 220ms",
      boxShadow: "var(--shadow-1)",
    }} />
  </div>
);

// =============================================================
// Messages threads list
// =============================================================
function ThreadsSection() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="21" name="Threads" sub="messages organized by scene — user writes both sides" />

      <Stack gap={8}>
        <Thread
          title="Good morning texts"
          preview="okay. wear the green coat."
          time="11:42p"
          count={28}
          tint="var(--sakura-deep)"
          unread
        />
        <Thread
          title="After the battle"
          preview="i told you i'd be fine."
          time="yesterday"
          count={12}
          tint="var(--lavender-deep)"
        />
        <Thread
          title="When she's away"
          preview="thinking of you. don't reply."
          time="Mon"
          count={47}
          tint="var(--peach-deep)"
        />
        <Thread
          title="The argument we never had"
          preview="i wish you would just say it."
          time="2w"
          count={5}
          tint="var(--ember)"
          muted
        />
      </Stack>
    </div>
  );
}

const Thread = ({ title, preview, time, count, tint, unread, muted }) => (
  <Row gap={12} align="center" style={{
    padding: "12px 14px",
    background: "var(--vellum)",
    border: `1px solid ${unread ? tint : "var(--line)"}`,
    borderRadius: "var(--r-3)",
    opacity: muted ? 0.7 : 1,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 999,
      background: `${tint}20`,
      border: `1px solid ${tint}40`,
      display: "grid", placeItems: "center",
      color: tint,
      flexShrink: 0,
    }}>
      <Heart size={14} color={tint} outline />
    </div>
    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
      <Row gap={8} align="baseline" style={{ justifyContent: "space-between" }}>
        <Row gap={6} align="center">
          <span className="ys-serif" style={{ fontSize: 17, fontStyle: "italic", lineHeight: 1 }}>{title}</span>
          {unread && <span style={{ width: 6, height: 6, borderRadius: 999, background: tint }} />}
        </Row>
        <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{time}</span>
      </Row>
      <Row gap={6} align="center">
        <span style={{ fontSize: 12, color: "var(--ink-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: "italic", fontFamily: "var(--font-display)" }}>
          {preview}
        </span>
        <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{count}</span>
      </Row>
    </Stack>
  </Row>
);

Object.assign(window, {
  YS_SubTabBarSection: SubTabBarSection,
  YS_SubTabBar: SubTabBar,
  YS_HeadcanonsSection: HeadcanonsSection,
  YS_PlaylistSection: PlaylistSection,
  YS_AestheticBoardSection: AestheticBoardSection,
  YS_PolyculeSection: PolyculeSection,
  YS_UpcomingSection: UpcomingSection,
  YS_SettingsSection: SettingsSection,
  YS_ThreadsSection: ThreadsSection,
  YS_TABS: TABS,
});
