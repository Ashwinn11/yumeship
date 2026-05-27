import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert, Image, Modal, Pressable, ScrollView,
  StyleSheet, Text, TextInput, TouchableWithoutFeedback, View,
} from 'react-native';

import { IconPlus } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { addOutfit, deleteOutfit, useOutfits } from '@/store/outfits';

const OCCASIONS = ['Casual', 'Date', 'Matching', 'Formal', 'Other'];

const OCCASION_COLOR: Record<string, string> = {
  Casual: Colors.sageDeep,
  Date: Colors.sakuraDeep,
  Matching: Colors.lavenderDeep,
  Formal: Colors.ink2,
  Other: Colors.ink3,
};

export function OutfitsTab({ shipId, shipName }: { shipId: string; shipName: string }) {
  const outfits = useOutfits(shipId);
  const [composing, setComposing] = useState(false);
  const [uri, setUri] = useState('');
  const [title, setTitle] = useState('');
  const [occasion, setOccasion] = useState('Casual');
  const [notes, setNotes] = useState('');

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });
    if (!result.canceled) setUri(result.assets[0].uri);
  }

  function save() {
    if (!title.trim()) return;
    addOutfit(shipId, { title: title.trim(), uri, occasion, notes: notes.trim() });
    setUri(''); setTitle(''); setOccasion('Casual'); setNotes('');
    setComposing(false);
  }

  return (
    <View style={s.tab}>
      <View style={s.header}>
        <Text style={s.label}>outfits · {outfits.length}</Text>
        <Pressable hitSlop={8} onPress={() => setComposing(true)}>
          <IconPlus size={14} color={Colors.sakuraDeep} />
        </Pressable>
      </View>

      {outfits.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>no outfits saved.</Text>
          <Text style={s.emptySub}>what does {shipName} wear?</Text>
          <Pressable style={s.emptyBtn} onPress={() => setComposing(true)}>
            <IconPlus size={13} color={Colors.vellum} />
            <Text style={s.emptyBtnText}>add outfit</Text>
          </Pressable>
        </View>
      ) : (
        <View style={s.grid}>
          {outfits.map((o) => (
            <Pressable
              key={o.id}
              style={s.card}
              onLongPress={() => Alert.alert('Delete outfit?', o.title, [
                { text: 'Delete', style: 'destructive', onPress: () => deleteOutfit(o.id) },
                { text: 'Cancel', style: 'cancel' },
              ])}
            >
              {o.uri ? (
                <Image source={{ uri: o.uri }} style={s.cardImg} />
              ) : (
                <View style={s.cardImgEmpty}>
                  <Text style={s.cardImgEmptyText}>服</Text>
                </View>
              )}
              <View style={s.cardInfo}>
                <Text style={s.cardTitle} numberOfLines={1}>{o.title}</Text>
                {o.occasion ? (
                  <View style={[s.occasionBadge, { backgroundColor: (OCCASION_COLOR[o.occasion] ?? Colors.ink3) + '22' }]}>
                    <Text style={[s.occasionText, { color: OCCASION_COLOR[o.occasion] ?? Colors.ink3 }]}>
                      {o.occasion}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <Modal visible={composing} transparent animationType="slide" onRequestClose={() => setComposing(false)}>
        <TouchableWithoutFeedback onPress={() => setComposing(false)}>
          <View style={s.overlay} />
        </TouchableWithoutFeedback>
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>add outfit</Text>
            <Pressable onPress={() => setComposing(false)} hitSlop={8}>
              <Text style={s.sheetClose}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={s.sheetScroll} contentContainerStyle={s.sheetContent} keyboardShouldPersistTaps="handled">
            <Pressable style={s.photoPicker} onPress={pickPhoto}>
              {uri ? (
                <Image source={{ uri }} style={s.photoPreview} />
              ) : (
                <View style={s.photoEmpty}>
                  <IconPlus size={24} color={Colors.ink3} />
                  <Text style={s.photoEmptyText}>add photo</Text>
                </View>
              )}
            </Pressable>

            <Text style={s.fieldLabel}>title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. casual streetwear"
              placeholderTextColor={Colors.ink3}
              style={s.input}
            />

            <Text style={s.fieldLabel}>occasion</Text>
            <View style={s.occasionRow}>
              {OCCASIONS.map((oc) => (
                <Pressable
                  key={oc}
                  style={[s.occasionBtn, occasion === oc && { backgroundColor: (OCCASION_COLOR[oc] ?? Colors.ink3) + '22', borderColor: OCCASION_COLOR[oc] ?? Colors.ink3 }]}
                  onPress={() => setOccasion(oc)}
                >
                  <Text style={[s.occasionBtnText, occasion === oc && { color: OCCASION_COLOR[oc] ?? Colors.ink3 }]}>{oc}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.fieldLabel}>notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="anything to add..."
              placeholderTextColor={Colors.ink3}
              multiline
              style={[s.input, s.inputMulti]}
            />

            <Pressable style={[s.saveBtn, !title.trim() && s.saveBtnDisabled]} onPress={save} disabled={!title.trim()}>
              <Text style={s.saveBtnText}>save outfit</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  tab: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s6, gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  label: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase' },
  empty: { alignItems: 'center', gap: Spacing.s3, paddingVertical: Spacing.s7 },
  emptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink },
  emptySub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink2 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.sakuraDeep, paddingHorizontal: Spacing.s5, paddingVertical: 10,
    borderRadius: Radius.pill, ...Shadow.s1,
  },
  emptyBtnText: { fontFamily: FontFamily.uiMedium, fontSize: FontSize.body, color: Colors.vellum },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', backgroundColor: Colors.vellum, borderRadius: Radius.r3, borderWidth: 1, borderColor: Colors.line, overflow: 'hidden', ...Shadow.s1 },
  cardImg: { width: '100%', height: 140 },
  cardImgEmpty: { width: '100%', height: 140, backgroundColor: Colors.lavenderSoft, alignItems: 'center', justifyContent: 'center' },
  cardImgEmptyText: { fontFamily: FontFamily.ja, fontSize: 40, color: Colors.lavender },
  cardInfo: { padding: Spacing.s3, gap: 4 },
  cardTitle: { fontFamily: FontFamily.displayItalic, fontSize: 13, color: Colors.ink },
  occasionBadge: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: Radius.pill },
  occasionText: { fontFamily: FontFamily.uiMedium, fontSize: 10 },

  // Sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5, paddingBottom: 40, maxHeight: '90%' },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.s4, borderBottomWidth: 1, borderBottomColor: Colors.line },
  sheetTitle: { fontFamily: FontFamily.displayItalic, fontSize: 17, color: Colors.ink },
  sheetClose: { fontSize: 13, color: Colors.ink3, fontFamily: FontFamily.ui },
  sheetScroll: { flex: 1 },
  sheetContent: { padding: Spacing.s5, gap: 6 },
  photoPicker: { width: '100%', height: 180, borderRadius: Radius.r3, overflow: 'hidden', borderWidth: 1, borderColor: Colors.line, borderStyle: 'dashed' },
  photoPreview: { width: '100%', height: '100%' },
  photoEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.paperDeep },
  photoEmptyText: { fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ink3 },
  fieldLabel: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 1.2, marginTop: 10, marginBottom: 4 },
  input: { fontFamily: FontFamily.ui, fontSize: 14, color: Colors.ink, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r2, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: Colors.vellum },
  inputMulti: { minHeight: 70, textAlignVertical: 'top' },
  occasionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  occasionBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.paperDeep },
  occasionBtnText: { fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink2 },
  saveBtn: { marginTop: 16, backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill, paddingVertical: 12, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontFamily: FontFamily.uiMedium, fontSize: 15, color: Colors.vellum },
});
