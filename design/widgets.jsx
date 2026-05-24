/* ============================================================
   yumeship — widgets.jsx
   Widget pack: lock-screen + home-screen widgets in three sizes.
     · Lock screen mock with three widgets overlaid
     · Home screen mock with a widget grid
     · Gallery of all 6 widget designs as standalone tiles
   ============================================================ */

const { IOSDevice } = window;
const { YS_Mark: Mark, YS_I: I, YS_Heart: Heart, YS_Sparkle: Sparkle,
        YS_SparkleCluster: SparkleCluster, YS_Sakura: Sakura,
        YS_WashiTape: WashiTape, YS_Pin: Pin, YS_Star: Star,
        YS_tileStyle: tileStyle, YS_SectionLabel: SectionLabel } = window;

// =============================================================
// WIDGET PRIMITIVES — six designs
// =============================================================

// Inline (lock screen) — single-line text-only
function WidgetInline({ size = "sm" }) {
  return (
    <div style={{
      padding: "4px 12px",
      background: "rgba(255,255,255,0.18)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: 12,
      color: "#fff",
      fontFamily: "var(--font-ui)",
      fontSize: 12, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 6,
      letterSpacing: "0.02em",
    }}>
      <Heart size={11} color="#fff" outline />
      <span>3d to Kafka anniv ♡</span>
    </div>
  );
}

// Circle (lock screen) — days countdown
function WidgetCircleDays({ days = 3 }) {
  return (
    <div style={{
      width: 56, height: 56,
      background: "rgba(255,255,255,0.16)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: 999,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      color: "#fff",
      fontFamily: "var(--font-ui)",
      position: "relative",
    }}>
      <span className="ys-serif" style={{ fontSize: 22, lineHeight: 1, fontStyle: "italic", fontWeight: 600 }}>{days}</span>
      <span style={{ fontSize: 7, opacity: 0.85, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>days</span>
      <span style={{ position: "absolute", top: -4, right: -2 }}>
        <Heart size={11} color="#fff" />
      </span>
    </div>
  );
}

// Rectangle (lock screen) — "today's prompt"
function WidgetRectPrompt() {
  return (
    <div style={{
      width: 158, padding: "8px 12px",
      background: "rgba(255,255,255,0.16)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: 14,
      color: "#fff",
      fontFamily: "var(--font-ui)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, opacity: 0.85 }}>
          today's prompt
        </span>
        <Sparkle size={9} color="#fff" />
      </div>
      <div className="ys-serif" style={{ fontSize: 12, lineHeight: 1.3, fontStyle: "italic", marginTop: 4 }}>
        "what would they pack you for lunch?"
      </div>
    </div>
  );
}

// Home screen — Small widget · F/O of the day
function WidgetSmall({ name = "Kafka", initial = "K", grad = "linear-gradient(140deg, #dca8c2, #6b3d5b)" }) {
  return (
    <div style={{
      width: 140, height: 140, borderRadius: 22,
      background: "var(--vellum)",
      border: "1px solid var(--line)",
      boxShadow: "var(--shadow-2)",
      padding: 12,
      display: "flex", flexDirection: "column",
      fontFamily: "var(--font-ui)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -4, left: 16 }}>
        <WashiTape width={50} height={12} pattern="heart" color="var(--sakura-deep)" rotate={-6} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 999,
          background: grad,
          display: "grid", placeItems: "center",
          color: "#fff",
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 22,
        }}>{initial}</div>
        <Heart size={11} color="var(--sakura-deep)" />
      </div>
      <div style={{ marginTop: 6 }}>
        <span className="ys-mono" style={{ fontSize: 8, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>together</span>
        <div className="ys-serif" style={{ fontSize: 16, lineHeight: 1, fontStyle: "italic", color: "var(--ink)", marginTop: 2 }}>{name}</div>
        <div className="ys-mono" style={{ fontSize: 10, color: "var(--ink-2)", marginTop: 4, fontWeight: 600 }}>1y 47d</div>
      </div>
    </div>
  );
}

// Home screen — Medium widget · scenario excerpt
function WidgetMedium() {
  return (
    <div style={{
      width: 300, height: 140, borderRadius: 22,
      background: "linear-gradient(165deg, var(--vellum), var(--sakura-soft))",
      border: "1px solid var(--sakura)",
      boxShadow: "var(--shadow-2)",
      padding: 14,
      fontFamily: "var(--font-ui)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 8, right: 12 }}>
        <Sparkle size={11} color="var(--sakura-deep)" />
      </div>

      <div style={{ display: "flex", gap: 12, height: "100%" }}>
        <div style={{
          width: 70, borderRadius: 12,
          background: "linear-gradient(140deg, #dca8c2, #6b3d5b)",
          display: "grid", placeItems: "center",
          color: "#fff",
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: 30,
          flexShrink: 0,
          position: "relative",
        }}>
          K
          <span style={{ position: "absolute", top: 4, right: 4 }}>
            <Heart size={10} color="#fff" outline />
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <span className="ys-mono" style={{ fontSize: 8, color: "var(--sakura-deep)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
            ♡ latest scene
          </span>
          <div className="ys-serif" style={{ fontSize: 15, lineHeight: 1.1, fontStyle: "italic", color: "var(--ink)", marginTop: 4 }}>
            Rain on the way home.
          </div>
          <div style={{ fontSize: 10, color: "var(--ink-2)", lineHeight: 1.4, marginTop: 4, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
            "he held the umbrella too far to his own side again. i noticed."
          </div>
          <span className="ys-mono" style={{ fontSize: 9, color: "var(--ink-3)", marginTop: "auto" }}>3w ago · 03 · 12</span>
        </div>
      </div>
    </div>
  );
}

// Home screen — Large widget · ships index
function WidgetLarge() {
  const ships = [
    { name: "Kafka", days: "1y 47d", initial: "K", grad: "linear-gradient(140deg, #dca8c2, #6b3d5b)", tint: "var(--sakura-deep)", pinned: true },
    { name: "Childe", days: "278d", initial: "C", grad: "linear-gradient(140deg, #e0a98c, #8b4a3a)", tint: "var(--peach-deep)" },
    { name: "Basil", days: "92d", initial: "B", grad: "linear-gradient(140deg, #b4c8a5, #4d6347)", tint: "var(--sage-deep)" },
  ];
  return (
    <div style={{
      width: 300, height: 300, borderRadius: 22,
      background: "var(--vellum)",
      border: "1px solid var(--line)",
      boxShadow: "var(--shadow-2)",
      padding: 16,
      fontFamily: "var(--font-ui)",
      position: "relative",
      overflow: "hidden",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Mark size={18} />
          <span className="ys-serif" style={{ fontSize: 16, fontStyle: "italic" }}>your ships</span>
        </div>
        <Sparkle size={11} color="var(--sakura-deep)" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {ships.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 10px",
            background: i === 0 ? "var(--sakura-soft)" : "var(--paper-soft)",
            border: `1px solid ${i === 0 ? "var(--sakura)" : "var(--line)"}`,
            borderRadius: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 999,
              background: s.grad,
              display: "grid", placeItems: "center",
              color: "#fff",
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: 14,
              flexShrink: 0,
              border: `1.5px solid ${s.tint}`,
            }}>{s.initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span className="ys-serif" style={{ fontSize: 14, fontStyle: "italic", lineHeight: 1 }}>{s.name}</span>
                {s.pinned && <Pin size={10} color="var(--sakura-deep)" />}
              </div>
              <span className="ys-mono" style={{ fontSize: 9, color: "var(--ink-3)" }}>{s.days}</span>
            </div>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: s.tint }} />
          </div>
        ))}
      </div>

      <div style={{
        textAlign: "center", fontSize: 9, color: "var(--ink-3)",
        fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
      }}>3 ships · 142 entries</div>
    </div>
  );
}

// =============================================================
// LOCK SCREEN MOCKUP — phone with widgets overlaid
// =============================================================
function LockScreenMock() {
  return (
    <IOSDevice width={340} height={720} dark>
      <div style={{
        width: "100%", height: "100%",
        background: `
          radial-gradient(circle at 30% 20%, #6b3d5b 0%, #2b1a26 50%, #0e0610 100%)
        `,
        position: "relative",
        display: "flex", flexDirection: "column",
        paddingTop: 56, paddingBottom: 34,
        color: "#fff",
        overflow: "hidden",
      }}>
        {/* soft sakura bg sparkles */}
        {[[40,80,14],[280,140,10],[80,260,8],[260,400,12],[120,520,9]].map(([x,y,s], i) => (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: 0.4 }}>
            <Sparkle size={s} color="#fff" />
          </div>
        ))}

        {/* Time */}
        <div style={{ textAlign: "center", paddingTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>Tuesday, May 26</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 80, lineHeight: 0.95, fontWeight: 300, marginTop: 4, letterSpacing: "-0.02em" }}>
            11:42
          </div>
        </div>

        {/* Inline widget row */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <WidgetInline />
        </div>

        {/* Circle widgets row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
          <WidgetCircleDays days={3} />
          <div style={{
            width: 56, height: 56,
            background: "rgba(255,255,255,0.16)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            borderRadius: 999,
            display: "grid", placeItems: "center",
            color: "#fff", position: "relative",
          }}>
            <Mark size={28} color="#fff" />
          </div>
          <div style={{
            width: 56, height: 56,
            background: "rgba(255,255,255,0.16)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            borderRadius: 999,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "#fff",
          }}>
            <span style={{ fontSize: 16 }}>♡</span>
            <span style={{ fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, opacity: 0.85, marginTop: 2 }}>scene</span>
          </div>
        </div>

        {/* Rectangle widget */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <WidgetRectPrompt />
        </div>

        <div style={{ flex: 1 }} />

        {/* Discreet notification */}
        <div style={{
          margin: "0 14px 14px",
          padding: "10px 14px",
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderRadius: 14,
          display: "flex", alignItems: "center", gap: 10,
          color: "#fff",
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: "rgba(255,255,255,0.2)",
            display: "grid", placeItems: "center",
          }}>
            <Mark size={14} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 11, fontWeight: 600 }}>journal</span>
              <span style={{ fontSize: 9, opacity: 0.7, letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>now</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.95, marginTop: 1, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
              don't forget to write today.
            </div>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// =============================================================
// HOME SCREEN MOCKUP — widgets on home screen with apps
// =============================================================
function HomeScreenMock() {
  const apps = [
    "Messages", "Mail", "Photos", "Camera",
    "Calendar", "Notes", "Maps", "Music",
  ];
  return (
    <IOSDevice width={340} height={720}>
      <div style={{
        width: "100%", height: "100%",
        background: `
          radial-gradient(circle at 50% 30%, #fde0ce 0%, #fadde5 40%, #ece4f7 100%)
        `,
        position: "relative",
        display: "flex", flexDirection: "column",
        paddingTop: 56, paddingBottom: 80,
        overflow: "hidden",
      }}>
        {/* widgets */}
        <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <WidgetSmall />
            <WidgetMedium />
          </div>
        </div>

        {/* sub row of apps */}
        <div style={{
          padding: "16px 22px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          rowGap: 18,
          marginTop: 16,
        }}>
          {/* yumeship app icon */}
          <AppIcon name="yumeship" icon={<Mark size={36} />} bg="var(--vellum)" />
          {apps.slice(0, 7).map((a, i) => (
            <AppIcon key={i} name={a} bg={["#88c1f0", "#7ec0a5", "#f7b274", "#999"][i % 4]} />
          ))}
        </div>

        {/* dock */}
        <div style={{
          position: "absolute", bottom: 38, left: 14, right: 14,
          padding: "10px 16px",
          background: "rgba(255,255,255,0.4)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderRadius: 26,
          display: "flex", justifyContent: "space-around",
        }}>
          <AppIcon dock />
          <AppIcon dock />
          <AppIcon dock />
          <AppIcon dock />
        </div>
      </div>
    </IOSDevice>
  );
}

const AppIcon = ({ name, bg = "#aaa", icon, dock }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
    <div style={{
      width: dock ? 52 : 50, height: dock ? 52 : 50,
      borderRadius: 14,
      background: bg,
      display: "grid", placeItems: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}>
      {icon}
    </div>
    {!dock && name && (
      <span style={{ fontSize: 9, color: "var(--ink)", fontWeight: 500 }}>{name}</span>
    )}
  </div>
);

// =============================================================
// WIDGET GALLERY — all 6 widgets on a single tile
// =============================================================
function WidgetGallery() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="26" name="Widget pack" sub="lock screen · home screen · 6 designs" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, alignItems: "flex-start" }}>
        <WidgetCol title="Lock screen widgets" subtitle="iOS 16+ · glass tinted" dark>
          <Stack gap={14}>
            <Labeled label="Inline · countdown">
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0", background: "linear-gradient(160deg, #6b3d5b, #2b1a26)", borderRadius: 12 }}>
                <WidgetInline />
              </div>
            </Labeled>
            <Labeled label="Circle · 1×1">
              <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "12px 0", background: "linear-gradient(160deg, #6b3d5b, #2b1a26)", borderRadius: 12 }}>
                <WidgetCircleDays days={3} />
                <div style={{
                  width: 56, height: 56,
                  background: "rgba(255,255,255,0.16)",
                  borderRadius: 999,
                  display: "grid", placeItems: "center",
                }}>
                  <Mark size={28} color="#fff" />
                </div>
              </div>
            </Labeled>
            <Labeled label="Rectangle · 2×1">
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0", background: "linear-gradient(160deg, #6b3d5b, #2b1a26)", borderRadius: 12 }}>
                <WidgetRectPrompt />
              </div>
            </Labeled>
          </Stack>
        </WidgetCol>

        <WidgetCol title="Home screen widgets" subtitle="three sizes · light & color">
          <Stack gap={14}>
            <Labeled label="Small · F/O of the day">
              <div style={{ display: "flex", justifyContent: "center", padding: 12, background: "var(--paper-deep)", borderRadius: 12 }}>
                <WidgetSmall />
              </div>
            </Labeled>
            <Labeled label="Medium · latest scene">
              <div style={{ display: "flex", justifyContent: "center", padding: 12, background: "var(--paper-deep)", borderRadius: 12 }}>
                <WidgetMedium />
              </div>
            </Labeled>
            <Labeled label="Large · ships index">
              <div style={{ display: "flex", justifyContent: "center", padding: 12, background: "var(--paper-deep)", borderRadius: 12 }}>
                <WidgetLarge />
              </div>
            </Labeled>
          </Stack>
        </WidgetCol>
      </div>
    </div>
  );
}

const Stack = ({ children, gap = 8 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap }}>{children}</div>
);

const WidgetCol = ({ title, subtitle, children, dark }) => (
  <div>
    <div style={{ marginBottom: 12 }}>
      <div className="ys-mono" style={{
        fontSize: 10, color: dark ? "var(--plum)" : "var(--sakura-deep)",
        letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
      }}>{title}</div>
      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{subtitle}</div>
    </div>
    {children}
  </div>
);

const Labeled = ({ label, children }) => (
  <div>
    <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
    <div style={{ marginTop: 4 }}>{children}</div>
  </div>
);

Object.assign(window, {
  YS_LockScreenMock: LockScreenMock,
  YS_HomeScreenMock: HomeScreenMock,
  YS_WidgetGallery: WidgetGallery,
});
