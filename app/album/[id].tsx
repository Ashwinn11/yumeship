import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Image,
  StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { WashiTape, Sparkle, Heart, Seal, Sakura } from '@/deco';

const STICKER_CATEGORIES = [
  { ja: '花', name: 'florals' },
  { ja: '心', name: 'hearts' },
  { ja: '星', name: 'sparkles' },
  { ja: '印', name: 'seals' },
];

export default function AlbumDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeCategory, setActiveCategory] = useState(0);
  const [showStickerDrawer, setShowStickerDrawer] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>album</Text>
        <Pressable style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ photo</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Polaroid card — empty state */}
        <View style={styles.polaroidWrap}>
          <View style={styles.polaroid}>
            {/* Tape */}
            <View style={styles.tapeWrap}>
              <WashiTape width={84} height={18} pattern="heart" color={colors.sakuraDeep} rotate={-8} />
            </View>

            {/* Photo area */}
            <View style={styles.photoArea}>
              {/* Placeholder gradient */}
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>K</Text>
              </View>

              {/* Sticker layer examples */}
              <View style={[styles.sticker, { top: 10, right: 14 }]}>
                <Heart size={26} color={colors.sakura} />
              </View>
              <View style={[styles.sticker, { top: 30, right: 38 }]}>
                <Sparkle size={14} color={colors.butter} />
              </View>
              <View style={[styles.sticker, { bottom: 12, left: 10 }]}>
                <Seal size={44} color={colors.vellum} ja="夢" label="yume" rotate={-15} />
              </View>
              <View style={[styles.sticker, { top: 90, left: 14 }]}>
                <Sakura size={22} color={colors.sakura} />
              </View>
            </View>

            {/* Caption */}
            <Text style={styles.caption}>my whole problem ♡</Text>
          </View>

          {/* Add sticker button */}
          <Pressable
            onPress={() => setShowStickerDrawer(!showStickerDrawer)}
            style={styles.stickerBtn}
          >
            <Sparkle size={11} color={colors.sakuraDeep} />
            <Text style={styles.stickerBtnText}>stickers</Text>
          </Pressable>
        </View>

        {/* Photo grid placeholder */}
        <View style={styles.gridHeader}>
          <Text style={styles.gridLabel}>all photos</Text>
          <Text style={styles.gridCount}>1 item</Text>
        </View>
        <View style={styles.gridEmpty}>
          <Heart size={24} color={colors.line} outline />
          <Text style={styles.gridEmptyText}>add more memories</Text>
        </View>
      </ScrollView>

      {/* Sticker drawer */}
      {showStickerDrawer && (
        <View style={styles.drawer}>
          <View style={styles.drawerHandle} />
          <Text style={styles.drawerTitle}>sticker sheet</Text>

          {/* Category tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            <View style={styles.catRow}>
              {STICKER_CATEGORIES.map((c, i) => (
                <Pressable
                  key={c.name}
                  onPress={() => setActiveCategory(i)}
                  style={[styles.catChip, i === activeCategory && styles.catChipActive]}
                >
                  <Text style={[styles.catJa, { color: i === activeCategory ? colors.sakuraDeep : colors.ink2 }]}>
                    {c.ja}
                  </Text>
                  <Text style={[styles.catName, { color: i === activeCategory ? colors.sakuraDeep : colors.ink3 }]}>
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Sticker grid */}
          <View style={styles.stickerGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Pressable key={i} style={styles.stickerCell}>
                <View style={styles.stickerCellInner}>
                  {i % 4 === 0 && <Heart size={28} color={colors.sakuraDeep} />}
                  {i % 4 === 1 && <Sparkle size={26} color={colors.butterDeep} />}
                  {i % 4 === 2 && <Sakura size={30} color={colors.sakura} />}
                  {i % 4 === 3 && <Seal size={38} color={colors.lavenderDeep} ja="夢" label="yume" rotate={0} />}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.s4, paddingVertical: spacing.s3,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  back: { width: 32 },
  backText: { fontSize: 22, color: colors.ink2, lineHeight: 26 },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 20, color: colors.ink,
  },
  addBtn: {
    paddingHorizontal: spacing.s3, paddingVertical: spacing.s1,
    backgroundColor: colors.sakuraDeep,
    borderRadius: radii.pill,
  },
  addBtnText: { color: colors.vellum, fontSize: 12, fontWeight: '600' },

  scroll: { flex: 1 },
  content: { padding: spacing.s4, alignItems: 'center' },

  polaroidWrap: { alignItems: 'center', marginBottom: spacing.s5 },
  polaroid: {
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.lineStrong,
    padding: 10, paddingBottom: 36,
    position: 'relative',
    transform: [{ rotate: '-2deg' }],
    ...shadows.md,
  },
  tapeWrap: { position: 'absolute', top: -8, left: '30%' as any },
  photoArea: { width: 230, height: 200, position: 'relative', overflow: 'hidden' },
  photoPlaceholder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.lavenderDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 80, color: colors.vellum, lineHeight: 80, opacity: 0.95,
  },
  sticker: { position: 'absolute' },
  caption: {
    marginTop: 8, textAlign: 'center',
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 17, color: colors.ink,
  },

  stickerBtn: {
    marginTop: spacing.s4,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.s4, paddingVertical: spacing.s2,
    backgroundColor: colors.sakuraSoft,
    borderWidth: 1, borderColor: colors.sakura,
    borderRadius: radii.pill,
  },
  stickerBtnText: {
    fontFamily: 'JetBrainsMono',
    fontSize: 11, color: colors.sakuraDeep, fontWeight: '600', letterSpacing: 0.8,
  },

  gridHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', marginBottom: spacing.s2,
  },
  gridLabel: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, color: colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase',
  },
  gridCount: { fontFamily: 'JetBrainsMono', fontSize: 9, color: colors.ink3 },
  gridEmpty: {
    width: '100%', paddingVertical: spacing.s6,
    alignItems: 'center', gap: spacing.s2,
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed',
    borderRadius: radii.r4,
  },
  gridEmptyText: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 14, color: colors.ink3,
  },

  drawer: {
    backgroundColor: colors.vellum,
    borderTopWidth: 1, borderTopColor: colors.line,
    borderTopLeftRadius: radii.r5, borderTopRightRadius: radii.r5,
    padding: spacing.s4, paddingTop: spacing.s3,
    maxHeight: 320,
    ...shadows.md,
  },
  drawerHandle: {
    width: 36, height: 4, borderRadius: radii.pill,
    backgroundColor: colors.lineStrong,
    alignSelf: 'center', marginBottom: spacing.s3,
  },
  drawerTitle: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 18, color: colors.ink, marginBottom: spacing.s3,
  },
  catScroll: { marginBottom: spacing.s3 },
  catRow: { flexDirection: 'row', gap: spacing.s2 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.s3, paddingVertical: spacing.s1,
    backgroundColor: colors.paperDeep,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.pill,
  },
  catChipActive: {
    backgroundColor: colors.sakuraSoft,
    borderColor: colors.sakuraDeep,
  },
  catJa: { fontFamily: 'KleeOne', fontSize: 13, fontWeight: '600' },
  catName: { fontSize: 11 },
  stickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2 },
  stickerCell: {
    width: 64, height: 64,
    backgroundColor: colors.paperDeep,
    borderRadius: radii.r3,
    borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  stickerCellInner: { alignItems: 'center', justifyContent: 'center' },
});
