import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { newId } from '@/db/client';
import { FlagIcon } from '@/components/deco/FlagIcon';
import { SEXUALITY_OPTIONS } from '@/constants/sexualities';
import { persistImage } from '@/lib/localMedia';
import { Colors, FontFamily, Radius, SheetColumn, Spacing, sf } from '@/constants/theme';
import { FLAGS_MAX, FLAG_TEXT_MAX, type ProfileFlag } from './cardTheme';

// same rectangle every drawn flag renders at (26x17 ≈ 3:2), so a photo picked
// here crops to look like a flag stripe rather than an arbitrary snapshot
const FLAG_RATIO = 3 / 2;

/** Center-crops a picked photo down to the flag rectangle ourselves, with no
 *  editing screen shown first — the system croppers are square-only on iOS
 *  and inconsistent on Android, so letting the user "confirm" a crop there
 *  just shows them the wrong shape before we fix it anyway. */
async function cropToFlagRatio(uri: string, width: number, height: number): Promise<string> {
  if (!width || !height) return uri;
  const cropW = width / height > FLAG_RATIO ? Math.round(height * FLAG_RATIO) : width;
  const cropH = cropW === width ? Math.round(width / FLAG_RATIO) : height;
  if (cropW === width && cropH === height) return uri;
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ crop: { originX: Math.round((width - cropW) / 2), originY: Math.round((height - cropH) / 2), width: cropW, height: cropH } }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

const BY_KEY = new Map(SEXUALITY_OPTIONS.map((o) => [o.key, o]));
// the picker is a flag picker — only entries with an actual drawn flag belong
// in it. The rest (straight, questioning, fictosexual…) have none, by design,
// and are said with words in the text box instead.
const FLAG_OPTIONS = SEXUALITY_OPTIONS.filter((o) => o.colors);

function Mark({ flag, imageUrl }: { flag: string; imageUrl: string }) {
  if (imageUrl) return <Image source={{ uri: imageUrl }} style={styles.markImg} contentFit="cover" />;
  const known = BY_KEY.get(flag);
  if (known?.colors) return <FlagIcon colors={known.colors} width={18} height={12} />;
  if (flag && !known) return <Text style={styles.markGlyph}>{flag}</Text>;
  return null;
}

/** Flags shown the way they'll actually appear, each one tappable to edit and
 *  removable in place. Adding or editing opens right here — a swatch beside a
 *  text box; the swatch opens the same picker used elsewhere in the app
 *  (onboarding/persona.tsx's F/O picker): a titled list of rows, tap one and
 *  it closes. Not a grid, not left sitting open. */
export function ProfileFlagsEditor({
  flags,
  onChange,
}: {
  flags: ProfileFlag[];
  onChange: (flags: ProfileFlag[]) => void;
}) {
  const [draft, setDraft] = useState<ProfileFlag | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isNew = !!draft && !flags.some((f) => f.id === draft.id);

  // new and existing land on the exact same inline row — it already handles
  // an empty flag fine (swatch just shows "—"), so there's nothing new to do
  function openNew() {
    setDraft({ id: newId(), flag: '', imageUrl: '', text: '' });
    setPickerOpen(false);
  }

  function edit(f: ProfileFlag) {
    setDraft(f);
    setPickerOpen(false);
  }

  function cancel() {
    setDraft(null);
    setPickerOpen(false);
  }

  function pick(flag: string) {
    if (!draft) return;
    setDraft({ ...draft, flag, imageUrl: '' });
    setPickerOpen(false);
  }

  // no catalogued flag fits everyone — a photo, a gradient screenshot, anything —
  // cropped to the same rectangle a drawn flag renders at, so it sits in the chip
  // the same way the presets do. No editing screen here — the system croppers
  // are square-only on iOS and inconsistent on Android, so we skip that step
  // entirely and center-crop to the flag ratio ourselves right after picking.
  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: false,
      quality: 0.9,
    });
    if (res.canceled || !res.assets[0] || !draft) return;
    const asset = res.assets[0];
    const cropped = await cropToFlagRatio(asset.uri, asset.width, asset.height);
    const stored = await persistImage(cropped);
    setDraft({ ...draft, imageUrl: stored, flag: '' });
    setPickerOpen(false);
  }

  function save() {
    if (!draft) return;
    if (!draft.flag && !draft.imageUrl && !draft.text.trim()) {
      // nothing was actually chosen — don't leave an empty chip behind
      setDraft(null);
      return;
    }
    onChange(isNew ? [...flags, draft].slice(0, FLAGS_MAX) : flags.map((f) => (f.id === draft.id ? draft : f)));
    cancel();
  }

  function remove(id: string) {
    onChange(flags.filter((f) => f.id !== id));
    cancel();
  }

  return (
    <View style={styles.wrap}>
      {/* the section sheet this opens in already titles itself "flags" — this
          row only needs to exist while there's a cancel to show */}
      {!!draft && (
        <View style={styles.header}>
          <Pressable onPress={cancel} hitSlop={6}>
            <Text style={styles.headerCancel}>cancel</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.chipRow}>
        {flags.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => (draft?.id === f.id ? cancel() : edit(f))}
            style={[styles.chip, draft?.id === f.id && styles.chipActive]}
          >
            <Mark flag={f.flag} imageUrl={f.imageUrl} />
            <Text style={styles.chipText} numberOfLines={1}>{f.text || 'untitled'}</Text>
          </Pressable>
        ))}
        {flags.length < FLAGS_MAX && (
          <Pressable onPress={openNew} style={styles.addChip}>
            <Text style={styles.addChipText}>+ flag</Text>
          </Pressable>
        )}
      </View>

      {draft && (
        <View style={styles.editorRow}>
          {/* dashed border while empty is the same "tap to pick" affordance
              GalleryPicker's add-tile already uses — a plain "—" in a solid
              circle read as a settled, already-decided state, not a button */}
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={[styles.swatch, !(draft.imageUrl || BY_KEY.get(draft.flag)?.colors) && styles.swatchEmpty]}
          >
            {draft.imageUrl || BY_KEY.get(draft.flag)?.colors
              ? <Mark flag={draft.flag} imageUrl={draft.imageUrl} />
              : <Text style={styles.swatchNone}>+</Text>}
          </Pressable>
          <TextInput
            value={draft.text}
            onChangeText={(v) => setDraft({ ...draft, text: v })}
            placeholder="your words"
            placeholderTextColor={Colors.ink3}
            maxLength={FLAG_TEXT_MAX}
            style={styles.textInput}
            autoFocus={isNew}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          <Pressable onPress={save} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>{isNew ? 'add' : 'done'}</Text>
          </Pressable>
        </View>
      )}

      {draft && !isNew && (
        <Pressable onPress={() => remove(draft.id)} hitSlop={6}>
          <Text style={styles.removeText}>remove this flag</Text>
        </Pressable>
      )}

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.pickOverlay} onPress={() => setPickerOpen(false)} />
        <View style={styles.pickSheetWrap} pointerEvents="box-none">
          <View style={[styles.pickSheet, SheetColumn]}>
            <Text style={styles.pickTitle}>flag</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Pressable style={styles.pickRow} onPress={pickImage}>
                <View style={styles.pickUpload}>
                  <Text style={styles.pickUploadPlus}>+</Text>
                </View>
                <Text style={styles.pickLabel}>upload your own image</Text>
              </Pressable>
              <Pressable
                style={[styles.pickRow, !draft?.flag && !draft?.imageUrl && styles.pickRowActive]}
                onPress={() => pick('')}
              >
                <View style={styles.pickNoneBox}>
                  <Text style={styles.pickNone}>—</Text>
                </View>
                <Text style={styles.pickLabel}>none — words only</Text>
              </Pressable>
              {FLAG_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  style={[styles.pickRow, draft?.flag === opt.key && styles.pickRowActive]}
                  onPress={() => pick(opt.key)}
                >
                  <FlagIcon colors={opt.colors!} width={28} height={18} />
                  <Text style={styles.pickLabel}>{opt.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'flex-end' },
  headerCancel: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink3 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep,
    borderWidth: 1, borderColor: Colors.line,
    maxWidth: '100%',
  },
  chipActive: { borderColor: Colors.sakuraDeep, backgroundColor: Colors.sakuraSoft },
  chipText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink, flexShrink: 1 },
  addChip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1.4, borderColor: Colors.line, borderStyle: 'dashed',
  },
  addChipText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink3 },

  markImg: { width: 18, height: 12, borderRadius: 2 },
  markGlyph: { fontSize: sf(13), color: Colors.ink2 },

  editorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: {
    width: 38, height: 38,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.pill, borderWidth: 1.4, borderColor: Colors.line,
    backgroundColor: Colors.vellum,
  },
  swatchEmpty: { borderStyle: 'dashed' },
  swatchNone: { fontSize: sf(14), color: Colors.ink3 },
  textInput: {
    flex: 1, height: 38,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.vellum,
    paddingHorizontal: Spacing.s3,
    fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink,
  },
  doneBtn: {
    height: 38, paddingHorizontal: Spacing.s4,
    borderRadius: Radius.pill, backgroundColor: Colors.sakuraDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  doneBtnText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12.5), color: '#fff' },

  removeText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ember, alignSelf: 'center' },

  // the picker itself — same shape as the F/O picker in onboarding/persona.tsx
  pickOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pickSheetWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', padding: Spacing.s6,
  },
  pickSheet: {
    width: '100%', maxWidth: 300, maxHeight: '76%',
    backgroundColor: Colors.paper, borderRadius: Radius.r4,
    padding: Spacing.s3, gap: 2,
  },
  pickTitle: {
    fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: Colors.ink,
    textAlign: 'center', marginBottom: 4,
  },
  pickRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 9, paddingHorizontal: 8,
    borderRadius: Radius.r3,
  },
  pickRowActive: { backgroundColor: Colors.sakuraSoft },
  pickLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.ink, flexShrink: 1 },
  pickNoneBox: { width: 28, alignItems: 'center' },
  pickNone: { fontSize: sf(15), color: Colors.ink3 },
  pickUpload: {
    width: 28, height: 18, borderRadius: 2,
    borderWidth: 1.4, borderColor: Colors.line, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  pickUploadPlus: { fontSize: sf(13), color: Colors.ink3, lineHeight: sf(15) },
});
