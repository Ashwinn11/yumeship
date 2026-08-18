import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FoForm, FoFormValue } from '@/components/fo/FoForm';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { addFo } from '@/store/fo';

const EMPTY: FoFormValue = {
  name: '', pronouns: '', fandom: '', relStatus: 'romantic', shareStatus: 'selective',
  bio: '', height: '', weight: '', age: '', birthday: '', photoUri: '', song: '', songLink: '', gallery: [], statusLabel: '',
};

export default function NewFoScreen() {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState<FoFormValue>(EMPTY);

  function handleSave() {
    if (!value.name.trim()) return;
    addFo({ ...value, name: value.name.trim() });
    router.back();
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>✕</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={22} />
          <Text style={styles.headerTitle}>new F/O</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <FoForm value={value} onChange={setValue} onSave={handleSave} saveLabel="add them ♡" />
    </View>
  );
}

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
  headerBtnText: { fontSize: sf(12), color: Colors.ink2, fontFamily: FontFamily.ui },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
});
