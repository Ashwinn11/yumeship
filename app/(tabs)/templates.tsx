import React from 'react';
import {
  View, Text, Pressable, FlatList,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Mark } from '@/components';
import { Sparkle, Heart, Sakura, Star, QuoteMark } from '@/deco';

const TEMPLATES = [
  {
    kind: 'intro', ja: '紹介', title: 'Meet My F/O',
    body: 'Introduction profile — name, fandom, first impression, why I love them.',
    tint: colors.sakuraDeep, fields: 5, icon: 'heart',
  },
  {
    kind: 'infodump', ja: '詳細', title: 'F/O Infodump',
    body: 'Deep dive: personality, appearance, quirks, favorites, 5 headcanons.',
    tint: colors.lavenderDeep, fields: 9, icon: 'spark',
  },
  {
    kind: 'preference', ja: '選択', title: 'This or That',
    body: '10 preference pairs — coffee/tea, morning/night, listener/talker.',
    tint: colors.butterDeep, fields: 10, icon: 'star',
  },
  {
    kind: 'headcanons', ja: '妄想', title: 'Headcanons List',
    body: 'Category-grouped — Personality, Habits, Favorites, How We Met, Random.',
    tint: colors.peachDeep, fields: 0, icon: 'sakura',
  },
  {
    kind: 'qa', ja: '問答', title: 'Selfship Q&A',
    body: '10 classic community questions — answer them all or just the ones that matter.',
    tint: colors.sageDeep, fields: 10, icon: 'quote',
  },
  {
    kind: 'letter', ja: '愛', title: "Valentine's",
    body: 'A love letter + favorite memory + 5 things I love about them.',
    tint: colors.sakuraDeep, fields: 7, icon: 'heart', featured: true,
  },
  {
    kind: 'gratitude', ja: '感謝', title: 'F/Ovember',
    body: '30 days of small gratitudes. A community tradition.',
    tint: colors.butterDeep, fields: 30, icon: 'star',
  },
  {
    kind: 'milestone', ja: '節目', title: 'Milestone',
    body: 'Celebrate an anniversary — message, best memories, next chapter.',
    tint: colors.peachDeep, fields: 6, icon: 'spark',
  },
  {
    kind: 'polycule', ja: '群', title: 'Polycule Intro',
    body: 'Introduce a polycule — group name, members, dynamics, notes.',
    tint: colors.plum, fields: 0, icon: 'sakura',
  },
] as const;

function TileIcon({ icon, tint, size = 16 }: { icon: string; tint: string; size?: number }) {
  switch (icon) {
    case 'heart':  return <Heart size={size} color={tint} />;
    case 'spark':  return <Sparkle size={size} color={tint} />;
    case 'star':   return <Star size={size - 2} color={tint} />;
    case 'sakura': return <Sakura size={size + 2} color={tint} />;
    case 'quote':  return <QuoteMark size={size + 4} color={tint} />;
    default:       return null;
  }
}

type TemplateItem = {
  kind: string; ja: string; title: string; body: string;
  tint: string; fields: number; icon: string; featured?: boolean;
};

function TemplateTile({ item }: { item: TemplateItem }) {
  return (
    <Pressable onPress={() => router.push(`/template/${item.kind}`)} style={{ flex: 1 }}>
      <View style={[
        styles.tile,
        item.featured && { backgroundColor: colors.sakuraSoft, borderColor: item.tint },
        ...shadows.sm as any,
      ]}>
        {/* Watermark kanji */}
        <Text style={[styles.watermark, { color: item.tint }]}>{item.ja}</Text>

        {/* Header row */}
        <View style={styles.tileHeader}>
          <TileIcon icon={item.icon} tint={item.tint} />
          <Text style={[styles.tileKind, { color: item.tint }]}>{item.kind}</Text>
        </View>

        <Text style={styles.tileTitle}>{item.title}</Text>
        <Text style={styles.tileBody}>{item.body}</Text>

        <View style={styles.tileFooter}>
          <Text style={styles.tileFields}>
            {item.fields > 0 ? `${item.fields} fields` : 'open'}
          </Text>
          <Text style={[styles.tileCta, { color: item.tint }]}>fill in ›</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function Templates() {
  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={TEMPLATES}
        keyExtractor={(item) => item.kind}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Mark size={26} />
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>templates</Text>
              <Sparkle size={14} color={colors.butterDeep} />
            </View>
            <Text style={styles.subtitle}>9 fill-in cards · save to photos</Text>
          </View>
        }
        renderItem={({ item }) => <TemplateTile item={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: spacing.s3 + 2, paddingBottom: spacing.s5 },
  row: { gap: spacing.s2 + 2, marginBottom: spacing.s2 + 2 },

  header: { paddingTop: spacing.s2 },
  headerRow: { paddingVertical: spacing.s2, paddingHorizontal: spacing.s2 },
  titleRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.s2,
    paddingHorizontal: spacing.s2, marginTop: spacing.s3, marginBottom: spacing.s1,
  },
  title: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 34, lineHeight: 32, letterSpacing: -0.5, color: colors.ink,
  },
  subtitle: {
    fontFamily: 'JetBrainsMono', fontSize: 10, color: colors.ink3,
    letterSpacing: 1.2, paddingHorizontal: spacing.s2,
    marginBottom: spacing.s3,
  },

  tile: {
    flex: 1, padding: spacing.s4 + 2,
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.r4,
    gap: spacing.s2 + 2,
    overflow: 'hidden', position: 'relative',
    ...shadows.sm,
  },
  watermark: {
    position: 'absolute', right: -8, top: -14,
    fontSize: 72, lineHeight: 72,
    fontFamily: 'KleeOne', fontWeight: '600',
    opacity: 0.08,
  },
  tileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  tileKind: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '600',
  },
  tileTitle: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 18, lineHeight: 20, letterSpacing: -0.1, color: colors.ink,
  },
  tileBody: {
    fontSize: 11, color: colors.ink2, lineHeight: 16, minHeight: 32,
  },
  tileFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tileFields: { fontFamily: 'JetBrainsMono', fontSize: 9, color: colors.ink3 },
  tileCta: { fontSize: 11, fontWeight: '600' },
});
