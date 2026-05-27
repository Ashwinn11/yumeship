/* customize.jsx — palette customizer for templates */

function CustomizeScreen() {
  const [theme, setTheme] = React.useState('sakura');
  const [tape, setTape] = React.useState('heart');
  const [pattern, setPattern] = React.useState('paper');

  const palette = PALETTES.find(p => p.id === theme);

  return (
    <div className={`theme-${theme}`} style={{ height: '100%', background: 'var(--paper)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* header */}
      <div style={{ padding: '10px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--vellum)', border: '1.2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div className="eyebrow">edit ship · style</div>
            <div className="display" style={{ fontSize: 18, lineHeight: 1 }}>customize Kuroo</div>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-marker)', fontSize: 9, color: 'var(--primary)', fontWeight: 600 }}>SAVED ♡</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '6px 16px 80px' }} className="no-scrollbar">
        {/* Live preview tile (re-themes!) */}
        <div style={{ position: 'relative' }}>
          <div style={{
            background: 'var(--vellum)', border: '1px solid var(--line)',
            borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 3px 10px rgba(110,58,90,0.08)',
          }}>
            <div style={{
              aspectRatio: '3 / 2.2',
              background: `linear-gradient(135deg, var(--primary-tint), var(--primary))`,
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ position: 'absolute', top: -2, left: 16, transform: 'rotate(-6deg)' }}>
                <WashiTape pattern={tape} width={70} height={14}/>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 56, color: 'rgba(255,255,255,0.95)' }}>K</div>
              <div style={{ position: 'absolute', bottom: 8, right: 10 }}><StickerSparkle size={14} color="rgba(255,255,255,0.9)"/></div>
            </div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="display" style={{ fontSize: 17 }}>Kuroo Tetsurō</div>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>haikyuu!! · romantic</div>
                <div style={{ fontFamily: 'var(--font-marker)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: 0.5 }}>147 DAYS</div>
              </div>
            </div>
          </div>
          {/* tags showing what re-themes */}
          <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
            {['button', 'washi', 'avatar', 'accents', 'callouts'].map(t =>
              <span key={t} className="chip" style={{ fontSize: 9, padding: '2px 8px' }}>{t}</span>
            )}
          </div>
        </div>

        {/* PALETTE picker */}
        <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>their color</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {PALETTES.map((p) => (
              <button key={p.id} onClick={() => setTheme(p.id)} style={{
                cursor: 'pointer', padding: 0, border: 'none', background: 'transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${p.tint}, ${p.hue})`,
                  border: theme === p.id ? '2.5px solid var(--ink)' : '1.5px solid var(--line)',
                  position: 'relative',
                }}>
                  {theme === p.id && (
                    <div style={{ position: 'absolute', top: -7, right: -5 }}><Bullets.Sakura size={14} color={p.hue}/></div>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-marker)', fontSize: 8, color: theme === p.id ? 'var(--ink)' : 'var(--ink-3)', fontWeight: theme === p.id ? 600 : 400, letterSpacing: 0.5 }}>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom hex override */}
        <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--vellum)', border: '1px dashed var(--line-strong)', borderRadius: 12 }}>
          <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>or pick your own</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary)', border: '1.5px solid var(--line-strong)' }}/>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink)', flex: 1, padding: '4px 10px', background: 'var(--paper-deep)', borderRadius: 6 }}>
              {palette?.hue ?? '#d77a8d'}
            </div>
            <button className="btn btn-soft" style={{ padding: '6px 10px', fontSize: 11 }}>edit</button>
          </div>
        </div>

        {/* WASHI TAPE picker */}
        <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>tape pattern</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['heart', 'floral', 'dot', 'check', 'star', 'gingham', 'lace', 'grid', 'stripe'].map(p =>
              <button key={p} onClick={() => setTape(p)} style={{
                cursor: 'pointer', padding: tape === p ? '4px 5px' : '5px 6px',
                border: tape === p ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                background: 'var(--vellum)', borderRadius: 8,
              }}>
                <WashiTape pattern={p} width={42} height={10} rotate={0}/>
              </button>
            )}
          </div>
        </div>

        {/* PAPER style picker */}
        <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>journal paper</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
            {[
              { id: 'paper', label: 'plain' },
              { id: 'lined', label: 'lined' },
              { id: 'grid', label: 'grid' },
              { id: 'scallop', label: 'scallop' },
            ].map(p => (
              <button key={p.id} onClick={() => setPattern(p.id)} style={{
                cursor: 'pointer', flex: 1,
                padding: 4, background: 'transparent', border: 'none',
              }}>
                <div style={{
                  height: 50,
                  background: p.id === 'paper' ? 'var(--vellum)'
                    : p.id === 'grid' ? 'var(--butter-soft)'
                    : p.id === 'scallop' ? 'var(--primary-soft)'
                    : 'var(--vellum)',
                  backgroundImage: p.id === 'grid' ? 'linear-gradient(var(--butter) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--butter) 0.5px, transparent 0.5px)' :
                    p.id === 'lined' ? 'repeating-linear-gradient(0deg, transparent 0 10px, var(--line) 10px 11px)' : 'none',
                  backgroundSize: p.id === 'grid' ? '8px 8px' : 'auto',
                  borderRadius: 6,
                  border: pattern === p.id ? '2px solid var(--ink)' : '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-script)', fontSize: 12, color: 'var(--ink-2)',
                }}>{p.id === 'scallop' && '♡'}</div>
                <div style={{ fontFamily: 'var(--font-marker)', fontSize: 9, color: pattern === p.id ? 'var(--ink)' : 'var(--ink-3)', textAlign: 'center', marginTop: 3, fontWeight: pattern === p.id ? 600 : 400 }}>{p.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sticker accents */}
        <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>sticker accents</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap', padding: '8px', background: 'var(--vellum)', borderRadius: 12, border: '1px solid var(--line)' }}>
            {[
              <StickerEnvelope key="e" size={32}/>,
              <StickerSakuraBranch key="s" size={32}/>,
              <StickerPolaroid key="p" size={32}/>,
              <StickerTicket key="t" size={28}/>,
              <StickerWaxSeal key="w" size={28}/>,
              <StickerHeartPatch key="h" size={26}/>,
              <StickerBow key="b" size={28}/>,
            ].map((s, i) => (
              <div key={i} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: i === 1 ? 'var(--primary-soft)' : 'transparent', border: i === 1 ? '1.5px solid var(--primary)' : '1px solid transparent' }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, background: 'var(--paper)' }}>
        <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>cancel</button>
        <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>save changes ♡</button>
      </div>
    </div>
  );
}

Object.assign(window, { CustomizeScreen });
