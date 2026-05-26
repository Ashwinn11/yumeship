import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Pattern as SvgPattern, Path, Rect } from 'react-native-svg';
import { KawaiiPanel, BlankPill, INK } from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

const PINK_INK = '#9c2d5a';
const PINK_BG = '#fbe7ee';
const PANEL_EDGE = '#f3a8c4';
const PANEL_BG = '#ffffff';

const INFO_KEYS = ['age', 'birthday', 'pronouns', 'love language', 'mbti'] as const;
const SHARING_OPTS = ['No sharing', 'Selective', 'Ok with sharing'] as const;

export function KawaiiUIContent({ editing = false }: { editing?: boolean }) {
  const [bgSize, setBgSize] = useState({ width: 0, height: 0 });
  const [vals, setVals] = useState<Record<string, string>>({});
  const [sharing, setSharing] = useState<string | null>(null);

  const set = (key: string) =>
    editing ? (v: string) => setVals((p) => ({ ...p, [key]: v })) : undefined;
  const val = (key: string) => (editing ? vals[key] ?? '' : undefined);

  return (
    <View
      style={s.card}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setBgSize({ width, height });
      }}
    >
      {bgSize.width > 0 && (
        <Svg style={StyleSheet.absoluteFill} width={bgSize.width} height={bgSize.height}>
          <Defs>
            <SvgPattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <Path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(243,168,196,0.35)" strokeWidth="0.7" />
            </SvgPattern>
          </Defs>
          <Rect width={bgSize.width} height={bgSize.height} fill="url(#grid)" />
        </Svg>
      )}

      <Svg style={s.ribbonTL} width={60} height={60} viewBox="0 0 60 60">
        <Path d="M5 25 Q 15 5, 30 20 Q 45 5, 55 25 L 30 40 Z" fill={PINK_INK} opacity="0.8" />
        <Path d="M30 40 L 22 56 L 30 50 L 38 56 Z" fill={PINK_INK} opacity="0.8" />
      </Svg>
      <Svg style={s.ribbonTR} width={60} height={60} viewBox="0 0 60 60">
        <Path d="M5 25 Q 15 5, 30 20 Q 45 5, 55 25 L 30 40 Z" fill={PINK_INK} opacity="0.8" />
        <Path d="M30 40 L 22 56 L 30 50 L 38 56 Z" fill={PINK_INK} opacity="0.8" />
      </Svg>

      <View style={s.titlePillRow}>
        <View style={s.titlePill}>
          <Text style={s.titlePillText}>My YumeShip</Text>
        </View>
      </View>

      {/* 3-col stat panels */}
      <View style={s.statRow}>
        {(['name', 'from', 'type'] as const).map((label) => (
          <KawaiiPanel key={label} edge={PANEL_EDGE} bg={PANEL_BG} style={s.statPanel}>
            <Text style={[s.kawaiiLabel, { color: PINK_INK }]}>{label}</Text>
            <View style={{ marginTop: 6 }}>
              <BlankPill value={val(label)} onChangeText={set(label)} placeholder={`——`} />
            </View>
          </KawaiiPanel>
        ))}
      </View>

      {/* Main: portrait + info */}
      <KawaiiPanel edge={PANEL_EDGE} bg={PANEL_BG} style={s.mainPanel}>
        <View style={s.mainRow}>
          <View style={[s.portrait, { backgroundColor: PINK_BG, borderColor: PANEL_EDGE }]}>
            <Heart size={28} color={PINK_INK} outline />
          </View>
          <View style={s.infoCol}>
            {INFO_KEYS.map((k) => (
              <View key={k} style={s.infoRow}>
                <Text style={[s.infoKey, { color: PINK_INK }]}>{k}</Text>
                {editing ? (
                  <TextInput
                    value={vals[k] ?? ''}
                    onChangeText={(v) => setVals((p) => ({ ...p, [k]: v }))}
                    placeholder="——"
                    placeholderTextColor={PINK_INK + '44'}
                    style={[s.infoVal, s.infoValInput, { backgroundColor: PINK_BG, borderColor: PANEL_EDGE }]}
                  />
                ) : (
                  <View style={[s.infoVal, { backgroundColor: PINK_BG, borderColor: PANEL_EDGE }]} />
                )}
              </View>
            ))}
          </View>
        </View>
      </KawaiiPanel>

      {/* Sharing */}
      <KawaiiPanel edge={PANEL_EDGE} bg={PANEL_BG} style={s.mt10}>
        <Text style={[s.kawaiiLabel, { color: PINK_INK, marginBottom: 6 }]}>sharing status</Text>
        <View style={s.sharingRow}>
          {SHARING_OPTS.map((t) => (
            <Pressable
              key={t}
              style={s.sharingOpt}
              onPress={editing ? () => setSharing(sharing === t ? null : t) : undefined}
              disabled={!editing}
            >
              <Heart size={12} color={PINK_INK} outline={sharing !== t} />
              <Text style={[s.sharingText, { color: PINK_INK, fontFamily: sharing === t ? FontFamily.markerBold : FontFamily.marker }]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </KawaiiPanel>

      {/* Theme song */}
      <KawaiiPanel edge={PANEL_EDGE} bg={PANEL_BG} style={s.mt10}>
        <View style={s.songRow}>
          <View style={[s.songIcon, { backgroundColor: PINK_BG, borderColor: PANEL_EDGE }]}>
            <Text style={{ color: PINK_INK, fontSize: 16 }}>♪</Text>
          </View>
          <View style={s.songInfo}>
            <Text style={[s.kawaiiLabel, { color: PINK_INK }]}>theme song</Text>
            <View style={{ marginTop: 4 }}>
              <BlankPill value={val('song')} onChangeText={set('song')} placeholder="song title" />
            </View>
          </View>
        </View>
      </KawaiiPanel>

      {/* Tropes + anniversary */}
      <View style={s.bottomGrid}>
        <KawaiiPanel edge={PANEL_EDGE} bg={PANEL_BG} style={s.bottomPanel}>
          <Text style={[s.kawaiiLabel, { color: PINK_INK }]}>tropes</Text>
          <View style={s.tropesWrap}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[s.tropeChip, { backgroundColor: PINK_BG, borderColor: PANEL_EDGE }]}>
                <BlankPill value={val(`trope${i}`)} onChangeText={set(`trope${i}`)} placeholder="trope" />
              </View>
            ))}
          </View>
        </KawaiiPanel>
        <KawaiiPanel edge={PANEL_EDGE} bg={PANEL_BG} style={s.bottomPanel}>
          <Text style={[s.kawaiiLabel, { color: PINK_INK }]}>anniversary</Text>
          <View style={{ marginTop: 6 }}>
            <BlankPill value={val('anniv')} onChangeText={set('anniv')} placeholder="date" />
          </View>
        </KawaiiPanel>
      </View>

      <Text style={[s.author, { color: PINK_INK }]}>template ♡ by @cherrypopstamp</Text>
    </View>
  );
}

export default function TemplateKawaiiUI() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.appBar}>
        <Pressable onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>‹</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <KawaiiUIContent editing />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  appBar: { paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: Colors.ink2, fontFamily: FontFamily.ui },
  scroll: { padding: Spacing.s5, paddingBottom: Spacing.s8 },
  card: {
    borderWidth: 2,
    borderColor: '#9c2d5a',
    borderRadius: 18,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#fcd6e2',
  },
  ribbonTL: { position: 'absolute', top: 8, left: 8 },
  ribbonTR: { position: 'absolute', top: 8, right: 8 },
  titlePillRow: { alignItems: 'center', marginTop: 50, marginBottom: 4 },
  titlePill: {
    backgroundColor: '#9c2d5a',
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 999,
  },
  titlePillText: {
    fontFamily: FontFamily.markerBold,
    fontWeight: '700',
    fontSize: 18,
    color: '#fff',
    letterSpacing: 0.5,
  },
  statRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  statPanel: { flex: 1 },
  kawaiiLabel: {
    fontFamily: FontFamily.markerBold,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  mainPanel: { marginTop: 10 },
  mainRow: { flexDirection: 'row', gap: 10 },
  portrait: {
    width: 100,
    height: 120,
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoCol: { flex: 1, gap: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoKey: {
    fontFamily: FontFamily.markerBold,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    opacity: 0.7,
    width: 84,
  },
  infoVal: {
    flex: 1,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoValInput: {
    fontFamily: FontFamily.ja,
    fontSize: 11,
    color: INK,
    padding: 0,
  },
  mt10: { marginTop: 10 },
  sharingRow: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  sharingOpt: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sharingText: { fontSize: 11 },
  songRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  songIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songInfo: { flex: 1 },
  bottomGrid: { flexDirection: 'row', gap: 10, marginTop: 10 },
  bottomPanel: { flex: 1 },
  tropesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tropeChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3, flex: 1 },
  author: {
    textAlign: 'center',
    fontFamily: FontFamily.script,
    fontSize: 12,
    opacity: 0.75,
    marginTop: 14,
  },
});
