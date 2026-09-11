import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BingoGrid } from '@/components/bingo/BingoGrid';
import type { BingoCard } from '@/lib/bingo';
import { Colors, FontFamily, sf } from '@/constants/theme';

type Props = {
  card: BingoCard;
  /** the post this card belongs to — "use this template" clones from it */
  postId: string;
};

/** Read-only rendering of a posted bingo card, plus the clone action that starts the trend chain. */
export function BingoCardView({ card, postId }: Props) {
  return (
    <View style={s.wrap}>
      <BingoGrid card={card} />
      <Pressable style={s.useBtn} onPress={() => router.push(`/social/bingo/${postId}` as any)} hitSlop={6}>
        <Text style={s.useBtnText}>🎲 use this template</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 4, gap: 8 },
  useBtn: {
    alignSelf: 'center', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: Colors.plum, backgroundColor: Colors.lavenderSoft,
  },
  useBtnText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: Colors.plum },
});
