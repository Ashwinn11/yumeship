import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sparkle } from '@/components/deco/Sparkle';
import { Button } from '@/components/ui/Button';
import { DismissKeyboardView } from '@/components/ui/DismissKeyboardView';
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { fetchGroup, updateGroup } from '@/store/groups';

const MAX_NAME = 60;
const MAX_DESCRIPTION = 500;
const AVATAR_SIZE = 60;

export default function EditGroupScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [fandom, setFandom] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [pickedAvatarUri, setPickedAvatarUri] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchGroup(id).then((g) => {
      if (cancelled || !g) return;
      setName(g.name);
      setFandom(g.fandom);
      setDescription(g.description);
      setAvatarUrl(g.avatarUrl);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const canSave = name.trim().length > 0 && !saving;
  const displayedAvatar = pickedAvatarUri || avatarUrl;

  async function pickAvatar() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled && res.assets[0]) setPickedAvatarUri(res.assets[0].uri);
  }

  async function submit() {
    if (!canSave) return;
    Keyboard.dismiss();
    setSaving(true);
    setError('');
    try {
      await updateGroup(id, {
        name,
        fandom,
        description,
        avatarUri: pickedAvatarUri || undefined,
      });
      router.back();
    } catch (e: any) {
      setError(e?.message ?? "couldn't save — try again");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator color={Colors.sakuraDeep} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ProfileScreenHeader insetsTop={insets.top} onBack={() => router.back()} title="edit group" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <DismissKeyboardView>
          <View style={[column, styles.body]}>
            <View style={styles.card}>
              <View style={styles.identityRow}>
                <Pressable style={styles.avatarWrap} onPress={pickAvatar}>
                  {displayedAvatar ? (
                    <Image source={{ uri: displayedAvatar }} style={styles.avatarImg} contentFit="cover" />
                  ) : (
                    <Text style={styles.avatarPlaceholder}>+</Text>
                  )}
                  <View style={styles.avatarSparkle}>
                    <Sparkle size={9} color={Colors.sakuraDeep} />
                  </View>
                </Pressable>

                <View style={styles.identityFields}>
                  <View>
                    <Text style={styles.fieldLabel}>NAME</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Haikyuu!! yumejoshi"
                      placeholderTextColor={Colors.ink3}
                      maxLength={MAX_NAME}
                      returnKeyType="next"
                      style={styles.underlineInput}
                    />
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.fieldLabel}>FANDOM · optional</Text>
                    <TextInput
                      value={fandom}
                      onChangeText={setFandom}
                      placeholder="e.g. Haikyuu!!"
                      placeholderTextColor={Colors.ink3}
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                      style={[styles.underlineInput, styles.underlineInputSmall]}
                    />
                  </View>
                </View>
              </View>
              <Text style={styles.avatarHint}>tap the circle to change the picture</Text>

              <View style={styles.cardDivider} />

              <Text style={styles.fieldLabel}>WHAT'S THIS SPACE ABOUT · optional</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="a place to gush, share art, plan events…"
                placeholderTextColor={Colors.ink3}
                maxLength={MAX_DESCRIPTION}
                multiline
                style={styles.description}
              />
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}
          </View>
        </DismissKeyboardView>
      </ScrollView>

      <View style={[styles.actions, column, { paddingBottom: insets.bottom + Spacing.s3 }]}>
        <Button variant="primary" size="lg" full onPress={submit} disabled={!canSave}>
          {saving ? 'saving…' : 'save changes'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  centeredScreen: { flex: 1, backgroundColor: Colors.paper, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s4, paddingBottom: Spacing.s4 },
  body: { position: 'relative' },

  card: {
    padding: 16,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r4,
    shadowColor: 'rgba(110, 58, 90, 0.05)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1,
  },
  cardDivider: { height: 1.2, backgroundColor: Colors.line, marginVertical: 14, opacity: 0.6 },

  identityRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatarWrap: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.paperDeep, borderWidth: 1.5, borderColor: Colors.line, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    position: 'relative', flexShrink: 0,
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarPlaceholder: { fontSize: sf(22), color: Colors.ink3, fontFamily: FontFamily.ui, lineHeight: sf(26) },
  avatarSparkle: { position: 'absolute', top: -6, left: -6 },
  avatarHint: { fontFamily: FontFamily.ui, fontSize: sf(10.5), color: Colors.ink3, marginTop: 8 },

  identityFields: { flex: 1, minWidth: 0 },
  fieldLabel: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.2 },
  underlineInput: {
    borderBottomWidth: 1.4, borderBottomColor: Colors.line, paddingVertical: 4, marginTop: 4,
    fontFamily: FontFamily.ui, fontSize: sf(16), color: Colors.ink, lineHeight: sf(21),
  },
  underlineInputSmall: { fontSize: sf(13), color: Colors.ink2, lineHeight: sf(18) },

  description: {
    marginTop: 8, minHeight: 84, textAlignVertical: 'top',
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    paddingVertical: 10, paddingHorizontal: 12,
    fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink, lineHeight: sf(18),
  },

  error: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ember, marginTop: Spacing.s4, textAlign: 'center' },
  actions: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s2 },
});
