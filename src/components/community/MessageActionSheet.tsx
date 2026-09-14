import { Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

import { Colors, FontFamily, Radius, Shadow, SheetColumn, Spacing, sf } from '@/constants/theme';

type Action = { label: string; onPress: () => void; destructive?: boolean };

/** A tiny bottom-sheet action list for a long-pressed chat message — reply
 *  always, report only on someone else's message. Generic enough to grow
 *  more actions later without a new sheet component. */
export function MessageActionSheet({ visible, actions, onClose }: { visible: boolean; actions: Action[]; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.wrap}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={[styles.sheet, SheetColumn]}>
          <View style={styles.handle} />
          {actions.map((a, i) => (
            <Pressable
              key={a.label}
              onPress={() => { onClose(); a.onPress(); }}
              style={[styles.row, i < actions.length - 1 && styles.rowDivider]}
            >
              <Text style={[styles.label, a.destructive && styles.labelDestructive]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: Colors.paper,
    borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5,
    paddingBottom: 34,
    ...Shadow.s1,
  },
  handle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: Spacing.s2 },
  row: { paddingVertical: 14, paddingHorizontal: Spacing.s5, alignItems: 'center' },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  label: { fontFamily: FontFamily.uiMedium, fontSize: sf(14.5), color: Colors.ink },
  labelDestructive: { color: Colors.ember },
});
