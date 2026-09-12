import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import type { CommunityPost } from '@/store/community';

import { MentionText } from './MentionText';

const AVATAR_SIZE = 34;

function Avatar({ uri, name }: { uri: string; name: string }) {
  return (
    <View style={styles.avatar}>
      {uri ? (
        <Image source={{ uri }} style={styles.avatarImg} contentFit="cover" recyclingKey={uri} {...AVATAR_IMAGE} />
      ) : (
        <Text style={styles.avatarInitial}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
      )}
    </View>
  );
}

/** The pinned daily winner, styled as its own headline card — distinct from
 * both a regular post and a pool row, matching the "today's activity" block
 * on the Activities tab. */
export function TodaysActivityCard({ activity }: { activity: CommunityPost }) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/social/activity/${activity.id}` as any)}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>today's activity</Text>
        <Text style={styles.labelSub}>· community picked</Text>
      </View>

      <View style={styles.contentRow}>
        <Avatar uri={activity.author.avatarUrl} name={activity.author.name} />
        <View style={styles.textCol}>
          <MentionText body={activity.body} mentions={activity.mentions} style={styles.headline} numberOfLines={3} />
          {!!activity.author.username && <Text style={styles.username}>@{activity.author.username}</Text>}
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.sakuraSoft,
    borderRadius: Radius.r4,
    padding: Spacing.s4,
    gap: 10,
  },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  label: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.sakuraDeep,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  labelSub: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3 },
  contentRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.sakura, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(14), color: '#fff' },
  textCol: { flex: 1, minWidth: 0, gap: 2 },
  headline: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(17), color: Colors.ink, lineHeight: sf(22) },
  username: { fontFamily: FontFamily.uiMedium, fontSize: sf(11.5), color: Colors.ink3 },
  chevron: { fontFamily: FontFamily.ui, fontSize: sf(22), color: Colors.ink3, lineHeight: sf(24) },
});
