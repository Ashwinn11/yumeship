import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sparkle } from '@/components/deco/Sparkle';
import { StickerWaxSeal } from '@/components/deco/Stickers';
import { Button } from '@/components/ui/Button';
import { DismissKeyboardView } from '@/components/ui/DismissKeyboardView';
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { createGroup } from '@/store/groups';

const MAX_NAME = 60;
const MAX_DESCRIPTION = 500;
const AVATAR_SIZE = 60;

export default function NewGroupScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const [name, setName] = useState('');
  const [fandom, setFandom] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const canCreate = name.trim().length > 0 && !creating;

  async function pickAvatar() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled && res.assets[0]) setAvatarUri(res.assets[0].uri);
  }

  async function submit() {
    if (!canCreate) return;
    Keyboard.dismiss();
    setCreating(true);
    setError('');
    try {
      const group = await createGroup({ name, fandom, description, avatarUri: avatarUri || undefined });
      router.replace(`/social/groups/${group.id}` as any);
    } catch (e: any) {
      setError(e?.message ?? "couldn't create the group — try again");
      setCreating(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ProfileScreenHeader insetsTop={insets.top} onBack={() => router.back()} title="new group" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <DismissKeyboardView>
          <View style={[column, styles.body]}>
            <View style={styles.decoTR} pointerEvents="none">
              <StickerWaxSeal size={52} />
            </View>
            <View style={styles.decoBL} pointerEvents="none">
              <Sparkle size={16} color={Colors.lavenderDeep} />
            </View>

            <Text style={styles.heading}>Start a corner{'\n'}for your fandom.</Text>
            <Text style={styles.subheading}>anyone can find and join — make it theirs too</Text>

            <View style={styles.card}>
              <View style={styles.identityRow}>
                <Pressable style={styles.avatarWrap} onPress={pickAvatar}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImg} contentFit="cover" />
                  ) : (
                    <Text style={styles.avatarPlaceholder}>+</Text>
                  )}
                  {!!avatarUri && (
                    <View style={styles.avatarSparkle}>
                      <Sparkle size={9} color={Colors.sakuraDeep} />
                    </View>
                  )}
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
                      autoFocus
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
              <Text style={styles.avatarHint}>tap the circle to add a picture</Text>

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
        <Button variant="primary" size="lg" full onPress={submit} disabled={!canCreate}>
          {creating ? 'creating…' : !name.trim() ? 'name it first' : 'create group'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  scrollContent: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s3, paddingBottom: Spacing.s4 },
  body: { position: 'relative' },
  decoTR: { position: 'absolute', top: -8, right: -6 },
  decoBL: { position: 'absolute', bottom: -2, left: 4 },

  heading: {
    fontFamily: FontFamily.displayItalic, fontSize: sf(26), lineHeight: sf(30),
    letterSpacing: -0.3, color: Colors.ink, marginTop: Spacing.s2,
  },
  subheading: { fontFamily: FontFamily.ui, fontSize: sf(12.5), color: Colors.ink3, marginTop: 6 },

  card: {
    marginTop: Spacing.s5, padding: 16,
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
