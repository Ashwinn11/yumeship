import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { Colors, FontFamily } from '@/constants/theme';
import type { CommunityMention } from '@/store/community';

const MENTION_RE = /@([a-zA-Z0-9_]{3,20})/g;

type Props = {
  body: string;
  mentions: CommunityMention[];
  style?: StyleProp<TextStyle>;
  mentionStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

/**
 * Renders a post/comment body, turning every @username that resolved to a
 * real account (per `mentions`, populated server-side by the mention-sync
 * trigger) into a tappable link to that profile. A typo or a since-deleted
 * account's handle just stays plain text — only tokens present in `mentions`
 * ever link, same as Instagram only linkifying mentions that resolve.
 */
export function MentionText({ body, mentions, style, mentionStyle, numberOfLines }: Props) {
  if (!body) return null;
  if (mentions.length === 0) {
    return <Text style={style} numberOfLines={numberOfLines}>{body}</Text>;
  }

  const byUsername = new Map(mentions.map((m) => [m.username.toLowerCase(), m.userId]));
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  const re = new RegExp(MENTION_RE);
  let match: RegExpExecArray | null;
  while ((match = re.exec(body))) {
    const userId = byUsername.get(match[1].toLowerCase());
    if (userId) {
      if (match.index > lastIndex) parts.push(body.slice(lastIndex, match.index));
      parts.push(
        <Text key={key++} style={mentionStyle ?? styles.mention} onPress={() => router.push(`/social/user/${userId}` as any)}>
          {match[0]}
        </Text>,
      );
      lastIndex = match.index + match[0].length;
    }
  }
  if (lastIndex < body.length) parts.push(body.slice(lastIndex));

  return <Text style={style} numberOfLines={numberOfLines}>{parts}</Text>;
}

const styles = StyleSheet.create({
  mention: { color: Colors.ink, fontFamily: FontFamily.uiSemiBold },
});
