import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import { followUser, unfollowUser } from '@/store/community';

type Props = {
  userId: string;
  initialFollowing: boolean;
  onChange?: (following: boolean) => void;
  onFailure?: () => void;
};

export function FollowButton({ userId, initialFollowing, onChange, onFailure }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  async function handlePress() {
    setBusy(true);
    const next = !following;
    setFollowing(next);
    onChange?.(next);
    try {
      if (next) await followUser(userId);
      else await unfollowUser(userId);
    } catch {
      setFollowing(!next);
      onChange?.(!next);
      onFailure?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Pressable style={[styles.btn, following && styles.btnActive]} onPress={handlePress} disabled={busy}>
      {busy ? (
        <ActivityIndicator size="small" color={following ? Colors.ink2 : '#fff'} />
      ) : (
        <Text style={[styles.text, following && styles.textActive]}>{following ? 'following' : 'follow'}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 92,
  },
  btnActive: { backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line },
  text: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: '#fff' },
  textActive: { color: Colors.ink2 },
});
