/* ============================================================
   yumeship — screens.jsx (spec v2)
   Five mobile screens matching SPEC.md:
     1 · Home (Ships)       — 4 bottom tabs, F/O grid
     2 · F/O Detail         — Profile sub-tab visible
     3 · Messages thread    — bubbles
     4 · Upcoming           — global anniversary list
     5 · Settings           — app lock, notifs, data, pro
   ============================================================ */

const { IOSDevice } = window;
const { YS_Mark: Mark, YS_I: I, YS_Bubble: Bubble, YS_Chip: Chip,
        YS_ph: ph,
        YS_Heart: Heart, YS_Sparkle: Sparkle, YS_SparkleCluster: SparkleCluster,
        YS_Sakura: Sakura, YS_Star: Star,
        YS_WashiTape: WashiTape, YS_Seal: Seal, YS_Pin: Pin,
        YS_TABS: TABS } = window;

// Common screen wrap — IOSDevice handles island/status/home indicator
function Screen({ children, bg = "var(--paper)" }) {
  return (
    <IOSDevice width={340} height={720}>
      <div style={{
        width: "100%", minHeight: "100%", background: bg,
        display: "flex", flexDirection: "column",
        paddingTop: 56,
        paddingBottom: 34,
        fontFamily: "var(--font-ui)",
        color: "var(--ink)",
      }}>
        {children}
      </div>
    </IOSDevice>
  );
}

// 4 root tabs (per spec)
const ROOT_TABS = [
  { id: "home",      ja: "船",   label: "Home" },
  { id: "templates", ja: "型",   label: "Templates" },
  { id: "upcoming",  ja: "次",   label: "Upcoming" },
  { id: "settings",  ja: "設",   label: "Settings" },
];

function RootTabBar({ active = "home" }) {
  return (
    <div style={{ padding: "4px 14px 8px", display: "flex", justifyContent: "center" }}>
      <div style={{
        background: "var(--vellum)",
        borderRadius: 999,
        border: "1px solid var(--line)",
        padding: 5,
        display: "flex", gap: 2,
        boxShadow: "var(--shadow-2)",
      }}>
        {ROOT_TABS.map((t) => {
          const on = t.id === active;
          return (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 12px",
              background: on ? "var(--sakura-deep)" : "transparent",
              color: on ? "var(--vellum)" : "var(--ink-2)",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: on ? 600 : 500,
              position: "relative",
            }}>
              {on && (
                <span style={{ position: "absolute", left: -3, top: -3 }}>
                  <Sparkle size={9} color="var(--butter)" />
                </span>
              )}
              <span className="ys-ja" style={{ fontSize: 11, opacity: on ? 1 : 0.55 }}>{t.ja}</span>
              <span>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SmallIcon = ({ children }) => (
  <div style={{
    width: 32, height: 32, borderRadius: 999,
    background: "var(--vellum)",
    border: "1px solid var(--line)",
    display: "grid", placeItems: "center",
    color: "var(--ink-2)",
  }}>{children}</div>
);

// =============================================================
// SCREEN 1: Home (Ships)
// =============================================================
function ScreenHome() {
  return (
    <Screen>
      {/* Header */}
      <div style={{ padding: "8px 22px 4px" }}>
        <Row style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Mark size={26} />
          <Row gap={6}>
            <SmallIcon>{I.search}</SmallIcon>
            <SmallIcon>{I.plus}</SmallIcon>
          </Row>
        </Row>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 14 }}>
          <div className="ys-serif" style={{ fontSize: 38, lineHeight: 1, fontStyle: "italic", letterSpacing: "-0.01em" }}>
            your ships
          </div>
          <Sparkle size={16} color="var(--sakura-deep)" />
        </div>
        <div className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", marginTop: 8 }}>
          3 F/Os · 142 ENTRIES · 1 POLYCULE
        </div>
      </div>

      {/* F/O grid */}
      <div style={{
        flex: 1, overflow: "hidden",
        padding: "10px 14px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
      }}>
        <ShipCard
          name="Kafka" src="HSR"
          type="romantic" typeColor="var(--sakura-deep)"
          grad="linear-gradient(160deg, #dca8c2 0%, #6b3d5b 100%)"
          initial="K"
          pinned polycule
          days="1y 47d"
          tape={{ pattern: "heart", color: "#fff" }}
        />
        <ShipCard
          name="Childe" src="Genshin"
          type="romantic" typeColor="var(--sakura-deep)"
          grad="linear-gradient(160deg, #e0a98c 0%, #8b4a3a 100%)"
          initial="C"
          days="278d"
          tape={{ pattern: "stripe", color: "var(--peach)" }}
        />
        <ShipCard
          name="Basil" src="OMORI"
          type="platonic" typeColor="var(--sage-deep)"
          grad="linear-gradient(160deg, #b4c8a5 0%, #4d6347 100%)"
          initial="B"
          days="92d"
          tape={{ pattern: "dot", color: "var(--sage)" }}
        />
        {/* Add new */}
        <div style={{
          aspectRatio: "3 / 4",
          border: "1.5px dashed var(--line-strong)",
          borderRadius: "var(--r-4)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 8, color: "var(--ink-2)",
          background: "rgba(243,182,196,0.08)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 999,
            background: "var(--sakura-soft)",
            display: "grid", placeItems: "center",
            color: "var(--sakura-deep)",
          }}>{I.plus}</div>
          <div className="ys-serif" style={{ fontSize: 14, fontStyle: "italic", textAlign: "center", padding: "0 8px", lineHeight: 1.2 }}>
            start a new ship
          </div>
        </div>
      </div>

      <RootTabBar active="home" />
    </Screen>
  );
}

function ShipCard({ name, src, type, typeColor, grad, initial, pinned, polycule, days, tape }) {
  return (
    <div style={{
      aspectRatio: "3 / 4",
      borderRadius: "var(--r-4)",
      background: "var(--vellum)",
      border: "1px solid var(--line)",
      boxShadow: "var(--shadow-1)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      {/* cover */}
      <div style={{
        flex: 1, position: "relative",
        background: grad,
        overflow: "hidden",
      }}>
        <div className="placeholder-stripe" style={{ position: "absolute", inset: 0, opacity: 0.15 }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 56,
          color: "rgba(255,255,255,0.92)",
        }}>{initial}</div>

        {/* washi tape */}
        <div style={{ position: "absolute", top: 0, left: -8 }}>
          <WashiTape width={56} height={14} pattern={tape.pattern} color={tape.color} rotate={-6} />
        </div>

        {/* pin */}
        {pinned && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            width: 22, height: 22, borderRadius: 999,
            background: "var(--vellum)",
            display: "grid", placeItems: "center",
            boxShadow: "var(--shadow-1)",
          }}>
            <Pin size={11} color="var(--sakura-deep)" />
          </div>
        )}

        {/* polycule */}
        {polycule && (
          <div style={{
            position: "absolute", bottom: 8, right: 8,
            padding: "2px 7px",
            background: "rgba(110,58,90,0.92)",
            color: "var(--vellum)",
            fontSize: 9, fontWeight: 600,
            borderRadius: 999,
            letterSpacing: "0.06em",
          }}>✶ poly</div>
        )}
      </div>

      {/* meta */}
      <div style={{ padding: "8px 10px", background: "var(--vellum)" }}>
        <Row align="center" style={{ justifyContent: "space-between", display: "flex" }}>
          <div className="ys-serif" style={{ fontSize: 18, fontStyle: "italic", lineHeight: 1.1 }}>{name}</div>
          <div style={{
            width: 8, height: 8, borderRadius: 999, background: typeColor,
          }} title={type} />
        </Row>
        <Row align="center" style={{ justifyContent: "space-between", marginTop: 2, display: "flex" }}>
          <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{src}</span>
          <span className="ys-mono" style={{ fontSize: 9, color: "var(--ink-3)" }}>{days}</span>
        </Row>
      </div>
    </div>
  );
}

// =============================================================
// SCREEN 2: F/O Detail (Profile tab)
// =============================================================
function ScreenDetail() {
  return (
    <Screen bg="var(--paper)">
      {/* App bar */}
      <div style={{
        padding: "6px 18px 6px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 20, color: "var(--ink-2)" }}>‹</div>
        <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.14em" }}>HONKAI STAR RAIL</span>
        <div style={{ fontSize: 14 }}>{I.edit}</div>
      </div>

      {/* Hero cover */}
      <div style={{
        margin: "4px 16px 0",
        height: 180,
        borderRadius: "var(--r-4)",
        background: "linear-gradient(160deg, #f3b6c4 0%, #c79bb5 45%, #6b3d5b 100%)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--shadow-2)",
      }}>
        <div className="placeholder-stripe" style={{ position: "absolute", inset: 0, opacity: 0.16 }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 100,
          color: "rgba(255,255,255,0.95)",
          lineHeight: 1,
        }}>K</div>

        {/* washi */}
        <div style={{ position: "absolute", top: -2, left: 14 }}>
          <WashiTape width={90} height={18} pattern="heart" color="#ffffff" rotate={-5} />
        </div>

        {/* pin */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          width: 28, height: 28, borderRadius: 999,
          background: "var(--vellum)",
          display: "grid", placeItems: "center",
          boxShadow: "var(--shadow-1)",
        }}>
          <Pin size={13} color="var(--sakura-deep)" />
        </div>

        {/* sparkle */}
        <div style={{ position: "absolute", top: 30, right: 50 }}>
          <Sparkle size={14} color="var(--butter)" />
        </div>
        <div style={{ position: "absolute", top: 50, right: 65 }}>
          <Sparkle size={8} color="var(--butter-soft)" />
        </div>

        {/* chips */}
        <Row gap={6} style={{ position: "absolute", bottom: 10, left: 12 }}>
          <Chip color="var(--sakura-deep)" bg="rgba(255,255,255,0.92)">♡ romantic</Chip>
          <Chip color="var(--lavender-deep)" bg="rgba(255,255,255,0.92)">mirror</Chip>
        </Row>
      </div>

      {/* Name */}
      <div style={{ padding: "12px 18px 4px" }}>
        <Row align="center" style={{ justifyContent: "space-between", display: "flex" }}>
          <div className="ys-serif" style={{ fontSize: 32, fontStyle: "italic", lineHeight: 1 }}>Kafka</div>
          <div style={{
            display: "inline-flex", gap: 4, alignItems: "center",
            padding: "3px 8px", fontSize: 9,
            color: "var(--plum)", background: "rgba(110,58,90,0.1)",
            borderRadius: 999, fontWeight: 600, letterSpacing: "0.04em",
          }}>✶ THE HUNTERS</div>
        </Row>
        <div className="ys-ja" style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>
          カフカ · "my whole problem"
        </div>
      </div>

      {/* Sub-tab bar */}
      <div style={{
        padding: "10px 14px 6px",
        overflowX: "auto",
        display: "flex",
      }}>
        <div style={{
          display: "flex", gap: 4,
          padding: 4,
          background: "var(--vellum)",
          border: "1px solid var(--line)",
          borderRadius: 999,
          boxShadow: "var(--shadow-1)",
        }}>
          {TABS.map((t, i) => {
            const on = i === 0;
            return (
              <div key={t.id} style={{
                padding: "6px 11px",
                background: on ? "var(--sakura-deep)" : "transparent",
                color: on ? "var(--vellum)" : "var(--ink-2)",
                borderRadius: 999,
                fontSize: 10, fontWeight: on ? 600 : 500,
                whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {on && <Sparkle size={8} color="var(--butter)" />}
                {t.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile content */}
      <div style={{ padding: "4px 18px 12px", flex: 1, overflow: "hidden" }}>
        {/* Anniversary chip */}
        <Row gap={6} style={{
          padding: "8px 12px",
          background: "var(--sakura-soft)",
          border: "1px solid var(--sakura)",
          borderRadius: "var(--r-3)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <Row gap={6} align="center">
            <Heart size={11} color="var(--sakura-deep)" />
            <span className="ys-serif" style={{ fontSize: 14, fontStyle: "italic", color: "var(--sakura-deep)" }}>
              together 1 year, 47 days
            </span>
          </Row>
          <span className="ys-mono" style={{ fontSize: 9, color: "var(--sakura-deep)" }}>
            since 2024.04.11
          </span>
        </Row>

        {/* About */}
        <div style={{ marginTop: 12 }}>
          <span className="ys-mono" style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            about
          </span>
          <div className="ys-serif" style={{ fontSize: 14, fontStyle: "italic", color: "var(--ink-2)", lineHeight: 1.5, marginTop: 4 }}>
            "she calls me when she shouldn't. I always pick up."
          </div>
        </div>

        {/* Headcanons strip */}
        <div style={{ marginTop: 14 }}>
          <Row align="center" style={{ justifyContent: "space-between", display: "flex" }}>
            <span className="ys-mono" style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              headcanons · 35
            </span>
            <span style={{ fontSize: 10, color: "var(--sakura-deep)", fontWeight: 600 }}>view all ›</span>
          </Row>
          <Row gap={6} wrap style={{ marginTop: 6 }}>
            <MiniHC ja="性" label="Personality" count={8} color="var(--sakura-deep)" />
            <MiniHC ja="癖" label="Habits" count={5} color="var(--lavender-deep)" />
            <MiniHC ja="好" label="Favorites" count={12} color="var(--butter-deep)" />
            <MiniHC ja="逢" label="How met" count={1} color="var(--peach-deep)" />
          </Row>
        </div>
      </div>
    </Screen>
  );
}

const MiniHC = ({ ja, label, count, color }) => (
  <div style={{
    display: "inline-flex", gap: 6, alignItems: "center",
    padding: "5px 10px",
    background: "var(--vellum)",
    border: `1px solid ${color}30`,
    borderRadius: 999,
    fontSize: 10,
  }}>
    <span className="ys-ja" style={{ color, fontWeight: 600, fontSize: 11 }}>{ja}</span>
    <span style={{ color: "var(--ink-2)", fontWeight: 500 }}>{label}</span>
    <span style={{ color, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600 }}>{count}</span>
  </div>
);

// =============================================================
// SCREEN 3: Messages thread (kept from before, refreshed)
// =============================================================
function ScreenMessages() {
  return (
    <Screen bg="var(--paper-deep)">
      {/* App bar */}
      <div style={{
        padding: "8px 16px 12px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--line)",
        background: "var(--paper)",
      }}>
        <span style={{ fontSize: 18, color: "var(--ink-2)" }}>‹</span>
        <Row gap={8} align="center">
          <div style={{
            width: 30, height: 30, borderRadius: 999,
            background: "linear-gradient(140deg, #dca8c2, #6b3d5b)",
            display: "grid", placeItems: "center",
            color: "var(--vellum)",
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 14,
            border: "1.5px solid var(--sakura-deep)",
          }}>K</div>
          <Stack gap={0} style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span className="ys-serif" style={{ fontSize: 16, fontStyle: "italic" }}>Kafka</span>
            <span className="ys-mono" style={{ fontSize: 8, color: "var(--ink-3)", letterSpacing: "0.08em" }}>good morning texts · 28</span>
          </Stack>
        </Row>
        <span style={{ fontSize: 14, color: "var(--ink-2)" }}>{I.lock}</span>
      </div>

      {/* Conversation */}
      <div style={{ flex: 1, overflow: "hidden", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{
          textAlign: "center", fontSize: 9,
          color: "var(--ink-3)", fontFamily: "var(--font-mono)",
          letterSpacing: "0.1em",
        }}>TUESDAY · 11:42PM</div>
        <Bubble from="them">you up?</Bubble>
        <Bubble from="them">i'm thinking about that ramen place again</Bubble>
        <Bubble from="me">obviously. it's me you're texting.</Bubble>
        <Bubble from="me">tomorrow. i'll meet you after work.</Bubble>
        <Bubble from="them" reaction="❤">okay. wear the green coat.</Bubble>
      </div>

      {/* Composer w/ side toggle */}
      <div style={{
        padding: "8px 12px 10px",
        background: "var(--paper)",
        borderTop: "1px solid var(--line)",
      }}>
        {/* who's typing toggle */}
        <Row gap={4} style={{ marginBottom: 8, justifyContent: "center" }}>
          <SideChip>me</SideChip>
          <SideChip active>them ♡</SideChip>
        </Row>
        <Row gap={6} align="center">
          <div style={{
            flex: 1, padding: "9px 14px",
            background: "var(--vellum)",
            border: "1px solid var(--line)",
            borderRadius: 999,
            fontSize: 12, color: "var(--ink-3)",
            fontStyle: "italic",
            fontFamily: "var(--font-display)",
          }}>
            write what they'd say…
          </div>
          <button style={{
            width: 36, height: 36, borderRadius: 999,
            background: "var(--sakura-deep)",
            border: "none",
            display: "grid", placeItems: "center",
            color: "var(--vellum)",
            flexShrink: 0,
          }}>{I.send}</button>
        </Row>
      </div>
    </Screen>
  );
}

const SideChip = ({ children, active }) => (
  <span style={{
    padding: "3px 12px",
    fontSize: 10,
    background: active ? "var(--sakura-deep)" : "var(--paper-deep)",
    color: active ? "var(--vellum)" : "var(--ink-2)",
    borderRadius: 999,
    fontWeight: active ? 600 : 500,
  }}>{children}</span>
);

// =============================================================
// SCREEN 4: Upcoming (anniversaries)
// =============================================================
function ScreenUpcoming() {
  return (
    <Screen>
      <div style={{ padding: "8px 22px 6px" }}>
        <Row style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Mark size={26} />
          <SmallIcon>{I.bell}</SmallIcon>
        </Row>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 14 }}>
          <div className="ys-serif" style={{ fontSize: 34, lineHeight: 1, fontStyle: "italic", letterSpacing: "-0.01em" }}>
            upcoming
          </div>
          <Sakura size={20} />
        </div>
        <Row gap={4} style={{ marginTop: 10 }}>
          <FilterChip active>next 30 days</FilterChip>
          <FilterChip>all upcoming</FilterChip>
          <FilterChip>all time</FilterChip>
        </Row>
      </div>

      <div style={{ flex: 1, overflow: "hidden", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <MiniUpcoming days={3} title="Our anniversary" fo="Kafka" tint="var(--sakura-deep)" featured />
        <MiniUpcoming days={14} title="The day I found him" fo="Childe" tint="var(--peach-deep)" />
        <MiniUpcoming days={41} title="Our song day" fo="Kafka" tint="var(--lavender-deep)" />
        <MiniUpcoming days={78} title="Birthday — Childe" fo="Childe" tint="var(--butter-deep)" />
        <MiniUpcoming days={112} title="In memoriam" fo="Basil" tint="var(--ember)" muted />
      </div>

      <RootTabBar active="upcoming" />
    </Screen>
  );
}

const FilterChip = ({ children, active }) => (
  <span style={{
    padding: "5px 10px",
    fontSize: 10,
    background: active ? "var(--sakura-deep)" : "var(--vellum)",
    color: active ? "var(--vellum)" : "var(--ink-2)",
    border: active ? "none" : "1px solid var(--line)",
    borderRadius: 999,
    fontWeight: active ? 600 : 500,
    letterSpacing: "0.02em",
  }}>{children}</span>
);

const MiniUpcoming = ({ days, title, fo, tint, featured, muted }) => (
  <Row gap={10} align="center" style={{
    padding: "10px 12px",
    background: featured ? "linear-gradient(95deg, var(--sakura-soft), var(--vellum))" : "var(--vellum)",
    border: `1px solid ${featured ? tint : "var(--line)"}`,
    borderRadius: "var(--r-3)",
    position: "relative",
    opacity: muted ? 0.75 : 1,
    display: "flex",
  }}>
    {featured && (
      <span style={{ position: "absolute", top: -5, left: 12 }}>
        <Heart size={12} color={tint} />
      </span>
    )}
    <div style={{
      width: 46, textAlign: "center",
      padding: "5px 0",
      background: `${tint}18`,
      border: `1px solid ${tint}40`,
      borderRadius: "var(--r-2)",
      flexShrink: 0,
    }}>
      <div className="ys-serif" style={{ fontSize: 19, lineHeight: 1, color: tint, fontStyle: "italic", fontWeight: 600 }}>{days}</div>
      <div className="ys-mono" style={{ fontSize: 7, color: tint, letterSpacing: "0.1em", marginTop: 2 }}>DAYS</div>
    </div>
    <Stack gap={2} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
      <span className="ys-serif" style={{ fontSize: 15, fontStyle: "italic", lineHeight: 1.1 }}>{title}</span>
      <span style={{ fontSize: 10, color: "var(--ink-2)" }}>{fo}</span>
    </Stack>
    <Sparkle size={10} color={tint} />
  </Row>
);

// =============================================================
// SCREEN 5: Settings
// =============================================================
function ScreenSettings() {
  return (
    <Screen>
      <div style={{ padding: "8px 22px 6px" }}>
        <Row style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Mark size={26} />
          <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em" }}>v0.1.0</span>
        </Row>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 14 }}>
          <div className="ys-serif" style={{ fontSize: 34, lineHeight: 1, fontStyle: "italic", letterSpacing: "-0.01em" }}>
            settings
          </div>
          <Sparkle size={14} color="var(--lavender-deep)" />
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Pro card */}
        <div style={{
          padding: "14px 16px",
          background: "linear-gradient(160deg, var(--sakura-soft), var(--lavender-soft))",
          border: "1px solid var(--sakura)",
          borderRadius: "var(--r-4)",
          position: "relative",
          overflow: "hidden",
        }}>
          <span style={{ position: "absolute", top: 8, right: 10 }}>
            <SparkleCluster color="var(--sakura-deep)" />
          </span>
          <Row gap={5} align="center">
            <Heart size={12} color="var(--sakura-deep)" />
            <span className="ys-mono" style={{ fontSize: 9, color: "var(--sakura-deep)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
              yumeship pro
            </span>
          </Row>
          <div className="ys-serif" style={{ fontSize: 18, lineHeight: 1.15, fontStyle: "italic", marginTop: 4 }}>
            iCloud sync.<br/>Coming soon.
          </div>
        </div>

        {/* App lock group */}
        <MiniGroup ja="鍵" name="App lock">
          <MiniSetting icon={I.lock} label="Face ID lock" trailing={<MiniToggle on />} />
          <MiniSetting label="Timeout" trailing={<span style={{ fontSize: 11, color: "var(--ink-3)" }}>1 min</span>} />
        </MiniGroup>

        {/* Notifications group */}
        <MiniGroup ja="便" name="Notifications">
          <MiniSetting icon={I.bell} label="Allow notifications" trailing={<MiniToggle on />} />
          <MiniSetting label="Discreet preview" trailing={<MiniToggle on />} />
        </MiniGroup>

        <MiniGroup ja="蔵" name="Data">
          <MiniSetting label="Storage" trailing={<span style={{ fontSize: 11, color: "var(--ink-3)" }}>142 MB</span>} />
          <MiniSetting label="Delete all" destructive />
        </MiniGroup>
      </div>

      <RootTabBar active="settings" />
    </Screen>
  );
}

const MiniGroup = ({ ja, name, children }) => (
  <Stack gap={5} style={{ display: "flex", flexDirection: "column" }}>
    <Row gap={5} align="center">
      <span className="ys-ja" style={{ fontSize: 11, color: "var(--sakura-deep)", fontWeight: 600 }}>{ja}</span>
      <span className="ys-mono" style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>{name}</span>
    </Row>
    <div style={{
      background: "var(--vellum)",
      border: "1px solid var(--line)",
      borderRadius: "var(--r-3)",
      overflow: "hidden",
    }}>{children}</div>
  </Stack>
);

const MiniSetting = ({ icon, label, trailing, destructive }) => (
  <Row gap={8} align="center" style={{
    padding: "9px 12px",
    background: "var(--vellum)",
    borderBottom: "1px solid var(--paper-deep)",
    display: "flex",
  }}>
    {icon && (
      <span style={{
        width: 22, height: 22, borderRadius: 5,
        background: "var(--paper-deep)",
        display: "grid", placeItems: "center",
        color: destructive ? "var(--ember)" : "var(--ink-2)",
        flexShrink: 0,
      }}>{icon}</span>
    )}
    <span style={{ flex: 1, fontSize: 12, color: destructive ? "var(--ember)" : "var(--ink)", fontWeight: 500 }}>{label}</span>
    {trailing}
  </Row>
);

const MiniToggle = ({ on }) => (
  <div style={{
    width: 34, height: 20, borderRadius: 999,
    background: on ? "var(--sakura-deep)" : "var(--line-strong)",
    padding: 2, display: "flex", alignItems: "center",
    flexShrink: 0,
  }}>
    <div style={{
      width: 16, height: 16, borderRadius: 999,
      background: "var(--vellum)",
      transform: on ? "translateX(14px)" : "translateX(0)",
    }} />
  </div>
);

Object.assign(window, {
  YS_ScreenHome: ScreenHome,
  YS_ScreenDetail: ScreenDetail,
  YS_ScreenMessages: ScreenMessages,
  YS_ScreenUpcoming: ScreenUpcoming,
  YS_ScreenSettings: ScreenSettings,
  YS_RootTabBar: RootTabBar,
});
