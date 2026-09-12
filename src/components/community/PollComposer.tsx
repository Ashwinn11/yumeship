import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';

export const MAX_POLL_OPTIONS = 4;
export const MIN_POLL_OPTIONS = 2;

type Props = {
  options: string[];
  onChange: (options: string[]) => void;
  onRemove: () => void;
};

/** Up to 4 text options for a new poll — mirrors MediaComposer's slot, mutually exclusive with photos. */
export function PollComposer({ options, onChange, onRemove }: Props) {
  function setOption(i: number, text: string) {
    onChange(options.map((o, idx) => (idx === i ? text : o)));
  }
  function removeOption(i: number) {
    onChange(options.filter((_, idx) => idx !== i));
  }
  function addOption() {
    onChange([...options, '']);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>poll</Text>
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel="Remove poll">
          <Text style={styles.headerRemove}>✕</Text>
        </Pressable>
      </View>

      {options.map((opt, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            value={opt}
            onChangeText={(t) => setOption(i, t)}
            placeholder={`option ${i + 1}`}
            placeholderTextColor={Colors.ink3}
            maxLength={60}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            style={styles.input}
          />
          {options.length > MIN_POLL_OPTIONS && (
            <Pressable onPress={() => removeOption(i)} hitSlop={8} style={styles.rowRemove} accessibilityLabel={`Remove option ${i + 1}`}>
              <Text style={styles.rowRemoveText}>✕</Text>
            </Pressable>
          )}
        </View>
      ))}

      {options.length < MAX_POLL_OPTIONS && (
        <Pressable onPress={addOption} style={styles.addRow}>
          <Text style={styles.addRowText}>+ add option</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.paperDeep, padding: Spacing.s3, gap: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLabel: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.ink3,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  headerRemove: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1, height: 40, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r2,
    backgroundColor: Colors.vellum, paddingHorizontal: 12,
    fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink,
  },
  rowRemove: { padding: 4 },
  rowRemoveText: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3 },
  addRow: { paddingVertical: 6 },
  addRowText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.sakuraDeep },
});
