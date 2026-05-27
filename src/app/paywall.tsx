import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PACKAGE_TYPE, PurchasesPackage } from 'react-native-purchases';

import { Heart } from '@/components/deco/Heart';
import { Sakura } from '@/components/deco/Sakura';
import { SparkleCluster } from '@/components/deco/SparkleCluster';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import {
  getAvailablePackages,
  getIntroOfferInfo,
  isPremium,
  purchasePackage,
  restorePurchases,
} from '@/store/purchases';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function periodLabel(pkg: PurchasesPackage): string {
  const p = pkg.product.subscriptionPeriod ?? '';
  if (p === 'P1W') return 'week';
  if (p === 'P1M') return 'month';
  if (p === 'P3M') return '3 months';
  if (p === 'P6M') return '6 months';
  if (p === 'P1Y') return 'year';
  // lifetime / custom — no renewal period
  return '';
}

// Builds the trial label string from RevenueCat introPrice — fully dynamic.
// Returns null if: user not eligible, no trial configured, or intro was removed.
function trialLabel(pkg: PurchasesPackage): string | null {
  const intro = getIntroOfferInfo(pkg);
  if (!intro) return null;
  const { periodUnit, periodUnits, price, isFree } = intro;
  if (isFree) {
    // Free trial — days derived from RevenueCat period fields
    const days =
      periodUnit === 'DAY' ? periodUnits :
      periodUnit === 'WEEK' ? periodUnits * 7 :
      null;
    if (days) return `${days} days free`;
    if (periodUnit === 'MONTH') return `${periodUnits} month${periodUnits > 1 ? 's' : ''} free`;
    return 'free trial';
  }
  // Paid intro offer
  return `${price} intro offer`;
}

// True only when the plan has a genuinely free (price=0) trial for this user.
// RevenueCat already sets introPrice=null when the user is ineligible.
function hasFreeIntro(pkg: PurchasesPackage | null): boolean {
  if (!pkg) return false;
  return getIntroOfferInfo(pkg)?.isFree === true;
}

function getSavingsVsWeekly(
  pkg: PurchasesPackage,
  weeklyPkg?: PurchasesPackage,
): { weeklyEquivalent: string; strikethroughPrice: string; savePercent: number } | null {
  const price = pkg.product.price;
  const weeklyPrice = weeklyPkg?.product.price;
  const priceString = pkg.product.priceString;
  
  if (!price || !weeklyPrice) return null;

  const isWeekly =
    pkg.packageType === PACKAGE_TYPE.WEEKLY ||
    pkg.identifier === '$rc_weekly' ||
    pkg.identifier.toLowerCase().includes('weekly') ||
    pkg.product.identifier.toLowerCase().includes('weekly');

  if (isWeekly) return null;

  const isAnnual =
    pkg.packageType === PACKAGE_TYPE.ANNUAL ||
    pkg.identifier === '$rc_annual' ||
    pkg.identifier.toLowerCase().includes('annual') ||
    pkg.product.identifier.toLowerCase().includes('annual');

  const isMonthly =
    pkg.packageType === PACKAGE_TYPE.MONTHLY ||
    pkg.identifier === '$rc_monthly' ||
    pkg.identifier.toLowerCase().includes('monthly') ||
    pkg.product.identifier.toLowerCase().includes('monthly');

  let weeks = 1;
  if (isAnnual) {
    weeks = 52;
  } else if (isMonthly) {
    weeks = 4;
  } else {
    return null;
  }

  const weeklyEquiv = price / weeks;
  const strikethrough = weeklyPrice * weeks;
  const savePct = Math.round(((strikethrough - price) / strikethrough) * 100);

  // Extract currency symbol
  const match = priceString.match(/^[^\d\s]+/);
  const symbol = match?.[0] || '$';

  return {
    weeklyEquivalent: `${symbol}${weeklyEquiv.toFixed(2)}`,
    strikethroughPrice: `${symbol}${strikethrough.toFixed(2)}`,
    savePercent: savePct,
  };
}

function getWeeklyEquivalentOnly(pkg: PurchasesPackage): string | null {
  const price = pkg.product.price;
  const priceString = pkg.product.priceString;
  if (!price || !priceString) return null;

  const isWeekly =
    pkg.packageType === PACKAGE_TYPE.WEEKLY ||
    pkg.identifier === '$rc_weekly' ||
    pkg.identifier.toLowerCase().includes('weekly') ||
    pkg.product.identifier.toLowerCase().includes('weekly');

  if (isWeekly) return null;

  const isAnnual =
    pkg.packageType === PACKAGE_TYPE.ANNUAL ||
    pkg.identifier === '$rc_annual' ||
    pkg.identifier.toLowerCase().includes('annual') ||
    pkg.product.identifier.toLowerCase().includes('annual');

  const isMonthly =
    pkg.packageType === PACKAGE_TYPE.MONTHLY ||
    pkg.identifier === '$rc_monthly' ||
    pkg.identifier.toLowerCase().includes('monthly') ||
    pkg.product.identifier.toLowerCase().includes('monthly');

  let weeks = 1;
  if (isAnnual) {
    weeks = 52;
  } else if (isMonthly) {
    weeks = 4;
  } else {
    return null;
  }

  const weeklyEquiv = price / weeks;
  const match = priceString.match(/^[^\d\s]+/);
  const symbol = match?.[0] || '$';
  return `${symbol}${weeklyEquiv.toFixed(2)}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    (async () => {
      const already = await isPremium();
      if (already) { router.back(); return; }
      const pkgs = await getAvailablePackages();
      // filter out all plans except annual, monthly, and weekly
      const filtered = pkgs.filter((p) => {
        const isWeekly =
          p.packageType === PACKAGE_TYPE.WEEKLY ||
          p.identifier === '$rc_weekly' ||
          p.identifier.toLowerCase().includes('weekly') ||
          p.product.identifier.toLowerCase().includes('weekly');

        const isAnnual =
          p.packageType === PACKAGE_TYPE.ANNUAL ||
          p.identifier === '$rc_annual' ||
          p.identifier.toLowerCase().includes('annual') ||
          p.product.identifier.toLowerCase().includes('annual');

        const isMonthly =
          p.packageType === PACKAGE_TYPE.MONTHLY ||
          p.identifier === '$rc_monthly' ||
          p.identifier.toLowerCase().includes('monthly') ||
          p.product.identifier.toLowerCase().includes('monthly');

        return isWeekly || isAnnual || isMonthly;
      });

      // sort annual first, then monthly, then weekly
      const sorted = [...filtered].sort((a, b) => {
        const getOrder = (p: PurchasesPackage) => {
          const isAnnual =
            p.packageType === PACKAGE_TYPE.ANNUAL ||
            p.identifier === '$rc_annual' ||
            p.identifier.toLowerCase().includes('annual') ||
            p.product.identifier.toLowerCase().includes('annual');

          const isMonthly =
            p.packageType === PACKAGE_TYPE.MONTHLY ||
            p.identifier === '$rc_monthly' ||
            p.identifier.toLowerCase().includes('monthly') ||
            p.product.identifier.toLowerCase().includes('monthly');

          if (isAnnual) return 0;
          if (isMonthly) return 1;
          return 2; // weekly
        };
        return getOrder(a) - getOrder(b);
      });

      setPackages(sorted);
      // pre-select the annual (first) package if available
      if (sorted.length > 0) setSelected(sorted[0]);
      setLoading(false);
    })();
  }, []);

  async function handlePurchase() {
    if (!selected) return;
    setPurchasing(true);
    try {
      const result = await purchasePackage(selected);
      if (result.success) {
        Alert.alert('🎉 Welcome to Premium!', 'Your subscription is now active.', [
          { text: 'Continue', onPress: () => router.back() },
        ]);
      } else if (!result.cancelled) {
        Alert.alert('Purchase failed', result.error ?? 'Something went wrong. Please try again.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong.');
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const { isPremium: active } = await restorePurchases();
      if (active) {
        Alert.alert('Restored!', 'Your premium subscription has been restored.', [
          { text: 'Continue', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Nothing to restore', 'No active subscription found for this Apple ID.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not restore purchases.');
    } finally {
      setRestoring(false);
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Sakura deco accents */}
      <View style={styles.decoTL} pointerEvents="none">
        <Sakura size={30} color={Colors.sakura} />
      </View>
      <View style={styles.decoBR} pointerEvents="none">
        <Sakura size={22} color={Colors.lavenderSoft} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()} id="paywall-close">
          <Text style={styles.closeTxt}>✕</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroRow}>
          <SparkleCluster color={Colors.sakuraDeep} />
        </View>
        <View style={styles.heroEyebrow}>
          <Heart size={12} color={Colors.sakuraDeep} />
          <Text style={styles.eyebrowTxt}>yumeship premium</Text>
        </View>
        <Text style={styles.heroTitle}>unlock everything</Text>
        <Text style={styles.heroSub}>
          Unlimited ships, priority support and every feature we ship — forever.
        </Text>

        {/* Features */}
        {[
          'Unlimited ships & headcanons',
          'Priority support & updates',
          'F/O message scheduling',
          'All future features included',
        ].map((f) => (
          <View key={f} style={styles.featureRow}>
            <Text style={styles.featureDot}>♡</Text>
            <Text style={styles.featureTxt}>{f}</Text>
          </View>
        ))}

        {/* Plans — 100% dynamic from RevenueCat */}
        {loading ? (
          <ActivityIndicator color={Colors.sakuraDeep} style={{ marginTop: 32 }} />
        ) : packages.length === 0 ? (
          <Text style={styles.noPlans}>No plans available right now.</Text>
        ) : (
          <View style={styles.plans}>
            {packages.map((pkg) => {
              const isSel = selected?.identifier === pkg.identifier;
              const trial = trialLabel(pkg);
              const period = periodLabel(pkg);
              const weeklyPkg = packages.find(p => 
                p.packageType === PACKAGE_TYPE.WEEKLY ||
                p.identifier === '$rc_weekly' ||
                p.identifier.toLowerCase().includes('weekly') ||
                p.product.identifier.toLowerCase().includes('weekly')
              );
              const savings = getSavingsVsWeekly(pkg, weeklyPkg);
              const isWeekly =
                pkg.packageType === PACKAGE_TYPE.WEEKLY ||
                pkg.identifier === '$rc_weekly' ||
                pkg.identifier.toLowerCase().includes('weekly') ||
                pkg.product.identifier.toLowerCase().includes('weekly');

              const isAnnual =
                pkg.packageType === PACKAGE_TYPE.ANNUAL ||
                pkg.identifier === '$rc_annual' ||
                pkg.identifier.toLowerCase().includes('annual') ||
                pkg.product.identifier.toLowerCase().includes('annual');

              const isMonthly =
                pkg.packageType === PACKAGE_TYPE.MONTHLY ||
                pkg.identifier === '$rc_monthly' ||
                pkg.identifier.toLowerCase().includes('monthly') ||
                pkg.product.identifier.toLowerCase().includes('monthly');

              const displayTitle = isAnnual ? 'Yearly' : isMonthly ? 'Monthly' : 'Weekly';

              return (
                <Pressable
                  key={pkg.identifier}
                  style={[styles.planCard, isSel && styles.planCardSel]}
                  onPress={() => setSelected(pkg)}
                  id={`plan-${pkg.identifier}`}
                >
                  {/* Save % badge */}
                  {savings && savings.savePercent > 0 && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsTxt}>
                        SAVE {savings.savePercent}%
                      </Text>
                    </View>
                  )}

                  <View style={styles.planCardRow}>
                    {/* Left Column */}
                    <View style={styles.planLeft}>
                      <View style={styles.planNameRow}>
                        <Text style={[styles.planName, isSel && styles.planNameSel]}>
                          {displayTitle}
                        </Text>
                        {trial && (
                          <View style={styles.trialInlineBadge}>
                            <Text style={styles.trialInlineTxt}>{trial.toUpperCase()}</Text>
                          </View>
                        )}
                      </View>
                      
                      {isWeekly ? (
                        <Text style={styles.planSubLabel}>billed weekly</Text>
                      ) : savings ? (
                        <Text style={styles.planSubLabel}>
                          {savings.weeklyEquivalent}/week
                        </Text>
                      ) : (() => {
                        const calculatedEquiv = getWeeklyEquivalentOnly(pkg);
                        return calculatedEquiv ? (
                          <Text style={styles.planSubLabel}>
                            {calculatedEquiv}/week
                          </Text>
                        ) : (
                          <Text style={styles.planSubLabel}>billed monthly</Text>
                        );
                      })()}
                    </View>

                    {/* Right Column */}
                    <View style={styles.planRight}>
                      {savings && (
                        <Text style={styles.strikethroughPrice}>
                          {savings.strikethroughPrice}
                          {period ? ` / ${period}` : ''}
                        </Text>
                      )}
                      <Text style={[styles.planPrice, isSel && styles.planPriceSel]}>
                        {pkg.product.priceString}
                        {period ? <Text style={styles.planPeriod}> / {period}</Text> : null}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* CTA */}
        <Pressable
          style={[styles.ctaBtn, (!selected || purchasing) && styles.ctaBtnDisabled]}
          onPress={handlePurchase}
          disabled={!selected || purchasing}
          id="paywall-subscribe"
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (() => {
            if (!selected) return <Text style={styles.ctaTxt}>Subscribe now</Text>;
            const trial = trialLabel(selected);
            const period = periodLabel(selected);
            const price = selected.product.priceString;
            const suffix = period ? `${price}/${period}` : price;
            return (
              <Text style={styles.ctaTxt}>
                {trial ? `Try ${trial}, then ${suffix}` : `Continue for ${suffix}`}
              </Text>
            );
          })()}
        </Pressable>

        {/* Sub-CTA note — "No payment due now" only for free trials */}
        <Text style={styles.subNote}>
          {hasFreeIntro(selected)
            ? 'No payment due now · Cancel anytime'
            : 'Cancel anytime'}
        </Text>

        {/* Footer row: Restore | Terms | Privacy */}
        <View style={styles.footerRow}>
          <Pressable onPress={handleRestore} disabled={restoring} id="paywall-restore">
            <Text style={styles.footerLink}>{restoring ? 'Restoring…' : 'Restore'}</Text>
          </Pressable>
          <Text style={styles.footerSep}>|</Text>
          <Pressable onPress={() => router.push('/terms' as any)} id="paywall-terms">
            <Text style={styles.footerLink}>Terms</Text>
          </Pressable>
          <Text style={styles.footerSep}>|</Text>
          <Pressable onPress={() => router.push('/privacy' as any)} id="paywall-privacy">
            <Text style={styles.footerLink}>Privacy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  decoTL: { position: 'absolute', top: 80, left: 18, opacity: 0.5 },
  decoBR: { position: 'absolute', bottom: 140, right: 24, opacity: 0.4 },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.s5,
    paddingVertical: Spacing.s3,
  },
  closeBtn: { padding: 6 },
  closeTxt: { fontSize: 16, color: Colors.ink3, fontFamily: FontFamily.ui },

  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s9 + 20 },

  heroRow: { alignItems: 'flex-start', marginBottom: 4 },
  heroEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  eyebrowTxt: {
    fontFamily: FontFamily.marker, fontSize: 9, color: Colors.sakuraDeep,
    letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '600',
  },
  heroTitle: {
    fontFamily: FontFamily.displayItalic, fontSize: 34, lineHeight: 38,
    color: Colors.ink, marginBottom: Spacing.s2,
  },
  heroSub: {
    fontFamily: FontFamily.ui, fontSize: FontSize.body, color: Colors.ink2,
    lineHeight: 22, marginBottom: Spacing.s4,
  },

  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureDot: { fontSize: 12, color: Colors.sakuraDeep },
  featureTxt: { fontFamily: FontFamily.ui, fontSize: FontSize.caption, color: Colors.ink },

  plans: { gap: 10, marginTop: Spacing.s4 },
  planCard: {
    borderWidth: 1.5, borderColor: Colors.line, borderRadius: Radius.r3,
    padding: Spacing.s4, backgroundColor: Colors.vellum, position: 'relative',
  },
  planCardSel: { borderColor: Colors.sakuraDeep, backgroundColor: Colors.sakuraSoft },
  trialBadge: {
    position: 'absolute', top: -10, right: 12,
    backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill,
    paddingVertical: 2, paddingHorizontal: 10,
  },
  trialTxt: { fontFamily: FontFamily.uiSemiBold, fontSize: 10, color: '#fff' },
  planName: {
    fontFamily: FontFamily.uiSemiBold, fontSize: 13, color: Colors.ink,
  },
  planNameSel: { color: Colors.sakuraDeep },
  planPrice: {
    fontFamily: FontFamily.displayItalic, fontSize: 20, color: Colors.ink,
  },
  planPriceSel: { color: Colors.ink },
  planPeriod: {
    fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink2,
  },
  planDesc: {
    fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink3, marginTop: 4,
  },
  planCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  planLeft: {
    flex: 1,
    gap: 2,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  trialInlineBadge: {
    backgroundColor: Colors.butter,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.r2,
    borderWidth: 1.5,
    borderColor: Colors.sakuraDeep,
    transform: [{ rotate: '1.5deg' }],
  },
  trialInlineTxt: {
    fontFamily: FontFamily.uiSemiBold,
    fontSize: 8,
    color: Colors.sakuraDeep,
    fontWeight: '800',
  },
  planSubLabel: {
    fontFamily: FontFamily.ui,
    fontSize: 11,
    color: Colors.ink2,
    opacity: 0.75,
    marginTop: 2,
  },
  planRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  strikethroughPrice: {
    fontFamily: FontFamily.ui,
    fontSize: 11,
    color: Colors.ink3,
    textDecorationLine: 'line-through',
    opacity: 0.65,
    marginBottom: 2,
  },
  savingsBadge: {
    position: 'absolute',
    top: -11,
    alignSelf: 'center',
    backgroundColor: Colors.sakuraDeep,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    transform: [{ rotate: '-2deg' }],
    zIndex: 20,
    shadowColor: Colors.sakuraDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 3,
  },
  savingsTxt: {
    fontFamily: FontFamily.uiSemiBold,
    fontSize: 9,
    color: '#fff',
    fontWeight: '900',
  },

  ctaBtn: {
    marginTop: Spacing.s5, backgroundColor: Colors.sakuraDeep,
    borderRadius: Radius.pill, paddingVertical: 15, alignItems: 'center',
  },
  ctaBtnDisabled: { opacity: 0.45 },
  ctaTxt: { fontFamily: FontFamily.uiSemiBold, fontSize: 15, color: '#fff' },

  subNote: {
    textAlign: 'center', marginTop: 10,
    fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink3,
  },

  footerRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 12, marginTop: Spacing.s5, marginBottom: Spacing.s2,
  },
  footerLink: {
    fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink3,
    textDecorationLine: 'underline',
  },
  footerSep: {
    fontFamily: FontFamily.ui, fontSize: 11, color: Colors.line,
  },
  noPlans: {
    textAlign: 'center', marginTop: 32,
    fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ink3,
  },
});
