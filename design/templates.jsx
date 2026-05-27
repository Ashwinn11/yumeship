/* templates.jsx — community-style templates + customization */

// ═══════════════════════════════════════════════════════════════
// CUSTOMIZER — palette swatches that re-theme any template live
// ═══════════════════════════════════════════════════════════════
function ThemePicker({ value, onChange }) {
  return (
    <div style={{
      background: 'var(--vellum)', border: '1.4px solid var(--line)',
      borderRadius: 16, padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 2px 8px rgba(110,58,90,0.06)',
    }}>
      <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>theme</div>
      <div style={{ flex: 1, display: 'flex', gap: 7 }}>
        {PALETTES.map((p) => (
          <button key={p.id}
            onClick={() => onChange?.(p.id)}
            style={{
              width: 26, height: 26, borderRadius: '50%',
              background: p.hue, cursor: 'pointer',
              border: value === p.id ? '2.5px solid var(--ink)' : '1.5px solid var(--line)',
              padding: 0,
              position: 'relative',
            }}>
            {value === p.id && (
              <div style={{ position: 'absolute', top: -8, left: -8 }}>
                <Bullets.Sakura size={12} color={p.hue}/>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HEADCANONS — REFINED with varied bullets (sakura, star, crescent, square…)
// ═══════════════════════════════════════════════════════════════
function HeadcanonsRefined({ theme = 'sakura' }) {
  const cats = [
    { ja: '性', name: 'PERSONALITY', bullet: 'Sakura', items: [
      'overcaffeinated past 3pm',
      'will pretend not to remember your favorite snack — then bring it anyway',
      'gets stupidly competitive at carnival games',
    ]},
    { ja: '癖', name: 'HABITS', bullet: 'Crescent', items: [
      'falls asleep with one hand outside the blanket',
      'whistles when he\'s lying',
      'collects ticket stubs in his wallet',
    ]},
    { ja: '好', name: 'FAVORITES', bullet: 'Star', items: [
      'strawberry milk · the chunky pulp kind',
      'rainy days · but only from indoors',
      'cats with bad attitudes',
    ]},
  ];
  return (
    <div style={{ height: '100%', background: 'var(--paper)', overflow: 'auto' }} className="no-scrollbar">
      <div style={{ padding: '16px 16px 100px' }}>
        <div style={{
          background: 'var(--vellum)', border: '2px solid var(--ink)',
          borderRadius: 14, padding: 16, position: 'relative',
          boxShadow: '0 4px 12px rgba(43,26,38,0.10)',
        }}>
          <div style={{ position: 'absolute', top: -8, left: 24 }}>
            <WashiTape pattern="floral" width={70} height={14} rotate={-4}/>
          </div>
          {/* Title */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 22, letterSpacing: -0.3, color: 'var(--ink)' }}>HEADCANONS</div>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 14, color: 'var(--ink)', fontStyle: 'italic' }}>the things only I'd notice</div>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 12, color: 'var(--ink)', fontStyle: 'italic', marginTop: 4 }}>
              template by <u>@daydreamr</u>
            </div>
          </div>

          {/* Field row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 10, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: 0.6 }}>F/O</span>
              <div style={{ width: 80, height: 18, background: 'white', border: '1.5px solid var(--ink)', borderRadius: 4, padding: '0 6px', display: 'flex', alignItems: 'center', fontFamily: 'var(--font-ja)', fontSize: 10, color: 'var(--ink)', fontWeight: 600 }}>Kuroo Tetsurō</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 10, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: 0.6 }}>SOURCE</span>
              <div style={{ width: 60, height: 18, background: 'white', border: '1.5px solid var(--ink)', borderRadius: 4, padding: '0 6px', display: 'flex', alignItems: 'center', fontFamily: 'var(--font-ja)', fontSize: 10, color: 'var(--ink)', fontWeight: 600 }}>Haikyuu</div>
            </div>
          </div>

          {/* Cats */}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cats.map((c, ci) => {
              const B = Bullets[c.bullet];
              return (
                <div key={ci} style={{ border: '1.5px solid var(--ink)', borderRadius: 8, background: 'white', overflow: 'hidden' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', background: 'var(--primary-soft)',
                    borderBottom: '1.5px solid var(--ink)',
                  }}>
                    <span style={{ fontFamily: 'var(--font-ja)', fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>{c.ja}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: 0.3 }}>{c.name}</span>
                    <div style={{ marginLeft: 'auto', padding: '1px 8px', background: 'white', border: '1px solid var(--ink)', borderRadius: 999, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9, color: 'var(--ink)' }}>{c.items.length}</div>
                  </div>
                  <div style={{ padding: '6px 10px' }}>
                    {c.items.map((it, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                        padding: '6px 0',
                        borderBottom: idx < c.items.length - 1 ? '1px solid rgba(43,26,38,0.18)' : 'none',
                      }}>
                        <div style={{ marginTop: 3 }}><B size={11}/></div>
                        <div style={{ flex: 1, fontFamily: 'var(--font-ja)', fontSize: 11, color: 'var(--ink)', fontWeight: 600, lineHeight: '14px' }}>{it}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STORYLINE — REFINED with varied markers
// ═══════════════════════════════════════════════════════════════
function StorylineRefined({ theme = 'sakura' }) {
  const events = [
    { d: 'JAN 12', t: 'first encounter', body: 'gym at 6am, both of us trying to pretend we weren\'t.', marker: 'Sakura' },
    { d: 'FEB 14', t: 'shared earbuds', body: 'the second train was running late and he didn\'t move.', marker: 'Star' },
    { d: 'MAR 30', t: 'rooftop', body: 'he asked if i wanted to skip my next class.', marker: 'Crescent' },
    { d: 'MAY 02', t: 'his name', body: 'finally. just before the train doors closed.', marker: 'Square', last: true },
  ];
  return (
    <div style={{ height: '100%', background: 'var(--paper)', overflow: 'auto' }} className="no-scrollbar">
      <div style={{ padding: '16px 16px 100px' }}>
        <div style={{
          background: 'var(--vellum)', border: '2px solid var(--ink)',
          borderRadius: 14, padding: 16, position: 'relative',
          boxShadow: '0 4px 12px rgba(43,26,38,0.10)',
        }}>
          <div style={{ position: 'absolute', top: -8, right: 30 }}>
            <WashiTape pattern="star" width={60} height={14} rotate={6} color="var(--lavender-deep)"/>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 20, letterSpacing: -0.3, color: 'var(--ink)' }}>OUR STORYLINE</div>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 14, color: 'var(--ink)' }}>the year so far</div>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 12, color: 'var(--ink)', marginTop: 2 }}>template by <u>@plumstamps</u></div>
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative', paddingLeft: 24, marginTop: 12 }}>
            <div style={{
              position: 'absolute', left: 7, top: 6, bottom: 6, width: 0,
              borderLeft: '1.5px dashed var(--ink)',
            }}/>
            {events.map((e, i) => {
              const B = Bullets[e.marker];
              return (
                <div key={i} style={{ marginBottom: 14, position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: -23, top: 2,
                    width: 16, height: 16, borderRadius: '50%',
                    background: e.last ? 'var(--ink)' : 'white',
                    border: '1.5px solid var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!e.last && <B size={9}/>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <div style={{
                      background: 'var(--primary-soft)', padding: '1px 5px',
                      border: '1.2px solid var(--ink)', borderRadius: 4,
                      fontFamily: 'var(--font-marker)', fontSize: 9, fontWeight: 700, color: 'var(--ink)',
                    }}>{e.d}</div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: 0.3, flex: 1 }}>{e.t}</div>
                    {e.last && <IconHeart size={13} color="var(--ink)"/>}
                  </div>
                  <div style={{ fontFamily: 'var(--font-ja)', fontSize: 11, color: 'var(--ink)', lineHeight: '15px', marginTop: 3 }}>{e.body}</div>
                </div>
              );
            })}
          </div>

          {/* Polaroid in corner */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <PaperPolaroid width={86} height={104} rotate={4}>
              <StickerSakuraBranch size={50}/>
            </PaperPolaroid>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NEW TEMPLATE 1 — FLIP PHONE PROFILE (Y2K window style)
// ═══════════════════════════════════════════════════════════════
function FlipPhoneTemplate({ theme = 'sakura' }) {
  return (
    <div style={{
      height: '100%',
      background: `
        repeating-linear-gradient(0deg, var(--primary-soft) 0 14px, transparent 14px 28px),
        repeating-linear-gradient(90deg, var(--primary-soft) 0 14px, var(--paper) 14px 28px)
      `,
      overflow: 'auto',
    }} className="no-scrollbar">
      <div style={{ padding: '16px 14px 100px' }}>
        <div style={{
          background: 'var(--primary)', border: '2px solid var(--primary-ink)',
          borderRadius: 18, padding: 14, position: 'relative',
          boxShadow: '0 6px 18px rgba(110,58,90,0.20)',
        }}>
          {/* Ribbon */}
          <div style={{ position: 'absolute', top: -8, left: 12, transform: 'rotate(-8deg)' }}>
            <WashiTape pattern="floral" width={70} height={14} color="var(--primary-ink)"/>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginTop: 4, marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'white', letterSpacing: -0.3 }}>My YumeShip</div>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 14, color: 'white', opacity: 0.85 }}>♡ ♡ ♡ ♡ ♡</div>
          </div>

          {/* Top row: small chat window + about */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Y2KWindow title="To:" tint={`color-mix(in oklch, var(--primary) 70%, white)`}>
              <div style={{ fontFamily: 'var(--font-ja)', fontSize: 9, color: 'white', lineHeight: '12px' }}>
                <b>xx says:</b><br/>i miss you<br/>
                <b>xx says:</b><br/>come over?<br/>
                <b>xx says:</b><br/>♡♡♡
              </div>
              <div style={{ marginTop: 4, height: 12, background: 'white', borderRadius: 6, border: '1px solid var(--primary-ink)'}}/>
            </Y2KWindow>
            <Y2KWindow title="About Me" tint={`color-mix(in oklch, var(--primary) 70%, white)`}>
              <div style={{ fontFamily: 'var(--font-ja)', fontSize: 9, color: 'white', lineHeight: '13px' }}>
                <b>Name:</b> Mei<br/>
                <b>Nickname:</b> Mei-chan<br/>
                <b>Age:</b> 24<br/>
                <b>Birthday:</b> 03/14<br/>
                <b>Occupation:</b> dreaming<br/>
                <b>My Valentine ♡</b>
              </div>
            </Y2KWindow>
          </div>

          {/* Middle: Phone screen photo */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
            <div style={{
              width: 100, height: 130,
              background: `linear-gradient(135deg, color-mix(in oklch, var(--primary) 30%, white), white)`,
              border: '2px solid var(--primary-ink)', borderRadius: 14,
              padding: 6,
              position: 'relative',
              boxShadow: '0 3px 10px rgba(110,58,90,0.20)',
            }}>
              <div style={{ position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)', fontSize: 8, fontWeight: 700, color: 'white' }}>+ + + +</div>
              <div style={{ width: '100%', height: '100%', background: 'white', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StickerPolaroid size={64}/>
              </div>
              <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 18, height: 6, background: 'var(--primary-ink)', borderRadius: 6 }}/>
            </div>
          </div>

          {/* Sharing window + Free space */}
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 8 }}>
            <Y2KWindow title="!" tint={`color-mix(in oklch, var(--primary) 50%, white)`} mini>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '4px 0' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>⚠</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, color: 'white', letterSpacing: 0.4 }}>SHARING</span>
              </div>
              <div style={{ background: 'white', borderRadius: 4, padding: '2px 6px', fontFamily: 'var(--font-ja)', fontWeight: 700, fontSize: 9, color: 'var(--primary-ink)', textAlign: 'center', border: '1px solid var(--primary-ink)' }}>Selective</div>
            </Y2KWindow>
            <Y2KWindow title="Free space" tint={`color-mix(in oklch, var(--primary) 70%, white)`}>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: 13, color: 'white', lineHeight: '15px' }}>
                he kissed me on the rooftop. i was three years too young. neither of us blinked.
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                <Bullets.Heart size={10} color="white"/>
                <Bullets.Sakura size={10} color="white"/>
                <Bullets.Star size={10} color="white"/>
              </div>
            </Y2KWindow>
          </div>

          {/* Theme song player */}
          <div style={{ marginTop: 10, background: `color-mix(in oklch, var(--primary) 70%, white)`, border: '1.5px solid var(--primary-ink)', borderRadius: 10, padding: '8px 10px' }}>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 13, color: 'white', textAlign: 'center' }}>♪ Theme Song</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 8, color: 'white', fontFamily: 'var(--font-marker)' }}>0:00</span>
              <div style={{ flex: 1, height: 3, background: 'white', borderRadius: 2, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: 'var(--primary-ink)', borderRadius: 2 }}/>
                <div style={{ position: 'absolute', left: '40%', top: '-2px', width: 7, height: 7, borderRadius: '50%', background: 'white', border: '1px solid var(--primary-ink)' }}/>
              </div>
              <span style={{ fontSize: 8, color: 'white', fontFamily: 'var(--font-marker)' }}>3:50</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Y2KWindow({ title, children, tint, mini }) {
  return (
    <div style={{
      background: 'white',
      border: '1.5px solid var(--primary-ink)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <div style={{
        background: tint || 'var(--primary)',
        padding: '3px 6px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1.5px solid var(--primary-ink)',
      }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9, color: 'white', textTransform: 'uppercase', letterSpacing: 0.4 }}>{title}</span>
        <span style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }}/>)}
        </span>
      </div>
      <div style={{ padding: mini ? 4 : 8, background: tint || 'var(--primary)', minHeight: mini ? 0 : 60 }}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NEW TEMPLATE 2 — TALKING ABOUT MY YUME (dual portrait)
// ═══════════════════════════════════════════════════════════════
function TalkingAboutTemplate({ theme = 'sakura' }) {
  return (
    <div style={{
      height: '100%',
      background: `
        radial-gradient(ellipse at top, var(--primary-soft), var(--paper) 60%)
      `,
      overflow: 'auto',
    }} className="no-scrollbar">
      <div style={{ padding: '14px 14px 100px' }}>
        {/* header */}
        <div style={{ textAlign: 'center', marginBottom: 10, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0 }}><StickerPolaroid size={42}/></div>
          <div style={{ position: 'absolute', top: 0, right: 0 }}><StickerPolaroid size={42}/></div>
          <div style={{ fontFamily: 'var(--font-marker)', fontWeight: 600, fontSize: 9, color: 'var(--ink-3)', letterSpacing: 1.6 }}>TALKING ABOUT MY</div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 32, color: 'var(--ink)', letterSpacing: -1, lineHeight: '34px', marginTop: 2 }}>YUME</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line-strong)' }}/>
            <StickerSparkle size={8} color="var(--ink)"/>
            <div style={{ flex: 1, height: 1, background: 'var(--line-strong)' }}/>
          </div>
        </div>

        {/* Two columns with categories */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: 'var(--ink)' }}>Type of relationship ♡</div>
            {['Married', 'Engaged', 'Boy/girlfriends', 'Platonic/QPR'].map((r, i) => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                <div style={{
                  width: 11, height: 11,
                  background: i === 1 ? 'var(--primary)' : 'white',
                  border: '1.2px solid var(--ink)', borderRadius: 2,
                  backgroundImage: i === 0 ? 'repeating-linear-gradient(45deg, var(--primary) 0 1px, transparent 1px 3px)' : undefined,
                }}/>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink)' }}>{r}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: 'var(--ink)' }}>♡ This has...</div>
            {['Happy ending', 'Bad ending', 'Neutral ending'].map((r, i) => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                <div style={{ width: 11, height: 11, background: i === 0 ? 'var(--primary)' : 'white', border: '1.2px solid var(--ink)', borderRadius: 2 }}/>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink)' }}>{r}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: 'var(--ink)' }}>Yume category ♡</div>
            <div style={{ marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 11, height: 11, background: 'var(--primary)', border: '1.2px solid var(--ink)', borderRadius: 2 }}/>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink)', fontWeight: 600 }}>OC × canon</span>
              </div>
              <div style={{ marginLeft: 16, fontFamily: 'var(--font-script)', fontSize: 13, color: 'var(--ink-2)', lineHeight: '14px' }}>
                — OC<br/>— Fan character
              </div>
            </div>
            <div style={{ marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 11, height: 11, background: 'white', border: '1.2px solid var(--ink)', borderRadius: 2 }}/>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink)' }}>Selfinsert × canon</span>
              </div>
              <div style={{ marginLeft: 16, fontFamily: 'var(--font-script)', fontSize: 13, color: 'var(--ink-2)', lineHeight: '14px' }}>
                — Avatar<br/>— Sona<br/>— Persona
              </div>
            </div>
          </div>
        </div>

        {/* Center cloud / ship art */}
        <div style={{ margin: '12px auto', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 160, height: 100,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-ink))',
            borderRadius: '50% 60% 55% 65% / 60% 50% 65% 55%',
            border: '2px solid var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            color: 'white', fontFamily: 'var(--font-script)', fontSize: 16,
          }}>
            <span>your ship art ♡</span>
            <div style={{ position: 'absolute', bottom: -6, left: -6 }}>
              <StickerSparkle size={12} color="var(--ink)"/>
            </div>
            <div style={{ position: 'absolute', top: -8, right: -4 }}>
              <StickerSparkle size={14} color="var(--ink)"/>
            </div>
          </div>
        </div>

        {/* Sharing status */}
        <div style={{ textAlign: 'center', margin: '4px 0 10px' }}>
          <div style={{ fontFamily: 'var(--font-script)', fontSize: 16, color: 'var(--ink)' }}>Sharing status</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 4, fontSize: 10, fontFamily: 'var(--font-ui)' }}>
            <span>Ok ○</span>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Non-sharing ●</span>
            <span>Selective ○</span>
          </div>
        </div>

        {/* Two character columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { name: 'Mei', pron: 'she/her', h: '163cm', mbti: 'INFP', emoji: '🍒💌💗', color: 'var(--primary)', palette: ['#2b1a26', '#6b4a3a', '#fad7c0', '#f3b6c4', '#8b3a4a'] },
            { name: 'Kuroo', pron: 'he/him', h: '187cm', mbti: 'ENTP', emoji: '🪷⏳💙', color: 'var(--lavender-deep)', palette: ['#1f1e3d', '#3a3d6a', '#fad7c0', '#8b6fc4', '#4d3982'] },
          ].map((p, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', background: 'white',
                border: '1.2px dashed var(--ink)', borderRadius: 4,
              }}>
                <span style={{ fontSize: 12 }}>{p.emoji}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--ink-3)', marginTop: 2 }}>Emoji</div>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', margin: '6px auto 4px',
                background: `linear-gradient(135deg, ${p.color}, color-mix(in oklch, ${p.color} 50%, white))`,
                border: '2px solid var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24,
              }}>{p.name[0]}</div>
              <div style={{ fontFamily: 'var(--font-marker)', fontWeight: 600, fontSize: 9, color: 'var(--ink-3)', letterSpacing: 1.4 }}>18 — 22</div>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: 18, color: p.color, lineHeight: '20px', marginTop: 2 }}>{p.name}</div>

              <div style={{ marginTop: 6, fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--ink)' }}>
                <b>Pronouns:</b> <span style={{ color: p.color, fontFamily: 'var(--font-script)', fontSize: 13 }}>{p.pron}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--ink)' }}>
                <b>Height:</b> <span style={{ color: p.color, fontFamily: 'var(--font-script)', fontSize: 13 }}>{p.h}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--ink)' }}>
                <b>MBTI:</b> <span style={{ color: p.color, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13 }}>{p.mbti}</span>
              </div>
              <div style={{ marginTop: 6, fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--ink)' }}>Color palette</div>
              <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 2 }}>
                {p.palette.map((col, ci) => (
                  <svg key={ci} width="14" height="14" viewBox="0 0 16 16">
                    <path d="M8 14 C 3 11 1 8.5 1 5.5 C 1 3.5 2.5 2 4.5 2 C 6 2 7.3 2.9 8 4.3 C 8.7 2.9 10 2 11.5 2 C 13.5 2 15 3.5 15 5.5 C 15 8.5 13 11 8 14 Z" fill={col} stroke="var(--ink)" strokeWidth="0.6"/>
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tropes box */}
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            padding: '6px 10px',
            border: '1.2px dashed var(--ink)', borderRadius: 6,
            background: 'white',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 10, color: 'var(--ink-3)' }}>Tropes</div>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 13, color: 'var(--ink)', lineHeight: '15px' }}>
              slowburn · annoyance to lovers<br/>
              sunshine × grumpy<br/>
              "i'd die for you × i'd kill for you"
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Level of affection', l: 70, lc: 'var(--primary)', rc: 'var(--lavender-deep)' },
            { label: 'Libido level', l: 55, lc: 'var(--primary)', rc: 'var(--lavender-deep)' },
            { label: 'Level of confidence', l: 35, lc: 'var(--primary)', rc: 'var(--lavender-deep)' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 10, color: 'var(--ink)' }}>{s.label}</div>
              <div style={{
                height: 9, display: 'flex',
                border: '1.2px solid var(--ink)', borderRadius: 999, overflow: 'hidden', margin: '2px 0',
                position: 'relative',
              }}>
                <div style={{ width: `${s.l}%`, background: `repeating-linear-gradient(90deg, ${s.lc} 0 6px, color-mix(in oklch, ${s.lc} 50%, white) 6px 10px)` }}/>
                <div style={{ flex: 1, background: `repeating-linear-gradient(90deg, ${s.rc} 0 6px, color-mix(in oklch, ${s.rc} 50%, white) 6px 10px)` }}/>
                <div style={{ position: 'absolute', left: `${s.l}%`, top: -2, bottom: -2, width: 1.5, background: 'var(--ink)' }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Footer letters */}
        <div style={{ marginTop: 14, textAlign: 'center', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, letterSpacing: 6, color: 'var(--ink)' }}>
          <span style={{ color: 'var(--primary)' }}>M</span>
          <span style={{ color: 'var(--lavender-deep)' }}>K</span>
          <span style={{ color: 'var(--primary)' }}>U</span>
          <span style={{ color: 'var(--lavender-deep)' }}>R</span>
          <span style={{ color: 'var(--primary)' }}>O</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NEW TEMPLATE 3 — BOND BANNER (bow + heart-shield + dual sliders)
// (Renamed from "Get to know my YumeShip" since "Get to Know" already exists)
// ═══════════════════════════════════════════════════════════════
function BondBannerTemplate({ theme = 'sakura' }) {
  const sliders = [
    { l: 'Friendly', r: 'Aloof', v: 30 },
    { l: 'Emotional', r: 'Logical', v: 65 },
    { l: 'Romantic', r: 'Allergic', v: 20 },
    { l: 'Pure', r: 'Spicy', v: 50 },
    { l: 'Clingy', r: 'Distant', v: 40 },
    { l: 'Jealous', r: 'Chill', v: 75 },
  ];
  return (
    <div style={{
      height: '100%',
      background: `linear-gradient(135deg, var(--primary-soft), var(--primary-tint))`,
      overflow: 'auto',
      position: 'relative',
    }} className="no-scrollbar">
      {/* twinkle bg */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4 }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const x = (i * 73) % 320; const y = (i * 41) % 600;
          return <circle key={i} cx={x} cy={y} r="0.8" fill="white"/>;
        })}
      </svg>

      <div style={{ position: 'relative', padding: '14px 14px 100px' }}>
        {/* Top banner with bow */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <div style={{
              padding: '6px 18px',
              background: 'var(--primary-soft)',
              border: '2px solid var(--primary-ink)',
              borderRadius: 16,
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: 'var(--primary-ink)',
            }}>
              get to know my<br/>♡ YumeShip ♡
            </div>
          </div>
          {/* bow */}
          <div style={{ marginTop: -6 }}><StickerBow size={50} color="var(--primary-tint)"/></div>
          {/* heart shield */}
          <svg width="120" height="140" viewBox="0 0 120 140" style={{ marginTop: -4 }}>
            <path d="M60 130 C 20 100 6 70 6 40 C 6 22 18 14 30 14 C 44 14 54 22 60 32 C 66 22 76 14 90 14 C 102 14 114 22 114 40 C 114 70 100 100 60 130 Z"
                  fill="var(--primary-soft)" stroke="var(--primary-ink)" strokeWidth="2"/>
          </svg>
        </div>

        {/* About columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: -100, position: 'relative', zIndex: 2 }}>
          {['ME / MY OC', 'MY F/O'].map((header, i) => (
            <div key={header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, color: 'var(--primary-ink)' }}>
                <span>♡</span><span>About {header}</span>
              </div>
              {['Name', 'Pronouns', 'MBTI', 'Vibe'].map((f) => (
                <div key={f} style={{
                  marginTop: 4, padding: '4px 8px',
                  background: 'rgba(255,255,255,0.5)',
                  border: '1.5px solid var(--primary-ink)', borderRadius: 8,
                }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 8, color: 'var(--primary-ink)', letterSpacing: 0.4 }}>{f}:</div>
                  <div style={{ fontFamily: 'var(--font-script)', fontSize: 14, color: 'var(--primary-ink)', minHeight: 16 }}>
                    {i === 0 ? ['Mei', 'she/her', 'INFP', 'romantic'][['Name','Pronouns','MBTI','Vibe'].indexOf(f)]
                             : ['Kuroo', 'he/him', 'ENTP', 'slowburn'][['Name','Pronouns','MBTI','Vibe'].indexOf(f)]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Anniversary box */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
          <div style={{
            padding: '6px 18px',
            background: 'rgba(255,255,255,0.6)',
            border: '1.5px solid var(--primary-ink)', borderRadius: 10,
            textAlign: 'center', minWidth: 120,
          }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, color: 'var(--primary-ink)' }}>♡ Anniversary ♡</div>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 18, color: 'var(--primary-ink)' }}>03 / 14 / 2024</div>
          </div>
        </div>

        {/* Sliders block */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, columnGap: 24 }}>
          {[0, 1].map((col) => (
            <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sliders.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 8, color: 'var(--primary-ink)' }}>
                    <span>{s.l}</span><span>{s.r}</span>
                  </div>
                  <div style={{
                    height: 12, background: 'rgba(255,255,255,0.5)',
                    border: '1.5px solid var(--primary-ink)', borderRadius: 4,
                    position: 'relative', marginTop: 2,
                    display: 'flex',
                  }}>
                    <div style={{ width: `${col === 0 ? s.v : 100 - s.v}%`, background: 'rgba(255,255,255,0.85)', borderRight: '1.5px solid var(--primary-ink)' }}/>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Credit */}
        <div style={{ marginTop: 14, textAlign: 'center', fontFamily: 'var(--font-marker)', fontWeight: 700, fontSize: 9, color: 'var(--primary-ink)', letterSpacing: 1.2 }}>
          credit: @yumeship
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ThemePicker, HeadcanonsRefined, StorylineRefined, FlipPhoneTemplate, TalkingAboutTemplate, BondBannerTemplate, Y2KWindow });
