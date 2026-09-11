import { Image } from 'expo-image';
import { useState } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GalleryPicker } from '@/components/profile/GalleryPicker';
import { ProfileFlagsEditor } from '@/components/profile/ProfileFlagsEditor';
import { Chip } from '@/components/ui/Chip';
import { DismissKeyboardView } from '@/components/ui/DismissKeyboardView';
import { Colors, FontFamily, Radius, SheetColumn, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import type { GalleryPhoto } from '@/store/fo';

// One editor for both a person's own profile and each F/O — they are the same
// kind of object, so they get the same editing experience and differ only in
// which fields they declare. Sections are data, not markup, so neither screen
// can quietly drift into its own layout again.

type Value = Record<string, any>;

export type EditField =
  | {
      kind: 'text';
      key: string;
      label: string;
      placeholder?: string;
      hint?: string;
      multiline?: boolean;
      maxLength?: number;
      autoCapitalize?: TextInputProps['autoCapitalize'];
      autoCorrect?: boolean;
      keyboardType?: TextInputProps['keyboardType'];
    }
  | {
      kind: 'chips';
      key: string;
      label: string;
      options: { value: string; label: string; color?: string }[];
      /** also shows a free-text field under the chips, so a preset is a shortcut, never a ceiling */
      allowCustom?: boolean;
      customPlaceholder?: string;
    }
  | { kind: 'swatches'; key: string; label: string; options: string[]; /** cleared when a swatch is picked */ clears?: string }
  | { kind: 'gallery'; key: string }
  | { kind: 'node'; label?: string; render: () => React.ReactNode };

export type EditSectionDef = {
  id: string;
  label: string;
  /** right-hand summary in the hub row */
  summary?: (v: Value) => string;
  accessory?: (v: Value) => React.ReactNode;
  /** fields shown in this section's own sheet — omit when `onPress` opens something else */
  fields?: EditField[];
  onPress?: () => void;
};

type Props = {
  title: string;
  value: Value;
  onChange: (patch: Value) => void;
  sections: EditSectionDef[];
  avatar: {
    uri?: string;
    fallbackColor: string;
    initial: string;
    onPick: () => void;
    /** e.g. "change photo" / "their portrait" */
    action: string;
  };
  /** the essentials, edited inline under the avatar rather than buried in a sheet */
  headerFields?: EditField[];
  /** the value key holding ProfileFlag[] — rendered inline too; a chip row plus
   *  a swatch+text add/edit row is small enough to live on the page, not behind
   *  a tap into its own titled sheet */
  flagsKey?: string;
  /** the ✕ — leaving without committing */
  onClose: () => void;
  /** the right-hand action; defaults to onClose when editing in place */
  onDone?: () => void;
  doneLabel?: string;
  /** section opened on mount, so creation lands straight in the essentials */
  initialSection?: string;
  /** shown under the header, e.g. a missing required field */
  notice?: string;
  /** destructive actions and anything else that belongs after the list */
  footer?: React.ReactNode;
};

export function ProfileEditor({
  title, value, onChange, sections, avatar, headerFields, flagsKey,
  onClose, onDone, doneLabel = 'done', initialSection, notice, footer,
}: Props) {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const [open, setOpen] = useState<string | null>(initialSection ?? null);

  const openSection = sections.find((s) => s.id === open) ?? null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1 }]}>
      <View style={[styles.header, column]}>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <Pressable onPress={onDone ?? onClose} hitSlop={8}>
          <Text style={styles.doneText}>{doneLabel}</Text>
        </Pressable>
      </View>

      {!!notice && (
        <View style={[styles.notice, column]}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, column]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        <DismissKeyboardView>
          <Pressable onPress={avatar.onPick} style={styles.avatarBlock}>
            <View style={[styles.avatar, { backgroundColor: avatar.fallbackColor }]}>
              {avatar.uri ? (
                <Image source={{ uri: avatar.uri }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.avatarInitial}>{avatar.initial || '♡'}</Text>
              )}
            </View>
            <Text style={styles.avatarAction}>{avatar.action}</Text>
          </Pressable>

          {!!headerFields?.length && (
            <View style={styles.headerCard}>
              {headerFields.map((f, i) => (
                <View key={('key' in f ? f.key : f.label) ?? i} style={[styles.headerField, i > 0 && styles.headerFieldDivider]}>
                  <Field field={f} value={value} onChange={onChange} />
                </View>
              ))}
            </View>
          )}

          {!!flagsKey && (
            <View style={styles.flagsCard}>
              <Text style={styles.flagsLabel}>flags</Text>
              <ProfileFlagsEditor
                flags={value[flagsKey] ?? []}
                onChange={(flags) => onChange({ [flagsKey]: flags })}
              />
            </View>
          )}

          <View style={styles.list}>
            {sections.map((s, i) => {
              const summary = s.summary?.(value) ?? '';
              const accessory = s.accessory?.(value);
              return (
                <Pressable
                  key={s.id}
                  onPress={() => (s.onPress ? s.onPress() : setOpen(s.id))}
                  style={[styles.row, i < sections.length - 1 && styles.rowDivider]}
                >
                  <Text style={styles.rowLabel}>{s.label}</Text>
                  <View style={styles.rowValueWrap}>
                    {accessory}
                    {!!summary && <Text style={styles.rowValue} numberOfLines={1}>{summary}</Text>}
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              );
            })}
          </View>

          {footer}

          <View style={{ height: insets.bottom + Spacing.s6 }} />
        </DismissKeyboardView>
      </ScrollView>

      {/* one section at a time — the sheet holds only its own fields */}
      {openSection?.fields && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setOpen(null)}>
          <View style={styles.sheetWrap}>
            <TouchableWithoutFeedback onPress={() => setOpen(null)}>
              <View style={styles.sheetOverlay} />
            </TouchableWithoutFeedback>
            <View style={[styles.sheet, SheetColumn]}>
              <View style={styles.handle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{openSection.label}</Text>
                <Pressable onPress={() => setOpen(null)} hitSlop={8}>
                  <Text style={styles.doneText}>done</Text>
                </Pressable>
              </View>
              <ScrollView
                contentContainerStyle={styles.sheetBody}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                onScrollBeginDrag={() => Keyboard.dismiss()}
              >
                <DismissKeyboardView>
                  {openSection.fields.map((f, i) => (
                    <Field key={('key' in f ? f.key : f.label) ?? i} field={f} value={value} onChange={onChange} />
                  ))}
                </DismissKeyboardView>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function Field({ field, value, onChange }: { field: EditField; value: Value; onChange: (p: Value) => void }) {
  if (field.kind === 'node') {
    return (
      <View style={styles.labeled}>
        {!!field.label && <Text style={styles.labeledText}>{field.label}</Text>}
        {field.render()}
      </View>
    );
  }

  if (field.kind === 'gallery') {
    return (
      <GalleryPicker
        photos={(value[field.key] ?? []) as GalleryPhoto[]}
        onChange={(photos) => onChange({ [field.key]: photos })}
      />
    );
  }

  if (field.kind === 'chips') {
    const current = value[field.key];
    return (
      <View style={styles.labeled}>
        <Text style={styles.labeledText}>{field.label}</Text>
        <View style={styles.chipRow}>
          {field.options.map((o) => {
            const active = current === o.value;
            const color = o.color ?? Colors.sakuraDeep;
            return (
              <Chip
                key={o.value}
                active={active}
                color={active ? color : Colors.ink2}
                bg={active ? `${color}22` : Colors.paperDeep}
                onPress={() => onChange({ [field.key]: o.value })}
              >
                {o.label}
              </Chip>
            );
          })}
        </View>
        {field.allowCustom && (
          <TextInput
            value={current ?? ''}
            onChangeText={(v) => onChange({ [field.key]: v })}
            placeholder={field.customPlaceholder ?? 'or type your own…'}
            placeholderTextColor={Colors.ink3}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            style={styles.chipCustomInput}
          />
        )}
      </View>
    );
  }

  if (field.kind === 'swatches') {
    const current = value[field.key];
    const cleared = field.clears ? value[field.clears] : '';
    return (
      <View style={styles.labeled}>
        <Text style={styles.labeledText}>{field.label}</Text>
        <View style={styles.chipRow}>
          {field.options.map((c) => (
            <Pressable
              key={c}
              onPress={() => onChange(field.clears ? { [field.key]: c, [field.clears]: '' } : { [field.key]: c })}
              style={[styles.swatch, { backgroundColor: c }, !cleared && current === c && styles.swatchOn]}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.labeled}>
      <Text style={styles.labeledText}>{field.label}</Text>
      <TextInput
        value={value[field.key] ?? ''}
        onChangeText={(v) => onChange({ [field.key]: v })}
        placeholder={field.placeholder}
        placeholderTextColor={Colors.ink3}
        multiline={field.multiline}
        maxLength={field.maxLength}
        autoCapitalize={field.autoCapitalize}
        autoCorrect={field.autoCorrect}
        keyboardType={field.keyboardType}
        returnKeyType={field.multiline ? undefined : 'done'}
        onSubmitEditing={field.multiline ? undefined : () => Keyboard.dismiss()}
        style={[styles.input, field.multiline && styles.inputTall]}
      />
      {!!field.hint && <Text style={styles.hint}>{field.hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s3,
  },
  closeBtn: {
    width: 30, height: 30, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink2 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(18), color: Colors.ink },
  doneText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(14), color: Colors.sakuraDeep },

  content: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3, gap: Spacing.s5 },
  notice: {
    marginHorizontal: Spacing.s5, marginBottom: Spacing.s2,
    paddingHorizontal: Spacing.s3, paddingVertical: 8,
    borderRadius: Radius.r3, backgroundColor: Colors.sakuraSoft,
    borderWidth: 1, borderColor: Colors.sakura,
  },
  noticeText: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.sakuraInk },

  headerCard: {
    backgroundColor: Colors.vellum,
    borderRadius: Radius.r4, borderWidth: 1, borderColor: Colors.line,
    paddingHorizontal: Spacing.s4,
  },
  headerField: { paddingVertical: Spacing.s4 },
  flagsCard: {
    backgroundColor: Colors.vellum,
    borderRadius: Radius.r4, borderWidth: 1, borderColor: Colors.line,
    padding: Spacing.s4, gap: Spacing.s3,
  },
  flagsLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink2 },
  headerFieldDivider: { borderTopWidth: 1, borderTopColor: Colors.line },
  avatarBlock: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 76, height: 76, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 76, height: 76, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(32), color: '#fff' },
  avatarAction: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.sakuraDeep },

  list: {
    backgroundColor: Colors.vellum,
    borderRadius: Radius.r4, borderWidth: 1, borderColor: Colors.line,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: Spacing.s4, minHeight: 52 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  rowLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(13.5), color: Colors.ink, width: 112 },
  rowValueWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  rowValue: { fontFamily: FontFamily.ui, fontSize: sf(12.5), color: Colors.ink3, flexShrink: 1, textAlign: 'right' },
  chevron: { fontFamily: FontFamily.ui, fontSize: sf(17), color: Colors.ink3 },

  sheetWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  sheetOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: Colors.paper,
    borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5,
    paddingBottom: 34, maxHeight: '80%',
  },
  handle: { width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.s4, borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  sheetTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: Colors.ink },
  sheetBody: { padding: Spacing.s5, gap: Spacing.s4 },

  labeled: { gap: 6 },
  labeledText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink2 },
  input: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.vellum,
    paddingHorizontal: Spacing.s3, paddingVertical: Spacing.s3,
    fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink,
  },
  inputTall: { minHeight: 92, textAlignVertical: 'top', lineHeight: sf(20) },
  hint: { fontFamily: FontFamily.ui, fontSize: sf(11.5), color: Colors.ink3, lineHeight: sf(16) },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chipCustomInput: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.vellum,
    paddingHorizontal: Spacing.s3, paddingVertical: 8,
    fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink,
  },
  swatch: { width: 30, height: 30, borderRadius: Radius.pill, borderWidth: 1.5, borderColor: Colors.line },
  swatchOn: { borderColor: Colors.ink, borderWidth: 2.5 },
});
