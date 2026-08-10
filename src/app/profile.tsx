import { router, useFocusEffect } from 'expo-router';
import { MEDIA_IMAGE } from '@/lib/imageProps';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sakura } from '@/components/deco/Sakura';
import { Sparkle } from '@/components/deco/Sparkle';
import { CardThemeSheet } from '@/components/profile/CardThemeSheet';
import type { CardTheme } from '@/components/profile/cardTheme';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { IconEdit, IconPalette } from '@/components/ui/Icon';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { getGlobalSetting, saveGlobalSetting } from '@/store/onboarding';
import { usePremium } from '@/store/premium';
import { parseGallery, useFos } from '@/store/fo';

function readMe() {
  return {
    name: getGlobalSetting('user_name'),
    pronouns: getGlobalSetting('user_pronouns', 'she/her'),
    username: getGlobalSetting('user_username'),
    color: getGlobalSetting('user_color') || Colors.sakura,
    avatar: getGlobalSetting('user_avatar'),
    bio: getGlobalSetting('user_bio'),
    height: getGlobalSetting('user_height'),
    weight: getGlobalSetting('user_weight'),
    song: getGlobalSetting('user_song'),
    songLink: getGlobalSetting('user_song_link'),
    gallery: parseGallery(getGlobalSetting('user_gallery')),
    pageBgColor: getGlobalSetting('user_page_bg_color'),
    pageBgImage: getGlobalSetting('user_page_bg_image'),
    cardBgColor: getGlobalSetting('user_card_bg_color'),
    cardBgImage: getGlobalSetting('user_card_bg_image'),
    cardBgGradient: getGlobalSetting('user_card_bg_gradient'),
    cardTransparent: getGlobalSetting('user_card_transparent') === '1',
    textColor: getGlobalSetting('user_text_color'),
    borderStyle: getGlobalSetting('user_border_style'),
    decoration: getGlobalSetting('user_decoration'),
    nameFont: getGlobalSetting('user_name_font'),
    statusLabel: getGlobalSetting('user_status_label'),
    identifyFoId: getGlobalSetting('user_identify_fo_id'),
  };
}

export default function MyProfileScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const [me, setMe] = useState(readMe);
  useFocusEffect(useCallback(() => { setMe(readMe()); }, []));
  const premium = usePremium();
  const [showCustomize, setShowCustomize] = useState(false);
  const fos = useFos();
  const pairedFo = fos.find((f) => f.id === me.identifyFoId);

  function handleThemeChange(patch: Partial<CardTheme>) {
    const keyMap = {
      pageBgColor: 'user_page_bg_color', pageBgImage: 'user_page_bg_image',
      cardBgColor: 'user_card_bg_color', cardBgImage: 'user_card_bg_image',
      cardBgGradient: 'user_card_bg_gradient',
      textColor: 'user_text_color',
      borderStyle: 'user_border_style',
      decoration: 'user_decoration',
      nameFont: 'user_name_font',
      statusLabel: 'user_status_label',
    } as const;
    for (const [k, v] of Object.entries(patch)) {
      if (k === 'cardTransparent') {
        saveGlobalSetting('user_card_transparent', v ? '1' : '');
        continue;
      }
      const mappedKey = keyMap[k as keyof typeof keyMap];
      if (mappedKey) saveGlobalSetting(mappedKey, (v as string) ?? '');
    }
    setMe((p) => ({ ...p, ...patch }));
  }

  const pageBg = me.pageBgImage || me.pageBgColor;

  const body = (
    <View style={[styles.screen, !pageBg && { backgroundColor: Colors.paper }]}>
      <View style={styles.decoTL} pointerEvents="none">
        <Sakura size={24} color={Colors.sakura} />
      </View>
      <View style={styles.decoBR} pointerEvents="none">
        <Sparkle size={16} color={Colors.lavenderDeep} />
      </View>

      <View style={[styles.header, { paddingTop: insets.top + Spacing.s1 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={22} />
          <Text style={styles.headerTitle}>my profile</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setShowCustomize(true)} style={styles.headerBtn}>
            <IconPalette size={13} color={Colors.ink2} />
          </Pressable>
          <Pressable onPress={() => router.push('/onboarding/persona?mode=edit' as any)} style={styles.headerBtn}>
            <IconEdit size={13} color={Colors.ink2} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, column, { paddingBottom: Spacing.s5 }]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard
          name={me.name || 'someone soft'}
          pronouns={me.pronouns}
          username={me.username}
          bio={me.bio}
          photoUri={me.avatar}
          fallbackColor={me.color}
          height={me.height}
          weight={me.weight}
          song={me.song}
          songLink={me.songLink}
          gallery={me.gallery}
          cardBgColor={me.cardBgColor}
          cardBgImage={me.cardBgImage}
          cardBgGradient={me.cardBgGradient}
          cardTransparent={me.cardTransparent}
          textColor={me.textColor}
          borderStyle={me.borderStyle}
          decoration={me.decoration}
          nameFont={me.nameFont}
          statusLabel={me.statusLabel}
          showPairedIdentity={!!pairedFo}
          pairedName={pairedFo?.name}
          pairedPronouns={pairedFo?.pronouns}
          pairedAvatarUri={pairedFo?.photoUri}
          pairedStatusLabel={pairedFo?.statusLabel}
        />
        <Text style={styles.footnote}>this is you, in their world ♡</Text>
      </ScrollView>

      <CardThemeSheet
        visible={showCustomize}
        onClose={() => setShowCustomize(false)}
        theme={{
          pageBgColor: me.pageBgColor, pageBgImage: me.pageBgImage,
          cardBgColor: me.cardBgColor, cardBgImage: me.cardBgImage,
          cardBgGradient: me.cardBgGradient, cardTransparent: me.cardTransparent,
          textColor: me.textColor,
          borderStyle: me.borderStyle, decoration: me.decoration,
          nameFont: me.nameFont, statusLabel: me.statusLabel,
        }}
        onChange={handleThemeChange}
        premium={premium}
      />
    </View>
  );

  if (me.pageBgImage) {
    return (
      <View style={styles.fill}>
        <Image source={{ uri: me.pageBgImage }} style={StyleSheet.absoluteFill} contentFit="cover" {...MEDIA_IMAGE} />
        {body}
      </View>
    );
  }
  if (me.pageBgColor) {
    return <View style={[styles.fill, { backgroundColor: me.pageBgColor }]}>{body}</View>;
  }
  return body;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  screen: { flex: 1, paddingBottom: Spacing.s1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  headerBtnText: { fontSize: sf(20), color: Colors.ink2, fontFamily: FontFamily.ui, lineHeight: sf(22) },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s6 },
  footnote: {
    fontFamily: FontFamily.script, fontSize: sf(15), color: Colors.ink3,
    textAlign: 'center', marginTop: Spacing.s4,
  },
  decoTL: { position: 'absolute', top: 120, left: 22 },
  decoBR: { position: 'absolute', bottom: 110, right: 28 },
});
