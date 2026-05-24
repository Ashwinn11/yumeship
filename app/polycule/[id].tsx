import React from 'react';
import {
  View, Text, Pressable, ScrollView,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Sparkle, Heart, Sakura } from '@/deco';

const MOCK = {
  id: '1',
  name: 'The Hunters',
  members: [
    { name: 'Kafka',       fandom: 'Honkai Star Rail', color: colors.sakuraDeep,   initial: 'K' },
    { name: 'Silver Wolf', fandom: 'Honkai Star Rail', color: colors.lavenderDeep, initial: 'S' },
    { name: 'Blade',       fandom: 'Honkai Star Rail', color: colors.ink2,         initial: 'B' },
  ],
  notes: 'cosmic chaos and a lot of tension. they orbit each other like a binary star system that forgot to stay in place.',
  tint: colors.plum,
};

export default function PolyculeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.safe}>
      {/* App bar */}
      <View style={styles.appBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.appBarMono}>polycule</Text>
        <Pressable>
          <Text style={styles.editBtn}>edit</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={[styles.hero, { borderColor: MOCK.tint + '40' }]}>
          <Text style={[styles.heroWatermark, { color: MOCK.tint }]}>群</Text>
          <View style={styles.heroHeader}>
            <Sparkle size={12} color={MOCK.tint} />
            <Text style={[styles.heroKind, { color: MOCK.tint }]}>constellation</Text>
          </View>
          <Text style={styles.heroName}>{MOCK.name}</Text>
          <Text style={styles.heroNotes}>{MOCK.notes}</Text>

          <View style={styles.memberAvatarRow}>
            {MOCK.members.map((m, i) => (
              <View
                key={m.name}
                style={[
                  styles.memberAvatar,
                  { backgroundColor: m.color + '30', borderColor: m.color },
                  i > 0 && { marginLeft: -10 },
                ]}
              >
                <Text style={[styles.memberInitial, { color: m.color }]}>{m.initial}</Text>
              </View>
            ))}
            <Text style={styles.memberCount}>{MOCK.members.length} members</Text>
          </View>
        </View>

        {/* Member list */}
        <Text style={styles.sectionLabel}>members</Text>
        {MOCK.members.map((m) => (
          <View key={m.name} style={[styles.memberCard, { borderColor: m.color + '40' }]}>
            <View style={[styles.memberDot, { backgroundColor: m.color + '30', borderColor: m.color }]}>
              <Text style={[styles.memberInitialLg, { color: m.color }]}>{m.initial}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{m.name}</Text>
              <Text style={styles.memberFandom}>{m.fandom}</Text>
            </View>
            <Sparkle size={10} color={m.color} />
          </View>
        ))}

        {/* Notes */}
        <Text style={styles.sectionLabel}>dynamics</Text>
        <View style={styles.notesCard}>
          <View style={styles.notesHeart}>
            <Heart size={10} color={MOCK.tint} />
          </View>
          <Text style={styles.notesText}>{MOCK.notes}</Text>
        </View>

        {/* Add member */}
        <Pressable style={styles.addMemberBtn}>
          <Text style={styles.addMemberText}>+ add member</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  appBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.s5, paddingVertical: spacing.s3,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  back: { fontSize: 22, color: colors.ink2, lineHeight: 26, width: 32 },
  appBarMono: {
    fontFamily: 'JetBrainsMono',
    fontSize: 10, color: colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase',
  },
  editBtn: { fontSize: 14, color: colors.plum, fontWeight: '600', width: 32, textAlign: 'right' },

  scroll: { flex: 1 },
  content: { padding: spacing.s4, gap: spacing.s3, paddingBottom: spacing.s7 },

  hero: {
    backgroundColor: colors.vellum,
    borderWidth: 1,
    borderRadius: radii.r4,
    padding: spacing.s5,
    position: 'relative', overflow: 'hidden',
    ...shadows.sm,
  },
  heroWatermark: {
    position: 'absolute', right: -8, top: -14,
    fontSize: 80, lineHeight: 80,
    fontFamily: 'KleeOne', fontWeight: '600',
    opacity: 0.08,
  },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2, marginBottom: spacing.s2 },
  heroKind: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '600',
  },
  heroName: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 28, lineHeight: 30, color: colors.ink, marginBottom: spacing.s2,
  },
  heroNotes: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 13, color: colors.ink2, lineHeight: 20,
    marginBottom: spacing.s3,
  },
  memberAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  memberAvatar: {
    width: 32, height: 32, borderRadius: radii.pill,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  memberInitial: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 15, fontWeight: '600',
  },
  memberCount: {
    fontFamily: 'JetBrainsMono',
    fontSize: 10, color: colors.ink3, marginLeft: spacing.s1,
  },

  sectionLabel: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, color: colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase',
    marginTop: spacing.s1,
  },
  memberCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.s3,
    backgroundColor: colors.vellum,
    borderWidth: 1,
    borderRadius: radii.r3,
    padding: spacing.s3,
    ...shadows.sm,
  },
  memberDot: {
    width: 40, height: 40, borderRadius: radii.pill,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  memberInitialLg: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 18, fontWeight: '600',
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 18, lineHeight: 20, color: colors.ink,
  },
  memberFandom: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, color: colors.ink3, letterSpacing: 0.4,
  },

  notesCard: {
    backgroundColor: colors.paperDeep,
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.plum + '60',
    borderRadius: radii.r3,
    padding: spacing.s3,
    position: 'relative',
  },
  notesHeart: { position: 'absolute', top: -5, left: 12 },
  notesText: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 13, color: colors.ink2, lineHeight: 20,
    marginTop: spacing.s1,
  },

  addMemberBtn: {
    alignItems: 'center', paddingVertical: spacing.s3,
    borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed',
    borderRadius: radii.r3,
    backgroundColor: colors.paperDeep,
  },
  addMemberText: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 15, color: colors.ink3,
  },
});
