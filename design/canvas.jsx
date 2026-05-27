/* canvas.jsx — main composition mounted into #root */

function App() {
  return (
    <DesignCanvas>
      {/* ─── INTRO ─── */}
      <DCSection id="intro" title="yumeship · cozy UI v2" subtitle="kit refresh, screen fixes, customization, new community-style templates">
        <DCArtboard id="usage-map" label="00 · screen ↔ component MAP" width={1000} height={1400}>
          <UsageMap/>
        </DCArtboard>
        <DCArtboard id="kit" label="01 · component kit (full reference)" width={780} height={780}>
          <KitDisplay theme="sakura"/>
        </DCArtboard>
      </DCSection>

      {/* ─── CUSTOMIZATION ─── */}
      <DCSection id="customize" title="customize · per-ship theming" subtitle="palette/washi/paper cascades through the whole UI. one ship card shown across themes to demo — same template, just recolored.">
        <DCArtboard id="customize-screen" label="customize panel · live retheme" width={340} height={680}>
          <Phone theme="sakura"><CustomizeScreen/></Phone>
        </DCArtboard>
        <DCArtboard id="theme-sakura" label="ship card · sakura" width={340} height={680}>
          <Phone theme="sakura"><ShipCardPreview name="Mei × Kuroo" src="haikyuu!! · romantic"/></Phone>
        </DCArtboard>
        <DCArtboard id="theme-lavender" label="ship card · lavender retheme" width={340} height={680}>
          <Phone theme="lavender"><ShipCardPreview name="Reader × Yuu" src="d.gray-man · romantic"/></Phone>
        </DCArtboard>
        <DCArtboard id="theme-sage" label="ship card · sage retheme" width={340} height={680}>
          <Phone theme="sage"><ShipCardPreview name="me × Levi" src="aot · platonic"/></Phone>
        </DCArtboard>
      </DCSection>

      {/* ─── SCREEN FIXES ─── */}
      <DCSection id="fixes" title="screen fixes · aesthetic-aligned" subtitle="the 'odd ones out' — messages, dates, scenarios — re-skinned to match the cozy paper vocabulary.">
        <DCArtboard id="msg-empty" label="messages · empty state (fixed)" width={340} height={680}>
          <Phone theme="sakura"><MessagesRefined empty/></Phone>
        </DCArtboard>
        <DCArtboard id="msg-thread" label="messages · letter bubble thread" width={340} height={680}>
          <Phone theme="sakura"><MessagesRefined/></Phone>
        </DCArtboard>
        <DCArtboard id="dates" label="dates · paper-card style" width={340} height={680}>
          <Phone theme="lavender"><DatesRefined/></Phone>
        </DCArtboard>
        <DCArtboard id="scenarios-empty" label="scenarios · empty (sakura branch)" width={340} height={680}>
          <Phone theme="sakura"><ScenariosRefined empty/></Phone>
        </DCArtboard>
        <DCArtboard id="scenarios" label="scenarios · scrapbook entries" width={340} height={680}>
          <Phone theme="sakura"><ScenariosRefined/></Phone>
        </DCArtboard>
      </DCSection>

      {/* ─── QUOTE CALLOUTS ─── */}
      <DCSection id="quotes" title="quote callouts · adapted to reference shapes" subtitle="persona + new-ship screens use the new pink rectangle callout and lavender cloud bubble.">
        <DCArtboard id="persona" label="persona · onboarding (pink callout)" width={340} height={680}>
          <Phone theme="sakura"><PersonaRefined/></Phone>
        </DCArtboard>
        <DCArtboard id="new-ship" label="new ship · step two (ship name + cloud)" width={340} height={680}>
          <Phone theme="lavender"><NewShipRefined/></Phone>
        </DCArtboard>
      </DCSection>

      {/* ─── SHIP SECTIONS (NOT templates) ─── */}
      <DCSection id="ship-sections" title="ship sections · built-in (not templates)" subtitle="headcanons / storyline / boundaries live inside each ship — not in the template library. they re-theme with the ship's palette.">
        <DCArtboard id="headcanons" label="headcanons · varied bullets per cat" width={340} height={680}>
          <Phone theme="sakura"><HeadcanonsRefined/></Phone>
        </DCArtboard>
        <DCArtboard id="storyline" label="storyline · marker by milestone" width={340} height={680}>
          <Phone theme="lavender"><StorylineRefined/></Phone>
        </DCArtboard>
      </DCSection>

      {/* ─── NEW COMMUNITY TEMPLATES ─── */}
      <DCSection id="new-templates" title="new templates · community-style" subtitle="three new templates inspired by community references. each is rethemeable per ship (shown here in the ship's default palette).">
        <DCArtboard id="flip-phone" label="y2k flip-phone profile" width={340} height={680}>
          <Phone theme="sakura"><FlipPhoneTemplate/></Phone>
        </DCArtboard>
        <DCArtboard id="talking-about" label="talking about my yume" width={340} height={680}>
          <Phone theme="sakura"><TalkingAboutTemplate/></Phone>
        </DCArtboard>
        <DCArtboard id="bond-banner" label="bond banner · bow + dual sliders" width={340} height={680}>
          <Phone theme="lavender"><BondBannerTemplate/></Phone>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// helper preview card
function ShipCardPreview({ name, src }) {
  return (
    <div style={{ height: '100%', background: 'var(--paper)', padding: '14px 16px' }}>
      <div className="eyebrow">your ships · 4 F/Os</div>
      <div className="display" style={{ fontSize: 26, marginTop: 4 }}>your ships <StickerSparkle size={14} style={{ verticalAlign: 'middle', marginLeft: 6 }}/></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
        {/* the main themed card */}
        <div style={{
          aspectRatio: '3 / 4',
          background: 'var(--vellum)', border: '1px solid var(--line)',
          borderRadius: 14, overflow: 'hidden', position: 'relative',
          boxShadow: '0 2px 6px rgba(110,58,90,0.08)',
        }}>
          <div style={{
            height: '70%',
            background: `linear-gradient(135deg, var(--primary-tint), var(--primary))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: -2, left: -6, transform: 'rotate(-6deg)' }}>
              <WashiTape pattern="heart" width={56} height={12}/>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 50, color: 'rgba(255,255,255,0.95)' }}>
              {name.charAt(name.lastIndexOf('×') + 2) || name[0]}
            </div>
          </div>
          <div style={{ padding: '6px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="display" style={{ fontSize: 14, lineHeight: 1 }}>{name}</div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }}/>
            </div>
            <div style={{ fontSize: 8.5, color: 'var(--ink-3)', marginTop: 2 }}>{src}</div>
          </div>
        </div>
        {/* alt card with different palette accent */}
        <div style={{
          aspectRatio: '3 / 4',
          background: 'var(--vellum)', border: '1px solid var(--line)',
          borderRadius: 14, overflow: 'hidden', position: 'relative',
        }}>
          <div style={{ height: '70%', background: 'linear-gradient(135deg, var(--peach-soft), var(--peach-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -2, left: -4, transform: 'rotate(-8deg)' }}>
              <WashiTape pattern="dot" width={56} height={12} color="var(--peach-deep)"/>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 50, color: 'rgba(255,255,255,0.95)' }}>S</div>
          </div>
          <div style={{ padding: '6px 8px' }}>
            <div className="display" style={{ fontSize: 14 }}>me × Sukuna</div>
            <div style={{ fontSize: 8.5, color: 'var(--ink-3)' }}>jjk · enemies-to-?</div>
          </div>
        </div>
      </div>

      {/* live theme callout */}
      <div style={{
        marginTop: 16, padding: '12px 14px',
        background: 'var(--primary-soft)', border: '1.4px solid var(--primary-tint)',
        borderRadius: 14, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: -10, left: 12 }}><Bullets.Heart size={14}/></div>
        <div style={{ fontFamily: 'var(--font-script)', fontSize: 16, color: 'var(--primary-ink)', lineHeight: '19px' }}>
          this theme is live — chips, buttons, washi, callouts, and templates all share these colors.
        </div>
      </div>

      <BottomNav active="home"/>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
