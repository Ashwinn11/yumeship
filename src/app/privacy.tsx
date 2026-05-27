import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sakura } from '@/components/deco/Sakura';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.decoTL} pointerEvents="none"><Sakura size={26} color={Colors.sakura} /></View>
      <View style={styles.decoBR} pointerEvents="none"><Sakura size={18} color={Colors.lavenderSoft} /></View>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} id="privacy-back">
          <Text style={styles.backTxt}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Last updated: May 27, 2025</Text>

        <Section title="1. Information We Collect">
          Yumeship is designed to keep your data on your device. We do not collect personal
          information beyond what is strictly necessary. When you make a purchase, our payment
          processor (RevenueCat) receives a pseudonymous App User ID and purchase receipt — no
          name or email is shared with us.
        </Section>

        <Section title="2. Data Stored on Device">
          All creative content you generate in the App (ships, headcanons, messages, etc.) is
          stored locally in an on-device SQLite database. We do not have access to this content.
        </Section>

        <Section title="3. Notifications">
          If you grant notification permission, scheduled messages are stored locally in the iOS
          notification system. No notification content is transmitted to our servers.
        </Section>

        <Section title="4. Third-Party Services">
          We use RevenueCat to manage in-app subscriptions. RevenueCat processes purchase data
          and subscription status. Their privacy policy can be found at revenuecat.com/privacy.
          We do not use advertising SDKs or sell your data to third parties.
        </Section>

        <Section title="5. Analytics">
          We do not currently use analytics SDKs. If this changes, we will update this policy
          and notify users.
        </Section>

        <Section title="6. Children's Privacy">
          The App is not directed at children under 13. We do not knowingly collect data from
          children under 13. If you believe a child has provided us with information, please
          contact us.
        </Section>

        <Section title="7. Your Rights">
          You may delete all your data at any time via Settings → Delete all data. Since we do
          not collect personal data, there is no data to request from us.
        </Section>

        <Section title="8. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of significant
          changes via an in-app notice.
        </Section>

        <Section title="9. Contact">
          Questions or concerns? Reach us at: support@yumeship.app
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
    fontFamily: FontFamily.uiSemiBold, fontSize: 13, color: Colors.ink,
    marginBottom: 6, fontWeight: '600',
  },
  body: {
    fontFamily: FontFamily.ui, fontSize: FontSize.caption,
    color: Colors.ink2, lineHeight: 22,
  },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  decoTL: { position: 'absolute', top: 72, left: 16, opacity: 0.45 },
  decoBR: { position: 'absolute', bottom: 100, right: 20, opacity: 0.35 },
  header: {
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s3,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  backBtn: { marginBottom: Spacing.s2 },
  backTxt: { fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ink2 },
  title: {
    fontFamily: FontFamily.displayItalic, fontSize: 28, color: Colors.ink, lineHeight: 32,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s9,
  },
  updated: {
    fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink3,
    marginBottom: Spacing.s4,
  },
});
