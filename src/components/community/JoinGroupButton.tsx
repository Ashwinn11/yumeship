import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import { joinGroup, leaveGroup } from '@/store/groups';

type Props = {
  groupId: string;
  initialMember: boolean;
  onChange?: (member: boolean) => void;
  onFailure?: () => void;
};

/** Same shape as FollowButton, aimed at group_members instead of follows. */
export function JoinGroupButton({ groupId, initialMember, onChange, onFailure }: Props) {
  const [member, setMember] = useState(initialMember);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMember(initialMember);
  }, [initialMember]);

  async function handlePress() {
    setBusy(true);
    const next = !member;
    setMember(next);
    onChange?.(next);
    try {
      if (next) await joinGroup(groupId);
      else await leaveGroup(groupId);
    } catch {
      setMember(!next);
      onChange?.(!next);
      onFailure?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Pressable style={[styles.btn, member && styles.btnActive]} onPress={handlePress} disabled={busy}>
      {busy ? (
        <ActivityIndicator size="small" color={member ? Colors.ink2 : '#fff'} />
      ) : (
        <Text style={[styles.text, member && styles.textActive]}>{member ? 'joined' : 'join'}</Text>
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
    minWidth: 78,
  },
  btnActive: { backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line },
  text: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: '#fff' },
  textActive: { color: Colors.ink2 },
});
