import { Image } from 'expo-image';
import { persistImage } from '@/lib/localMedia';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mark } from '@/components/ui/Mark';
import { SNIPSY_URL } from '@/constants/links';
import { BUILTIN_STICKERS } from '@/constants/stickers';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { addCustomSticker, deleteCustomSticker, useCustomStickers } from '@/store/customStickers';

export default function StickersScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const stickers = useCustomStickers();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handleAddFromPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      addCustomSticker(await persistImage(result.assets[0].uri));
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1 }]}>
      <View style={[styles.header, column]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={22} />
          <Text style={styles.headerTitle}>sticker collection</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, column, { paddingBottom: insets.bottom + Spacing.s5 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>built-in — used in love letters &amp; storyline</Text>
        <View style={styles.grid}>
          {BUILTIN_STICKERS.map(({ key, label, El }) => (
            <View key={key} style={styles.cell}>
              <View style={styles.builtinImg}>
                <El size={56} />
              </View>
              <Text style={styles.builtinLabel} numberOfLines={1}>{label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>your stickers</Text>
        <View style={styles.actionRow}>
          <Pressable style={styles.actionBtn} onPress={handleAddFromPhotos}>
            <Text style={styles.actionBtnIcon}>＋</Text>
            <Text style={styles.actionBtnLabel}>add from photos</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.snipsyBtn]} onPress={() => Linking.openURL(SNIPSY_URL)}>
            <Text style={styles.actionBtnIcon}>✂️</Text>
            <Text style={styles.actionBtnLabel}>make more in Snipsy</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>
          die-cut stickers with a transparent background work best — export one from Snipsy&apos;s share sheet,
          then add it from your photos here.
        </Text>

        {stickers.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>no custom stickers yet</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {stickers.map((s) => (
              <View key={s.id} style={styles.cell}>
                <View style={styles.checker}>
                  <View style={[styles.checkerCell, { top: 0, left: 0 }]} />
                  <View style={[styles.checkerCell, { top: 22, left: 22 }]} />
                </View>
                <Image source={{ uri: s.uri }} style={styles.cellImg} contentFit="contain" />
                <Pressable
                  style={styles.cellRemove}
                  onPress={() => setConfirmDeleteId(s.id)}
                  hitSlop={8}
                >
                  <Text style={styles.cellRemoveText}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {confirmDeleteId && (
        <Pressable style={styles.confirmOverlay} onPress={() => setConfirmDeleteId(null)}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>remove this sticker?</Text>
            <View style={styles.confirmRow}>
              <Pressable style={styles.confirmCancel} onPress={() => setConfirmDeleteId(null)}>
                <Text style={styles.confirmCancelText}>keep it</Text>
              </Pressable>
              <Pressable
                style={styles.confirmDelete}
                onPress={() => { deleteCustomSticker(confirmDeleteId); setConfirmDeleteId(null); }}
              >
                <Text style={styles.confirmDeleteText}>remove</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const CELL = 92;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  headerBtnText: { fontSize: sf(18), color: Colors.ink2, fontFamily: FontFamily.ui, lineHeight: sf(20) },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s5 },

  sectionLabel: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.ink3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.s3,
  },
  sectionLabelSpaced: { marginTop: Spacing.s6 },
  builtinImg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  builtinLabel: {
    fontFamily: FontFamily.ui, fontSize: sf(9), color: Colors.ink3,
    textAlign: 'center', paddingBottom: 6, paddingHorizontal: 4,
  },

  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, paddingVertical: Spacing.s4, borderRadius: Radius.r3,
    borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.vellum,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  snipsyBtn: { borderStyle: 'dashed', backgroundColor: Colors.paperDeep },
  actionBtnIcon: { fontSize: sf(20) },
  actionBtnLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink2, textAlign: 'center' },

  hint: {
    fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3,
    lineHeight: sf(16), marginTop: Spacing.s4,
  },

  empty: { alignItems: 'center', paddingVertical: Spacing.s9 },
  emptyText: { fontFamily: FontFamily.script, fontSize: sf(18), color: Colors.ink3 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: Spacing.s5 },
  cell: {
    width: CELL, height: CELL, borderRadius: Radius.r3, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.vellum,
  },
  checker: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  checkerCell: { position: 'absolute', width: 22, height: 22, backgroundColor: Colors.paperDeep },
  cellImg: { width: '100%', height: '100%' },
  cellRemove: {
    position: 'absolute', top: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  cellRemoveText: { color: '#fff', fontSize: sf(10), fontFamily: FontFamily.uiSemiBold },

  confirmOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.s6,
  },
  confirmCard: {
    width: '100%', backgroundColor: Colors.paper, borderRadius: Radius.r4,
    padding: Spacing.s5, gap: Spacing.s4,
  },
  confirmTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: Colors.ink, textAlign: 'center' },
  confirmRow: { flexDirection: 'row', gap: 10 },
  confirmCancel: {
    flex: 1, paddingVertical: Spacing.s3, borderRadius: Radius.pill,
    borderWidth: 1, borderColor: Colors.line, alignItems: 'center',
  },
  confirmCancelText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.ink2 },
  confirmDelete: {
    flex: 1, paddingVertical: Spacing.s3, borderRadius: Radius.pill,
    backgroundColor: Colors.ember, alignItems: 'center',
  },
  confirmDeleteText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: '#fff' },
});
