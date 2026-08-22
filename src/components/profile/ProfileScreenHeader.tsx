import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';

type Props = {
  /** top safe-area inset — owned here so every profile-like screen agrees on
   * where the padding lives, instead of some putting it on the header and
   * others on the outer screen view */
  insetsTop: number;
  onBack: () => void;
  /** '‹' for back, '✕' for cancel-edit — defaults to back */
  backLabel?: string;
  title: string;
  /** right-side action slot — palette/edit buttons, block/unblock, or a bare spacer */
  right?: React.ReactNode;
};

const SPACER = <View style={{ width: 32 }} />;

export function ProfileScreenHeader({ insetsTop, onBack, backLabel = '‹', title, right }: Props) {
  const { column } = useIPad();
  return (
    <View style={[styles.header, column, { paddingTop: insetsTop + Spacing.s1 }]}>
      <Pressable onPress={onBack} style={styles.headerBtn}>
        <Text style={styles.headerBtnText}>{backLabel}</Text>
      </Pressable>
      <View style={styles.headerCenter}>
        <Mark size={22} />
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      </View>
      {right ?? SPACER}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  headerBtnText: { fontSize: sf(18), color: Colors.ink2, fontFamily: FontFamily.ui, lineHeight: sf(20) },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
});
