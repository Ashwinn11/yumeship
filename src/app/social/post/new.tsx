import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MediaComposer } from '@/components/community/MediaComposer';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { Mark } from '@/components/ui/Mark';
import { Row } from '@/components/ui/Row';
import { UnderInput } from '@/components/ui/UnderInput';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { createPost, type LocalPickedMedia } from '@/store/community';
import { useFos } from '@/store/fo';

export default function NewPostScreen() {
  const insets = useSafeAreaInsets();
  const fos = useFos().filter((f) => f.isPublic);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState<LocalPickedMedia[]>([]);
  const [foId, setFoId] = useState<string | undefined>(undefined);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    setError('');
    try {
      await createPost({ title, body, media, foProfileId: foId });
      router.back();
    } catch (e: any) {
      setError(e?.message ?? 'something went wrong — try again');
    } finally {
      setPosting(false);
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>✕</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={22} />
          <Text style={styles.headerTitle}>new post</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        <Field label="Title">
          <UnderInput value={title} onChangeText={setTitle} placeholder="what's this about?" />
        </Field>

        <View style={styles.spacer} />

        <Field label="Body">
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="share what's on your mind…"
            placeholderTextColor={Colors.ink3}
            multiline
            style={styles.bodyInput}
          />
        </Field>

        <View style={styles.spacer} />

        <Field label="Photos or video (optional)">
          <MediaComposer media={media} onChange={setMedia} />
        </Field>

        {fos.length > 0 && (
          <>
            <View style={styles.spacer} />
            <Field label="Post with (optional)" hint="pair this post with one of your public F/Os">
              <Row gap={6} wrap>
                <Chip
                  color={!foId ? Colors.sakuraDeep : Colors.ink2}
                  bg={!foId ? Colors.sakuraSoft : Colors.paperDeep}
                  active={!foId}
                  onPress={() => setFoId(undefined)}
                >
                  just me
                </Chip>
                {fos.map((f) => (
                  <Chip
                    key={f.id}
                    color={foId === f.id ? Colors.sakuraDeep : Colors.ink2}
                    bg={foId === f.id ? Colors.sakuraSoft : Colors.paperDeep}
                    active={foId === f.id}
                    onPress={() => setFoId(f.id)}
                  >
                    {f.name}
                  </Chip>
                ))}
              </Row>
            </Field>
          </>
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.spacer2} />

        <Button variant="primary" size="lg" full disabled={!title.trim() || !body.trim() || posting} onPress={submit}>
          {posting ? 'posting…' : 'post'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  headerBtnText: { fontSize: sf(14), color: Colors.ink2, fontFamily: FontFamily.ui },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s4, paddingBottom: Spacing.s6 },
  spacer: { height: 16 },
  spacer2: { height: 26 },
  bodyInput: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.paperDeep,
    padding: Spacing.s3, minHeight: 110, textAlignVertical: 'top',
    fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink, lineHeight: sf(19),
  },
  error: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ember, marginTop: 12, textAlign: 'center' },
});
