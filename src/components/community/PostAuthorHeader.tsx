import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import type { CommunityFoProfile, CommunityProfile } from '@/store/community';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

type Props = {
  author: CommunityProfile;
  fo?: CommunityFoProfile | null;
  createdAt?: string;
  size?: 'sm' | 'lg';
};

/** Shared "who posted this" header — one visual, reused by the feed card and post detail. */
export function PostAuthorHeader({ author, fo, createdAt, size = 'sm' }: Props) {
  const big = size === 'lg';
  const avatarSize = big ? 44 : 36;
  const foSize = big ? 24 : 20;

  return (
    <View style={styles.row}>
      <View style={styles.avatarStack}>
        <Pressable onPress={() => router.push(`/social/user/${author.id}` as any)}>
          <View style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: Colors.sakura }]}>
            {author.avatarUrl ? (
              <Image source={{ uri: author.avatarUrl }} style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }} contentFit="cover" />
            ) : (
              <Text style={[styles.avatarInitial, { fontSize: sf(big ? 18 : 15) }]}>
                {author.name.trim().charAt(0).toUpperCase() || '♡'}
              </Text>
            )}
          </View>
        </Pressable>
        {!!fo && (
          <Pressable onPress={() => router.push(`/social/fo/${fo.id}` as any)} style={styles.foWrap}>
            <View style={[styles.foAvatar, { width: foSize, height: foSize, borderRadius: foSize / 2, backgroundColor: Colors.lavender }]}>
              {fo.avatarUrl ? (
                <Image source={{ uri: fo.avatarUrl }} style={{ width: foSize, height: foSize, borderRadius: foSize / 2 }} contentFit="cover" />
              ) : (
                <Text style={[styles.avatarInitial, { fontSize: sf(big ? 11 : 9) }]}>
                  {fo.name.trim().charAt(0).toUpperCase() || '♡'}
                </Text>
              )}
            </View>
          </Pressable>
        )}
      </View>

      <View style={styles.textCol}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, big && styles.nameLg]} numberOfLines={1}>
            {author.name || 'someone'}
            {fo ? ` × ${fo.name}` : ''}
          </Text>
          {!!author.username && <Text style={styles.username}>@{author.username}</Text>}
        </View>
        {!!createdAt && <Text style={styles.meta}>{timeAgo(createdAt)}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarStack: { position: 'relative' },
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarInitial: { fontFamily: FontFamily.displayItalic, color: '#fff' },
  foWrap: { position: 'absolute', bottom: -4, right: -8 },
  foAvatar: {
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.vellum,
  },
  textCol: { flex: 1, minWidth: 0, gap: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
  name: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink },
  nameLg: { fontSize: sf(15) },
  username: { fontFamily: FontFamily.uiMedium, fontSize: sf(11.5), color: Colors.sakuraDeep },
  meta: { fontFamily: FontFamily.ui, fontSize: sf(10.5), color: Colors.ink3 },
});
