import { Sakura } from '@/components/deco/Sakura';
import { IconChevronLeft } from '@/components/ui/Icon';
import { Colors, FontFamily, FontSize, Radius, Spacing ,sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.decoTR} pointerEvents="none"><Sakura size={26} color={Colors.sakura} /></View>
      <View style={styles.decoBR} pointerEvents="none"><Sakura size={18} color={Colors.sakura} /></View>
      <View style={[styles.header, column]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} id="terms-back">
          <IconChevronLeft size={14} color={Colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Terms of Service</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, column]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Last updated: September 14, 2026</Text>

        {Platform.OS === 'ios' ? (
          <Section title="1. Licensed Application EULA">
            Yumeship is licensed to you under Apple's standard End User License Agreement (EULA).
            The EULA applies to your use of this App and is available at:
            https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
          </Section>
        ) : null}

        <Section title="2. Your account">
          Some parts of Yumeship — posting, groups, public profiles — require a community account.
          You're responsible for the activity on your account and for keeping your login secure.
          You must be at least 17 to create one, consistent with the app's age rating.
        </Section>

        <Section title="3. Community conduct">
          You agree not to use the community feature to harass or target another person or their
          F/O, post sexual content involving minors, post hate speech or content promoting
          violence, impersonate another person, post spam or unrelated content, repeatedly
          interact with someone who has a stated DNI in a targeted way, or share another person's
          private information without consent. We may remove content, suspend, or terminate
          accounts that violate these rules.
        </Section>

        <Section title="4. Reporting and enforcement">
          You can report posts, comments, messages, and profiles you believe violate these terms.
          We review reports and may remove content, warn a user, or suspend or terminate an
          account as a result. You can also block another user to stop seeing their content.
        </Section>

        <Section title="5. Your content">
          You own what you create — your private journal, and anything you post to the community
          (posts, comments, profile content, photos). By posting to the community feature, you
          give other users permission to view that content as intended by the feature it's posted
          in, and you give us the license needed to store, display, and transmit it as part of
          operating the app. This license ends when you delete the content or your account. Your
          private, on-device journal is never covered by this license, since we never receive it.
        </Section>

        <Section title="6. Subscriptions">
          {Platform.OS === 'ios'
            ? "Yumeship Premium is an auto-renewable subscription sold through Apple's App Store. " +
              'Payment is charged to your Apple ID at confirmation of purchase. Subscriptions renew ' +
              'automatically unless cancelled at least 24 hours before the end of the current period. ' +
              'Manage or cancel anytime in your Apple ID Account Settings.'
            : 'Yumeship Premium is an auto-renewable subscription sold through Google Play. ' +
              'Payment is charged to your Google account at confirmation of purchase. Subscriptions renew ' +
              'automatically unless cancelled at least 24 hours before the end of the current period. ' +
              'Manage or cancel anytime in Google Play subscription settings.'}
        </Section>

        <Section title="7. Termination">
          You can delete your account at any time from within the app. We may suspend or
          terminate your access to the community feature if you violate these terms. Your
          private, on-device journal is unaffected by any action we take on your community
          account.
        </Section>

        <Section title="8. Contact">
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
    marginBottom: 6,
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
