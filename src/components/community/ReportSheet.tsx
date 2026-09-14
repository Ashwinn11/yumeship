import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Colors, FontFamily, Radius, Shadow, SheetColumn, Spacing, sf } from '@/constants/theme';
import { REPORT_REASONS, reportContent, type ReportReason, type ReportTargetType } from '@/store/community';

const TARGET_LABEL: Record<ReportTargetType, string> = {
  post: 'post',
  comment: 'comment',
  group_message: 'message',
  user: 'profile',
  fo_profile: "f/o's profile",
  group: 'group',
};

type Props = {
  visible: boolean;
  targetType: ReportTargetType;
  targetId: string;
  onClose: () => void;
  /** fires once the report is actually saved, so the caller can toast+close */
  onSubmitted?: () => void;
  onFailure?: () => void;
};

/** The one report sheet every surface (posts, comments, group messages,
 *  profiles) shares — a reason picker plus optional details, filed to the
 *  `reports` table for manual review. Not a moderation queue: Apple's
 *  requirement is a reporting mechanism reaching the developer, not an
 *  automated in-app action. */
export function ReportSheet({ visible, targetType, targetId, onClose, onSubmitted, onFailure }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setReason(null);
    setDetails('');
  }

  async function submit() {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      await reportContent(targetType, targetId, reason, details.trim());
      reset();
      onSubmitted?.();
    } catch {
      onFailure?.();
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.wrap}>
        <TouchableWithoutFeedback onPress={close}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={[styles.sheet, SheetColumn]}>
          <View style={styles.handle} />
          <Text style={styles.title}>report this {TARGET_LABEL[targetType]}</Text>
          <Text style={styles.subtitle}>what's going on? this goes straight to us, not the person you're reporting.</Text>

          <View style={styles.chipRow}>
            {REPORT_REASONS.map((r) => (
              <Chip
                key={r.value}
                active={reason === r.value}
                color={reason === r.value ? Colors.sakuraDeep : Colors.ink2}
                bg={reason === r.value ? Colors.sakuraSoft : Colors.paperDeep}
                onPress={() => setReason(r.value)}
              >
                {r.label}
              </Chip>
            ))}
          </View>

          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="anything else we should know? (optional)"
            placeholderTextColor={Colors.ink3}
            multiline
            maxLength={500}
            style={styles.input}
          />

          <View style={styles.actions}>
            <Button variant="outline" onPress={close} style={styles.btn}>Cancel</Button>
            <Button variant="primary" onPress={submit} disabled={!reason || submitting} style={styles.btn}>
              {submitting ? 'sending…' : 'submit report'}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: Colors.paper,
    borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5,
    paddingBottom: 34, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3,
    gap: Spacing.s3,
    ...Shadow.s1,
  },
  handle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.s2 },
  title: { fontFamily: FontFamily.displayItalic, fontSize: sf(18), color: Colors.ink },
  subtitle: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3, lineHeight: sf(17) },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: {
    minHeight: 70, textAlignVertical: 'top',
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.vellum,
    paddingVertical: Spacing.s3, paddingHorizontal: Spacing.s3,
    fontFamily: FontFamily.ui, fontSize: sf(13.5), color: Colors.ink,
  },
  actions: { flexDirection: 'row', gap: Spacing.s3, marginTop: Spacing.s2 },
  btn: { flex: 1 },
});
