import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { CozyModal } from '@/components/ui/CozyModal';
import { IconHandStop } from '@/components/ui/Icon';
import { Colors, FontFamily, Radius, sf } from '@/constants/theme';

/** A small boundary pill next to the follow button — renders nothing when
 *  there's no DNI text set. Tapping it opens the full text in a plain info
 *  dialog (CozyModal with no onConfirm renders a single "close" button)
 *  rather than trying to cram a whole boundary statement into the pill itself. */
export function DniPill({ text }: { text?: string }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.pill} hitSlop={6}>
        <IconHandStop size={11} color={Colors.ember} />
        <Text style={styles.pillText}>DNI</Text>
      </Pressable>
      <CozyModal
        visible={open}
        title="Do Not Interact"
        message={text}
        confirmText="Close"
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.ember,
    justifyContent: 'center',
  },
  pillText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.ember, letterSpacing: 0.4 },
});
