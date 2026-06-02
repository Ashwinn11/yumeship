import { Sakura } from '@/components/deco/Sakura';
import { IconChevronLeft } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Spacing ,sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.decoTR} pointerEvents="none"><Sakura size={26} color={Colors.sakura} /></View>
      <View style={styles.decoBR} pointerEvents="none"><Sakura size={18} color={Colors.sakura} /></View>
      <View style={[styles.header, column]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} id="privacy-back">
          <IconChevronLeft size={14} color={Colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, column]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Last updated: May 27, 2025</Text>

        <Section title="1. Your data stays on your device">
          Everything you create in Yumeship — ships, headcanons, letters, scenes — is stored
          locally on your device in an on-device database. We cannot see it, access it, or
          back it up. Deleting the App removes all of it permanently.
        </Section>

        <Section title="2. What we don't collect">
          We do not collect your name, email, or any creative content. We do not use advertising
          SDKs or sell data to third parties. There is no account system.
        </Section>

        <Section title="3. Subscriptions">
          When you subscribe, our payment processor (RevenueCat) receives a pseudonymous ID and
          your purchase receipt to verify your subscription status. No personal details are shared
          with us. RevenueCat's privacy policy: revenuecat.com/privacy.
        </Section>

        <Section title="4. Notifications">
          If you allow notifications, scheduled reminders are handled entirely on-device through
          iOS. Nothing is sent to our servers.
        </Section>

        <Section title="5. Deleting your data">
          Go to Settings → Delete all data to wipe everything from your device. Since we hold
          no data on our end, there is nothing further to request from us.
        </Section>

        <Section title="6. Contact">
          Questions? Reach us at: ashwinnanbazhagan@gmail.com
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={s.section}>
      <Text style={s.heading}>{title}</Text>
      <Text style={s.body}>{children}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginBottom: Spacing.s4 },
  heading: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink,
    marginBottom: 6, fontWeight: '600',
  },
  body: {
    fontFamily: FontFamily.ui, fontSize: FontSize.caption,
    color: Colors.ink2, lineHeight: 22,
  },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  decoTR: { position: 'absolute', top: 130, right: 16 },
  decoBR: { position: 'absolute', bottom: 100, right: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s3,
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3, paddingBottom: Spacing.s3,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontFamily: FontFamily.displayItalic, fontSize: sf(22), color: Colors.ink, flex: 1,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s9,
  },
  updated: {
    fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3,
    marginBottom: Spacing.s4,
  },
});
