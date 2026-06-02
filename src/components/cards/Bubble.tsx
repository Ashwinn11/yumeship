import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, FontSize, Radius, Shadow ,sf } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

// design/cards.jsx — Bubble
// Chat message bubble: me (sakura-deep, right-aligned) vs them (vellum, left-aligned).

type Props = {
  children: React.ReactNode;
  from: 'me' | 'them';
  reaction?: boolean;
  status?: string;
};

export function Bubble({ children, from, reaction, status }: Props) {
  const isMe = from === 'me';

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleThem,
        ]}
      >
        <Text style={[styles.text, { color: isMe ? Colors.vellum : Colors.ink }]}>
          {children}
        </Text>

        {reaction && (
          <View style={[styles.reaction, isMe ? styles.reactionMe : styles.reactionThem]}>
            <Heart size={10} color={Colors.sakuraDeep} />
          </View>
        )}

        {status && (
          <Text style={styles.status}>{status}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  rowMe: {
    justifyContent: 'flex-end',
  },
  rowThem: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    position: 'relative',
    ...Shadow.s1,
  },
  bubbleMe: {
    backgroundColor: Colors.sakuraDeep,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: Colors.vellum,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  text: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.ui,
    lineHeight: 22,
  },
  reaction: {
    position: 'absolute',
    bottom: -8,
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor: Colors.vellum,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadow.s1,
  },
  reactionMe: {
    left: -6,
  },
  reactionThem: {
    right: -6,
  },
  status: {
    position: 'absolute',
    bottom: -16,
    right: 0,
    fontSize: sf(10),
    color: Colors.ink3,
    fontFamily: FontFamily.marker,
    letterSpacing: 0.5,
  },
});
