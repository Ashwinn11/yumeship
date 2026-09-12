import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AVATAR_IMAGE, MEDIA_IMAGE } from '@/lib/imageProps';
import { timeAgo } from '@/lib/relativeTime';
import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import type { GroupMessage } from '@/store/groups';

import { MentionText } from './MentionText';

const AVATAR_SIZE = 26;
const MAX_IMG = 220;

function imageDisplaySize(width: number, height: number) {
  if (!width || !height) return { width: MAX_IMG, height: MAX_IMG };
  const scale = MAX_IMG / Math.max(width, height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

type Props = {
  message: GroupMessage;
  isMe: boolean;
  /** looked up from the chat's own already-loaded messages — see
   *  GroupMessage.replyToId's doc comment for why this isn't a DB join */
  messagesById: Map<string, GroupMessage>;
  onLongPress: () => void;
  /** false when the message right before this one (chronologically) is from
   *  the same sender — same run-grouping convention as WhatsApp/iMessage:
   *  avatar and name show once per consecutive run, not on every bubble.
   *  Own messages never show either regardless of this prop. */
  showIdentity?: boolean;
};

export function GroupChatBubble({ message, isMe, messagesById, onLongPress, showIdentity = true }: Props) {
  const replyTo = message.replyToId ? messagesById.get(message.replyToId) : undefined;
  const image = message.media[0];

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      {!isMe && (
        showIdentity ? (
          <View style={styles.avatar}>
            {message.sender.avatarUrl ? (
              <Image source={{ uri: message.sender.avatarUrl }} style={styles.avatarImg} contentFit="cover" {...AVATAR_IMAGE} />
            ) : (
              <Text style={styles.avatarInitial}>{(message.sender.name || message.sender.username).trim().charAt(0).toUpperCase() || '♡'}</Text>
            )}
          </View>
        ) : (
          <View style={styles.avatarSpacer} />
        )
      )}

      <Pressable onLongPress={onLongPress} style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        {!isMe && showIdentity && <Text style={styles.senderLabel}>{message.sender.name || message.sender.username}</Text>}

        {!!message.replyToId && (
          <View style={[styles.quote, isMe && styles.quoteMe]}>
            <Text style={[styles.quoteSender, isMe && styles.quoteTextMe]} numberOfLines={1}>
              {replyTo ? replyTo.sender.name || replyTo.sender.username : 'original message'}
            </Text>
            <Text style={[styles.quoteBody, isMe && styles.quoteTextMe]} numberOfLines={1}>
              {replyTo ? (replyTo.body || (replyTo.media.length > 0 ? 'photo' : '')) : 'no longer available'}
            </Text>
          </View>
        )}

        {!!image && (
          <Image
            source={{ uri: image.url }}
            style={[styles.image, imageDisplaySize(image.width, image.height)]}
            contentFit="cover"
            {...MEDIA_IMAGE}
          />
        )}

        {message.body ? (
          // the time rides the end of the body text itself (a nested Text,
          // not a separate block) so RN's own line-wrapping decides whether
          // it fits the last line or wraps below — no manual line-length
          // math needed
          <MentionText
            body={message.body}
            mentions={message.mentions}
            style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}
            mentionStyle={isMe ? styles.mentionMe : undefined}
            trailing={
              <Text style={[styles.timeInline, isMe ? styles.quoteTextMe : styles.timeThem]}>
                {'   ' + timeAgo(message.createdAt)}
              </Text>
            }
          />
        ) : (
          <Text style={[styles.time, isMe ? styles.quoteTextMe : styles.timeThem]}>{timeAgo(message.createdAt)}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', width: '100%', alignItems: 'flex-end', gap: 6 },
  rowMe: { justifyContent: 'flex-end' },
  rowThem: { justifyContent: 'flex-start' },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.sakura, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(11), color: '#fff' },
  // keeps grouped bubbles aligned under the one above rather than sliding
  // left once the avatar stops rendering
  avatarSpacer: { width: AVATAR_SIZE },

  bubble: {
    maxWidth: '78%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    gap: 4,
  },
  bubbleMe: { backgroundColor: Colors.sakuraDeep, borderBottomRightRadius: 4 },
  bubbleThem: {
    backgroundColor: Colors.vellum,
    borderWidth: 1.2,
    borderColor: Colors.line,
    borderBottomLeftRadius: 4,
  },
  senderLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(10.5), color: Colors.sakuraDeep },
  bubbleText: { fontFamily: FontFamily.ui, fontSize: sf(13.5), lineHeight: sf(18) },
  bubbleTextMe: { color: Colors.vellum },
  bubbleTextThem: { color: Colors.ink },
  mentionMe: { fontFamily: FontFamily.uiSemiBold, color: Colors.vellum, textDecorationLine: 'underline' },

  quote: {
    borderLeftWidth: 2.5,
    borderLeftColor: Colors.line,
    backgroundColor: Colors.paperDeep,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    gap: 1,
  },
  quoteMe: { backgroundColor: 'rgba(255,255,255,0.16)', borderLeftColor: 'rgba(255,255,255,0.5)' },
  quoteSender: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(10.5), color: Colors.ink2 },
  quoteBody: { fontFamily: FontFamily.ui, fontSize: sf(11.5), color: Colors.ink3 },
  quoteTextMe: { color: Colors.vellum },

  image: { borderRadius: 12 },
  // block variant — only used when there's no body text to ride (an
  // image-only message), so it needs its own line and right alignment
  time: { fontFamily: FontFamily.ui, fontSize: sf(9.5), color: 'rgba(255,255,255,0.75)', alignSelf: 'flex-end' },
  // inline variant — a nested span inside the body's own <Text>, so no
  // alignSelf (that's a block-layout property, meaningless on a text span)
  timeInline: { fontFamily: FontFamily.ui, fontSize: sf(9.5), color: 'rgba(255,255,255,0.75)' },
  timeThem: { color: Colors.ink3 },
});
