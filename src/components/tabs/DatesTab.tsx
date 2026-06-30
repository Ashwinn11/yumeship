import { useState } from 'react';
import {
  Modal, Pressable, ScrollView,
  StyleSheet, Switch, Text, TextInput, TouchableWithoutFeedback, View,
} from 'react-native';
import { useIPad } from '@/hooks/use-ipad';
import { LinearGradient } from 'expo-linear-gradient';

import { StickerTicket, WashiTape, Bullets, Sparkle } from '@/components/deco';
import { CozyModal } from '@/components/ui/CozyModal';
import { IconPlus } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing ,sf } from '@/constants/theme';
import { addDate, deleteDate, daysUntil, parseLocalDate, useDates } from '@/store/dates';
import { requestPermission } from '@/store/notifications';
import { DateField } from '@/components/ui/DateField';

const DATE_COLORS = [Colors.sakuraDeep, Colors.peachDeep, Colors.lavenderDeep, Colors.sageDeep];

export function DatesTab({ shipId, shipName }: { shipId: string; shipName?: string }) {
  const { column } = useIPad();
  const dates = useDates(shipId);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [date, setDate] = useState('');
  const [yearly, setYearly] = useState(true);
  const [notify, setNotify] = useState(false);
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);
  const [annivInfo, setAnnivInfo] = useState(false);

  async function save() {
    if (!title.trim() || !date.trim()) return;
    let notifyEnabled = notify;
    if (notify) {
      const granted = await requestPermission();
      if (!granted) notifyEnabled = false;
    }
    await addDate(shipId, { title: title.trim(), date: date.trim(), yearly, notify: notifyEnabled, subtitle: subtitle.trim() });
    setTitle(''); setSubtitle(''); setDate(''); setYearly(true); setNotify(false);
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
      <View style={[s.header, column]}>
        <Text style={s.label}>dates · {dates.length}</Text>
        <Pressable hitSlop={8} onPress={() => setComposing(true)}>
          <IconPlus size={14} color={Colors.sakuraDeep} />
        </Pressable>
      </View>

      {dates.length === 0 ? (
        <View style={[s.empty, { flex: 1, justifyContent: 'center', paddingTop: 40, paddingHorizontal: 20, gap: 12 }]}>
          <StickerTicket size={88} />
          <Text style={{ fontFamily: FontFamily.script, fontSize: sf(26), color: Colors.ink, textAlign: 'center', marginTop: 10 }}>
            no dates saved
          </Text>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: Colors.sakuraDeep,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 99,
              shadowColor: 'rgba(110, 58, 90, 0.12)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 3,
              elevation: 1,
              marginTop: 10,
            }}
            onPress={() => setComposing(true)}
          >
            <IconPlus size={12} color={Colors.vellum} />
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.vellum }}>add a date</Text>
          </Pressable>
        </View>
      ) : (
        dates.map((d, idx) => {
          const days = daysUntil(d.date, d.yearly);
          const isAnn = d.id.startsWith('ship-ann-');
          const tint = DATE_COLORS[idx % DATE_COLORS.length];

          let monthStr = 'DEC';
          let dayStr = '25';
          try {
            const dateObj = parseLocalDate(d.date);
            if (dateObj) {
              monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
              dayStr = dateObj.toLocaleDateString('en-US', { day: 'numeric' });
            }
          } catch (e) {}

          const numDisplay = days === 0 ? '♡' : days !== null && days > 0 ? String(days) : '0';
          const unitDisplay = days === 0 ? 'NOW' : days !== null && days > 0 ? 'DAYS' : 'PAST';

          return (
            <Pressable
              key={d.id}
              onLongPress={() => isAnn ? setAnnivInfo(true) : setDateToDelete(d.id)}
            >
              <View
                style={[
                  s.dateCard,
                  {
                    backgroundColor: Colors.vellum,
                    borderColor: Colors.line,
                    borderRadius: 14,
                    padding: 14,
                    shadowColor: 'rgba(110, 58, 90, 0.06)',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 6,
                    elevation: 1,
                    borderWidth: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    position: 'relative',
                    overflow: 'visible',
                    marginVertical: 4,
                  }
                ]}
              >
                {/* Washi tape corner */}
                <View style={{ position: 'absolute', top: -6, left: 18, zIndex: 10 }}>
                  <WashiTape
                    pattern={['floral', 'heart', 'star', 'dot'][idx % 4] as any}
                    width={42}
                    height={12}
                    rotate={-8}
                    color={tint}
                  />
                </View>

                {/* date block left — rounded block with light mix background */}
                <View
                  style={{
                    width: 56,
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor: tint + '18', // color-mix tint
                    borderWidth: 1,
                    borderColor: tint + '55',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(9), color: tint, letterSpacing: 1.4, textAlign: 'center' }}>
                    {monthStr}
                  </Text>
                  <Text style={{ fontFamily: FontFamily.displayItalic, fontSize: sf(28), lineHeight: 28, color: tint, marginTop: -1, textAlign: 'center' }}>
                    {dayStr}
                  </Text>
                </View>

                {/* center text */}
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: Colors.ink, lineHeight: 18 }} numberOfLines={1}>
                      {d.title}
                    </Text>
                    {isAnn && <Bullets.Heart size={10} color={tint} />}
                  </View>
                  <Text style={{ fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink2, marginTop: 2 }} numberOfLines={1}>
                    {d.subtitle || (isAnn ? 'the day we met' : (d.yearly ? 'repeating yearly ♡' : 'one-time memory'))}
                  </Text>
                </View>

                {/* countdown right */}
                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: FontFamily.displayItalic, fontSize: sf(22), color: tint, lineHeight: 22 }}>
                    {numDisplay}
                  </Text>
                  <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(8), color: Colors.ink3, letterSpacing: 1.4 }}>
                    {unitDisplay}
                  </Text>
                </View>
              </View>
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

            <Text style={s.fieldLabel}>subtitle (optional)</Text>
            <TextInput
              value={subtitle}
              onChangeText={setSubtitle}
              placeholder="e.g. fictional pisces ♡, we hold hands here"
              placeholderTextColor={Colors.ink3}
              style={[s.input, { fontFamily: FontFamily.script, fontSize: sf(16), paddingTop: 4, paddingBottom: 4 }]}
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
                fontSize: sf(13),
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

            <View style={s.toggleRow}>
              <View style={s.toggleLabel}>
                <Text style={s.toggleTitle}>remind me ♡</Text>
                <Text style={s.toggleSub}>get a notification on this date</Text>
              </View>
              <Switch
                value={notify}
                onValueChange={setNotify}
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
  tab: { flex: 1, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s6, gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  label: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase' },
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
  cardNum: { fontFamily: FontFamily.displayItalic, fontSize: sf(36), lineHeight: 38, letterSpacing: -1 },
  cardUnit: { fontFamily: FontFamily.marker, fontSize: sf(9), letterSpacing: 1.4, textTransform: 'uppercase', marginTop: -4 },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: Colors.ink, lineHeight: 20 },
  cardSub: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3 },

  // Sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.s4, borderBottomWidth: 1, borderBottomColor: Colors.line },
  sheetTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: Colors.ink },
  sheetClose: { fontSize: sf(13), color: Colors.ink3, fontFamily: FontFamily.ui },
  sheetContent: { padding: Spacing.s5, gap: 6 },
  fieldLabel: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.2, marginTop: 10, marginBottom: 4 },
  input: { fontFamily: FontFamily.ja, fontSize: sf(13), color: Colors.ink, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r2, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: Colors.vellum },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: Spacing.s4, backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3 },
  toggleLabel: { flex: 1, gap: 2 },
  toggleTitle: { fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.ink },
  toggleSub: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3 },
  saveBtn: { marginTop: 20, backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill, paddingVertical: 12, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(15), color: Colors.vellum },
});
