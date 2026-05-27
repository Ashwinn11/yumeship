/* screens.jsx — refined screens that match the cozy aesthetic */

// ─── Bottom nav (used across screens) ───────────────────────────
function BottomNav({ active = 'home' }) {
  const items = [
    { id: 'home', label: 'home', icon: IconHome },
    { id: 'vault', label: 'vault', icon: IconBook },
  ];
  const right = [
    { id: 'letters', label: 'letters', icon: IconMail },
    { id: 'me', label: 'profile', icon: IconUser },
  ];
  const cell = (it) => {
    const I = it.icon; const on = active === it.id;
    return (
      <div key={it.id} style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        padding: '6px 4px', borderRadius: 12,
        background: on ? 'var(--primary-soft)' : 'transparent',
      }}>
        <I size={18} color={on ? 'var(--ink)' : 'var(--ink-3)'} />
        <span style={{ fontSize: 9, color: on ? 'var(--ink)' : 'var(--ink-3)', fontWeight: on ? 600 : 400 }}>{it.label}</span>
      </div>
    );
  };
  return (
    <div style={{ position: 'absolute', bottom: 14, left: 12, right: 12 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--vellum)', borderRadius: 22,
        border: '1.4px solid var(--line)',
        padding: '6px 8px', gap: 4,
        boxShadow: '0 4px 14px rgba(110,58,90,0.10)',
      }}>
        {items.map(cell)}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(110,58,90,0.20)',
          flexShrink: 0,
        }}>
          <IconPlus size={16} color="white"/>
        </div>
        {right.map(cell)}
      </div>
    </div>
  );
}

// ─── Header bar (eyebrow + title) ───────────────────────────────
function ScreenHeader({ eyebrow, title, deco, right }) {
  return (
    <div style={{ padding: '6px 20px 4px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        {right}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <div className="display" style={{ fontSize: 28, lineHeight: '30px' }}>{title}</div>
        {deco}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. MESSAGES (refined — letter bubbles, washi date header, sticker accents)
// ═══════════════════════════════════════════════════════════════

function MessagesRefined({ shipName = 'Kuroo', theme = 'sakura', empty = false }) {
  const meMsg = (txt) => (
    <div style={{ alignSelf: 'flex-end', maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <div style={{
        background: 'var(--primary)', color: 'white',
        padding: '10px 14px',
        borderRadius: '18px 18px 4px 18px',
        fontFamily: 'var(--font-ui)', fontSize: 12.5, lineHeight: '17px',
        boxShadow: '0 2px 6px rgba(110,58,90,0.15)',
      }}>{txt}</div>
    </div>
  );
  const themMsg = (txt, attach) => (
    <div style={{ alignSelf: 'flex-start', maxWidth: '76%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        background: 'var(--vellum)', color: 'var(--ink)',
        padding: '10px 14px',
        borderRadius: '18px 18px 18px 4px',
        fontFamily: 'var(--font-ui)', fontSize: 12.5, lineHeight: '17px',
        border: '1.2px solid var(--line)',
        position: 'relative',
      }}>
        {txt}
        {attach}
      </div>
    </div>
  );
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      {/* Top */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 18px 8px', borderBottom: '1px solid var(--line)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: -2, left: 20, transform: 'rotate(-4deg)' }}>
          <WashiTape pattern="floral" width={60} height={12} rotate={0}/>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-tint), var(--primary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18,
          border: '2px solid white', boxShadow: '0 1px 4px rgba(110,58,90,0.15)',
        }}>{shipName[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink)', lineHeight: 1 }}>{shipName}</div>
          <div style={{ fontFamily: 'var(--font-script)', fontSize: 13, color: 'var(--primary-ink)', marginTop: 2 }}>imagined ♡</div>
        </div>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--vellum)', border: '1.2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconHeart size={13} color="var(--primary)"/>
        </div>
      </div>

      {/* Sender toggle */}
      <div style={{ padding: '10px 18px 6px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'var(--paper-deep)', borderRadius: 999, padding: 3, display: 'flex', gap: 2, border: '1px solid var(--line)' }}>
          <div style={{ padding: '4px 12px', borderRadius: 999, background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 500 }}>me</div>
          <div style={{ padding: '4px 12px', borderRadius: 999, color: 'var(--ink-2)', fontSize: 10 }}>{shipName} ♡</div>
        </div>
      </div>

      {/* Messages list */}
      <div style={{ flex: 1, padding: '6px 16px 14px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        {empty ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20 }}>
            <div style={{ position: 'relative' }}>
              <StickerEnvelope size={64}/>
              <div style={{ position: 'absolute', top: -6, right: -10 }}>
                <StickerSparkle size={14}/>
              </div>
              <div style={{ position: 'absolute', bottom: -4, left: -10 }}>
                <StickerSparkle size={10} color="var(--lavender-deep)"/>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="display" style={{ fontSize: 22, lineHeight: '24px' }}>your conversation starts here</div>
              <div className="script" style={{ fontSize: 17, marginTop: 8, color: 'var(--ink-2)' }}>
                imagined texts —<br/>never sent, always read.
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 6 }}>
              <IconPencil size={14} color="white"/> write the first one
            </button>
          </div>
        ) : (
          <>
            {/* Date pill */}
            <div style={{ alignSelf: 'center', position: 'relative', marginTop: 4 }}>
              <div style={{ position: 'absolute', top: -3, left: -8, zIndex: 0 }}>
                <WashiTape pattern="dot" width={60} height={10} rotate={-6}/>
              </div>
              <div style={{
                position: 'relative', zIndex: 1,
                fontFamily: 'var(--font-marker)', fontSize: 9, letterSpacing: 1.4,
                color: 'var(--ink-3)', textTransform: 'uppercase',
                padding: '2px 10px', background: 'var(--paper)',
              }}>tuesday · 3:42 pm</div>
            </div>

            {themMsg("oi. you still up? saw your light from across the gym.")}
            {meMsg("can't sleep. you're not exactly helping by being out there.")}
            {themMsg("then come down here.")}
            {/* Sticker reaction */}
            <div style={{ alignSelf: 'flex-end', display: 'flex', gap: 4, marginTop: -2 }}>
              <div style={{ background: 'var(--vellum)', borderRadius: 999, padding: '2px 8px', border: '1px solid var(--line)', fontSize: 12 }}>♡ 1</div>
            </div>
            {meMsg("can't. roommates. tomorrow?")}
            {themMsg("text me when you're free. don't make me wait.")}
          </>
        )}
      </div>

      {/* Composer */}
      {!empty && (
        <div style={{ padding: '10px 14px 14px', borderTop: '1px solid var(--line)', background: 'var(--paper-deep)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            flex: 1, padding: '9px 14px', borderRadius: 22,
            background: 'var(--vellum)', border: '1.4px solid var(--line)',
            fontFamily: 'var(--font-script)', fontSize: 16, color: 'var(--ink-3)', lineHeight: '18px',
          }}>write to them...</div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(110,58,90,0.18)' }}>
            <IconSend size={14} color="white"/>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. DATES (refined — paper cards with tape + washi corners)
// ═══════════════════════════════════════════════════════════════

function DatesRefined({ shipName = 'Kuroo', theme = 'sakura' }) {
  const dates = [
    { d: 12, m: 'NOV', title: 'his birthday', sub: 'fictional pisces ♡', tape: 'floral', color: 'var(--primary)' },
    { d: 3, m: 'MAR', title: 'our anniversary', sub: 'the day we met', tape: 'heart', color: 'var(--lavender-deep)', pinned: true },
    { d: 28, m: 'FEB', title: 'season 2 finale', sub: 'rewatch monthly', tape: 'star', color: 'var(--butter-deep)' },
    { d: 14, m: 'JUL', title: 'beach episode', sub: 'we hold hands here', tape: 'dot', color: 'var(--peach-deep)' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      <ScreenHeader
        eyebrow="dates · 4 saved"
        title="things to remember"
        deco={<StickerSparkle size={14}/>}
        right={<div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--vellum)', border: '1.2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconPlus size={12} color="var(--primary)"/></div>}
      />

      <div style={{ flex: 1, padding: '12px 16px 80px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        {dates.map((d, i) => (
          <div key={i} style={{
            position: 'relative',
            background: 'var(--vellum)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 2px 6px rgba(110,58,90,0.06)',
          }}>
            {/* washi tape corner */}
            <div style={{ position: 'absolute', top: -6, left: 18, zIndex: 1 }}>
              <WashiTape pattern={d.tape} width={42} height={12} rotate={-8} color={d.color}/>
            </div>
            {/* date block — torn paper feel */}
            <div style={{
              width: 56, padding: '6px 8px', borderRadius: 8,
              background: `color-mix(in oklch, ${d.color} 14%, white)`,
              border: `1px solid ${d.color}55`,
              textAlign: 'center', flexShrink: 0,
            }}>
              <div style={{ fontFamily: 'var(--font-marker)', fontSize: 9, fontWeight: 600, color: d.color, letterSpacing: 1.4 }}>{d.m}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, lineHeight: '28px', color: d.color, marginTop: -1 }}>{d.d}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink)', lineHeight: '18px' }}>{d.title}</div>
                {d.pinned && <Bullets.Heart size={10} color={d.color}/>}
              </div>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: 14, color: 'var(--ink-2)', marginTop: 2 }}>{d.sub}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: d.color, lineHeight: '22px' }}>{Math.floor(Math.random() * 200) + 5}</div>
              <div style={{ fontFamily: 'var(--font-marker)', fontSize: 8, color: 'var(--ink-3)', letterSpacing: 1.4 }}>DAYS</div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="vault"/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. SCENARIOS (refined — scrapbook journal entry)
// ═══════════════════════════════════════════════════════════════

function ScenariosRefined({ shipName = 'Kuroo', theme = 'sakura', empty = false }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      <ScreenHeader eyebrow="scenarios · 7 saved" title="what-ifs" deco={<Bullets.Sakura size={12}/>}/>

      <div style={{ flex: 1, padding: '10px 16px 80px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        {empty ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20 }}>
            <StickerSakuraBranch size={80}/>
            <div style={{ textAlign: 'center' }}>
              <div className="display" style={{ fontSize: 22, lineHeight: '24px' }}>no daydreams yet</div>
              <div className="script" style={{ fontSize: 17, marginTop: 6, color: 'var(--ink-2)' }}>
                the rainy afternoons,<br/>the airport goodbyes —<br/>start somewhere.
              </div>
            </div>
            <button className="btn btn-primary">
              <IconPencil size={14} color="white"/> write a scenario
            </button>
          </div>
        ) : (
          <>
            {/* Entry 1 — scrapbook style */}
            <div style={{
              position: 'relative', background: 'var(--vellum)',
              border: '1px solid var(--line)', borderRadius: 14,
              padding: '16px 16px 14px',
              boxShadow: '0 3px 10px rgba(110,58,90,0.08)',
            }}>
              <div style={{ position: 'absolute', top: -8, right: 24 }}>
                <WashiTape pattern="heart" width={70} height={14} rotate={6}/>
              </div>
              <div style={{ position: 'absolute', top: 14, right: -2 }}>
                <Bullets.Sakura size={14}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <div style={{ fontFamily: 'var(--font-marker)', fontSize: 9, color: 'var(--primary)', letterSpacing: 1.4, fontWeight: 600 }}>MAR · 18</div>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--line-strong)' }}/>
                <div style={{ fontFamily: 'var(--font-marker)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: 1 }}>RAINY DAY · 3 MIN READ</div>
              </div>
              <div className="display" style={{ fontSize: 22, lineHeight: '24px', marginTop: 6 }}>he runs in soaking wet</div>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: 16, color: 'var(--ink-2)', lineHeight: '19px', marginTop: 8 }}>
                "you'd think he'd own an umbrella by now. instead he stands at my door, hair plastered to his forehead,
                holding a single grocery bag of <span style={{ color: 'var(--primary)', fontWeight: 600 }}>strawberry milk</span> like a war trophy..."
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <div className="chip" style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary-tint)' }}>♡ comfort</div>
                <div className="chip" style={{ background: 'var(--lavender-soft)', borderColor: 'var(--lavender)', color: 'var(--lavender-deep)' }}>✿ slowburn</div>
              </div>
            </div>

            {/* Entry 2 — torn paper feel, more spare */}
            <div style={{
              background: 'var(--paper-soft)', border: '1px solid var(--line)',
              borderRadius: 14, padding: '14px 14px 12px',
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: -6, left: 20 }}>
                <WashiTape pattern="floral" width={50} height={12} rotate={-8} color="var(--lavender-deep)"/>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <div style={{ fontFamily: 'var(--font-marker)', fontSize: 9, color: 'var(--lavender-deep)', letterSpacing: 1.4, fontWeight: 600 }}>FEB · 02</div>
                <div className="display" style={{ fontSize: 17, lineHeight: '19px', flex: 1 }}>airport, 4am, last call</div>
              </div>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: 15, color: 'var(--ink-2)', marginTop: 4 }}>
                what if he came back. just once. just to see.
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav active="vault"/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. PERSONA (with callout quote at bottom)
// ═══════════════════════════════════════════════════════════════

function PersonaRefined({ theme = 'sakura' }) {
  return (
    <div style={{ height: '100%', background: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
      {/* deco */}
      <div style={{ position: 'absolute', top: 60, right: 14, opacity: 0.7 }}><StickerSakuraBranch size={50}/></div>
      <div style={{ position: 'absolute', bottom: 200, left: 16 }}><StickerSparkle size={12} color="var(--lavender-deep)"/></div>

      {/* step dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '14px 0 4px' }}>
        <div style={{ width: 18, height: 4, borderRadius: 2, background: 'var(--primary)' }}/>
        <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--line-strong)' }}/>
        <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--line-strong)' }}/>
      </div>

      <div style={{ padding: '20px 22px 0' }}>
        <div className="eyebrow">step one · you</div>
        <div className="display" style={{ fontSize: 26, lineHeight: '28px', marginTop: 6 }}>
          Who are you,<br/>in their world?
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-marker)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: 1.4, fontWeight: 600 }}>YOUR NAME (OR THEIRS FOR YOU)</div>
            <div style={{ borderBottom: '1.4px solid var(--line)', paddingBottom: 4, marginTop: 6, fontFamily: 'var(--font-script)', fontSize: 18, color: 'var(--primary-ink)' }}>Mei</div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: 'var(--font-marker)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: 1.4, fontWeight: 600, marginBottom: 6 }}>PRONOUNS</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {['she/her', 'he/him', 'they/them', '+'].map((p, i) =>
                <div key={p} className="chip" style={i === 0 ? { background: 'var(--primary-soft)', borderColor: 'var(--primary)', color: 'var(--primary-ink)', fontWeight: 600 } : { background: 'var(--paper-deep)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}>{p}</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: 'var(--font-marker)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: 1.4, fontWeight: 600, marginBottom: 6 }}>A COLOR THAT FEELS LIKE YOU</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {PALETTES.map((p, i) => (
                <div key={p.id} style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: p.tint,
                  border: i === 0 ? '2px solid var(--ink)' : '1.5px solid var(--line)',
                  position: 'relative',
                }}>
                  {i === 0 && <div style={{ position: 'absolute', top: -7, left: -7 }}><StickerSparkle size={10}/></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Callout quote at bottom */}
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
          <CalloutBubble tone="pink">
            A self-insert is you<br/>in their story —<br/>there's no wrong way.
          </CalloutBubble>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 16, left: 22, right: 22 }}>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
          continue · meet them
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. NEW SHIP (with Caveat quote at bottom)
// ═══════════════════════════════════════════════════════════════

function NewShipRefined({ theme = 'sakura' }) {
  return (
    <div style={{ height: '100%', background: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 70, right: 16, transform: 'rotate(8deg)', opacity: 0.85 }}><StickerHeartPatch size={32}/></div>
      <div style={{ position: 'absolute', top: 140, left: 14 }}><StickerSparkle size={14} color="var(--lavender-deep)"/></div>

      {/* dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '14px 0 4px' }}>
        <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--line-strong)' }}/>
        <div style={{ width: 18, height: 4, borderRadius: 2, background: 'var(--primary)' }}/>
        <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--line-strong)' }}/>
      </div>

      <div style={{ padding: '20px 22px 0' }}>
        <div className="eyebrow">step two · them</div>
        <div className="display" style={{ fontSize: 24, lineHeight: '26px', marginTop: 6 }}>
          Meet them,<br/>your forever-someone.
        </div>

        <div className="card" style={{ marginTop: 16, padding: 14 }}>
          {/* Ship name (combined name) field at top */}
          <div>
            <div style={{ fontFamily: 'var(--font-marker)', fontSize: 8, color: 'var(--ink-3)', letterSpacing: 1.4, fontWeight: 600 }}>SHIP NAME · what you call this</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4, borderBottom: '1.4px solid var(--line)', paddingBottom: 4 }}>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: 22, color: 'var(--primary-ink)', lineHeight: 1, flex: 1 }}>Mei × Kuroo</div>
              <IconHeart size={12} color="var(--primary)"/>
            </div>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
              the headline that appears on cards & letters
            </div>
          </div>

          <hr className="divider-soft"/>

          {/* preview tile */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 60, height: 76,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary-tint), var(--primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 36,
              position: 'relative',
              boxShadow: '0 2px 6px rgba(110,58,90,0.15)',
              flexShrink: 0,
            }}>
              K
              <div style={{ position: 'absolute', top: -4, left: -8, transform: 'rotate(-8deg)' }}>
                <WashiTape pattern="heart" width={28} height={10}/>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-marker)', fontSize: 8, color: 'var(--ink-3)', letterSpacing: 1.4, fontWeight: 600 }}>THEIR NAME</div>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: 18, color: 'var(--primary-ink)', lineHeight: 1 }}>Kuroo Tetsurō</div>
              <div style={{ fontFamily: 'var(--font-marker)', fontSize: 8, color: 'var(--ink-3)', letterSpacing: 1.4, fontWeight: 600, marginTop: 6 }}>SOURCE</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-2)' }}>Haikyuu!! · canon</div>
            </div>
          </div>

          <hr className="divider-soft"/>

          <div style={{ fontFamily: 'var(--font-marker)', fontSize: 8, color: 'var(--ink-3)', letterSpacing: 1.4, fontWeight: 600 }}>RELATIONSHIP</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {['romantic', 'platonic', 'familial'].map((r, i) =>
              <div key={r} className="chip" style={i === 0 ? { background: 'var(--primary-soft)', borderColor: 'var(--primary)', color: 'var(--primary-ink)', fontWeight: 600 } : { background: 'var(--paper-deep)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}>{r}</div>
            )}
          </div>

          <div style={{ fontFamily: 'var(--font-marker)', fontSize: 8, color: 'var(--ink-3)', letterSpacing: 1.4, fontWeight: 600, marginTop: 12 }}>THEIR COLOR</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {PALETTES.map((p, i) =>
              <div key={p.id} style={{ width: 22, height: 22, borderRadius: '50%', background: p.hue, border: i === 0 ? '2px solid var(--ink)' : '1.5px solid var(--line)' }}/>
            )}
          </div>
        </div>

        {/* Caveat quote callout at bottom — new shape */}
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
          <ThoughtCloud tone="lavender">
            love them how you want.<br/>
            this corner of your<br/>
            heart is just yours.
          </ThoughtCloud>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 16, left: 22, right: 22 }}>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
          launch the ship
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { MessagesRefined, DatesRefined, ScenariosRefined, PersonaRefined, NewShipRefined, BottomNav, ScreenHeader });
