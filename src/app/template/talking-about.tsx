import { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Modal, TouchableWithoutFeedback, PanResponder } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import { PhotoBox, MarkerCard, MemoriesFooter, INK, useSliderTrack } from '@/components/templates/primitives';
import { Sparkle } from '@/components/deco';
import { useTemplateCtx } from '@/store/templateData';
import { Colors, FontFamily, Radius, SheetColumn, Spacing ,sf } from '@/constants/theme';

// ─── Palette options (same as aesthetic template) ──────────────
const PALETTE_OPTIONS = [
  '#8b3a4a', '#d77a8d', '#f3b6c4', '#fadde5',
  '#6b4da3', '#9b7fd4', '#c9b8e8', '#ece4f7',
  '#b76b48', '#e8a07a', '#f4c09a', '#fde0ce',
  '#4a7050', '#7aad82', '#b4cba5', '#e0ebd4',
  '#9b7c20', '#d4a830', '#f0daa0', '#fdf3d0',
  '#1a2a4a', '#3a6fa8', '#b8d4f0', '#e8f2fc',
  '#1f1219', '#4a3a40', '#9a8a90', '#f5f0f2',
];

const ME_DEFAULT_PAL  = ['#2b1a26','#6b4a3a','#fad7c0','#f3b6c4','#8b3a4a'];
const FO_DEFAULT_PAL  = ['#1f1e3d','#3a3d6a','#fad7c0','#8b6fc4','#4d3982'];

// ─── Checkbox ─────────────────────────────────────────────────
function Checkbox({ on = false, onPress }: { on?: boolean; onPress?: () => void }) {
  const box = <View style={[cb.box, on && cb.filled]} />;
  if (onPress) return <Pressable onPress={onPress} hitSlop={8}>{box}</Pressable>;
  return box;
}

// ─── DualSlider ────────────────────────────────────────────────
function DualSlider({ label, value = 0.5, onValueChange, leftColor, rightColor }: { label: string; value?: number; onValueChange?: (v: number) => void; leftColor?: string; rightColor?: string }) {
  const { trackRef, responder } = useSliderTrack(onValueChange);
  const pct = `${Math.round(value * 100)}%` as any;
  const rest = `${Math.round((1 - value) * 100)}%` as any;
  return (
    <View style={sl.wrap}>
      <Text style={sl.label}>{label}</Text>
      <View ref={trackRef} style={sl.track}
        {...responder}>
        <View style={[sl.left, { width: pct }, leftColor ? { backgroundColor: leftColor + 'cc' } : null]} />
        <View style={[sl.right, { width: rest }, rightColor ? { backgroundColor: rightColor + 'cc' } : null]} />
        <View style={[sl.divider, { left: pct }]} />
      </View>
    </View>
  );
}

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DOODLE_COLORS = ['#1f1219','#8b3a4a','#d77a8d','#f3b6c4','#9b7fd4','#4a7050','#d4a830','#ffffff'];
const BRUSH_SIZES   = [2, 4, 8] as const;
const CANVAS_BG = Colors.sakuraSoft; // matches template card background

// ─── Full-screen Doodle Modal ──────────────────────────────────
function DoodleModal({ paths, onSave, onClose }: {
  paths: string[];
  onSave: (paths: string[]) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [localPaths, setLocalPaths] = useState<Array<{ d: string; color: string; width: number }>>(
    // migrate old plain-string paths
    paths.map(p => typeof p === 'string' && p.startsWith('{') ? JSON.parse(p) : { d: p as string, color: '#1f1219', width: 3 })
  );
  const [live, setLive] = useState('');
  const [color, setColor] = useState('#1f1219');
  const [brushSize, setBrushSize] = useState<2 | 4 | 8>(3 as any);
  const [eraser, setEraser] = useState(false);
  const viewRef = useRef<View>(null);

  const strokeColor = eraser ? CANVAS_BG : color;
  const strokeWidth = eraser ? 22 : brushSize;

  const pr = PanResponder.create({
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => {
      const { locationX: x, locationY: y } = e.nativeEvent;
      setLive(`M${x.toFixed(1)},${y.toFixed(1)}`);
    },
    onPanResponderMove: (e) => {
      const { locationX: x, locationY: y } = e.nativeEvent;
      setLive(p => `${p} L${x.toFixed(1)},${y.toFixed(1)}`);
    },
    onPanResponderRelease: () => {
      if (live) setLocalPaths(p => [...p, { d: live, color: strokeColor, width: strokeWidth }]);
      setLive('');
    },
  });

  const handleSave = () => {
    onSave(localPaths.map(p => JSON.stringify(p)));
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
      {/* Tap-outside to cancel */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={dd.overlay} />
      </TouchableWithoutFeedback>

      {/* Bottom sheet */}
      <View style={[dd.sheet, { paddingBottom: insets.bottom + 8 }, SheetColumn]}>
        {/* Handle */}
        <View style={dd.handle} />

        {/* Header */}
        <View style={dd.topBar}>
          <Pressable onPress={onClose} style={dd.toolBtn}>
            <Text style={dd.toolText}>cancel</Text>
          </Pressable>
          <Text style={dd.toolTitle}>your ship art ♡</Text>
          <Pressable onPress={handleSave} style={[dd.toolBtn, dd.doneBtn]}>
            <Text style={[dd.toolText, { color: '#fff' }]}>done</Text>
          </Pressable>
        </View>

        {/* Drawing zone */}
        <View style={dd.canvasWrap}>
          <View ref={viewRef} style={dd.drawZone} {...pr.panHandlers}>
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              {localPaths.map((p, i) => (
                <Path key={i} d={p.d} stroke={p.color} strokeWidth={p.width}
                  fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {live ? (
                <Path d={live} stroke={strokeColor} strokeWidth={strokeWidth}
                  fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}
            </Svg>
            {localPaths.length === 0 && !live && (
              <Text style={dd.placeholder}>draw here ✏️</Text>
            )}
          </View>
        </View>

        {/* Colors */}
        <View style={dd.colorRow}>
          {DOODLE_COLORS.map(c => (
            <Pressable key={c} onPress={() => { setColor(c); setEraser(false); }}
              style={[dd.colorSwatch, { backgroundColor: c },
                !eraser && color === c && dd.colorSwatchActive,
                c === '#ffffff' && { borderColor: INK + '66' },
              ]} />
          ))}
        </View>

        {/* Tools */}
        <View style={dd.toolRow}>
          <View style={dd.sizeRow}>
            {BRUSH_SIZES.map(sz => (
              <Pressable key={sz} onPress={() => { setBrushSize(sz as any); setEraser(false); }}
                style={[dd.sizeBtn, !eraser && brushSize === sz && dd.sizeBtnActive]}>
                <View style={[dd.sizeDot, { width: sz * 2.5, height: sz * 2.5, borderRadius: sz * 1.25,
                  backgroundColor: !eraser && brushSize === sz ? '#fff' : INK }]} />
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => setLocalPaths(p => p.slice(0, -1))} style={dd.iconBtn}>
            <Text style={dd.iconText}>↩ undo</Text>
          </Pressable>

          <Pressable onPress={() => setEraser(e => !e)} style={[dd.iconBtn, eraser && dd.iconBtnActive]}>
            <Text style={[dd.iconText, eraser && { color: '#fff' }]}>⌫ erase</Text>
          </Pressable>

          <Pressable onPress={() => { setLocalPaths([]); setLive(''); }} style={dd.iconBtn}>
            <Text style={dd.iconText}>✕ clear</Text>
          </Pressable>
        </View>
      </View>
      </View>
    </Modal>
  );

}

// ─── Doodle thumbnail shown in the template ────────────────────
// Helper: parse a stored path entry (plain string or JSON object)
function parsePath(raw: string): { d: string; color: string; width: number } {
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object' && obj.d) return obj;
  } catch {}
  return { d: raw, color: INK, width: 2 };
}

function DoodleThumb({ paths, editing, onOpen, transparent }: { paths: string[]; editing: boolean; onOpen: () => void; transparent?: boolean }) {
  const parsed = paths.map(parsePath);
  const hasPaths = paths.length > 0;
  return (
    <Pressable style={[dc.wrap, hasPaths && (transparent ? null : dc.wrapFilled)]} onPress={editing ? onOpen : undefined}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {parsed.map((p, i) => (
          <Path key={i} d={p.d} stroke={p.color} strokeWidth={p.width}
            fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </Svg>
      {paths.length === 0 ? (
        <Text style={dc.hint}>your ship art ♡{editing ? '\ntap to draw' : ''}</Text>
      ) : editing ? (
        <View style={dc.editBadge}><Text style={dc.editBadgeText}>tap to edit</Text></View>
      ) : null}
    </Pressable>
  );
}

function HeartDot({ color, onPress }: { color: string; onPress?: () => void }) {
  const svg = (
    <Svg width={14} height={14} viewBox="0 0 16 16">
      <Path d="M8 14 C 3 11 1 8.5 1 5.5 C 1 3.5 2.5 2 4.5 2 C 6 2 7.3 2.9 8 4.3 C 8.7 2.9 10 2 11.5 2 C 13.5 2 15 3.5 15 5.5 C 15 8.5 13 11 8 14 Z"
        fill={color} stroke={INK} strokeWidth={0.6} />
    </Svg>
  );
  if (onPress) return <Pressable onPress={onPress} hitSlop={6}>{svg}</Pressable>;
  return svg;
}

// ─── Main Template ─────────────────────────────────────────────
export function TalkingAboutContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;

  const [vals, setVals] = useState<Record<string, string>>(() => ({
    relTypes:  ctx.get('relTypes', '["Married"]'),
    endings:   ctx.get('endings',  '["Happy ending"]'),
    yumeCat:   ctx.get('yumeCat',  'OC × canon'),
    sharing:   ctx.get('sharing',  'No'),
    photoL:    ctx.get('photoL',   ''),
    photoR:    ctx.get('photoR',   ''),
    meName:    ctx.get('meName',   ''),
    mePron:    ctx.get('mePron',   ''),
    meH:       ctx.get('meH',      ''),
    meMbti:    ctx.get('meMbti',   ''),
    meEmoji:   ctx.get('meEmoji',  ''),
    mePal0:    ctx.get('mePal0',   ME_DEFAULT_PAL[0]),
    mePal1:    ctx.get('mePal1',   ME_DEFAULT_PAL[1]),
    mePal2:    ctx.get('mePal2',   ME_DEFAULT_PAL[2]),
    mePal3:    ctx.get('mePal3',   ME_DEFAULT_PAL[3]),
    mePal4:    ctx.get('mePal4',   ME_DEFAULT_PAL[4]),
    foName:    ctx.get('foName',   ''),
    foPron:    ctx.get('foPron',   ''),
    foH:       ctx.get('foH',      ''),
    foMbti:    ctx.get('foMbti',   ''),
    foEmoji:   ctx.get('foEmoji',  ''),
    foPal0:    ctx.get('foPal0',   FO_DEFAULT_PAL[0]),
    foPal1:    ctx.get('foPal1',   FO_DEFAULT_PAL[1]),
    foPal2:    ctx.get('foPal2',   FO_DEFAULT_PAL[2]),
    foPal3:    ctx.get('foPal3',   FO_DEFAULT_PAL[3]),
    foPal4:    ctx.get('foPal4',   FO_DEFAULT_PAL[4]),
    meColor:   ctx.get('meColor',  Colors.sakuraInk),
    foColor:   ctx.get('foColor',  Colors.lavenderDeep),
    doodle:    ctx.get('doodle',   '[]'),
    tropes:    ctx.get('tropes',   ''),
    sliders:   ctx.get('sliders',  '[0.7,0.55,0.35]'),
    memPhoto0: ctx.get('memPhoto0', ''), memPhoto1: ctx.get('memPhoto1', ''), memPhoto2: ctx.get('memPhoto2', ''),
    memCap0:   ctx.get('memCap0',   ''), memCap1:   ctx.get('memCap1',   ''), memCap2:   ctx.get('memCap2',   ''),
    song:      ctx.get('song',      ''),
  }));

  const setVal = (key: string, v: string) => { setVals(p => ({ ...p, [key]: v })); ctx.set(key, v); };
  const toggleArr = (key: string, item: string) => {
    const arr: string[] = JSON.parse(vals[key] || '[]');
    setVal(key, JSON.stringify(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]));
  };

  // Color picker state: { pfx: 'me'|'fo', idx: 0-4 } | null
  const [picking, setPicking] = useState<{ pfx: string; idx: number } | null>(null);
  const [doodleOpen, setDoodleOpen] = useState(false);

  const relTypes: string[] = JSON.parse(vals.relTypes || '[]');
  const endings:  string[] = JSON.parse(vals.endings  || '[]');
  const sliders = JSON.parse(vals.sliders) as [number, number, number];
  const meColor = vals.meColor || Colors.sakuraInk;
  const foColor = vals.foColor || Colors.lavenderDeep;
  const e = editing;

  const chars = [
    { pfx: 'me', label: 'ME / MY OC', defColor: Colors.sakuraInk },
    { pfx: 'fo', label: 'MY F/O',     defColor: Colors.lavenderDeep },
  ];

  return (
    <MarkerCard tint={customBg ? 'transparent' : Colors.sakuraSoft} style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <PhotoBox size={48} editing={e} uri={vals.photoL}
          onUriChange={e ? u => setVal('photoL', u) : undefined} style={s.headerStL} />
        <PhotoBox size={48} editing={e} uri={vals.photoR}
          onUriChange={e ? u => setVal('photoR', u) : undefined} style={s.headerStR} />
        <Text style={s.eyebrow}>TALKING ABOUT MY</Text>
        <Text style={s.title}>YUME</Text>
        <View style={s.rule}>
          <View style={s.ruleLine} />
          <Sparkle size={8} color={INK} />
          <View style={s.ruleLine} />
        </View>
      </View>

      {/* Category columns */}
      <View style={s.row2}>
        <View style={s.col}>
          <Text style={s.colTitle}>Type of relationship ♡</Text>
          {(['Married','Engaged','Boy/girlfriends','Platonic/QPR'] as const).map(r => (
            <View key={r} style={s.checkRow}>
              <Checkbox on={relTypes.includes(r)} onPress={e ? () => toggleArr('relTypes', r) : undefined} />
              <Text style={s.checkLabel}>{r}</Text>
            </View>
          ))}
          <Text style={[s.colTitle, { marginTop: 12 }]}>♡ This has...</Text>
          {(['Happy ending','Bad ending','Neutral ending'] as const).map(r => (
            <View key={r} style={s.checkRow}>
              <Checkbox on={endings.includes(r)} onPress={e ? () => toggleArr('endings', r) : undefined} />
              <Text style={s.checkLabel}>{r}</Text>
            </View>
          ))}
        </View>
        <View style={s.col}>
          <Text style={s.colTitle}>Yume category ♡</Text>
          {[
            { key: 'OC × canon', subs: '— OC\n— Fan character' },
            { key: 'Selfinsert × canon', subs: '— Avatar\n— Sona\n— Persona' },
          ].map(({ key, subs }) => (
            <View key={key} style={{ marginTop: 6 }}>
              <View style={s.checkRow}>
                <Checkbox on={vals.yumeCat === key} onPress={e ? () => setVal('yumeCat', vals.yumeCat === key ? '' : key) : undefined} />
                <Text style={s.checkLabel}>{key}</Text>
              </View>
              <Text style={s.subItems}>{subs}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Ship art — tap to open full-screen doodle */}
      <View style={s.doodleWrap}>
        <DoodleThumb
          paths={JSON.parse(vals.doodle || '[]')}
          editing={e}
          onOpen={() => setDoodleOpen(true)}
          transparent={!!customBg}
        />
        <View style={s.sparkBL} pointerEvents="none"><Sparkle size={12} color={INK} /></View>
        <View style={s.sparkTR} pointerEvents="none"><Sparkle size={14} color={INK} /></View>
      </View>

      {/* Sharing status */}
      <View style={s.sharingWrap}>
        <Text style={s.sharingTitle}>Sharing status</Text>
        <View style={s.sharingRow}>
          {(['Yes','No','Selective'] as const).map(opt => {
            const on = vals.sharing === opt;
            return (
              <Pressable key={opt} onPress={() => e && setVal('sharing', opt)} style={s.sharingOpt}>
                <Text style={[s.sharingText, on && s.sharingOn]}>{opt}</Text>
                <View style={[s.sharingDot, on ? s.sharingDotOn : s.sharingDotOff]} />
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Character columns */}
      <View style={s.row2}>
        {chars.map(({ pfx, defColor }) => {
          const name  = vals[`${pfx}Name`];
          const color = vals[`${pfx}Color`] || defColor;
          const pal   = [0,1,2,3,4].map(i => vals[`${pfx}Pal${i}`]);
          return (
            <View key={pfx} style={s.charCol}>
              {/* Emoji */}
              <View style={[s.emojiBox, customBg ? { backgroundColor: 'transparent' } : null]}>
                <TextInput
                  value={vals[`${pfx}Emoji`]}
                  onChangeText={e ? v => setVal(`${pfx}Emoji`, v) : undefined}
                  editable={e}
                  placeholder="🍒💌💗"
                  placeholderTextColor={INK + '55'}
                  style={s.emojiInput}
                  textAlign="center"
                />
              </View>
              <Text style={s.emojiLabel}>Emoji</Text>

              {/* Avatar circle — tap to recolor */}
              <Pressable
                onPress={e ? () => setPicking({ pfx, idx: -1 }) : undefined}
                style={[s.avatar, { backgroundColor: color }]}
              >
                <Text style={s.avatarLetter}>{(name || '?')[0]}</Text>
              </Pressable>



              {/* Name — prefilled from ship */}
              {e ? (
                <TextInput value={name} onChangeText={v => setVal(`${pfx}Name`, v)}
                  placeholder="Name" placeholderTextColor={INK + '55'}
                  style={[s.charName, { color }]} textAlign="center" />
              ) : (
                <Text style={[s.charName, { color }]}>{name || '——'}</Text>
              )}

              {/* Pronouns / Height / MBTI */}
              {[['Pronouns', `${pfx}Pron`], ['Height', `${pfx}H`], ['MBTI', `${pfx}Mbti`]].map(([label, key]) => (
                <View key={key} style={s.charField}>
                  <Text style={s.charFieldKey}>{label}: </Text>
                  {e ? (
                    <TextInput value={vals[key]} onChangeText={v => setVal(key, v)}
                      placeholder="——" placeholderTextColor={INK + '55'}
                      style={[s.charFieldVal, { color }]} />
                  ) : (
                    <Text style={[s.charFieldVal, { color }]}>{vals[key] || '——'}</Text>
                  )}
                </View>
              ))}

              {/* Color palette — tappable hearts */}
              <Text style={[s.charFieldKey, { marginTop: 6 }]}>Color palette</Text>
              <View style={s.paletteRow}>
                {pal.map((col, ci) => (
                  <HeartDot key={ci} color={col}
                    onPress={e ? () => setPicking({ pfx, idx: ci }) : undefined} />
                ))}
              </View>
              {e && <Text style={s.palHint}>tap to change</Text>}
            </View>
          );
        })}
      </View>

      {/* Tropes box */}
      <View style={[s.tropesBox, customBg ? { backgroundColor: 'transparent' } : null]}>
        <Text style={s.tropesLabel}>Tropes</Text>
        {e ? (
          <TextInput value={vals.tropes} onChangeText={v => setVal('tropes', v)}
            placeholder={'slowburn · annoyance to lovers\nsunshine × grumpy'}
            placeholderTextColor={INK + '55'} multiline
            style={s.tropesInput} textAlign="center" />
        ) : (
          <Text style={s.tropesText}>{vals.tropes || 'slowburn · annoyance to lovers\nsunshine × grumpy'}</Text>
        )}
      </View>

      {/* Sliders */}
      <View style={s.sliderBlock}>
        {(['Level of affection','Libido level','Level of confidence'] as const).map((label, i) => (
          <DualSlider key={label} label={label} value={sliders[i] ?? 0.5}
            leftColor={meColor} rightColor={foColor}
            onValueChange={e ? (v) => {
              const next = [...sliders] as [number, number, number];
              next[i] = v;
              setVal('sliders', JSON.stringify(next));
            } : undefined} />
        ))}
      </View>

      <MemoriesFooter
        editing={e}
        photos={[
          { uri: vals.memPhoto0, caption: vals.memCap0 },
          { uri: vals.memPhoto1, caption: vals.memCap1 },
          { uri: vals.memPhoto2, caption: vals.memCap2 },
        ]}
        onPhotoChange={e ? (i, u) => setVal(`memPhoto${i}`, u) : undefined}
        onCaptionChange={e ? (i, c) => setVal(`memCap${i}`, c) : undefined}
        song={vals.song}
        onSongChange={e ? (v) => setVal('song', v) : undefined}
        transparentBg={!!customBg}
      />

      {doodleOpen && (
        <DoodleModal
          paths={JSON.parse(vals.doodle || '[]')}
          onSave={(p) => setVal('doodle', JSON.stringify(p))}
          onClose={() => setDoodleOpen(false)}
        />
      )}


      {/* Color picker modal */}
      <Modal visible={picking !== null} transparent animationType="fade"
        onRequestClose={() => setPicking(null)}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
        <TouchableWithoutFeedback onPress={() => setPicking(null)}>
          <View style={m.overlay} />
        </TouchableWithoutFeedback>
        <View style={[m.sheet, SheetColumn]}>
          <View style={m.handle} />
          <Text style={m.title}>pick a color</Text>
          <View style={m.grid}>
            {PALETTE_OPTIONS.map(c => {
              const currentVal = picking
                ? (picking.idx === -1 ? vals[`${picking.pfx}Color`] : vals[`${picking.pfx}Pal${picking.idx}`])
                : '';
              return (
                <Pressable key={c} style={[m.swatch, { backgroundColor: c }, c === currentVal && m.swatchActive]}
                  onPress={() => {
                    if (picking) {
                      if (picking.idx === -1) setVal(`${picking.pfx}Color`, c);
                      else setVal(`${picking.pfx}Pal${picking.idx}`, c);
                    }
                    setPicking(null);
                  }} />
              );
            })}
          </View>
        </View>
        </View>
      </Modal>
    </MarkerCard>
  );
}

export default function TemplateTalkingAbout() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="talking-about" shipId={shipId}>
      <TalkingAboutContent editing />
    </TemplateScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const cb = StyleSheet.create({
  box:    { width: 11, height: 11, borderWidth: 1.2, borderColor: INK, borderRadius: 2, backgroundColor: '#fff' },
  filled: { backgroundColor: Colors.sakura },
});

const sl = StyleSheet.create({
  wrap:    { gap: 2 },
  label:   { fontFamily: FontFamily.markerBold, fontSize: sf(10), color: INK, textAlign: 'center' },
  track:   { height: 9, flexDirection: 'row', borderWidth: 1.2, borderColor: INK, borderRadius: 999, overflow: 'hidden', position: 'relative' },
  left:    { height: '100%', backgroundColor: Colors.sakura + 'cc' },
  right:   { flex: 1, height: '100%', backgroundColor: Colors.lavenderDeep + 'cc' },
  divider: { position: 'absolute', top: -2, bottom: -2, width: 1.5, backgroundColor: INK },
});

const dc = StyleSheet.create({
  wrap:      { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  wrapFilled:{ backgroundColor: CANVAS_BG },
  hint:      { fontFamily: FontFamily.script, fontSize: sf(16), color: INK, opacity: 0.6 },
  clearBtn:  { position: 'absolute', bottom: 4, right: 6, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  clearText: { fontFamily: FontFamily.marker, fontSize: sf(8), color: INK },
  editBadge: { position: 'absolute', bottom: 4, right: 6, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  editBadgeText: { fontFamily: FontFamily.marker, fontSize: sf(8), color: INK },
});

const s = StyleSheet.create({
  card:      { gap: 12 },
  header:    { alignItems: 'center', paddingVertical: 4, position: 'relative', paddingHorizontal: 50 },
  headerStL: { position: 'absolute', top: 0, left: 0 },
  headerStR: { position: 'absolute', top: 0, right: 0 },
  eyebrow:   { fontFamily: FontFamily.marker, fontSize: sf(9), color: INK + '88', letterSpacing: 1.6 },
  title:     { fontFamily: FontFamily.displayItalic, fontSize: sf(32), color: INK, letterSpacing: -1, lineHeight: 34, marginTop: 2 },
  rule:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, width: '100%' },
  ruleLine:  { flex: 1, height: 1, backgroundColor: INK + '55' },
  row2:      { flexDirection: 'row', gap: 10 },
  col:       { flex: 1, alignItems: 'center' },
  colTitle:  { fontFamily: FontFamily.markerBold, fontSize: sf(11), color: INK },
  checkRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  checkLabel:{ fontFamily: FontFamily.marker, fontSize: sf(10), color: INK },
  subItems:  { marginLeft: 16, fontFamily: FontFamily.script, fontSize: sf(13), color: INK + '88', lineHeight: 14, marginTop: 2 },
  doodleWrap:{ width: '100%', height: 130, position: 'relative' },
  blobText:  { fontFamily: FontFamily.script, fontSize: sf(16), color: '#fff' },
  sparkBL:   { position: 'absolute', bottom: -6, left: -6 },
  sparkTR:   { position: 'absolute', top: -8, right: -4 },
  sharingWrap:{ alignItems: 'center', marginVertical: 2 },
  sharingTitle:{ fontFamily: FontFamily.script, fontSize: sf(16), color: INK },
  sharingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  sharingOpt: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sharingText: { fontFamily: FontFamily.marker, fontSize: sf(10), color: INK },
  sharingOn:  { color: Colors.sakuraInk },
  sharingDot:   { borderRadius: 999 },
  sharingDotOff: { width: 8, height: 8, borderWidth: 1.2, borderColor: INK },
  sharingDotOn:  { width: 13, height: 13, backgroundColor: Colors.sakuraInk },
  charCol:   { flex: 1, alignItems: 'center', gap: 2 },
  emojiBox:  { paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1.2, borderStyle: 'dashed', borderColor: INK, borderRadius: 4, backgroundColor: '#fff' },
  emojiInput:{ fontFamily: FontFamily.ja, fontSize: sf(12), color: INK, minWidth: 60 },
  emojiLabel:{ fontFamily: FontFamily.marker, fontSize: sf(9), color: INK + '88' },
  avatar:    { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: INK, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  avatarLetter:{ fontFamily: FontFamily.displayItalic, fontSize: sf(24), color: '#fff' },
  ageRange:  { fontFamily: FontFamily.marker, fontSize: sf(9), color: INK + '88', letterSpacing: 1.4 },
  charName:  { fontFamily: FontFamily.script, fontSize: sf(18), lineHeight: 20, marginTop: 2 },
  charField: { flexDirection: 'row', alignItems: 'center' },
  charFieldKey:{ fontFamily: FontFamily.marker, fontSize: sf(9), color: INK },
  charFieldVal:{ fontFamily: FontFamily.script, fontSize: sf(13) },
  paletteRow:{ flexDirection: 'row', gap: 3, justifyContent: 'center', marginTop: 2 },
  palHint:   { fontFamily: FontFamily.marker, fontSize: sf(8), color: INK + '60', marginTop: 2 },
  tropesBox: { borderWidth: 1.2, borderStyle: 'dashed', borderColor: INK, borderRadius: 6, padding: 8, backgroundColor: '#fff', alignItems: 'center' },
  tropesLabel:{ fontFamily: FontFamily.markerBold, fontSize: sf(10), color: INK + '88' },
  tropesInput:{ fontFamily: FontFamily.script, fontSize: sf(13), color: INK, lineHeight: 15, textAlign: 'center', width: '100%' },
  tropesText: { fontFamily: FontFamily.script, fontSize: sf(13), color: INK, lineHeight: 15, textAlign: 'center' },
  sliderBlock:{ gap: 8 },
});

const m = StyleSheet.create({
  overlay:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet:       { backgroundColor: Colors.paper ?? '#fffbf6', borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5, padding: Spacing.s5, paddingBottom: 40 },
  handle:      { width: 40, height: 4, backgroundColor: Colors.line ?? '#e0d4cc', borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.s4 },
  title:       { fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: INK, marginBottom: Spacing.s4 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch:      { width: 36, height: 36, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.line ?? '#e0d4cc' },
  swatchActive:{ borderColor: INK, borderWidth: 2.5 },
});

const dd = StyleSheet.create({
  overlay:         { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:           { backgroundColor: CANVAS_BG, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  handle:          { width: 36, height: 4, backgroundColor: INK + '33', borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  topBar:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolTitle:       { fontFamily: FontFamily.script, fontSize: sf(18), color: INK },
  toolBtn:         { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1.2, borderColor: INK + '44' },
  doneBtn:         { backgroundColor: Colors.sakura, borderColor: Colors.sakura },
  toolText:        { fontFamily: FontFamily.marker, fontSize: sf(11), color: INK },
  canvasWrap:      { alignItems: 'center' },
  drawZone:        { width: '100%', aspectRatio: 2.6, backgroundColor: CANVAS_BG, borderWidth: 1.5, borderColor: INK, borderRadius: 6, overflow: 'hidden' },
  placeholder:     { position: 'absolute', alignSelf: 'center', top: '38%', fontFamily: FontFamily.script, fontSize: sf(15), color: INK + '55' },
  colorRow:        { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  colorSwatch:     { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: 'transparent' },
  colorSwatchActive: { borderColor: INK, transform: [{ scale: 1.15 }] },
  toolRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  sizeRow:         { flexDirection: 'row', gap: 4 },
  sizeBtn:         { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1.2, borderColor: INK + '33' },
  sizeBtnActive:   { backgroundColor: INK },
  sizeDot:         {},
  iconBtn:         { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12, borderWidth: 1.2, borderColor: INK + '33' },
  iconBtnActive:   { backgroundColor: INK },
  iconText:        { fontFamily: FontFamily.marker, fontSize: sf(10), color: INK },
  // unused but kept for ts compat
  screen: {}, topBar2: {}, canvas: {}, canvasWrap2: {}, dimBg: {}, zoneHint: {}, bottomBar: {},
});


