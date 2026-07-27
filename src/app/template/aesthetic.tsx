import { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, PhotoBox, BlankPill, DualPolarSlider, QuadrantPicker, ChoiceRow, useThemedInk,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, Radius, SheetColumn, Spacing, sf } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';

// Same swatch set as talking-about's color pickers, kept in sync.
const PALETTE_OPTIONS = [
  '#8b3a4a', '#d77a8d', '#f3b6c4', '#fadde5',
  '#6b4da3', '#9b7fd4', '#c9b8e8', '#ece4f7',
  '#b76b48', '#e8a07a', '#f4c09a', '#fde0ce',
  '#4a7050', '#7aad82', '#b4cba5', '#e0ebd4',
  '#9b7c20', '#d4a830', '#f0daa0', '#fdf3d0',
  '#1a2a4a', '#3a6fa8', '#b8d4f0', '#e8f2fc',
  '#1f1219', '#4a3a40', '#9a8a90', '#f5f0f2',
];

const DYNAMIC_PAIRS = [
  ['Jealous', 'Chill'],
  ['Possessive', 'Lax'],
  ['Dedicated', 'Casual'],
  ['Needs Space', 'Clingy'],
  ['Awkward', 'Charismatic'],
  ['Forgives Easily', 'Holds Grudges'],
  ['Lends Clothes', 'Steals Clothes'],
  ['Combative', 'Dislikes Conflict'],
  ['Introvert', 'Extrovert'],
  ['Love At First Sight', 'Slow Burn'],
] as const;

const INTIMACY_PAIRS = [
  ['Big Spoon', 'Little Spoon'],
  ['Loves PDA', 'Dislikes PDA'],
  ['Flirtatious', 'Bashful'],
  ['Open', 'Repressed'],
  ['Experienced', 'No Experience'],
  ['Comfortable', 'Insecure'],
  ['Vanilla', 'Kinky'],
  ['Dom', 'Sub'],
  ['Top', 'Bottom'],
  ['High Libido', 'Sexually Declined'],
] as const;

const ROLE_LABELS = [
  'first to confess',
  'first to apologize after a fight',
  'does the cooking',
  'does the cleaning',
  'does the talking',
  'designated driver',
  'the caregiver',
  'the more popular one',
  'the one who proposes',
  'the one who dies for the other',
] as const;
const ROLE_OPTS = ['Me', 'F/O', 'Both'] as const;

// Me/F.O. defaults start offset (not both at 0.5) so the two markers
// never land exactly on top of each other before a user has touched them —
// otherwise it looks like a single-marker slider and hides that both are draggable.
const ME_DEFAULT10 = [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4];
const FO_DEFAULT10 = [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6];
const ME_DEFAULT_QUAD = { x: 0.4, y: 0.45 };
const FO_DEFAULT_QUAD = { x: 0.6, y: 0.55 };

function Cell({ label, value, onChange, editing, style }: { label: string; value: string; onChange?: (v: string) => void; editing: boolean; style?: object }) {
  const ink = useThemedInk();
  return (
    <View style={[c.wrap, style]}>
      <Text style={[c.label, { color: ink }]}>{label}</Text>
      {editing ? (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="——"
          placeholderTextColor={ink + '88'}
          underlineColorAndroid="transparent"
          style={[c.box, c.boxInput, { color: ink, borderColor: ink }]}
        />
      ) : (
        <View style={[c.box, { borderColor: ink }]}>
          <Text style={{ fontFamily: FontFamily.ja, fontSize: sf(11), color: ink }}>{value || '——'}</Text>
        </View>
      )}
    </View>
  );
}

export function AestheticContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const e = editing;
  const customBg = ctx.bgColor || ctx.bgImage;
  const ink = useThemedInk();

  const [vals, setVals] = useState<Record<string, string>>(() => ({
    meName: ctx.get('meName'),
    foName: ctx.get('foName'),
    mePhoto: ctx.get('mePhoto'),
    foPhoto: ctx.get('foPhoto'),
    meAge: ctx.get('meAge'),
    foAge: ctx.get('foAge'),
    ageDiff: ctx.get('ageDiff'),
    meHeight: ctx.get('meHeight'),
    foHeight: ctx.get('foHeight'),
    heightDiff: ctx.get('heightDiff'),
    meGender: ctx.get('meGender'),
    foGender: ctx.get('foGender'),
    meSexuality: ctx.get('meSexuality'),
    foSexuality: ctx.get('foSexuality'),
    tropes: ctx.get('tropes'),
    meNickname: ctx.get('meNickname'),
    foNickname: ctx.get('foNickname'),
    meLoveLanguage: ctx.get('meLoveLanguage'),
    foLoveLanguage: ctx.get('foLoveLanguage'),
    meDyn: ctx.get('meDyn', JSON.stringify(ME_DEFAULT10)),
    foDyn: ctx.get('foDyn', JSON.stringify(FO_DEFAULT10)),
    meAlign: ctx.get('meAlign', JSON.stringify(ME_DEFAULT_QUAD)),
    foAlign: ctx.get('foAlign', JSON.stringify(FO_DEFAULT_QUAD)),
    roles: ctx.get('roles', '[]'),
    meIntimacy: ctx.get('meIntimacy', JSON.stringify(ME_DEFAULT10)),
    foIntimacy: ctx.get('foIntimacy', JSON.stringify(FO_DEFAULT10)),
    meOverallIntimacy: ctx.get('meOverallIntimacy', '0.4'),
    foOverallIntimacy: ctx.get('foOverallIntimacy', '0.6'),
    meColor: ctx.get('meColor', Colors.sakuraInk),
    foColor: ctx.get('foColor', Colors.lavenderDeep),
  }));

  const [picking, setPicking] = useState<'me' | 'fo' | null>(null);

  const set = (key: string) => (v: string) => {
    setVals((p) => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };
  const setRaw = (key: string, v: string) => {
    setVals((p) => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };

  const meDyn = JSON.parse(vals.meDyn || JSON.stringify(ME_DEFAULT10)) as number[];
  const foDyn = JSON.parse(vals.foDyn || JSON.stringify(FO_DEFAULT10)) as number[];
  const meIntimacy = JSON.parse(vals.meIntimacy || JSON.stringify(ME_DEFAULT10)) as number[];
  const foIntimacy = JSON.parse(vals.foIntimacy || JSON.stringify(FO_DEFAULT10)) as number[];
  const meAlign = JSON.parse(vals.meAlign || JSON.stringify(ME_DEFAULT_QUAD)) as { x: number; y: number };
  const foAlign = JSON.parse(vals.foAlign || JSON.stringify(FO_DEFAULT_QUAD)) as { x: number; y: number };
  const roles = JSON.parse(vals.roles || '[]') as string[];

  const setMeDyn = (i: number, v: number) => {
    const next = [...meDyn];
    next[i] = v;
    setRaw('meDyn', JSON.stringify(next));
  };
  const setFoDyn = (i: number, v: number) => {
    const next = [...foDyn];
    next[i] = v;
    setRaw('foDyn', JSON.stringify(next));
  };
  const setMeIntimacy = (i: number, v: number) => {
    const next = [...meIntimacy];
    next[i] = v;
    setRaw('meIntimacy', JSON.stringify(next));
  };
  const setFoIntimacy = (i: number, v: number) => {
    const next = [...foIntimacy];
    next[i] = v;
    setRaw('foIntimacy', JSON.stringify(next));
  };
  const setRole = (i: number, v: string) => {
    const next = [...roles];
    while (next.length <= i) next.push('');
    next[i] = v;
    setRaw('roles', JSON.stringify(next));
  };

  return (
    <MarkerCard tint={customBg ? 'transparent' : '#fffbf6'}>
      <Text style={[s.title, { color: ink }]}>OUR YUME/SHIP{'\n'}TEMPLATE</Text>

      <View style={s.topRow}>
        <View style={s.sideCol}>
          <View style={s.nameRow}>
            <View style={s.nameRowPill}>
              <BlankPill value={vals.meName} onChangeText={e ? set('meName') : undefined} placeholder="your name" style={customBg ? { backgroundColor: 'transparent' } : undefined} />
            </View>
            <Pressable disabled={!e} onPress={() => setPicking('me')} style={s.colorSwatch}>
              <Heart size={20} color={vals.meColor} />
            </Pressable>
          </View>
          <View style={s.mt8}>
            <PhotoBox width="100%" height={130} editing={e} uri={vals.mePhoto} onUriChange={e ? set('mePhoto') : undefined} />
          </View>
        </View>

        <View style={s.centerCol}>
          <View style={s.statRow3}>
            <Cell label="age" value={vals.meAge} onChange={set('meAge')} editing={e} style={s.cellFlex} />
            <Cell label="diff" value={vals.ageDiff} onChange={set('ageDiff')} editing={e} style={s.cellFlex} />
            <Cell label="age" value={vals.foAge} onChange={set('foAge')} editing={e} style={s.cellFlex} />
          </View>
          <View style={s.statRow3}>
            <Cell label="height" value={vals.meHeight} onChange={set('meHeight')} editing={e} style={s.cellFlex} />
            <Cell label="diff" value={vals.heightDiff} onChange={set('heightDiff')} editing={e} style={s.cellFlex} />
            <Cell label="height" value={vals.foHeight} onChange={set('foHeight')} editing={e} style={s.cellFlex} />
          </View>
          <View style={s.statRow2}>
            <Cell label="gender" value={vals.meGender} onChange={set('meGender')} editing={e} style={s.cellFlex} />
            <Cell label="gender" value={vals.foGender} onChange={set('foGender')} editing={e} style={s.cellFlex} />
          </View>
          <View style={s.statRow2}>
            <Cell label="sexuality" value={vals.meSexuality} onChange={set('meSexuality')} editing={e} style={s.cellFlex} />
            <Cell label="sexuality" value={vals.foSexuality} onChange={set('foSexuality')} editing={e} style={s.cellFlex} />
          </View>
        </View>

        <View style={s.sideCol}>
          <View style={s.nameRow}>
            <Pressable disabled={!e} onPress={() => setPicking('fo')} style={s.colorSwatch}>
              <Heart size={20} color={vals.foColor} />
            </Pressable>
            <View style={s.nameRowPill}>
              <BlankPill value={vals.foName} onChangeText={e ? set('foName') : undefined} placeholder="their name" style={customBg ? { backgroundColor: 'transparent' } : undefined} />
            </View>
          </View>
          <View style={s.mt8}>
            <PhotoBox width="100%" height={130} editing={e} uri={vals.foPhoto} onUriChange={e ? set('foPhoto') : undefined} />
          </View>
        </View>
      </View>

      <View style={[s.tropesBox, { borderColor: ink }, customBg ? { backgroundColor: 'transparent' } : null]}>
        <Text style={[s.smallLabel, { color: ink }]}>tropes</Text>
        {e ? (
          <TextInput
            value={vals.tropes}
            onChangeText={set('tropes')}
            placeholder="enemies to lovers, slow burn..."
            placeholderTextColor={ink + '88'}
            multiline
            underlineColorAndroid="transparent"
            style={[s.tropesText, { color: ink }]}
          />
        ) : (
          <Text style={[s.tropesText, { color: ink }]}>{vals.tropes || '——'}</Text>
        )}
      </View>

      <View style={s.sideFieldsRow}>
        <View style={s.sideCol}>
          <Cell label="nickname (by partner)" value={vals.meNickname} onChange={set('meNickname')} editing={e} />
          <View style={s.mt6}>
            <Cell label="love language" value={vals.meLoveLanguage} onChange={set('meLoveLanguage')} editing={e} />
          </View>
        </View>
        <View style={s.sideCol}>
          <Cell label="nickname (by partner)" value={vals.foNickname} onChange={set('foNickname')} editing={e} />
          <View style={s.mt6}>
            <Cell label="love language" value={vals.foLoveLanguage} onChange={set('foLoveLanguage')} editing={e} />
          </View>
        </View>
      </View>

      <View style={s.divider}>
        <Heart size={12} color={ink} outline />
      </View>

      <View style={s.section}>
        <Text style={[s.sectionHeader, { color: ink }]}>dynamic</Text>
        <View style={s.legendRow}>
          <Heart size={11} color={vals.meColor} />
          <Text style={[s.legendText, { color: ink }]}>me</Text>
          <Heart size={11} color={vals.foColor} />
          <Text style={[s.legendText, { color: ink }]}>f/o</Text>
        </View>
        <View style={s.slidersCol}>
          {DYNAMIC_PAIRS.map(([l, r], i) => (
            <DualPolarSlider
              key={l}
              left={l}
              right={r}
              meValue={meDyn[i]}
              foValue={foDyn[i]}
              meColor={vals.meColor}
              foColor={vals.foColor}
              onMeChange={e ? (v) => setMeDyn(i, v) : undefined}
              onFoChange={e ? (v) => setFoDyn(i, v) : undefined}
            />
          ))}
        </View>
        <View style={s.mt10}>
          <QuadrantPicker
            top="Harmonious"
            bottom="Strained"
            left="Similar"
            right="Opposites"
            points={[
              { id: 'me', x: meAlign.x, y: meAlign.y, color: vals.meColor },
              { id: 'fo', x: foAlign.x, y: foAlign.y, color: vals.foColor },
            ]}
            onPointChange={e ? (id, v) => setRaw(id === 'me' ? 'meAlign' : 'foAlign', JSON.stringify(v)) : undefined}
          />
        </View>
      </View>

      <View style={s.divider}>
        <Heart size={12} color={ink} outline />
      </View>

      <View style={s.section}>
        <Text style={[s.sectionHeader, { color: ink }]}>who's who</Text>
        <View style={s.rolesCol}>
          {ROLE_LABELS.map((label, i) => (
            <ChoiceRow
              key={label}
              label={label}
              options={ROLE_OPTS}
              optionColors={[vals.meColor, vals.foColor, undefined]}
              value={roles[i]}
              onChange={e ? (v) => setRole(i, v) : undefined}
            />
          ))}
        </View>
      </View>

      <View style={s.divider}>
        <Heart size={12} color={ink} outline />
      </View>

      <View style={s.section}>
        <Text style={[s.sectionHeader, { color: ink }]}>intimacy</Text>
        <View style={s.legendRow}>
          <Heart size={11} color={vals.meColor} />
          <Text style={[s.legendText, { color: ink }]}>me</Text>
          <Heart size={11} color={vals.foColor} />
          <Text style={[s.legendText, { color: ink }]}>f/o</Text>
        </View>
        <View style={s.slidersCol}>
          {INTIMACY_PAIRS.map(([l, r], i) => (
            <DualPolarSlider
              key={l}
              left={l}
              right={r}
              meValue={meIntimacy[i]}
              foValue={foIntimacy[i]}
              meColor={vals.meColor}
              foColor={vals.foColor}
              onMeChange={e ? (v) => setMeIntimacy(i, v) : undefined}
              onFoChange={e ? (v) => setFoIntimacy(i, v) : undefined}
            />
          ))}
        </View>
        <View style={s.mt10}>
          <DualPolarSlider
            left="platonic"
            right="intense"
            meValue={parseFloat(vals.meOverallIntimacy) || 0.4}
            foValue={parseFloat(vals.foOverallIntimacy) || 0.6}
            meColor={vals.meColor}
            foColor={vals.foColor}
            onMeChange={e ? (v) => setRaw('meOverallIntimacy', String(v)) : undefined}
            onFoChange={e ? (v) => setRaw('foOverallIntimacy', String(v)) : undefined}
          />
          <Text style={[s.overallCaption, { color: ink }]}>overall intimacy (romantic or sexual)</Text>
        </View>
      </View>

      <Modal visible={picking !== null} transparent animationType="fade" onRequestClose={() => setPicking(null)}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback onPress={() => setPicking(null)}>
            <View style={pk.overlay} />
          </TouchableWithoutFeedback>
          <View style={[pk.sheet, SheetColumn]}>
            <View style={pk.handle} />
            <Text style={pk.title}>pick a color</Text>
            <View style={pk.grid}>
              {PALETTE_OPTIONS.map((c2) => {
                const curKey = picking === 'me' ? 'meColor' : 'foColor';
                const cur = picking ? vals[curKey] : '';
                return (
                  <Pressable
                    key={c2}
                    style={[pk.swatchWrap, c2 === cur && pk.swatchWrapActive]}
                    onPress={() => {
                      if (picking) setRaw(picking === 'me' ? 'meColor' : 'foColor', c2);
                      setPicking(null);
                    }}
                  >
                    <Heart size={26} color={c2} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </MarkerCard>
  );
}

export default function TemplateAesthetic() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="aesthetic" shipId={shipId}>
      <AestheticContent editing />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
  title: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(18),
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: sf(21),
    marginBottom: 12,
  },
  topRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  sideCol: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameRowPill: { flex: 1 },
  colorSwatch: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  centerCol: { flex: 1.3, gap: 6 },
  mt6: { marginTop: 6 },
  mt8: { marginTop: 8 },
  mt10: { marginTop: 10 },
  statRow3: { flexDirection: 'row', gap: 4 },
  statRow2: { flexDirection: 'row', gap: 4 },
  cellFlex: { flex: 1 },
  smallLabel: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(9),
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
    marginBottom: 4,
  },
  tropesBox: {
    marginTop: 12,
    padding: 10,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  tropesText: {
    fontFamily: FontFamily.ja,
    fontSize: sf(12),
    lineHeight: 17,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  sideFieldsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  divider: { alignItems: 'center', marginVertical: 14 },
  section: {},
  sectionHeader: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(14),
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 10,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 8 },
  legendText: { fontFamily: FontFamily.ui, fontSize: sf(9), textTransform: 'uppercase', letterSpacing: 0.4, marginRight: 8 },
  slidersCol: { gap: 9 },
  rolesCol: { gap: 10 },
  overallCaption: {
    fontFamily: FontFamily.ui,
    fontSize: sf(9),
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

const c = StyleSheet.create({
  wrap: { gap: 3 },
  label: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(8),
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  box: {
    height: 26,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  boxInput: {
    fontFamily: FontFamily.ja,
    fontSize: sf(11),
    padding: 0,
  },
});

const pk = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5, padding: Spacing.s5, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.s4 },
  title: { fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: Colors.ink, marginBottom: Spacing.s4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatchWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1.5, borderColor: 'transparent' },
  swatchWrapActive: { backgroundColor: Colors.line, borderColor: Colors.ink },
});
