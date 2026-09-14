import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import { timeAgo } from '@/lib/relativeTime';
import { BLINKIE_BY_ID } from '@/constants/blinkies';
import { Blinkie } from '@/components/profile/Blinkie';
import type { CommunityFoProfile, CommunityProfile } from '@/store/community';

type Props = {
  author: CommunityProfile;
  fo?: CommunityFoProfile | null;
  createdAt?: string;
  size?: 'sm' | 'lg';
};

function Avatar({
  uri,
  name,
  size,
  color,
  fontSize,
  style,
}: {
  uri?: string;
  name: string;
  size: number;
  color: string;
  fontSize: number;
  style?: object;
}) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          recyclingKey={uri}
          {...AVATAR_IMAGE}
        />
      ) : (
        <Text style={[styles.avatarInitial, { fontSize: sf(fontSize) }]}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
      )}
    </View>
  );
}

/** Shared "who posted this" header — one visual, reused by the feed card and post detail. */
export function PostAuthorHeader({ author, fo, createdAt, size = 'sm' }: Props) {
  const big = size === 'lg';
  const avatarSize = big ? 44 : 36;
  const pairedAvatarSize = big ? 38 : 32;
  // only the author's primary (first) equipped blinkie, never their whole
  // wall — a feed row is exactly the wrong place to repeat a big collection
  const primarySlot = author.blinkies?.[0];
  const primaryTemplate = primarySlot ? BLINKIE_BY_ID[primarySlot.templateId] : undefined;

  if (fo) {
    return (
      <View style={styles.row}>
        <View style={styles.pairedAvatars}>
          <Pressable onPress={() => router.push(`/social/user/${author.id}` as any)}>
            <Avatar uri={author.avatarUrl} name={author.name} size={pairedAvatarSize} color={Colors.sakura} fontSize={big ? 15 : 13} />
          </Pressable>
          <Text style={styles.pairedHeartSymbol}>♥</Text>
          <Pressable onPress={() => router.push(`/social/fo/${fo.id}` as any)}>
            <Avatar
              uri={fo.avatarUrl}
              name={fo.name}
              size={pairedAvatarSize}
              color={Colors.lavender}
              fontSize={big ? 15 : 13}
            />
          </Pressable>
        </View>

        <View style={styles.textCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, big && styles.nameLg]} numberOfLines={1}>
              {author.name || 'someone'}
            </Text>
            {!!author.username && <Text style={styles.username}>@{author.username}</Text>}
            {!!createdAt && <Text style={styles.meta}>· {timeAgo(createdAt)}</Text>}
          </View>
          {/* paired post: the author's badge sits next to the f/o's own name,
              not the author's own name — this line is "who they're posting as with" */}
          <View style={styles.foRow}>
            <View style={styles.foBadge}>
              <Text style={styles.foBadgeText} numberOfLines={1}>{fo.name}</Text>
            </View>
            {!!primaryTemplate && !!primarySlot!.text && (
              <Blinkie template={primaryTemplate} text={primarySlot!.text} />
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.push(`/social/user/${author.id}` as any)}>
        <Avatar uri={author.avatarUrl} name={author.name} size={avatarSize} color={Colors.sakura} fontSize={big ? 18 : 15} />
      </Pressable>

      <View style={styles.textCol}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, big && styles.nameLg]} numberOfLines={1}>
            {author.name || 'someone'}
          </Text>
          {!!author.username && <Text style={styles.username}>@{author.username}</Text>}
          {!!createdAt && <Text style={styles.meta}>· {timeAgo(createdAt)}</Text>}
        </View>
        {/* no f/o on this post — the badge is the author's own, so it goes
            under their name instead of tucked into a nonexistent f/o line */}
        {!!primaryTemplate && !!primarySlot!.text && (
          <View style={styles.identityRow}>
            <Blinkie template={primaryTemplate} text={primarySlot!.text} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarInitial: { fontFamily: FontFamily.displayItalic, color: '#fff' },
  pairedAvatars: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  // intentionally pure black, not Colors.ink (a deep-wine near-black) — no
  // token in this palette matches true black, and this glyph is meant to be it
  pairedHeartSymbol: { fontSize: sf(13), color: '#000' },
  textCol: { flex: 1, minWidth: 0, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
  name: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink },
  nameLg: { fontSize: sf(15) },
  foRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  foBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.pill,
    backgroundColor: Colors.lavenderSoft, borderWidth: 1, borderColor: Colors.lavender,
  },
  foBadgeText: { fontFamily: FontFamily.uiMedium, fontSize: sf(10), color: Colors.lavenderDeep },
  identityRow: { marginTop: 1 },
  username: { fontFamily: FontFamily.uiMedium, fontSize: sf(11.5), color: Colors.sakuraDeep },
  meta: { fontFamily: FontFamily.ui, fontSize: sf(10.5), color: Colors.ink3 },
});
