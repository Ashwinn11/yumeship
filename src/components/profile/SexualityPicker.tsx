import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

import { FlagIcon } from '@/components/deco/FlagIcon';
import { findSexualityOption, SEXUALITY_OPTIONS } from '@/constants/sexualities';
import { Colors, FontFamily, Radius, SheetColumn, Spacing, sf } from '@/constants/theme';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function SexualityPicker({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const [customText, setCustomText] = useState(value);
  const matched = findSexualityOption(value);

  function openPicker() {
    setCustomText(value);
    setVisible(true);
  }

  function selectPreset(label: string) {
    onChange(label);
    setVisible(false);
  }

  function saveCustom() {
    onChange(customText.slice(0, 30));
    setVisible(false);
  }

  return (
    <>
      <Pressable style={styles.trigger} onPress={openPicker}>
        <FlagIcon colors={matched?.colors} />
        <Text style={[styles.triggerText, !value && styles.triggerPlaceholder]}>
          {value || 'tap to choose'}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.wrap}>
          <TouchableWithoutFeedback onPress={() => setVisible(false)}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <View style={[styles.sheet, SheetColumn]}>
            <View style={styles.handle} />
            <Text style={styles.title}>sexuality</Text>

            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {SEXUALITY_OPTIONS.map((opt) => (
                <Pressable key={opt.key} style={styles.row} onPress={() => selectPreset(opt.label)}>
                  <FlagIcon colors={opt.colors} />
                  <Text style={styles.rowLabel}>{opt.label}</Text>
                  {value === opt.label && <Text style={styles.rowCheck}>✓</Text>}
                </Pressable>
              ))}

              <View style={styles.divider} />

              <Text style={styles.customLabel}>or write your own</Text>
              <TextInput
                value={customText}
                onChangeText={setCustomText}
                placeholder="e.g. demisexual, graysexual…"
                placeholderTextColor={Colors.ink3}
                maxLength={30}
                style={styles.customInput}
                onSubmitEditing={saveCustom}
              />
              <Pressable style={styles.saveBtn} onPress={saveCustom} disabled={!customText.trim()}>
                <Text style={styles.saveBtnText}>save</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.paperDeep, paddingHorizontal: Spacing.s3, paddingVertical: Spacing.s3,
  },
  triggerText: { flex: 1, fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.ink },
  triggerPlaceholder: { color: Colors.ink3, fontFamily: FontFamily.ui },
  chevron: { fontSize: sf(15), color: Colors.ink3 },

  wrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5,
    paddingBottom: 34, maxHeight: '75%',
  },
  handle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  title: {
    fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: Colors.ink,
    textAlign: 'center', paddingVertical: Spacing.s3,
  },
  list: { paddingHorizontal: Spacing.s5, paddingBottom: 20, gap: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: Spacing.s3,
  },
  rowLabel: { flex: 1, fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.ink },
  rowCheck: { fontSize: sf(13), color: Colors.sakuraDeep, fontFamily: FontFamily.uiSemiBold },
  divider: { height: 1, backgroundColor: Colors.line, marginVertical: Spacing.s3 },
  customLabel: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(10), color: Colors.ink3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.s2,
  },
  customInput: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.vellum, paddingHorizontal: Spacing.s3, paddingVertical: Spacing.s3,
    fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink,
  },
  saveBtn: {
    marginTop: Spacing.s3, alignSelf: 'center',
    paddingHorizontal: Spacing.s6, paddingVertical: Spacing.s2,
    borderRadius: Radius.pill, backgroundColor: Colors.sakuraDeep,
  },
  saveBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: '#fff' },
});
