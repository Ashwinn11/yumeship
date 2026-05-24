import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { WashiTape, Heart } from '@/deco';

const REL_TYPES = [
  { ja: '恋', name: 'romantic', tint: colors.sakuraDeep, bg: colors.sakuraSoft },
  { ja: '友', name: 'platonic', tint: colors.sageDeep, bg: colors.sageSoft },
  { ja: '家', name: 'familial', tint: colors.peachDeep, bg: colors.peachSoft },
];

export default function NewFO() {
  const [name, setName] = useState('');
  const [fandom, setFandom] = useState('');
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');
  const [relType, setRelType] = useState(0);

  const save = () => {
    // Wire to DB later
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.appBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹</Text>
        </Pressable>
        <Text style={styles.appBarTitle}>new F/O</Text>
        <Pressable onPress={save}>
          <Text style={styles.saveBtn}>save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Cover placeholder */}
        <View style={styles.cover}>
          <View style={styles.coverUpload}>
            <Text style={styles.coverPlus}>＋ add cover photo</Text>
          </View>
          <View style={styles.washiWrap}>
            <WashiTape width={80} height={16} pattern="heart" color={colors.vellum} rotate={-4} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Their name</Text>
            <TextInput
              value={name} onChangeText={setName}
              placeholder="Name…"
              placeholderTextColor={colors.ink3}
              style={styles.underInput}
            />
          </View>

          <View style={[styles.fieldGroup, { marginTop: spacing.s3 }]}>
            <Text style={styles.fieldLabel}>From (fandom / source)</Text>
            <TextInput
              value={fandom} onChangeText={setFandom}
              placeholder="Fandom…"
              placeholderTextColor={colors.ink3}
              style={styles.underInput}
            />
          </View>

          <View style={[styles.fieldGroup, { marginTop: spacing.s3 }]}>
            <Text style={styles.fieldLabel}>Nickname (what you call them)</Text>
            <TextInput
              value={nickname} onChangeText={setNickname}
              placeholder={'"my whole problem"'}
              placeholderTextColor={colors.sakuraInk + '80'}
              style={[styles.underInput, { fontFamily: 'InstrumentSerif_Italic', color: colors.sakuraInk }]}
            />
          </View>

          <View style={[styles.fieldGroup, { marginTop: spacing.s4 }]}>
            <Text style={styles.fieldLabel}>Relationship type</Text>
            <View style={styles.typeRow}>
              {REL_TYPES.map((t, i) => (
                <Pressable key={t.name} onPress={() => setRelType(i)} style={{ flex: 1 }}>
                  <View style={[
                    styles.typeChip,
                    { backgroundColor: relType === i ? t.bg : colors.vellum, borderColor: relType === i ? t.tint : colors.line },
                  ]}>
                    <Text style={[styles.typeJa, { color: t.tint }]}>{t.ja}</Text>
                    <Text style={[styles.typeName, { color: relType === i ? t.tint : colors.ink2 }]}>{t.name}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.fieldGroup, { marginTop: spacing.s3 }]}>
            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput
              value={notes} onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Anything you want to remember about them…"
              placeholderTextColor={colors.ink3}
              style={styles.textarea}
              textAlignVertical="top"
            />
          </View>
        </View>
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
    backgroundColor: colors.paper,
  },
  backBtn: { fontSize: 20, color: colors.ink2 },
  appBarTitle: { fontFamily: 'InstrumentSerif_Italic', fontSize: 18, color: colors.ink },
  saveBtn: { fontSize: 14, fontWeight: '600', color: colors.sakuraDeep },

  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.s5, paddingTop: spacing.s3, paddingBottom: spacing.s7 },

  cover: {
    height: 160, borderRadius: radii.r4,
    backgroundColor: colors.sakura + '60',
    overflow: 'hidden', position: 'relative',
    marginBottom: spacing.s3,
    alignItems: 'center', justifyContent: 'center',
  },
  coverUpload: {
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)', borderStyle: 'dashed',
    borderRadius: radii.r3, paddingHorizontal: spacing.s5, paddingVertical: spacing.s2,
  },
  coverPlus: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '500' },
  washiWrap: { position: 'absolute', top: 12, left: 14 },

  card: {
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.r4,
    padding: spacing.s4,
    ...shadows.sm,
  },
  fieldGroup: { gap: spacing.s1 },
  fieldLabel: {
    fontSize: 9, color: colors.ink3,
    letterSpacing: 1.2, fontFamily: 'JetBrainsMono',
    textTransform: 'uppercase',
  },
  underInput: {
    borderBottomWidth: 1, borderBottomColor: colors.lineStrong,
    backgroundColor: 'transparent',
    paddingVertical: 6, fontSize: 18,
    fontFamily: 'InstrumentSerif_Italic', color: colors.ink,
  },
  typeRow: { flexDirection: 'row', gap: spacing.s2, marginTop: spacing.s1 },
  typeChip: {
    paddingVertical: spacing.s2, paddingHorizontal: spacing.s1,
    borderRadius: radii.r3, borderWidth: 1,
    alignItems: 'center', gap: spacing.s1,
  },
  typeJa: { fontFamily: 'KleeOne', fontSize: 16, fontWeight: '600' },
  typeName: { fontSize: 10, fontWeight: '500' },
  textarea: {
    padding: spacing.s3,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.r3, backgroundColor: colors.paperSoft,
    fontSize: 14, color: colors.ink2, lineHeight: 21,
    minHeight: 80,
  },
});
