import { useState } from 'react';
import {
  Modal, Pressable, ScrollView,
  StyleSheet, Switch, Text, TextInput, TouchableWithoutFeedback, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Heart } from '@/components/deco/Heart';
import { Sparkle } from '@/components/deco/Sparkle';
import { CozyModal } from '@/components/ui/CozyModal';
import { IconPlus } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { addDate, deleteDate, daysUntil, useDates } from '@/store/dates';
import { DateField } from '@/components/ui/DateField';

const DATE_COLORS = [Colors.sakuraDeep, Colors.peachDeep, Colors.lavenderDeep, Colors.sageDeep];

export function DatesTab({ shipId, shipName }: { shipId: string; shipName?: string }) {
  const dates = useDates(shipId);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [yearly, setYearly] = useState(true);
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);
  const [annivInfo, setAnnivInfo] = useState(false);

  function save() {
    if (!title.trim() || !date.trim()) return;
    addDate(shipId, { title: title.trim(), date: date.trim(), yearly });
    setTitle(''); setDate(''); setYearly(true);
    setComposing(false);
  }

  const dateToDeleteData = dates.find((d) => d.id === dateToDelete);

  return (
    <View style={s.tab}>
      <CozyModal
        visible={!!dateToDelete}
        title="remove this date?"
        message={dateToDeleteData?.title}
        confirmText="Delete"
        cancelText="keep it"
        isDestructive
        onConfirm={() => { if (dateToDelete) deleteDate(dateToDelete); setDateToDelete(null); }}
        onClose={() => setDateToDelete(null)}
      />
      <CozyModal
        visible={annivInfo}
        title="anniversary"
        message="You can change or remove your main anniversary from the ship profile."
        confirmText="got it"
        onClose={() => setAnnivInfo(false)}
      />
      <View style={s.header}>
        <Text style={s.label}>dates · {dates.length}</Text>
        <Pressable hitSlop={8} onPress={() => setComposing(true)}>
          <IconPlus size={14} color={Colors.sakuraDeep} />
        </Pressable>
      </View>

      {dates.length === 0 ? (
        <View style={s.empty}>
          <Heart size={24} color={Colors.sakura} />
          <Text style={s.emptyTitle}>no dates saved.</Text>
          <Text style={s.emptySub}>anniversaries, character birthdays, release dates — anything worth remembering.</Text>
          <Pressable style={s.emptyBtn} onPress={() => setComposing(true)}>
            <IconPlus size={13} color={Colors.vellum} />
            <Text style={s.emptyBtnText}>add a date</Text>
          </Pressable>
        </View>
      ) : (
        dates.map((d, idx) => {
          const days = daysUntil(d.date, d.yearly);
          const isAnn = d.id.startsWith('ship-ann-');
          const tint = DATE_COLORS[idx % DATE_COLORS.length];

          const numDisplay = days === 0 ? '♡' : days !== null && days > 0 ? String(days) : null;
          const unitDisplay = days === 0 ? null : days !== null && days > 0 ? 'DAYS' : 'PAST';

          return (
            <Pressable
              key={d.id}
              onLongPress={() => isAnn ? setAnnivInfo(true) : setDateToDelete(d.id)}
            >
              <LinearGradient
                colors={[tint + '18', tint + '50']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[s.dateCard, { borderColor: tint + '60' }]}
              >
                {isAnn && (
                  <View style={s.annHeart}>
                    <Heart size={12} color={tint} />
                  </View>
                )}
                <View style={s.cardLeft}>
                  {numDisplay !== null && (
                    <Text style={[s.cardNum, { color: tint }]}>{numDisplay}</Text>
                  )}
                  {unitDisplay !== null && (
                    <Text style={[s.cardUnit, { color: tint }]}>{unitDisplay}</Text>
                  )}
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.cardTitle} numberOfLines={1}>{d.title}</Text>
                  {shipName ? (
                    <Text style={s.cardSub} numberOfLines={1}>{shipName}</Text>
                  ) : null}
                </View>
                <Sparkle size={11} color={tint} />
              </LinearGradient>
            </Pressable>
          );
        })
      )}

      <Modal visible={composing} transparent animationType="slide" onRequestClose={() => setComposing(false)}>
        <TouchableWithoutFeedback onPress={() => setComposing(false)}>
          <View style={s.overlay} />
        </TouchableWithoutFeedback>
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>add a date</Text>
            <Pressable onPress={() => setComposing(false)} hitSlop={8}>
              <Text style={s.sheetClose}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={s.sheetContent} keyboardShouldPersistTaps="handled">
            <Text style={s.fieldLabel}>what is this date?</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. their birthday, our anniversary"
              placeholderTextColor={Colors.ink3}
              style={s.input}
            />

            <Text style={s.fieldLabel}>when is it?</Text>
            <DateField
              value={date}
              onChange={setDate}
              editing={true}
              placeholder="e.g. 2024-03-15"
              style={{
                borderWidth: 1,
                borderColor: Colors.line,
                borderRadius: Radius.r2,
                paddingVertical: 9,
                paddingHorizontal: 12,
                backgroundColor: Colors.vellum,
                height: 40,
                justifyContent: 'center',
              }}
              textStyle={{
                fontFamily: FontFamily.ja,
                fontSize: 13,
                color: date ? Colors.ink : Colors.ink3,
              }}
            />

            <View style={s.toggleRow}>
              <View style={s.toggleLabel}>
                <Text style={s.toggleTitle}>repeats yearly</Text>
                <Text style={s.toggleSub}>counts down to next occurrence each year</Text>
              </View>
              <Switch
                value={yearly}
                onValueChange={setYearly}
                trackColor={{ true: Colors.sakuraDeep, false: Colors.line }}
                thumbColor={Colors.vellum}
              />
            </View>

            <Pressable
              style={[s.saveBtn, (!title.trim() || !date.trim()) && s.saveBtnDisabled]}
              onPress={save}
              disabled={!title.trim() || !date.trim()}
            >
              <Text style={s.saveBtnText}>save date</Text>
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
  empty: { alignItems: 'center', gap: Spacing.s3, paddingVertical: Spacing.s7, paddingHorizontal: Spacing.s2 },
  emptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink },
  emptySub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink2, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.sakuraDeep, paddingHorizontal: Spacing.s5, paddingVertical: 10,
    borderRadius: Radius.pill, ...Shadow.s1,
  },
  emptyBtnText: { fontFamily: FontFamily.uiMedium, fontSize: FontSize.body, color: Colors.vellum },
  dateCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: Spacing.s4, paddingHorizontal: Spacing.s5,
    borderWidth: 1, borderRadius: Radius.r3,
    overflow: 'hidden',
    position: 'relative',
  },
  annHeart: { position: 'absolute', top: 10, left: 12 },
  cardLeft: { width: 52, alignItems: 'flex-start', justifyContent: 'center' },
  cardNum: { fontFamily: FontFamily.displayItalic, fontSize: 36, lineHeight: 38, letterSpacing: -1 },
  cardUnit: { fontFamily: FontFamily.marker, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: -4 },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: FontFamily.displayItalic, fontSize: 17, color: Colors.ink, lineHeight: 20 },
  cardSub: { fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink3 },

  // Sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.s4, borderBottomWidth: 1, borderBottomColor: Colors.line },
  sheetTitle: { fontFamily: FontFamily.displayItalic, fontSize: 17, color: Colors.ink },
  sheetClose: { fontSize: 13, color: Colors.ink3, fontFamily: FontFamily.ui },
  sheetContent: { padding: Spacing.s5, gap: 6 },
  fieldLabel: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 1.2, marginTop: 10, marginBottom: 4 },
  input: { fontFamily: FontFamily.ja, fontSize: 13, color: Colors.ink, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r2, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: Colors.vellum },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: Spacing.s4, backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3 },
  toggleLabel: { flex: 1, gap: 2 },
  toggleTitle: { fontFamily: FontFamily.uiMedium, fontSize: 14, color: Colors.ink },
  toggleSub: { fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink3 },
  saveBtn: { marginTop: 20, backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill, paddingVertical: 12, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontFamily: FontFamily.uiMedium, fontSize: 15, color: Colors.vellum },
});
