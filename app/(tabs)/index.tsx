import React from 'react';
import {
  View, Text, Pressable, FlatList,
  StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Mark, Icons, SmallIconBtn } from '@/components';
import { Sparkle, WashiTape, Pin, Heart } from '@/deco';

// Mock data — will be wired to DB later
const SHIPS = [
  {
    id: '1', name: 'Kafka', src: 'HSR',
    type: 'romantic', typeColor: colors.sakuraDeep,
    grad: [colors.sakura, '#6b3d5b'],
    initial: 'K', pinned: true, polycule: true, days: '1y 47d',
    tape: { pattern: 'heart' as const, color: colors.vellum },
  },
  {
    id: '2', name: 'Childe', src: 'Genshin',
    type: 'romantic', typeColor: colors.sakuraDeep,
    grad: ['#e0a98c', '#8b4a3a'],
    initial: 'C', pinned: false, polycule: false, days: '278d',
    tape: { pattern: 'stripe' as const, color: colors.peach },
  },
  {
    id: '3', name: 'Basil', src: 'OMORI',
    type: 'platonic', typeColor: colors.sageDeep,
    grad: [colors.sage, '#4d6347'],
    initial: 'B', pinned: false, polycule: false, days: '92d',
    tape: { pattern: 'dot' as const, color: colors.sage },
  },
];

function ShipCard({ item }: { item: typeof SHIPS[0] }) {
  return (
    <Pressable onPress={() => router.push(`/fo/${item.id}/profile`)} style={{ flex: 1 }}>
      <View style={styles.shipCard}>
        {/* Cover */}
        <View style={[styles.cover, { backgroundColor: item.grad[1] }]}>
          <View style={[styles.coverGrad, { backgroundColor: item.grad[0] }]} />
          <Text style={styles.coverInitial}>{item.initial}</Text>

          <View style={styles.washiWrap}>
            <WashiTape width={56} height={14} pattern={item.tape.pattern} color={item.tape.color} rotate={-6} />
          </View>

          {item.pinned && (
            <View style={styles.pinWrap}>
              <Pin size={11} color={colors.sakuraDeep} />
            </View>
          )}

          {item.polycule && (
            <View style={styles.polyculeTag}>
              <Text style={styles.polyculeText}>✶ poly</Text>
            </View>
          )}
        </View>

        {/* Meta */}
        <View style={styles.cardMeta}>
          <View style={styles.cardRow}>
            <Text style={styles.cardName}>{item.name}</Text>
            <View style={[styles.typeDot, { backgroundColor: item.typeColor }]} />
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardSrc}>{item.src}</Text>
            <Text style={styles.cardDays}>{item.days}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function Home() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Mark size={26} />
          <View style={styles.headerActions}>
            <View style={[styles.iconBtn, { color: colors.ink2 } as any]}>
              {Icons.search}
            </View>
            <Pressable onPress={() => router.push('/fo/new' as any)}>
              <View style={styles.iconBtn}>
                {Icons.plus}
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>your ships</Text>
          <Sparkle size={16} color={colors.sakuraDeep} />
        </View>
        <Text style={styles.subtitle}>3 F/Os · 142 ENTRIES · 1 POLYCULE</Text>

        {/* Grid */}
        <View style={styles.grid}>
          {SHIPS.map((ship) => (
            <ShipCard key={ship.id} item={ship} />
          ))}

          {/* Add card */}
          <Pressable onPress={() => router.push('/fo/new' as any)} style={{ flex: 1 }}>
            <View style={styles.addCard}>
              <View style={styles.addIcon}>
                {Icons.plus}
              </View>
              <Text style={styles.addText}>start a new ship</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.s3 + 2, paddingTop: spacing.s2, paddingBottom: spacing.s5 },

  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: spacing.s2 + 2,
    paddingVertical: spacing.s2,
  },
  headerActions: { flexDirection: 'row', gap: spacing.s2 },
  iconBtn: {
    width: 32, height: 32, borderRadius: radii.pill,
    backgroundColor: colors.vellum, borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center',
    color: colors.ink2,
  },

  titleRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.s2 + 2,
    paddingHorizontal: spacing.s2 + 2, marginTop: spacing.s3,
  },
  title: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 38, lineHeight: 36,
    letterSpacing: -0.5, color: colors.ink,
  },
  subtitle: {
    fontFamily: 'JetBrainsMono',
    fontSize: 10, color: colors.ink3,
    letterSpacing: 1.2,
    paddingHorizontal: spacing.s2 + 2, marginTop: spacing.s2,
    marginBottom: spacing.s2 + 2,
  },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: spacing.s2 + 2,
    paddingHorizontal: spacing.s1,
  },

  shipCard: {
    borderRadius: radii.r4,
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.line,
    overflow: 'hidden',
    aspectRatio: 3 / 4,
    ...shadows.sm,
  },
  cover: {
    flex: 1, position: 'relative',
    overflow: 'hidden',
  },
  coverGrad: {
    ...StyleSheet.absoluteFill,
    opacity: 0.6,
  },
  coverInitial: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 56,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 150,
  },
  washiWrap: { position: 'absolute', top: 0, left: -8 },
  pinWrap: {
    position: 'absolute', top: 8, right: 8,
    width: 22, height: 22, borderRadius: radii.pill,
    backgroundColor: colors.vellum,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.sm,
  },
  polyculeTag: {
    position: 'absolute', bottom: 8, right: 8,
    paddingHorizontal: 7, paddingVertical: 2,
    backgroundColor: 'rgba(110,58,90,0.92)',
    borderRadius: radii.pill,
  },
  polyculeText: { fontSize: 9, fontWeight: '600', color: colors.vellum, letterSpacing: 0.6 },
  cardMeta: { padding: spacing.s2 + 2, backgroundColor: colors.vellum },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 18, lineHeight: 20, color: colors.ink,
  },
  typeDot: { width: 8, height: 8, borderRadius: radii.pill },
  cardSrc: { fontSize: 10, color: colors.ink3 },
  cardDays: { fontFamily: 'JetBrainsMono', fontSize: 9, color: colors.ink3 },

  addCard: {
    aspectRatio: 3 / 4,
    borderWidth: 1.5, borderColor: colors.lineStrong, borderStyle: 'dashed',
    borderRadius: radii.r4,
    alignItems: 'center', justifyContent: 'center',
    gap: spacing.s2,
    backgroundColor: 'rgba(243,182,196,0.08)',
  },
  addIcon: {
    width: 36, height: 36, borderRadius: radii.pill,
    backgroundColor: colors.sakuraSoft,
    alignItems: 'center', justifyContent: 'center',
    color: colors.sakuraDeep,
  },
  addText: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 14, color: colors.ink2,
    textAlign: 'center', paddingHorizontal: spacing.s2,
    lineHeight: 17,
  },
});
