/* ============================================================
   yumeship — cards.jsx
   Domain components: F/O card, scenarios, outfits, anniversaries,
   timeline, messages, mood board, notifications.
   ============================================================ */

const { YS_tileStyle: tileStyle, YS_SectionLabel: SectionLabel, YS_Row: Row,
        YS_Stack: Stack, YS_Field: Field, YS_Btn: Btn, YS_Chip: Chip,
        YS_ph: ph, YS_I: I, YS_Mark: Mark } = window;

// ------- F/O profile card -------
function FOCardSection() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="07" name="F/O card" sub="the centerpiece — type · sharing · pin · polycule" />

      <Row gap={24} align="flex-start">
        <FOCard />
        <Stack gap={10} style={{ maxWidth: 240 }}>
          <Anatomy n="01" label="Cover image" body="User-set. Soft-clipped, with washi tape detail." />
          <Anatomy n="02" label="Type · sharing" body="Romantic/platonic/familial. NG/welcome/mirror." />
          <Anatomy n="03" label="Pin · polycule" body="Pin to top of home. Group indicator if part of a polycule." />
          <Anatomy n="04" label="From-line" body="Source media in mono. Italic display for the name." />
          <Anatomy n="05" label="Anniversary" body="Days together — always present, never loud." />
          <Anatomy n="06" label="Pocket" body="Quick jumps into the seven detail tabs." />
        </Stack>
      </Row>
    </div>
  );
}

const Anatomy = ({ n, label, body }) => (
  <Row gap={10} align="flex-start">
    <span className="ys-mono" style={{
      fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em",
      minWidth: 24, paddingTop: 2,
    }}>{n}</span>
    <Stack gap={2}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{label}</span>
      <span style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.45 }}>{body}</span>
    </Stack>
  </Row>
);

function FOCard({ width = 340 }) {
  const { YS_WashiTape: WashiTape, YS_Heart: Heart, YS_Pin: Pin,
          YS_Sparkle: Sparkle } = window;
  return (
    <div style={{
      width,
      background: "var(--vellum)",
      borderRadius: "var(--r-5)",
      border: "1px solid var(--line)",
      boxShadow: "var(--shadow-2)",
      overflow: "hidden",
      fontFamily: "var(--font-ui)",
      position: "relative",
    }}>
      {/* Cover image area */}
      <div style={{
        position: "relative", height: 160,
        background: "linear-gradient(160deg, #f3b6c4 0%, #c79bb5 45%, #6b3d5b 100%)",
        overflow: "hidden",
      }}>
        {/* placeholder stripes */}
        <div className="placeholder-stripe" style={{
          position: "absolute", inset: 0, opacity: 0.18,
        }} />
        {/* portrait monogram */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 100,
          color: "rgba(255,255,255,0.92)",
          lineHeight: 1,
          textShadow: "0 2px 12px rgba(110,58,90,0.25)",
        }}>K</div>

        {/* washi tape — top-left */}
        <div style={{ position: "absolute", top: 6, left: -10 }}>
          <WashiTape width={80} height={18} pattern="heart" color="#ffffff" rotate={-8} />
        </div>

        {/* pin indicator — top-right */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          width: 28, height: 28, borderRadius: 999,
          background: "var(--vellum)",
          display: "grid", placeItems: "center",
          boxShadow: "var(--shadow-1)",
        }}>
          <Pin size={14} color="var(--sakura-deep)" />
        </div>

        {/* sparkle accent */}
        <div style={{ position: "absolute", bottom: 14, right: 18 }}>
          <Sparkle size={14} color="var(--butter)" />
        </div>
        <div style={{ position: "absolute", bottom: 26, right: 36 }}>
          <Sparkle size={9} color="var(--butter-soft)" opacity={0.8} />
        </div>

        {/* chips overlay */}
        <Row gap={6} style={{ position: "absolute", bottom: 12, left: 16 }}>
          <Chip color="var(--sakura-deep)" bg="rgba(255,255,255,0.92)">♡ romantic</Chip>
          <Chip color="var(--lavender-deep)" bg="rgba(255,255,255,0.92)">mirror</Chip>
        </Row>
      </div>

      <Stack gap={6} style={{ padding: "16px 24px 4px" }}>
        <Row gap={8} align="center" style={{ justifyContent: "space-between" }}>
          <div className="ys-mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            from · Honkai Star Rail
          </div>
          <div style={{
            display: "inline-flex", gap: 4, alignItems: "center",
            padding: "3px 8px", fontSize: 10,
            color: "var(--plum)", background: "rgba(110,58,90,0.1)",
            borderRadius: 999, fontWeight: 600,
          }}>❖ polycule</div>
        </Row>
        <div className="ys-serif" style={{ fontSize: 36, lineHeight: 1, fontStyle: "italic", letterSpacing: "-0.01em" }}>
          Kafka
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="ys-ja" style={{ fontSize: 14, color: "var(--ink-2)" }}>
            カフカ
          </span>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: "italic" }}>
            · “my whole problem”
          </span>
        </div>
      </Stack>

      {/* anniversary strip */}
      <div style={{
        margin: "16px 24px 0",
        padding: "12px 14px",
        background: "var(--sakura-soft)",
        border: "1px solid var(--sakura)",
        borderRadius: "var(--r-3)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative",
      }}>
        <Stack gap={2}>
          <div className="ys-mono" style={{ fontSize: 10, color: "var(--sakura-deep)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
            together
          </div>
          <div className="ys-serif" style={{ fontSize: 22, lineHeight: 1, fontStyle: "italic", color: "var(--sakura-deep)" }}>
            1 year, 47 days
          </div>
        </Stack>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--sakura-deep)",
          textAlign: "right", lineHeight: 1.4,
        }}>
          since<br />2024.04.11
        </div>
      </div>

      {/* pocket */}
      <Row gap={8} style={{ padding: 20 }}>
        <PocketBtn icon={I.edit} label="Scene" />
        <PocketBtn icon={I.send} label="Message" />
        <PocketBtn icon={I.bookmark} label="Album" />
        <PocketBtn icon={I.bell} label="Dates" />
      </Row>
    </div>
  );
}

const PocketBtn = ({ icon, label }) => (
  <button style={{
    flex: 1, height: 52,
    background: "var(--paper-soft)",
    border: "1px solid var(--line)",
    borderRadius: "var(--r-3)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 4, cursor: "pointer",
    color: "var(--ink)",
  }}>
    {icon}
    <span style={{ fontSize: 11, fontWeight: 500 }}>{label}</span>
  </button>
);

function DevotionRing({ value, size = 100, children }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{
      width: size, height: size, position: "relative",
      display: "grid", placeItems: "center",
    }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--paper-deep)" strokeWidth="3" fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="var(--plum)" strokeWidth="3" fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
          strokeLinecap="round"
        />
      </svg>
      {children}
    </div>
  );
}

// ------- Scenarios / outfits / memories grid -------
function ContentCards() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="08" name="Content cards" sub="scenario · outfit · memory · headcanon" />

      <Row gap={16} wrap align="stretch">
        <ScenarioCard />
        <OutfitCard />
        <MemoryCard />
        <HeadcanonCard />
      </Row>
    </div>
  );
}

function ScenarioCard() {
  return (
    <div style={{
      width: 220, padding: 18,
      background: "var(--vellum)",
      borderRadius: "var(--r-4)",
      border: "1px solid var(--line)",
      display: "flex", flexDirection: "column", gap: 12,
      fontFamily: "var(--font-ui)",
    }}>
      <Row gap={6} align="center" style={{ justifyContent: "space-between" }}>
        <Chip color="var(--lavender-deep)" bg="rgba(182,163,212,0.25)">scenario</Chip>
        <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>03 · 12</span>
      </Row>
      <div className="ys-serif" style={{ fontSize: 22, lineHeight: 1.1, fontStyle: "italic" }}>
        Rain on the way home.
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 }}>
        He held the umbrella too far to his own side again. I noticed. I always notice.
      </div>
      <Row gap={6}>
        <MiniTag>winter</MiniTag>
        <MiniTag>fluff</MiniTag>
      </Row>
    </div>
  );
}

function OutfitCard() {
  return (
    <div style={{
      width: 220, padding: 0,
      background: "var(--vellum)",
      borderRadius: "var(--r-4)",
      border: "1px solid var(--line)",
      overflow: "hidden",
      fontFamily: "var(--font-ui)",
      display: "flex", flexDirection: "column",
    }}>
      {ph("outfit reference", "100%", 140, "1/1")}
      <Stack gap={8} style={{ padding: 16 }}>
        <Row gap={6} style={{ justifyContent: "space-between" }} align="center">
          <Chip color="var(--butter-deep)" bg="rgba(230,193,112,0.3)">outfit</Chip>
          <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>autumn</span>
        </Row>
        <div className="ys-serif" style={{ fontSize: 20, lineHeight: 1.1, fontStyle: "italic" }}>
          Wool coat, scarf I knit
        </div>
        <Row gap={4}>
          <Swatch c="#5a3f33" /><Swatch c="#e0c8a0" /><Swatch c="#8b3a4a" />
        </Row>
      </Stack>
    </div>
  );
}

const Swatch = ({ c }) => (
  <span style={{ width: 14, height: 14, borderRadius: 999, background: c, border: "1px solid rgba(0,0,0,0.06)" }} />
);

function MemoryCard() {
  return (
    <div style={{
      width: 220,
      background: "var(--vellum)",
      borderRadius: "var(--r-4)",
      border: "1px solid var(--line)",
      overflow: "hidden",
      fontFamily: "var(--font-ui)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ position: "relative" }}>
        {ph("paired photo", "100%", 160, "1/1")}
        <div style={{
          position: "absolute", inset: "auto 12px 12px",
          padding: "6px 10px",
          background: "rgba(43,26,38,0.7)",
          color: "var(--vellum)",
          backdropFilter: "blur(8px)",
          fontSize: 11, borderRadius: 999,
          display: "inline-flex", gap: 6, alignItems: "center",
          width: "fit-content",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--sakura)" }} />
          43rd memory
        </div>
      </div>
      <Stack gap={4} style={{ padding: 16 }}>
        <div className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          2025.05.18
        </div>
        <div className="ys-serif" style={{ fontSize: 18, lineHeight: 1.2, fontStyle: "italic" }}>
          The first time he laughed at one of my jokes.
        </div>
      </Stack>
    </div>
  );
}

function HeadcanonCard() {
  return (
    <div style={{
      width: 220, padding: 18,
      background: "linear-gradient(180deg, #fff4e8, #f5e3d2)",
      borderRadius: "var(--r-4)",
      border: "1px solid var(--line)",
      display: "flex", flexDirection: "column", gap: 12,
      fontFamily: "var(--font-ui)",
      position: "relative",
    }}>
      {/* taped corner */}
      <div style={{
        position: "absolute", top: -8, left: 20,
        width: 32, height: 14,
        background: "rgba(232,163,176,0.5)",
        border: "1px solid rgba(196,107,124,0.3)",
        transform: "rotate(-4deg)",
      }} />
      <Chip color="var(--sakura-deep)" bg="rgba(232,163,176,0.3)">headcanon</Chip>
      <div className="ys-serif" style={{ fontSize: 18, lineHeight: 1.25, fontStyle: "italic" }}>
        She hates the smell of jasmine but lies about it because I gave her that perfume.
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-3)", fontStyle: "italic" }}>
        — me, 11:42pm
      </div>
    </div>
  );
}

const MiniTag = ({ children }) => (
  <span style={{
    fontSize: 10,
    padding: "3px 8px",
    background: "var(--paper-deep)",
    color: "var(--ink-2)",
    borderRadius: 4,
    letterSpacing: "0.04em",
    fontFamily: "var(--font-mono)",
  }}>#{children}</span>
);

// ------- Messages / chat bubbles -------
function Messages() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="09" name="Messages" sub="imagined texts — never sent, always read" />

      <div style={{
        background: "var(--paper-deep)",
        borderRadius: "var(--r-4)",
        padding: 24,
        display: "flex", flexDirection: "column", gap: 14,
        maxWidth: 460, flex: 1,
      }}>
        <DayLabel>Tuesday, 11:42pm</DayLabel>
        <Bubble from="them">
          you up?
        </Bubble>
        <Bubble from="them">
          i'm thinking about that ramen place again
        </Bubble>
        <Bubble from="me">
          obviously. it's me you're texting.
        </Bubble>
        <Bubble from="me" status="read">
          tomorrow. i'll meet you after work.
        </Bubble>
        <Bubble from="them" reaction="❤">
          okay. wear the green coat.
        </Bubble>
        <TypingBubble />
      </div>
    </div>
  );
}

const DayLabel = ({ children }) => (
  <div style={{
    textAlign: "center",
    fontSize: 11,
    color: "var(--ink-3)",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.1em",
  }}>{children}</div>
);

const Bubble = ({ children, from, status, reaction }) => {
  const isMe = from === "me";
  return (
    <div style={{
      display: "flex",
      justifyContent: isMe ? "flex-end" : "flex-start",
      position: "relative",
    }}>
      <div style={{
        maxWidth: "75%",
        padding: "10px 14px",
        background: isMe ? "var(--sakura-deep)" : "var(--vellum)",
        color: isMe ? "var(--vellum)" : "var(--ink)",
        borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        fontSize: 14,
        lineHeight: 1.45,
        border: isMe ? "none" : "1px solid var(--line)",
        boxShadow: "var(--shadow-1)",
        position: "relative",
      }}>
        {children}
        {reaction && (
          <span style={{
            position: "absolute",
            bottom: -8,
            [isMe ? "left" : "right"]: -6,
            fontSize: 14,
            background: "var(--vellum)",
            width: 22, height: 22,
            borderRadius: 999,
            display: "grid", placeItems: "center",
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
          }}>{reaction}</span>
        )}
        {status && (
          <div style={{
            position: "absolute",
            bottom: -16, right: 0,
            fontSize: 10,
            color: "var(--ink-3)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.05em",
          }}>{status}</div>
        )}
      </div>
    </div>
  );
};

const TypingBubble = () => (
  <div style={{ display: "flex", justifyContent: "flex-start" }}>
    <div style={{
      padding: "10px 14px",
      background: "var(--vellum)",
      borderRadius: "18px 18px 18px 4px",
      border: "1px solid var(--line)",
      display: "flex", gap: 4,
    }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: 999,
          background: "var(--ink-3)",
          opacity: 0.6,
          animation: `bounce 1.2s ${i * 0.15}s infinite ease-in-out`,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.3 } 40% { transform: translateY(-4px); opacity: 1 } }`}</style>
    </div>
  </div>
);

// ------- Timeline / storyline -------
function Timeline() {
  const events = [
    { d: "2024.04.11", label: "We met", body: "Watched the first cutscene. Knew immediately.", tier: "var(--sakura-deep)", anchor: true },
    { d: "2024.05.02", label: "Named our song", body: "“Lush Moss” — track 14 from the OST.", tier: "var(--lavender-deep)" },
    { d: "2024.09.22", label: "First fight", body: "I wrote 1,200 words of a scenario where she left. Then 2,400 where she came back.", tier: "var(--ember)" },
    { d: "2025.02.14", label: "Anniversary", body: "Made a paired bento. Took a polaroid of just the bento.", tier: "var(--butter-deep)" },
    { d: "Today",      label: "Devotion: riako", body: "It's been a year. It feels like always.", tier: "var(--plum)", now: true },
  ];

  return (
    <div style={tileStyle}>
      <SectionLabel pre="10" name="Storyline" sub="the timeline of your ship" />

      <div style={{ position: "relative", paddingLeft: 28 }}>
        <div style={{
          position: "absolute", left: 6, top: 8, bottom: 8,
          width: 1, background: "var(--line)",
        }} />
        <Stack gap={22}>
          {events.map((e, i) => (
            <Row key={i} gap={20} align="flex-start">
              <div style={{
                position: "absolute", left: 0,
                width: 13, height: 13, borderRadius: 999,
                background: e.now ? e.tier : "var(--paper-soft)",
                border: `2px solid ${e.tier}`,
                marginTop: 4,
                boxShadow: e.now ? `0 0 0 6px ${e.tier}22` : "none",
              }} />
              <Stack gap={4} style={{ flex: 1 }}>
                <Row gap={10} align="baseline">
                  <span className="ys-mono" style={{
                    fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em",
                    minWidth: 86,
                  }}>{e.d}</span>
                  <span className="ys-serif" style={{ fontSize: 22, lineHeight: 1, fontStyle: "italic", color: e.tier }}>
                    {e.label}
                  </span>
                  {e.anchor && <Chip color="var(--ink-3)" bg="var(--paper-deep)">anchor</Chip>}
                </Row>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, paddingLeft: 96 }}>
                  {e.body}
                </div>
              </Stack>
            </Row>
          ))}
        </Stack>
      </div>
    </div>
  );
}

// ------- Notifications -------
function Notifications() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="11" name="Private notifications" sub="reminders only you can read" />

      <Stack gap={10}>
        <NotifCard
          time="08:14"
          from="Kafka"
          body="don't skip breakfast today, alright?"
          tier="var(--sakura-deep)"
        />
        <NotifCard
          time="12:00"
          from="anniversary · 1 year"
          body="It's been a year since you first met."
          tier="var(--butter-deep)"
          accent
        />
        <NotifCard
          time="22:30"
          from="storyline · weekly"
          body="You haven't written this week. Want to pick up from rainy Tuesday?"
          tier="var(--lavender-deep)"
        />
      </Stack>
    </div>
  );
}

const NotifCard = ({ time, from, body, tier, accent }) => (
  <Row gap={14} align="flex-start" style={{
    padding: "14px 16px",
    background: accent ? "linear-gradient(95deg, rgba(230,193,112,0.15), var(--vellum))" : "var(--vellum)",
    borderRadius: "var(--r-3)",
    border: "1px solid var(--line)",
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: "var(--r-2)",
      background: `${tier}1f`, border: `1px solid ${tier}40`,
      display: "grid", placeItems: "center",
      color: tier,
      flexShrink: 0,
    }}>
      <Mark size={18} color={tier} />
    </div>
    <Stack gap={2} style={{ flex: 1 }}>
      <Row gap={8} align="baseline" style={{ justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: tier, letterSpacing: "0.01em" }}>{from}</span>
        <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{time}</span>
      </Row>
      <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.4, fontStyle: accent ? "italic" : "normal", fontFamily: accent ? "var(--font-display)" : "var(--font-ui)" }}>
        {body}
      </div>
    </Stack>
  </Row>
);

// ------- Mood board / album grid -------
function Moodboard() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="12" name="Album · mood board" />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridAutoRows: 90,
        gap: 8,
      }}>
        <Tile span={[2, 2]} label="hero · paired art" />
        <Tile label="screencap" />
        <Tile label="hand · ref" />
        <Tile label="poem" textTile body="“The way her hair caught the late light, like a coin pressed flat into the day.”" />
        <Tile label="palette">
          <Row gap={4}>
            <Sw c="#8b3a4a" /><Sw c="#e0c8a0" /><Sw c="#2b1a26" /><Sw c="#c46b7c" />
          </Row>
        </Tile>
        <Tile span={[1, 2]} label="full body" />
        <Tile label="audio" mono="track 14 · ost" />
        <Tile label="screencap" />
        <Tile label="quote" textTile body="“obviously. it's me you're texting.”" />
      </div>
    </div>
  );
}

const Sw = ({ c }) => <span style={{ width: 16, height: 16, borderRadius: 999, background: c }} />;

const Tile = ({ span = [1, 1], label, body, mono, textTile, children }) => (
  <div style={{
    gridColumn: `span ${span[0]}`,
    gridRow: `span ${span[1]}`,
    background: textTile ? "var(--paper-deep)" : "var(--paper-soft)",
    borderRadius: "var(--r-3)",
    border: "1px solid var(--line)",
    padding: 12,
    display: "flex", flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
  }}>
    {!textTile && !children && (
      <div className="placeholder-stripe" style={{
        position: "absolute", inset: 0, opacity: 0.6,
      }} />
    )}
    {textTile && body && (
      <div className="ys-serif" style={{
        fontSize: 13, lineHeight: 1.35, fontStyle: "italic",
        color: "var(--ink-2)",
      }}>{body}</div>
    )}
    {children && (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
        {children}
      </div>
    )}
    <div className="ys-mono" style={{
      position: "relative",
      fontSize: 9, color: "var(--ink-3)",
      letterSpacing: "0.1em", textTransform: "uppercase",
      alignSelf: "flex-end",
      background: "var(--vellum)",
      padding: "2px 6px",
      borderRadius: 4,
    }}>{mono || label}</div>
  </div>
);

// ------- Navigation (tab bar + app bar) -------
function Navigation() {
  return (
    <div style={tileStyle}>
      <SectionLabel pre="13" name="Navigation" sub="top bar · bottom tabs · context menu" />

      {/* App bar */}
      <div style={{
        background: "var(--vellum)",
        borderRadius: "var(--r-3)",
        border: "1px solid var(--line)",
        padding: "14px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Row gap={10} align="center">
          <Mark size={28} />
          <Stack gap={0}>
            <span className="ys-serif" style={{ fontSize: 18, fontStyle: "italic", lineHeight: 1 }}>Kafka</span>
            <span className="ys-mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em" }}>1y 47d together</span>
          </Stack>
        </Row>
        <Row gap={6}>
          <IconBtn>{I.search}</IconBtn>
          <IconBtn>{I.bell}</IconBtn>
          <IconBtn>{I.edit}</IconBtn>
        </Row>
      </div>

      {/* Bottom tabs — 4 root tabs per spec */}
      <div style={{
        background: "var(--vellum)",
        borderRadius: 999,
        border: "1px solid var(--line)",
        padding: 6,
        display: "flex",
        gap: 4,
        alignSelf: "center",
        boxShadow: "var(--shadow-2)",
      }}>
        <Tab label="home" active />
        <Tab label="templates" />
        <Tab label="upcoming" />
        <Tab label="settings" />
      </div>

      {/* context menu */}
      <Row gap={20} align="flex-start">
        <div style={{
          width: 220,
          background: "var(--vellum)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-3)",
          padding: 6,
          boxShadow: "var(--shadow-3)",
        }}>
          <MenuItem>{I.plus} New scenario</MenuItem>
          <MenuItem>{I.heart} Add to devotion</MenuItem>
          <MenuItem>{I.bookmark} Save to album</MenuItem>
          <Divider />
          <MenuItem destructive>{I.lock} Hide from preview</MenuItem>
        </div>
        <div style={{
          width: 220,
          background: "var(--ink)",
          borderRadius: "var(--r-3)",
          padding: 6,
          boxShadow: "var(--shadow-3)",
        }}>
          <MenuItem dark>{I.moon} Night mode</MenuItem>
          <MenuItem dark>{I.lock} Lock app</MenuItem>
          <MenuItem dark>{I.bell} Quiet for 1h</MenuItem>
        </div>
      </Row>
    </div>
  );
}

const Tab = ({ label, active }) => (
  <div style={{
    padding: "8px 16px",
    fontSize: 12, fontWeight: active ? 600 : 500,
    color: active ? "var(--vellum)" : "var(--ink-2)",
    background: active ? "var(--plum)" : "transparent",
    borderRadius: 999,
    letterSpacing: "0.02em",
    cursor: "pointer",
  }}>{label}</div>
);

const IconBtn = ({ children }) => (
  <button style={{
    width: 32, height: 32, borderRadius: 999,
    border: "none", background: "transparent",
    color: "var(--ink-2)",
    display: "grid", placeItems: "center", cursor: "pointer",
  }}>{children}</button>
);

const MenuItem = ({ children, destructive, dark }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 10px",
    fontSize: 13,
    color: destructive ? "var(--ember)" : (dark ? "var(--paper)" : "var(--ink)"),
    borderRadius: 6,
    cursor: "pointer",
  }}>{children}</div>
);

const Divider = () => <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />;

// expose
Object.assign(window, {
  YS_FOCardSection: FOCardSection,
  YS_FOCard: FOCard,
  YS_ContentCards: ContentCards,
  YS_Messages: Messages,
  YS_Timeline: Timeline,
  YS_Notifications: Notifications,
  YS_Moodboard: Moodboard,
  YS_Navigation: Navigation,
  YS_DevotionRing: DevotionRing,
  YS_Bubble: Bubble,
  YS_Tab: Tab,
});
