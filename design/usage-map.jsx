/* usage-map.jsx — explicit mapping: which component goes where */

function UsageMap() {
  const Row = ({ screen, where, kit, screenshot }) => (
    <div style={{
      display: 'grid', gridTemplateColumns: '160px 1fr 1fr',
      gap: 16, padding: '16px 0',
      borderBottom: '1px dashed var(--line-strong)',
      alignItems: 'flex-start',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--ink)', lineHeight: 1.1 }}>{screen}</div>
        <div style={{ marginTop: 8 }}>{screenshot}</div>
      </div>
      <div>
        <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>where</div>
        <ul style={{ margin: '4px 0 0', paddingLeft: 14, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink)', lineHeight: 1.6 }}>
          {where.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>
      <div>
        <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>kit pieces used</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {kit.map((k, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-ui)', fontSize: 10.5, padding: '3px 8px',
              background: k.tone === 'primary' ? 'var(--primary-soft)' : k.tone === 'lavender' ? 'var(--lavender-soft)' : k.tone === 'butter' ? 'var(--butter-soft)' : 'var(--paper-deep)',
              color: k.tone === 'primary' ? 'var(--primary-ink)' : k.tone === 'lavender' ? 'var(--lavender-deep)' : k.tone === 'butter' ? 'var(--butter-deep)' : 'var(--ink)',
              border: `1px solid ${k.tone === 'primary' ? 'var(--primary-tint)' : k.tone === 'lavender' ? 'var(--lavender)' : k.tone === 'butter' ? 'var(--butter)' : 'var(--line)'}`,
              borderRadius: 999,
            }}>{k.label}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // Tiny screen previews — single block of mini SVG/CSS hints
  const MiniPhone = ({ children }) => (
    <div style={{
      width: 90, height: 140,
      background: 'var(--paper)',
      borderRadius: 12,
      border: '1.5px solid var(--ink-3)',
      overflow: 'hidden',
      position: 'relative',
    }}>{children}</div>
  );

  return (
    <div className="theme-sakura" style={{
      width: '100%', height: '100%',
      background: 'var(--paper)',
      padding: 28,
      overflow: 'auto',
      fontFamily: 'var(--font-ui)',
    }}>
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">how to use the kit</div>
        <div className="display" style={{ fontSize: 30, lineHeight: 1.05, marginTop: 4 }}>
          screen ↔ component map
        </div>
        <div style={{ fontFamily: 'var(--font-script)', fontSize: 17, color: 'var(--ink-2)', marginTop: 6 }}>
          which paper goes on which screen — bullets per template — sticker per empty state. tape variants per F/O.
        </div>
      </div>

      {/* ───────────────────── ROWS ───────────────────── */}

      <Row
        screen="Home · your ships"
        screenshot={
          <MiniPhone>
            <div style={{ padding: 6, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 9, color: 'var(--ink)' }}>your ships</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '0 6px' }}>
              <div style={{ aspectRatio: '3/4', background: 'linear-gradient(135deg, var(--primary-tint), var(--primary))', borderRadius: 4, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -1, left: -3, transform: 'rotate(-8deg)' }}><WashiTape pattern="heart" width={22} height={5}/></div>
              </div>
              <div style={{ aspectRatio: '3/4', background: 'linear-gradient(135deg, var(--lavender), var(--lavender-deep))', borderRadius: 4, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -1, left: -3, transform: 'rotate(-8deg)' }}><WashiTape pattern="dot" width={22} height={5} color="var(--lavender-deep)"/></div>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 14, right: 6, transform: 'rotate(8deg)' }}><StickerSakuraFlower size={16}/></div>
          </MiniPhone>
        }
        where={[
          'Washi tape diagonal on each ship card (top-left corner)',
          'Per-ship tape pattern matches their relationship vibe',
          'Sticker accent (sakura flower) on add-card / empty zone',
          'Sparkle in title row',
        ]}
        kit={[
          { label: 'Washi · 9 patterns', tone: 'primary' },
          { label: 'StickerSakuraFlower', tone: 'primary' },
          { label: 'StickerSparkle', tone: 'primary' },
          { label: 'Bullet · type-dot', tone: 'default' },
        ]}
      />

      <Row
        screen="Vault · messages"
        screenshot={
          <MiniPhone>
            <div style={{ padding: '4px 6px', fontFamily: 'var(--font-marker)', fontSize: 7, color: 'var(--ink-3)', textAlign: 'center', borderBottom: '0.5px solid var(--line)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -2, left: 24, transform: 'rotate(-6deg)' }}><WashiTape pattern="floral" width={28} height={6}/></div>
              <span style={{ background: 'var(--paper)', padding: '0 4px' }}>tue · 3:42pm</span>
            </div>
            <div style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ alignSelf: 'flex-start', background: 'var(--vellum)', border: '0.6px solid var(--line)', padding: '3px 6px', borderRadius: '6px 6px 6px 1px', fontSize: 6 }}>oi. you up?</div>
              <div style={{ alignSelf: 'flex-end', background: 'var(--primary)', color: 'white', padding: '3px 6px', borderRadius: '6px 6px 1px 6px', fontSize: 6 }}>can't sleep</div>
              <div style={{ alignSelf: 'flex-start', background: 'var(--vellum)', border: '0.6px solid var(--line)', padding: '3px 6px', borderRadius: '6px 6px 6px 1px', fontSize: 6 }}>come down</div>
            </div>
            <div style={{ position: 'absolute', top: 38, right: 4 }}><StickerEnvelope size={18}/></div>
          </MiniPhone>
        }
        where={[
          'Washi pill on each date separator',
          'Envelope sticker on empty state',
          'Floral washi behind header avatar',
          'Sparkle accent on reactions row',
        ]}
        kit={[
          { label: 'WashiTape · floral/dot', tone: 'primary' },
          { label: 'StickerEnvelope (empty)', tone: 'primary' },
          { label: 'StickerSparkle', tone: 'primary' },
          { label: 'CalloutBubble (note)', tone: 'primary' },
        ]}
      />

      <Row
        screen="Vault · dates"
        screenshot={
          <MiniPhone>
            <div style={{ padding: 4 }}>
              {['var(--primary)', 'var(--lavender-deep)', 'var(--butter-deep)'].map((c, i) => (
                <div key={i} style={{ background: 'var(--vellum)', border: '0.5px solid var(--line)', borderRadius: 4, padding: 3, marginTop: 3, display: 'flex', gap: 4, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -2, left: 6, transform: 'rotate(-6deg)' }}><WashiTape pattern={['heart','dot','star'][i]} width={14} height={4} color={c}/></div>
                  <div style={{ width: 18, padding: 1, background: `color-mix(in oklch, ${c} 14%, white)`, border: `0.5px solid ${c}55`, borderRadius: 2, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 10, color: c, textAlign: 'center', lineHeight: 1 }}>12</div>
                  <div style={{ flex: 1, fontSize: 5, color: 'var(--ink)' }}>his birthday</div>
                </div>
              ))}
            </div>
          </MiniPhone>
        }
        where={[
          'Each date card gets a colored washi tape corner',
          'Heart bullet marks pinned/anniversary dates',
          'Sparkle in title row',
          'Color flows from event type (sakura/lavender/butter…)',
        ]}
        kit={[
          { label: 'WashiTape · per-card color', tone: 'primary' },
          { label: 'Bullet · Heart (pinned)', tone: 'primary' },
          { label: 'StickerSparkle', tone: 'primary' },
        ]}
      />

      <Row
        screen="Vault · scenarios"
        screenshot={
          <MiniPhone>
            <div style={{ padding: 5 }}>
              <div style={{ background: 'var(--vellum)', border: '0.5px solid var(--line)', borderRadius: 4, padding: 4, position: 'relative', marginTop: 4 }}>
                <div style={{ position: 'absolute', top: -3, right: 8, transform: 'rotate(6deg)' }}><WashiTape pattern="heart" width={20} height={5}/></div>
                <div style={{ fontSize: 4.5, color: 'var(--primary)', fontFamily: 'var(--font-marker)' }}>MAR · 18</div>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 8, color: 'var(--ink)', lineHeight: 1 }}>he runs in soaking wet</div>
                <div style={{ fontSize: 4.5, color: 'var(--ink-2)', fontFamily: 'var(--font-script)' }}>strawberry milk in hand</div>
              </div>
              <div style={{ background: 'var(--paper-soft)', border: '0.5px solid var(--line)', borderRadius: 4, padding: 4, position: 'relative', marginTop: 4 }}>
                <div style={{ position: 'absolute', top: -2, left: 6, transform: 'rotate(-6deg)' }}><WashiTape pattern="floral" width={14} height={4} color="var(--lavender-deep)"/></div>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 7, color: 'var(--ink)' }}>airport, 4am</div>
              </div>
              <div style={{ position: 'absolute', bottom: 14, right: 6 }}><StickerSakuraBranch size={22}/></div>
            </div>
          </MiniPhone>
        }
        where={[
          'Washi tape on each scenario card (mood-tinted)',
          'Sakura branch sticker for empty state',
          'Sakura bullet next to tag chips',
          'Optional polaroid attachment per scenario',
        ]}
        kit={[
          { label: 'WashiTape · mood color', tone: 'primary' },
          { label: 'StickerSakuraBranch (empty)', tone: 'primary' },
          { label: 'PaperPolaroid (attachment)', tone: 'lavender' },
          { label: 'Bullet · Sakura', tone: 'primary' },
        ]}
      />

      <Row
        screen="Ship section · storyline"
        screenshot={
          <MiniPhone>
            <div style={{ padding: 4 }}>
              <div style={{ background: 'var(--vellum)', border: '1px solid var(--ink)', borderRadius: 4, padding: 4, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -2, right: 6, transform: 'rotate(6deg)' }}><WashiTape pattern="star" width={20} height={5} color="var(--lavender-deep)"/></div>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 7, color: 'var(--ink)' }}>OUR STORYLINE</div>
                <div style={{ paddingLeft: 6, marginTop: 4, borderLeft: '0.5px dashed var(--ink)' }}>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: 2 }}><Bullets.Sakura size={6}/><span style={{ fontSize: 5 }}>JAN · first met</span></div>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: 2 }}><Bullets.Star size={6}/><span style={{ fontSize: 5 }}>FEB · shared earbuds</span></div>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: 2 }}><Bullets.Crescent size={6}/><span style={{ fontSize: 5 }}>MAR · rooftop</span></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}><StickerPolaroid size={18}/></div>
              </div>
            </div>
          </MiniPhone>
        }
        where={[
          'Bullet per timeline event — varies by mood',
          'Polaroid in corner with photo of milestone',
          'Washi tape on template header (star/floral)',
          'Last/biggest event = filled marker',
        ]}
        kit={[
          { label: 'Bullet · Sakura / Star / Crescent', tone: 'primary' },
          { label: 'StickerPolaroid', tone: 'lavender' },
          { label: 'WashiTape · star/floral', tone: 'butter' },
        ]}
      />

      <Row
        screen="Ship section · headcanons"
        screenshot={
          <MiniPhone>
            <div style={{ padding: 4 }}>
              <div style={{ background: 'var(--vellum)', border: '1px solid var(--ink)', borderRadius: 4, padding: 4, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -2, left: 6, transform: 'rotate(-4deg)' }}><WashiTape pattern="floral" width={22} height={5}/></div>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 7, color: 'var(--ink)' }}>HEADCANONS</div>
                {[['性 PERSONALITY', 'Sakura'], ['癖 HABITS', 'Crescent'], ['好 FAVORITES', 'Star']].map((c, i) => {
                  const B = Bullets[c[1]];
                  return (
                    <div key={i} style={{ border: '0.5px solid var(--ink)', borderRadius: 2, marginTop: 3, padding: 2 }}>
                      <div style={{ fontSize: 5, fontWeight: 700 }}>{c[0]}</div>
                      <div style={{ display: 'flex', gap: 2, alignItems: 'center', marginTop: 1 }}>
                        <B size={5}/>
                        <span style={{ fontSize: 5 }}>·····</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </MiniPhone>
        }
        where={[
          'Different bullet per category (Personality/Habits/Favorites)',
          'Washi banner across template header',
          'Sticker accents in corners (sparkle, flower)',
          'Color flows from ship palette',
        ]}
        kit={[
          { label: 'Bullet · Sakura (Personality)', tone: 'primary' },
          { label: 'Bullet · Crescent (Habits)', tone: 'lavender' },
          { label: 'Bullet · Star (Favorites)', tone: 'butter' },
          { label: 'WashiTape · header', tone: 'primary' },
        ]}
      />

      <Row
        screen="Template · love-letter / compose"
        screenshot={
          <MiniPhone>
            <div style={{ padding: 4 }}>
              <div style={{ background: 'var(--vellum)', borderRadius: 4, padding: 4, position: 'relative', backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 8px, var(--line) 8px 8.5px)' }}>
                <div style={{ fontFamily: 'var(--font-script)', fontSize: 7, color: 'var(--primary-ink)', lineHeight: '8px' }}>
                  Dear Kuroo,<br/>I think about<br/>the way you<br/>look at me when<br/>you don't think...
                </div>
                <div style={{ position: 'absolute', bottom: -8, right: 8 }}><StickerWaxSeal size={20}/></div>
              </div>
            </div>
          </MiniPhone>
        }
        where={[
          'Lined paper background for the body',
          'Wax seal as the "send / seal" CTA',
          'Envelope appears after sealing (in letters list)',
          'Caveat font for the letter body',
        ]}
        kit={[
          { label: 'PaperLined', tone: 'default' },
          { label: 'StickerWaxSeal (send)', tone: 'primary' },
          { label: 'StickerEnvelope (after)', tone: 'primary' },
        ]}
      />

      <Row
        screen="Onboarding · persona"
        screenshot={
          <MiniPhone>
            <div style={{ padding: 4 }}>
              <div style={{ fontSize: 5, color: 'var(--primary)', fontFamily: 'var(--font-marker)' }}>STEP ONE · YOU</div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 7, color: 'var(--ink)', lineHeight: 1 }}>Who are you,<br/>in their world?</div>
              <div style={{ background: 'var(--vellum)', borderRadius: 4, padding: 3, marginTop: 4, fontSize: 5 }}>
                <div style={{ color: 'var(--ink-3)' }}>NAME</div>
                <div style={{ fontFamily: 'var(--font-script)', fontSize: 7, color: 'var(--primary-ink)', borderBottom: '0.5px solid var(--line)' }}>Mei</div>
              </div>
              {/* callout */}
              <div style={{ marginTop: 6, background: '#fadde5', border: '0.6px solid #e8a8b5', borderRadius: 6, padding: 3, fontFamily: 'var(--font-script)', fontSize: 5, color: '#8b3a4a', position: 'relative' }}>
                "no wrong way."
              </div>
              <div style={{ position: 'absolute', top: 22, right: 6 }}><StickerSakuraBranch size={20}/></div>
            </div>
          </MiniPhone>
        }
        where={[
          'Pink CalloutBubble below the form for reassurance',
          'Sakura branch deco in top-right',
          'Sparkle on selected color swatch',
          'Heart patch sticker on confirmation',
        ]}
        kit={[
          { label: 'CalloutBubble (pink)', tone: 'primary' },
          { label: 'StickerSakuraBranch (deco)', tone: 'primary' },
          { label: 'StickerSparkle (selected)', tone: 'primary' },
          { label: 'StickerHeartPatch (confirm)', tone: 'primary' },
        ]}
      />

      <Row
        screen="Onboarding · new ship"
        screenshot={
          <MiniPhone>
            <div style={{ padding: 4 }}>
              <div style={{ fontSize: 5, color: 'var(--primary)', fontFamily: 'var(--font-marker)' }}>STEP TWO · THEM</div>
              <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
                <div style={{ width: 18, height: 22, background: 'linear-gradient(135deg, var(--primary-tint), var(--primary))', borderRadius: 3, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -1, left: -2, transform: 'rotate(-8deg)' }}><WashiTape pattern="heart" width={10} height={3}/></div>
                </div>
                <div style={{ fontFamily: 'var(--font-script)', fontSize: 7, color: 'var(--primary-ink)' }}>Kuroo</div>
              </div>
              <div style={{ marginTop: 8, background: '#ece4f7', border: '0.6px solid #c7b5e3', borderRadius: '50%/40%', padding: 4, fontFamily: 'var(--font-script)', fontSize: 5, color: '#4d3982', textAlign: 'center' }}>
                love them how you want
              </div>
            </div>
          </MiniPhone>
        }
        where={[
          'Lavender ThoughtCloud at bottom with a soft note',
          'Washi tape on preview-card top-left',
          'Color palette row · the 6 palette swatches',
          'Heart-patch sticker as decoration',
        ]}
        kit={[
          { label: 'ThoughtCloud (lavender)', tone: 'lavender' },
          { label: 'PALETTES · 6 swatches', tone: 'primary' },
          { label: 'WashiTape · heart', tone: 'primary' },
          { label: 'StickerHeartPatch', tone: 'primary' },
        ]}
      />

      <Row
        screen="Templates · color customizer"
        screenshot={
          <MiniPhone>
            <div style={{ padding: 4 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 7 }}>customize Kuroo</div>
              <div style={{ background: 'var(--vellum)', borderRadius: 4, marginTop: 3, overflow: 'hidden', border: '0.5px solid var(--line)' }}>
                <div style={{ height: 24, background: 'linear-gradient(135deg, var(--primary-tint), var(--primary))' }}/>
                <div style={{ padding: 2, fontSize: 5 }}>Kuroo Tetsurō</div>
              </div>
              <div style={{ fontSize: 4.5, color: 'var(--ink-3)', marginTop: 3, fontFamily: 'var(--font-marker)' }}>THEIR COLOR</div>
              <div style={{ display: 'flex', gap: 2, marginTop: 1 }}>
                {PALETTES.map(p => <div key={p.id} style={{ width: 8, height: 8, borderRadius: '50%', background: p.hue, border: p.id === 'sakura' ? '1px solid var(--ink)' : '0.4px solid var(--line)' }}/>)}
              </div>
              <div style={{ fontSize: 4.5, color: 'var(--ink-3)', marginTop: 3, fontFamily: 'var(--font-marker)' }}>TAPE PATTERN</div>
              <div style={{ display: 'flex', gap: 2, marginTop: 1, flexWrap: 'wrap' }}>
                {['heart','floral','dot','star'].map(p => <WashiTape key={p} pattern={p} width={12} height={4}/>)}
              </div>
            </div>
          </MiniPhone>
        }
        where={[
          'Live ship card preview at top — re-themes instantly',
          '6-palette swatch row · per-ship CSS var override',
          'Washi pattern picker — 9 patterns',
          'Paper texture picker (plain/lined/grid/scallop)',
          'Sticker accent picker (envelope, branch, polaroid…)',
        ]}
        kit={[
          { label: 'PALETTES (6)', tone: 'primary' },
          { label: 'WashiTape (9 patterns)', tone: 'primary' },
          { label: 'Papers (4 styles)', tone: 'butter' },
          { label: 'Stickers (8)', tone: 'lavender' },
        ]}
      />

      <Row
        screen="Empty states everywhere"
        screenshot={
          <MiniPhone>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <StickerEnvelope size={26}/>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 7, color: 'var(--ink)' }}>your conversation</div>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: 6, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.2 }}>imagined texts —<br/>never sent.</div>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: 999, fontSize: 5 }}>write first one</div>
            </div>
          </MiniPhone>
        }
        where={[
          'Messages empty → envelope sticker',
          'Scenarios empty → sakura branch',
          'Dates empty → leaf branch',
          'Headcanons empty → wax seal',
          'Letters empty → ticket / polaroid',
        ]}
        kit={[
          { label: 'StickerEnvelope', tone: 'primary' },
          { label: 'StickerSakuraBranch', tone: 'primary' },
          { label: 'StickerLeafBranch', tone: 'lavender' },
          { label: 'StickerWaxSeal', tone: 'primary' },
          { label: 'StickerTicket', tone: 'primary' },
        ]}
      />

      {/* legend */}
      <div style={{
        marginTop: 18, padding: '12px 14px',
        background: 'var(--vellum)', border: '1px dashed var(--line-strong)', borderRadius: 14,
        fontFamily: 'var(--font-script)', fontSize: 16, color: 'var(--ink-2)', lineHeight: '20px',
      }}>
        <strong style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--primary)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>tldr · rules of use</strong>
        <div style={{ marginTop: 6 }}>
          ♡ <b style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink)' }}>Washi tape</b> — anywhere a card/paper has a "pinned" or scrapbook feel. Always 1, rotated −4 to +8°.<br/>
          ♡ <b style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink)' }}>Stickers</b> — empty states (1 large) and template decoration corners (2-3 small).<br/>
          ♡ <b style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink)' }}>Bullets</b> — vary by category in any list of 3+ groups (storyline events, headcanon cats).<br/>
          ♡ <b style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink)' }}>Callouts</b> — onboarding / first-time tips only. One per screen, never two.<br/>
          ♡ <b style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink)' }}>Papers</b> — for templates that imitate paper (letter, journal, scrapbook). Not for chrome.<br/>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { UsageMap });
