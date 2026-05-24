/* ============================================================
   yumeship — onboarding.jsx
   A 5-screen onboarding flow, treated as a love-letter, not a form.
     1 · Welcome
     2 · Who are you, in their world? (persona)
     3 · Who's the one? (F/O)
     4 · Type · sharing · privacy
     5 · The first time (scenario seed)
   ============================================================ */

const { IOSDevice } = window;
const { YS_Mark: Mark, YS_I: I, YS_Heart: Heart, YS_Sparkle: Sparkle,
        YS_SparkleCluster: SparkleCluster, YS_Sakura: Sakura,
        YS_WashiTape: WashiTape, YS_Seal: Seal, YS_Star: Star,
        YS_SakuraConfetti: SakuraConfetti, YS_QuoteMark: QuoteMark,
        YS_Chip: Chip } = window;

function OnbScreen({ children, bg = "var(--paper)" }) {
  return (
    <IOSDevice width={340} height={720}>
      <div style={{
        width: "100%", minHeight: "100%", background: bg,
        display: "flex", flexDirection: "column",
        paddingTop: 56, paddingBottom: 34,
        fontFamily: "var(--font-ui)",
        color: "var(--ink)",
        position: "relative",
        overflow: "hidden",
      }}>
        {children}
      </div>
    </IOSDevice>
  );
}

const StepDots = ({ step, total = 5 }) => (
  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} style={{
        width: i === step ? 18 : 6,
        height: 6, borderRadius: 999,
        background: i === step ? "var(--sakura-deep)" : i < step ? "var(--sakura)" : "var(--paper-deep)",
        transition: "all 200ms",
      }} />
    ))}
  </div>
);

const PrimaryButton = ({ children, icon }) => (
  <button style={{
    width: "100%", height: 48,
    background: "var(--sakura-deep)",
    color: "var(--vellum)",
    border: "none",
    borderRadius: 999,
    fontFamily: "var(--font-ui)",
    fontSize: 15, fontWeight: 600,
    letterSpacing: "0.01em",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    boxShadow: "var(--shadow-2)",
    cursor: "pointer",
  }}>
    {children}
    {icon}
  </button>
);

const SkipLink = ({ children = "later" }) => (
  <button style={{
    background: "none", border: "none", cursor: "pointer",
    color: "var(--ink-3)", fontSize: 13, fontWeight: 500,
    fontFamily: "var(--font-ui)",
    textDecoration: "underline", textUnderlineOffset: 3,
  }}>{children}</button>
);

// =============================================================
// SCREEN 1: Welcome
// =============================================================
function OnbWelcome() {
  return (
    <OnbScreen>
      {/* sakura confetti bg */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.55, pointerEvents: "none" }}>
        <SakuraConfetti />
      </div>

      <div style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Mark size={72} />
        </div>

        <div className="ys-serif" style={{
          fontSize: 56, lineHeight: 0.95,
          letterSpacing: "-0.02em", fontStyle: "italic",
          textAlign: "center", color: "var(--ink)",
        }}>
          yumeship
        </div>

        <div className="ys-ja" style={{
          fontSize: 14, color: "var(--ink-2)",
          textAlign: "center", marginTop: 8, letterSpacing: "0.1em",
        }}>
          夢 ・ ゆめしっぷ
        </div>

        <div className="ys-serif" style={{
          fontSize: 18, lineHeight: 1.4, fontStyle: "italic",
          color: "var(--ink-2)", textAlign: "center",
          marginTop: 28, padding: "0 14px",
        }}>
          "A quiet place to keep them. Held close, like a letter you never sent."
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 22 }}>
          <Sparkle size={14} color="var(--sakura-deep)" />
          <Heart size={14} color="var(--plum)" outline />
          <Sparkle size={10} color="var(--lavender-deep)" />
        </div>
      </div>

      <div style={{ padding: "0 24px 12px", position: "relative", zIndex: 2 }}>
        <PrimaryButton icon={<Heart size={14} color="var(--vellum)" />}>
          begin · let's meet them
        </PrimaryButton>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <SkipLink>I have an account</SkipLink>
        </div>
      </div>
    </OnbScreen>
  );
}

// =============================================================
// SCREEN 2: Who are you, in their world?
// =============================================================
function OnbPersona() {
  return (
    <OnbScreen>
      <div style={{ padding: "16px 24px 6px" }}>
        <StepDots step={1} />
      </div>

      <div style={{ padding: "24px 24px 0", flex: 1 }}>
        <div className="ys-mono" style={{
          fontSize: 10, color: "var(--sakura-deep)",
          letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
        }}>
          ✶ step one · you
        </div>
        <div className="ys-serif" style={{
          fontSize: 30, lineHeight: 1.05,
          letterSpacing: "-0.01em", fontStyle: "italic",
          marginTop: 8,
        }}>
          Who are you,<br/>in their world?
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 8, lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
          A self-insert is you in their story. Or someone you've imagined for it. There's no wrong way.
        </div>

        {/* Persona card */}
        <div style={{
          marginTop: 18,
          padding: "16px 18px",
          background: "var(--vellum)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-4)",
          boxShadow: "var(--shadow-1)",
        }}>
          <Field label="Your name (or theirs for you)">
            <UnderInput value="Mae" />
          </Field>
          <div style={{ height: 14 }} />
          <Field label="Pronouns">
            <Row>
              {["she/her", "he/him", "they/them", "+"].map((p, i) => (
                <Chip key={i} color={i === 0 ? "var(--sakura-deep)" : "var(--ink-2)"} bg={i === 0 ? "var(--sakura-soft)" : "var(--paper-deep)"} active={i === 0}>{p}</Chip>
              ))}
            </Row>
          </Field>
          <div style={{ height: 14 }} />
          <Field label="A color that feels like you">
            <Row gap={8}>
              {[
                "var(--sakura)", "var(--lavender)", "var(--sage)",
                "var(--peach)", "var(--butter)", "var(--plum)",
              ].map((c, i) => (
                <button key={i} style={{
                  width: 26, height: 26, borderRadius: 999,
                  background: c, cursor: "pointer",
                  border: i === 0 ? "2px solid var(--ink)" : "1.5px solid var(--line)",
                  position: "relative",
                }}>
                  {i === 0 && <span style={{ position: "absolute", inset: -6 }}>
                    <Sparkle size={9} color="var(--sakura-deep)" />
                  </span>}
                </button>
              ))}
            </Row>
          </Field>
        </div>

        <div style={{
          marginTop: 14, padding: "12px 14px",
          background: "var(--sakura-soft)",
          border: "1px dashed var(--sakura)",
          borderRadius: "var(--r-3)",
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 12,
          color: "var(--sakura-ink)",
          lineHeight: 1.5,
          position: "relative",
        }}>
          <span style={{ position: "absolute", top: -6, left: 12 }}>
            <Heart size={10} color="var(--sakura-deep)" />
          </span>
          "Even if you change your mind, you can change all of this later. Nothing is fixed."
        </div>
      </div>

      <div style={{ padding: "12px 24px 12px" }}>
        <PrimaryButton icon={<span>›</span>}>continue · meet them</PrimaryButton>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <SkipLink>add later</SkipLink>
        </div>
      </div>
    </OnbScreen>
  );
}

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <span className="ys-mono" style={{
      fontSize: 9, color: "var(--ink-3)",
      letterSpacing: "0.12em", textTransform: "uppercase",
    }}>{label}</span>
    {children}
  </div>
);

const UnderInput = ({ value }) => (
  <input
    defaultValue={value}
    style={{
      border: "none",
      borderBottom: "1px solid var(--line-strong)",
      background: "transparent",
      padding: "6px 0",
      fontSize: 18,
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      color: "var(--ink)",
      outline: "none",
      width: "100%",
    }}
  />
);

const Row = ({ children, gap = 6 }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap }}>{children}</div>
);

// =============================================================
// SCREEN 3: Who's the one?
// =============================================================
function OnbFO() {
  return (
    <OnbScreen>
      <div style={{ padding: "16px 24px 6px" }}>
        <StepDots step={2} />
      </div>

      <div style={{ padding: "24px 24px 0", flex: 1, overflow: "hidden" }}>
        <div className="ys-mono" style={{
          fontSize: 10, color: "var(--plum)",
          letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
        }}>
          ♡ step two · them
        </div>
        <div className="ys-serif" style={{
          fontSize: 32, lineHeight: 1.05,
          letterSpacing: "-0.01em", fontStyle: "italic",
          marginTop: 8,
        }}>
          Who's the one?
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 8, lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
          The first F/O. You can add more later — even a whole polycule if you want.
        </div>

        {/* Avatar setup */}
        <div style={{
          marginTop: 18,
          background: "linear-gradient(160deg, #f3b6c4 0%, #c79bb5 45%, #6b3d5b 100%)",
          borderRadius: "var(--r-4)",
          padding: 22,
          position: "relative",
          overflow: "hidden",
          boxShadow: "var(--shadow-2)",
          minHeight: 140,
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.18 }} className="placeholder-stripe" />
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            display: "grid", placeItems: "center",
            width: 72, height: 72, borderRadius: 999,
            background: "rgba(255,255,255,0.25)",
            border: "1.5px dashed rgba(255,255,255,0.8)",
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ fontSize: 28, color: "rgba(255,255,255,0.9)" }}>{I.plus}</span>
          </div>
          <div style={{ position: "absolute", top: 12, left: 14 }}>
            <WashiTape width={80} height={16} pattern="heart" color="#ffffff" rotate={-5} />
          </div>
        </div>

        <div style={{
          marginTop: 14,
          padding: "14px 16px",
          background: "var(--vellum)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-4)",
        }}>
          <Field label="Their name">
            <UnderInput value="Kafka" />
          </Field>
          <div style={{ height: 14 }} />
          <Field label="From">
            <UnderInput value="Honkai Star Rail" />
          </Field>
          <div style={{ height: 14 }} />
          <Field label="What you call them, when no one's listening">
            <div style={{
              padding: "8px 10px",
              border: "1px solid var(--line)",
              borderRadius: 8,
              background: "var(--paper-soft)",
              fontStyle: "italic",
              fontFamily: "var(--font-display)",
              fontSize: 15,
              color: "var(--sakura-ink)",
            }}>"my whole problem"</div>
          </Field>
        </div>
      </div>

      <div style={{ padding: "12px 24px 12px" }}>
        <PrimaryButton icon={<span>›</span>}>continue · the rules</PrimaryButton>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <SkipLink>add later</SkipLink>
        </div>
      </div>
    </OnbScreen>
  );
}

// =============================================================
// SCREEN 4: Type · sharing
// =============================================================
function OnbRules() {
  return (
    <OnbScreen>
      <div style={{ padding: "16px 24px 6px" }}>
        <StepDots step={3} />
      </div>

      <div style={{ padding: "20px 24px 0", flex: 1, overflow: "hidden" }}>
        <div className="ys-mono" style={{
          fontSize: 10, color: "var(--sage-deep)",
          letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
        }}>
          ✶ step three · the rules
        </div>
        <div className="ys-serif" style={{
          fontSize: 28, lineHeight: 1.05,
          letterSpacing: "-0.01em", fontStyle: "italic",
          marginTop: 8,
        }}>
          What kind of love,<br/>and who's invited?
        </div>

        {/* Type */}
        <div style={{ marginTop: 16 }}>
          <Field label="Relationship type">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
              <PickerOption ja="恋" name="romantic" tint="var(--sakura-deep)" tintBg="var(--sakura-soft)" active />
              <PickerOption ja="友" name="platonic" tint="var(--sage-deep)"   tintBg="var(--sage-soft)" />
              <PickerOption ja="家" name="familial" tint="var(--peach-deep)"  tintBg="var(--peach-soft)" />
            </div>
          </Field>
        </div>

        {/* Sharing */}
        <div style={{ marginTop: 18 }}>
          <Field label="Sharing — about doubles">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
              <PickerOption ja="禁" name="sharing NG"  tint="var(--ember)" tintBg="#fde0d4" />
              <PickerOption ja="可" name="welcome"    tint="var(--sage-deep)" tintBg="var(--sage-soft)" />
              <PickerOption ja="鏡" name="mirror"     tint="var(--lavender-deep)" tintBg="var(--lavender-soft)" active />
            </div>
          </Field>
        </div>

        {/* Privacy reassurance */}
        <div style={{
          marginTop: 18,
          padding: "12px 14px",
          background: "var(--vellum)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-3)",
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: "var(--lavender-soft)",
            display: "grid", placeItems: "center",
            color: "var(--lavender-deep)",
            flexShrink: 0,
          }}>{I.lock}</span>
          <div style={{ flex: 1, fontSize: 11, color: "var(--ink-2)", lineHeight: 1.5 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>
              Private by default
            </div>
            Nothing leaves your phone. Notifications never reveal the app on your lock screen.
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 24px 12px" }}>
        <PrimaryButton icon={<span>›</span>}>continue · the first scene</PrimaryButton>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <SkipLink>skip for now</SkipLink>
        </div>
      </div>
    </OnbScreen>
  );
}

const PickerOption = ({ ja, name, tint, tintBg, active }) => (
  <div style={{
    padding: "10px 6px",
    background: active ? tintBg : "var(--vellum)",
    border: active ? `1.5px solid ${tint}` : "1px solid var(--line)",
    borderRadius: "var(--r-3)",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    cursor: "pointer",
    position: "relative",
  }}>
    {active && (
      <span style={{ position: "absolute", top: -5, right: -3 }}>
        <Sparkle size={10} color={tint} />
      </span>
    )}
    <span className="ys-ja" style={{
      fontSize: 18, color: tint, fontWeight: 600,
    }}>{ja}</span>
    <span style={{
      fontSize: 10, fontWeight: active ? 600 : 500,
      color: active ? tint : "var(--ink-2)",
      letterSpacing: "0.02em",
    }}>{name}</span>
  </div>
);

// =============================================================
// SCREEN 5: The first time (scenario seed)
// =============================================================
function OnbScenario() {
  return (
    <OnbScreen>
      <div style={{ padding: "16px 24px 6px" }}>
        <StepDots step={4} />
      </div>

      <div style={{ padding: "24px 24px 0", flex: 1, overflow: "hidden" }}>
        <div className="ys-mono" style={{
          fontSize: 10, color: "var(--lavender-deep)",
          letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
        }}>
          ♡ step four · the first scene
        </div>
        <div className="ys-serif" style={{
          fontSize: 30, lineHeight: 1.05,
          letterSpacing: "-0.01em", fontStyle: "italic",
          marginTop: 8,
        }}>
          The first time<br/>you saw them.
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 8, lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
          Just a few sentences. You can come back. Or pick from a prompt.
        </div>

        {/* Big writing surface */}
        <div style={{
          marginTop: 16,
          padding: 16,
          background: "var(--vellum)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-4)",
          minHeight: 220,
          position: "relative",
        }}>
          <div style={{ position: "absolute", top: -8, left: 16 }}>
            <WashiTape width={56} height={14} pattern="heart" color="var(--sakura-deep)" rotate={-6} />
          </div>
          <div className="ys-mono" style={{
            fontSize: 9, color: "var(--ink-3)",
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}>scene 01</div>
          <div className="ys-serif" style={{
            marginTop: 8,
            fontSize: 18,
            lineHeight: 1.5,
            fontStyle: "italic",
            color: "var(--ink)",
          }}>
            "the first cutscene. she said my name—"
          </div>
          <div style={{
            display: "inline-block", width: 2, height: 22,
            background: "var(--sakura-deep)",
            verticalAlign: "middle",
            marginTop: 8,
            animation: "blink 1s steps(2) infinite",
          }} />
          <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>
        </div>

        {/* Prompts */}
        <div style={{ marginTop: 14 }}>
          <span className="ys-mono" style={{
            fontSize: 9, color: "var(--ink-3)",
            letterSpacing: "0.12em", textTransform: "uppercase",
          }}>or pick a prompt</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {[
              ["雨", "rainy day"],
              ["夜", "late call"],
              ["朝", "morning after"],
              ["初", "first meeting"],
            ].map(([ja, l], i) => (
              <span key={i} style={{
                display: "inline-flex", gap: 5, alignItems: "center",
                padding: "5px 10px",
                background: "var(--paper-deep)",
                border: "1px solid var(--line)",
                borderRadius: 999,
                fontSize: 11,
                color: "var(--ink-2)",
              }}>
                <span className="ys-ja" style={{ color: "var(--sakura-deep)", fontWeight: 600 }}>{ja}</span>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 24px 12px" }}>
        <PrimaryButton icon={<Heart size={14} color="var(--vellum)" />}>
          finish · keep them close
        </PrimaryButton>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <SkipLink>save & finish later</SkipLink>
        </div>
      </div>
    </OnbScreen>
  );
}

Object.assign(window, {
  YS_OnbWelcome:  OnbWelcome,
  YS_OnbPersona:  OnbPersona,
  YS_OnbFO:       OnbFO,
  YS_OnbRules:    OnbRules,
  YS_OnbScenario: OnbScenario,
});
