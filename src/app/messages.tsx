import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconLock, IconSend } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [side, setSide] = useState<'me' | 'them'>('them');

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* App bar */}
      <View style={styles.appBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>

        <View style={styles.appBarCenter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>·</Text>
          </View>
          <View style={styles.appBarInfo}>
            <Text style={styles.appBarName}>messages</Text>
          </View>
        </View>

        <IconLock size={14} color={Colors.ink2} />
      </View>

      {/* Empty thread state */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.emptyContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.emptyText}>no messages yet</Text>
        <Text style={styles.emptySub}>write what you'd imagine them saying</Text>
      </ScrollView>

      {/* Composer */}
      <View style={styles.composer}>
        <View style={styles.sideToggle}>
          <Pressable
            onPress={() => setSide('me')}
            style={[styles.sideChip, side === 'me' ? styles.sideChipActive : styles.sideChipInactive]}
          >
            <Text style={[styles.sideChipText, side === 'me' && styles.sideChipTextActive]}>me</Text>
          </Pressable>
          <Pressable
            onPress={() => setSide('them')}
            style={[styles.sideChip, side === 'them' ? styles.sideChipActive : styles.sideChipInactive]}
          >
            <Text style={[styles.sideChipText, side === 'them' && styles.sideChipTextActive]}>them</Text>
          </Pressable>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={side === 'them' ? "write what they'd say…" : "write what you'd say…"}
            placeholderTextColor={Colors.ink3}
          />
          <Pressable style={styles.sendBtn}>
            <IconSend size={14} color={Colors.vellum} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paperDeep,
  },
  appBar: {
    paddingHorizontal: Spacing.s4,
    paddingVertical: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  back: {
    fontSize: 20,
    color: Colors.ink2,
    fontFamily: FontFamily.ui,
  },
  appBarCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.sakuraDeep,
  },
  avatarInitial: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 14,
    color: Colors.vellum,
  },
  appBarInfo: {
    gap: 1,
  },
  appBarName: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.bodyLg - 1,
    color: Colors.ink,
    lineHeight: 18,
  },
  appBarMeta: {
    fontFamily: FontFamily.marker,
    fontSize: 8,
    color: Colors.ink3,
    letterSpacing: 0.8,
  },
  scroll: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: Spacing.s9,
  },
  emptyText: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 18,
    color: Colors.ink3,
  },
  emptySub: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 13,
    color: Colors.ink3,
    opacity: 0.7,
  },
  composer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 10,
    backgroundColor: Colors.paper,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    gap: 8,
  },
  sideToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  sideChip: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
  },
  sideChipActive: {
    backgroundColor: Colors.sakuraDeep,
  },
  sideChipInactive: {
    backgroundColor: Colors.paperDeep,
  },
  sideChipText: {
    fontSize: 10,
    fontFamily: FontFamily.ui,
    color: Colors.ink2,
    fontWeight: '500',
  },
  sideChipTextActive: {
    color: Colors.vellum,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.pill,
    fontSize: FontSize.caption,
    fontFamily: FontFamily.displayItalic,
    color: Colors.ink,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
