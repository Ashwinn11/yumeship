import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiniHC } from '@/components/cards/MiniHC';
import { Heart } from '@/components/deco/Heart';
import { Pin } from '@/components/deco/Pin';
import { Sparkle } from '@/components/deco/Sparkle';
import { WashiTape } from '@/components/deco/WashiTape';
import { SubTabBar, type DetailTab } from '@/components/nav/SubTabBar';
import { Chip } from '@/components/ui/Chip';
import { GradientCover } from '@/components/ui/GradientCover';
import { IconEdit } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export default function ShipDetail() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<DetailTab>('profile');

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* App bar */}
      <View style={styles.appBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.appBarTitle}>YOUR SHIP</Text>
        <Pressable>
          <IconEdit size={14} color={Colors.ink2} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero cover */}
        <GradientCover
          gradStart="#f3b6c4"
          gradEnd="#6b3d5b"
          style={styles.hero}
        >
          <Text style={styles.heroInitial}>·</Text>

          <View style={styles.heroTape}>
            <WashiTape width={90} height={18} pattern="heart" color="rgba(255,255,255,0.9)" rotate={-5} />
          </View>

          <View style={styles.heroPin}>
            <Pin size={13} color={Colors.sakuraDeep} />
          </View>

          <View style={styles.heroSparkle1}>
            <Sparkle size={14} color={Colors.butter} />
          </View>
          <View style={styles.heroSparkle2}>
            <Sparkle size={8} color={Colors.butterSoft} />
          </View>

          <View style={styles.heroChips}>
            <Chip color={Colors.sakuraDeep} bg="rgba(255,255,255,0.92)">romantic</Chip>
            <Chip color={Colors.lavenderDeep} bg="rgba(255,255,255,0.92)">mirror</Chip>
          </View>
        </GradientCover>

        {/* Name block */}
        <View style={styles.nameBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>—</Text>
          </View>
        </View>

        {/* Sub-tab bar */}
        <SubTabBar active={activeTab} onPress={setActiveTab} />

        {/* Profile content */}
        <View style={styles.profileContent}>
          {/* Anniversary — placeholder */}
          <View style={styles.anniversary}>
            <View style={styles.anniversaryLeft}>
              <Heart size={11} color={Colors.sakuraDeep} />
              <Text style={styles.anniversaryText}>add a start date</Text>
            </View>
          </View>

          {/* About */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionLabel}>about</Text>
          </View>

          {/* Headcanons */}
          <View style={styles.hcSection}>
            <View style={styles.hcHeader}>
              <Text style={styles.sectionLabel}>headcanons · 0</Text>
            </View>
            <View style={styles.hcRow}>
              <MiniHC ja="性" label="Personality" count={0} color={Colors.sakuraDeep} />
              <MiniHC ja="癖" label="Habits" count={0} color={Colors.lavenderDeep} />
              <MiniHC ja="好" label="Favorites" count={0} color={Colors.butterDeep} />
              <MiniHC ja="逢" label="How met" count={0} color={Colors.peachDeep} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  appBar: {
    paddingHorizontal: Spacing.s5,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  back: {
    fontSize: 22,
    color: Colors.ink2,
    fontFamily: FontFamily.ui,
  },
  appBarTitle: {
    fontFamily: FontFamily.marker,
    fontSize: 10,
    color: Colors.ink3,
    letterSpacing: 1.4,
  },
  scroll: {
    flex: 1,
  },
  hero: {
    marginHorizontal: Spacing.s4,
    height: 180,
    borderRadius: Radius.r4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInitial: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 100,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 100,
  },
  heroTape: {
    position: 'absolute',
    top: -2,
    left: 14,
  },
  heroPin: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: Colors.vellum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSparkle1: {
    position: 'absolute',
    top: 30,
    right: 50,
  },
  heroSparkle2: {
    position: 'absolute',
    top: 50,
    right: 65,
  },
  heroChips: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  nameBlock: {
    paddingHorizontal: Spacing.s5,
    paddingTop: 12,
    paddingBottom: Spacing.s1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 32,
    lineHeight: 33,
    color: Colors.ink,
  },
  polyculeTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(110,58,90,0.1)',
    borderRadius: Radius.pill,
  },
  polyculeText: {
    fontSize: 9,
    fontFamily: FontFamily.marker,
    color: Colors.plum,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  nameJa: {
    fontFamily: FontFamily.ja,
    fontSize: FontSize.caption,
    color: Colors.ink2,
    marginTop: 2,
  },
  profileContent: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s1,
    paddingBottom: Spacing.s6,
    gap: 12,
  },
  anniversary: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.sakuraSoft,
    borderWidth: 1,
    borderColor: Colors.sakura,
    borderRadius: Radius.r3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  anniversaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  anniversaryText: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 14,
    color: Colors.sakuraDeep,
  },
  anniversaryDate: {
    fontFamily: FontFamily.marker,
    fontSize: 9,
    color: Colors.sakuraDeep,
  },
  sectionLabel: {
    fontFamily: FontFamily.marker,
    fontSize: 9,
    color: Colors.ink3,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  aboutSection: {
    gap: 4,
  },
  aboutText: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 14,
    color: Colors.ink2,
    lineHeight: 21,
  },
  hcSection: {
    gap: 6,
  },
  hcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    fontSize: 10,
    color: Colors.sakuraDeep,
    fontWeight: '600',
    fontFamily: FontFamily.ui,
  },
  hcRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
