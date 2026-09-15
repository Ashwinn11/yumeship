import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BLINKIE_BY_ID, BLINKIE_CATALOG, BLINKIE_FREE_WALL_MAX, BLINKIE_TEXT_MAX, BLINKIE_WALL_MAX, type EquippedBlinkie } from '@/constants/blinkies';
import { Colors, FontFamily, Radius, sf, Spacing } from '@/constants/theme';
import { Blinkie } from './Blinkie';

type Slot = EquippedBlinkie & { slotId: string };

type Props = {
  selected: EquippedBlinkie[];
  onChange: (items: EquippedBlinkie[]) => void;
  premium: boolean;
  /** called instead of adding a template once the free cap is hit — the
   *  caller is responsible for navigating to the paywall, since it also
   *  needs to close whatever modal this editor is sitting in first (see
   *  ProfileEditor's `closeSheet`); this component never navigates itself */
  onNeedsPaywall: () => void;
};

/**
 * Every template is free to pick from — the gate is on how many can be
 * equipped at once. A free account gets one; reaching for a second sends
 * them straight to the paywall instead of adding it, same convention
 * CardThemeSheet already uses for its own premium controls.
 */
export function BlinkieWallEditor({ selected, onChange, premium, onNeedsPaywall }: Props) {
  // a stable per-slot id, not the template id, so equipping the same
  // template twice with different text doesn't collide as one React key
  const slots: Slot[] = selected.map((s, i) => ({ ...s, slotId: `${s.templateId}-${i}` }));
  const freeCapped = !premium && slots.length >= BLINKIE_FREE_WALL_MAX;
  const atMax = slots.length >= BLINKIE_WALL_MAX;

  function addTemplate(templateId: string) {
    if (freeCapped) {
      onNeedsPaywall();
      return;
    }
    if (atMax) return;
    onChange([...selected, { templateId, text: '' }]);
  }

  function updateText(index: number, text: string) {
    const next = selected.slice();
    next[index] = { ...next[index], text: text.slice(0, BLINKIE_TEXT_MAX) };
    onChange(next);
  }

  function remove(index: number) {
    onChange(selected.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.wrap}>
      {slots.length > 0 && (
        <View style={styles.equippedList}>
          {slots.map((slot, i) => {
            const template = BLINKIE_BY_ID[slot.templateId];
            if (!template) return null;
            return (
              <View key={slot.slotId} style={styles.equippedRow}>
                <Blinkie template={template} text={slot.text || ' '} />
                <TextInput
                  value={slot.text}
                  onChangeText={(v) => updateText(i, v)}
                  placeholder="type your text…"
                  placeholderTextColor={Colors.ink3}
                  maxLength={BLINKIE_TEXT_MAX}
                  style={styles.textInput}
                />
                <Pressable onPress={() => remove(i)} hitSlop={8} style={styles.removeBtn}>
                  <Text style={styles.removeGlyph}>✕</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.hint}>
        {freeCapped
          ? 'one blinkie is free — go premium for more'
          : `${slots.length}/${BLINKIE_WALL_MAX} equipped — tap a template to add it`}
      </Text>
      <View style={styles.grid}>
        {BLINKIE_CATALOG.map((template) => (
          <Pressable
            key={template.id}
            onPress={() => addTemplate(template.id)}
            disabled={!freeCapped && atMax}
            style={[styles.item, !freeCapped && atMax && styles.itemDisabled]}
          >
            <Blinkie template={template} text="add me" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  equippedList: { gap: 8 },
  equippedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textInput: {
    flex: 1, height: 36,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.vellum,
    paddingHorizontal: Spacing.s3,
    fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink,
  },
  removeBtn: {
    width: 28, height: 28, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  removeGlyph: { fontSize: 11, color: Colors.ink3 },

  hint: { fontFamily: FontFamily.uiMedium, fontSize: sf(11.5), color: Colors.ink3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.s2 },
  item: { position: 'relative' },
  itemDisabled: { opacity: 0.4 },
});
