import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sakura } from '@/components/deco/Sakura';
import { IconChevronLeft } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.decoTR} pointerEvents="none"><Sakura size={26} color={Colors.sakura} /></View>
      <View style={styles.decoBR} pointerEvents="none"><Sakura size={18} color={Colors.sakura} /></View>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} id="terms-back">
          <IconChevronLeft size={14} color={Colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Terms of Service</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Last updated: May 27, 2025</Text>

        <Section title="1. Acceptance of Terms">
          By downloading, installing, or using Yumeship ("App"), you agree to be bound by these
          Terms of Service. If you do not agree, please do not use the App.
        </Section>

        <Section title="2. Use of the App">
          Yumeship is a personal creative companion app intended for users 13 years of age and
          older. You agree to use the App only for lawful, personal, non-commercial purposes.
          You are solely responsible for any content you create within the App.
        </Section>

        <Section title="3. Subscriptions & Payments">
          Yumeship offers auto-renewable subscriptions through Apple's App Store. Subscription
          prices and available plans are displayed in the App and may change. Payment is charged
          to your Apple ID at confirmation of purchase. Subscriptions renew automatically unless
          cancelled at least 24 hours before the end of the current period. You can manage and
          cancel subscriptions in your Apple ID Account Settings. No refunds are provided for
          unused portions of a subscription period, except as required by applicable law.
        </Section>

        <Section title="4. Free Trials">
          Free trials, where offered, are available to new subscribers only. If you do not cancel
          before the trial ends, you will be charged the standard subscription price. Trial
          eligibility is determined at runtime by our payment processor (RevenueCat).
        </Section>

        <Section title="5. Intellectual Property">
          The App and its original content, features, and functionality are owned by Yumeship and
          are protected by applicable intellectual property laws. Content you create inside the App
          remains yours. You grant us no rights to your creative content.
        </Section>

        <Section title="6. Privacy">
          Your use of the App is also governed by our Privacy Policy. All personal data is
          processed in accordance with that policy.
        </Section>

        <Section title="7. Disclaimer of Warranties">
          The App is provided "as is" without warranties of any kind, express or implied. We do
          not warrant that the App will be uninterrupted, error-free, or free of viruses.
        </Section>

        <Section title="8. Limitation of Liability">
          To the fullest extent permitted by law, Yumeship shall not be liable for any indirect,
          incidental, special, or consequential damages arising from your use of the App.
        </Section>

        <Section title="9. Changes to Terms">
          We reserve the right to update these Terms at any time. Continued use of the App after
          changes constitutes acceptance of the new Terms.
        </Section>

        <Section title="10. Contact">
          For questions about these Terms, contact us at: support@yumeship.app
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
    fontFamily: FontFamily.displayItalic, fontSize: 22, color: Colors.ink, flex: 1,
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
