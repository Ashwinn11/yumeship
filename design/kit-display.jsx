/* kit-display.jsx — shows the entire kit (like the reference image) */

function KitDisplay({ theme = 'sakura' }) {
  const sec = (title, children) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontFamily: 'var(--font-marker)', fontWeight: 600, fontSize: 9, letterSpacing: 1.8,
        color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8,
      }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div className={`theme-${theme}`} style={{
      width: '100%', height: '100%',
      background: 'var(--paper)',
      padding: 24,
      overflow: 'auto',
      fontFamily: 'var(--font-ui)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>

        {/* ─── LEFT COLUMN ─── */}
        <div>
          {sec('QUOTES / CALLOUTS · adapted from reference', (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <CalloutBubble tone="pink">
                a self-insert is<br/>you in their story.
              </CalloutBubble>
              <ThoughtCloud tone="lavender">
                maybe today,<br/>he says hi.
              </ThoughtCloud>
            </div>
          ))}

          {sec('ICONS · using your existing set (Icon.tsx)', (
            <div style={{ padding: '10px 12px', background: 'var(--vellum)', border: '1px dashed var(--line-strong)', borderRadius: 10, fontFamily: 'var(--font-script)', fontSize: 14, color: 'var(--ink-2)' }}>
              kept as-is from <code style={{ fontFamily: 'var(--font-ui)', fontSize: 11, background: 'var(--paper-deep)', padding: '1px 6px', borderRadius: 4 }}>src/components/ui/Icon.tsx</code> — the cozy outline set you already have.
            </div>
          ))}

          {sec('COLOR PALETTE · per-ship theming', (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {PALETTES.map(p => (
                <div key={p.id} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: p.hue, border: '1.5px solid var(--line)',
                  }}/>
                  <div style={{ fontFamily: 'var(--font-marker)', fontSize: 8, color: 'var(--ink-3)', marginTop: 4, letterSpacing: 0.5 }}>{p.name}</div>
                </div>
              ))}
            </div>
          ))}

          {sec('BUTTONS', (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
              <button className="btn btn-primary">primary button <IconHeart size={12} color="white"/></button>
              <button className="btn btn-secondary">secondary button <IconHeart size={12} color="var(--primary)"/></button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-soft" style={{ padding: '8px 10px' }}><IconPlus size={14}/></button>
                <button className="btn btn-soft" style={{ padding: '8px 10px' }}><IconHeart size={14}/></button>
                <button className="btn btn-soft" style={{ padding: '8px 10px', background: 'var(--lavender-soft)', color: 'var(--lavender-deep)' }}>···</button>
              </div>
            </div>
          ))}

          {sec('TABS · root navigation', (
            <div style={{ background: 'var(--vellum)', borderRadius: 22, border: '1.4px solid var(--line)', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, maxWidth: 280 }}>
              {[{ icon: IconHome, label: 'home', on: true }, { icon: IconBook, label: 'vault' }].map((t, i) => {
                const I = t.icon;
                return <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', borderRadius: 12, background: t.on ? 'var(--primary-soft)' : 'transparent' }}>
                  <I size={16} color={t.on ? 'var(--ink)' : 'var(--ink-3)'}/>
                  <span style={{ fontSize: 9, color: t.on ? 'var(--ink)' : 'var(--ink-3)', fontWeight: t.on ? 600 : 400 }}>{t.label}</span>
                </div>;
              })}
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconPlus size={14} color="white"/>
              </div>
              {[{ icon: IconMail, label: 'letters' }, { icon: IconUser, label: 'profile' }].map((t, i) => {
                const I = t.icon;
                return <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px' }}>
                  <I size={16} color="var(--ink-3)"/>
                  <span style={{ fontSize: 9, color: 'var(--ink-3)' }}>{t.label}</span>
                </div>;
              })}
            </div>
          ))}

          {sec('CHIPS / TAGS', (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="chip">memories <span className="chip-x">✕</span></span>
              <span className="chip" style={{ background: 'var(--lavender-soft)', borderColor: 'var(--lavender)', color: 'var(--lavender-deep)' }}>gratitude <span className="chip-x">✕</span></span>
              <span className="chip" style={{ background: 'var(--butter-soft)', borderColor: 'var(--butter)', color: 'var(--butter-deep)' }}>dreams <span className="chip-x">✕</span></span>
              <span className="chip" style={{ background: 'transparent', borderStyle: 'dashed', color: 'var(--ink-3)' }}>+ new tag</span>
            </div>
          ))}

          {sec('INPUTS', (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconSearch size={12} color="var(--ink-3)"/>
                <span style={{ color: 'var(--ink-3)', flex: 1 }}>search...</span>
                <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>✕</span>
              </div>
              <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--ink-3)', flex: 1, fontFamily: 'var(--font-script)', fontSize: 14 }}>write something...</span>
                <IconHeart size={12} color="var(--primary)"/>
              </div>
            </div>
          ))}

          {sec('BULLETS / MARKERS', (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Bullets.Heart size={16}/>
              <Bullets.Sakura size={16}/>
              <Bullets.Star size={16}/>
              <Bullets.Dot size={14} color="var(--lavender-deep)"/>
              <Bullets.Crescent size={14} color="var(--lavender-deep)"/>
              <Bullets.Square size={12} color="var(--butter-deep)"/>
              <Bullets.Tape size={16}/>
              <Bullets.Ribbon size={14}/>
            </div>
          ))}
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div>
          {sec('STICKERS / ILLUSTRATIONS', (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <StickerEnvelope size={56}/>
              <StickerSakuraBranch size={60}/>
              <StickerPolaroid size={58}/>
              <StickerTicket size={56}/>
              <StickerWaxSeal size={44}/>
              <StickerHeartPatch size={38}/>
              <StickerBow size={40}/>
              <div style={{ display: 'flex', gap: 4 }}>
                <StickerSparkle size={14}/>
                <StickerSparkle size={10} color="var(--lavender-deep)"/>
                <StickerSparkle size={8} color="var(--butter-deep)"/>
              </div>
            </div>
          ))}

          {sec('WASHI TAPES · 9 patterns', (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { pattern: 'heart', color: 'var(--primary-tint)' },
                { pattern: 'floral', color: 'var(--primary)' },
                { pattern: 'dot', color: 'var(--lavender-deep)' },
                { pattern: 'check', color: 'var(--sage-deep)' },
                { pattern: 'stripe', color: 'var(--primary)' },
                { pattern: 'gingham', color: 'var(--peach-deep)' },
                { pattern: 'star', color: 'var(--butter-deep)' },
                { pattern: 'lace', color: 'var(--lavender-deep)' },
                { pattern: 'grid', color: 'var(--ink-3)' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <WashiTape pattern={t.pattern} color={t.color} width={70} height={14} rotate={-2}/>
                  <span style={{ fontFamily: 'var(--font-marker)', fontSize: 9, color: 'var(--ink-3)' }}>{t.pattern}</span>
                </div>
              ))}
            </div>
          ))}

          {sec('PAPERS / FRAMES', (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: -8, left: 14, zIndex: 1 }}>
                  <WashiTape pattern="floral" width={50} height={12} rotate={-6}/>
                </div>
                <PaperLined width={100} height={120}>
                  <div>tuesday</div>
                  <div>3:42pm</div>
                  <div>he texted ♡</div>
                  <div>i smiled,</div>
                  <div>just a little.</div>
                </PaperLined>
              </div>
              <div style={{ position: 'relative' }}>
                <ClipBinder size={20} rotate={-12} style={{ position: 'absolute', top: -10, left: 16, zIndex: 1 }} color="var(--butter)"/>
                <PaperScalloped width={100} height={120}>
                  what if<br/>he stayed<br/>just one<br/>more<br/>minute
                </PaperScalloped>
              </div>
              <PaperPolaroid width={88} height={108} rotate={-4}>
                <StickerSakuraBranch size={50}/>
              </PaperPolaroid>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: -8, left: 14, zIndex: 1 }}>
                  <WashiTape pattern="gingham" width={40} height={12} rotate={6} color="var(--lavender-deep)"/>
                </div>
                <PaperGrid width={92} height={120}>
                  <div>03/14</div>
                  <div>♡ his bday</div>
                  <div>+ ramen?</div>
                  <div>+ playlist?</div>
                </PaperGrid>
              </div>
            </div>
          ))}

          {sec('FIELD BLOCK · for template forms', (
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="field-block" style={{ flex: 1 }}>
                <div className="field-block-label">name</div>
                <div className="field-block-value">Mei</div>
              </div>
              <div className="field-block" style={{ flex: 1 }}>
                <div className="field-block-label">pronouns</div>
                <div className="field-block-value">she/her</div>
              </div>
            </div>
          ))}

          {sec('DIVIDERS', (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--primary)' }}/>
                <Bullets.Heart size={10}/>
                <div style={{ flex: 1, height: 1, background: 'var(--primary)' }}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, borderBottom: '1px dashed var(--line-strong)' }}/>
                <Bullets.Sakura size={11}/>
                <div style={{ flex: 1, borderBottom: '1px dashed var(--line-strong)' }}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--lavender-deep)' }}/>
                <Bullets.Star size={11} color="var(--lavender-deep)"/>
                <Bullets.Dot size={6} color="var(--lavender-deep)"/>
                <Bullets.Star size={11} color="var(--lavender-deep)"/>
                <div style={{ flex: 1, height: 1, background: 'var(--lavender-deep)' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: 18, padding: '10px 14px',
        background: 'var(--vellum)', border: '1px dashed var(--line-strong)',
        borderRadius: 12, fontFamily: 'var(--font-script)', fontSize: 15, color: 'var(--ink-2)',
      }}>
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Note ♡</span> — every component above re-themes when the user picks a different palette. Templates use the same tokens, so a ship's chosen color flows through buttons, washi tints, slider fills, etc.
      </div>
    </div>
  );
}

Object.assign(window, { KitDisplay });
