import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PACKAGE_TYPE, PurchasesPackage } from 'react-native-purchases';

import { Heart } from '@/components/deco/Heart';
import { Sparkle } from '@/components/deco/Sparkle';
import {
  StickerSakuraBranch, StickerEnvelope, StickerWaxSeal, StickerHeartPatch,
} from '@/components/deco/Stickers';
import { WashiTape } from '@/components/deco/WashiTape';
import { CozyModal } from '@/components/ui';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { refreshPremium } from '@/store/premium';
import { requestReviewIfEligible } from '@/store/onboarding';
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
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; onClose?: () => void } | null>(null);

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
        await refreshPremium();
        requestReviewIfEligible();
        setAlertModal({
          title: '🎉 Welcome to Premium!',
          message: 'Your subscription is now active.',
          onClose: () => router.back(),
        });
      } else if (!result.cancelled) {
        setAlertModal({ title: 'Purchase failed', message: result.error ?? 'Something went wrong. Please try again.' });
      }
    } catch (e: any) {
      setAlertModal({ title: 'Error', message: e.message ?? 'Something went wrong.' });
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const { isPremium: active } = await restorePurchases();
      if (active) {
        await refreshPremium();
        setAlertModal({
          title: 'Restored! ✓',
          message: 'Your premium subscription has been restored.',
          onClose: () => router.back(),
        });
      } else {
        setAlertModal({ title: 'Nothing to restore', message: 'No active subscription found for this Apple ID.' });
      }
    } catch (e: any) {
      setAlertModal({ title: 'Error', message: e.message ?? 'Could not restore purchases.' });
    } finally {
      setRestoring(false);
    }
  }

  return (
    <View style={styles.screen}>
      {/* Close button */}
      <Pressable
        style={styles.closeBtn}
        onPress={() => router.back()}
        id="paywall-close"
      >
        <Text style={styles.closeTxt}>✕</Text>
      </Pressable>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          {/* scattered sparkles */}
          <View style={[styles.abs, { top: 8, left: 16 }]} pointerEvents="none">
            <Sparkle size={14} color={Colors.butterDeep} />
          </View>
          <View style={[styles.abs, { top: 0, right: 28 }]} pointerEvents="none">
            <Sparkle size={10} color={Colors.lavenderDeep} />
          </View>
          <View style={[styles.abs, { bottom: 12, right: 10 }]} pointerEvents="none">
            <Sparkle size={12} color={Colors.sakuraDeep} />
          </View>

          {/* sakura branch — top-left */}
          <View style={[styles.abs, { top: 26, left: 0, transform: [{ rotate: '-20deg' }] }]} pointerEvents="none">
            <StickerSakuraBranch size={64} />
          </View>

          {/* envelope — bottom-right */}
          <View style={[styles.abs, { bottom: 0, right: 4, transform: [{ rotate: '10deg' }] }]} pointerEvents="none">
            <StickerEnvelope size={48} />
          </View>

          {/* heart patch — left side */}
          <View style={[styles.abs, { bottom: 10, left: 8, transform: [{ rotate: '-8deg' }] }]} pointerEvents="none">
            <StickerHeartPatch size={38} />
          </View>

          {/* wax seal — top-right */}
          <View style={[styles.abs, { top: 34, right: 6, transform: [{ rotate: '12deg' }] }]} pointerEvents="none">
            <StickerWaxSeal size={36} />
          </View>

          {/* icon card */}
          <View style={styles.iconCard}>
            <WashiTape
              width={70} height={13} pattern="floral" color="#fadde5" rotate={-3}
              style={{ alignSelf: 'center', marginBottom: -6, zIndex: 1 }}
            />
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.heroIcon}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.heroTitle}>{'your F/O deserves\nthe full vault ♡'}</Text>
        <Text style={styles.heroSub}>
          every ship, every story, no limits.
        </Text>

        {/* Features card */}
        <View style={styles.featCard}>
          {[
            { icon: '♡', label: 'Unlimited ships — all your F/Os' },
            { icon: '♡', label: 'Unlimited scenarios — no story caps' },
            { icon: '♡', label: 'Albums, Storyline & Love Letters' },
            { icon: '♡', label: 'F/O notifications & date reminders' },
            { icon: '♡', label: 'Export & share templates to camera roll' },
          ].map((f, i, arr) => (
            <View key={f.label} style={[styles.featRow, i < arr.length - 1 && styles.featRowBorder]}>
              <View style={styles.featPill}>
                <Text style={styles.featPillTxt}>{f.icon}</Text>
              </View>
              <Text style={styles.featLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

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
                  style={[
                    styles.planCard,
                    isSel && styles.planCardSel,
                    isAnnual && styles.planCardAnnual,
                    isMonthly && styles.planCardMonthly,
                  ]}
                  onPress={() => setSelected(pkg)}
                  id={`plan-${pkg.identifier}`}
                >
                  {/* Floating SAVE % badge — annual & monthly */}
                  {savings && savings.savePercent > 0 && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsTxt}>SAVE {savings.savePercent}%</Text>
                    </View>
                  )}

                  {/* Annual deco — sparkles in corners */}
                  {isAnnual && (
                    <>
                      <View style={[styles.cardDeco, { top: 8, right: 10 }]} pointerEvents="none">
                        <Sparkle size={11} color={isSel ? Colors.sakuraDeep : Colors.sakura} />
                      </View>
                      <View style={[styles.cardDeco, { bottom: 8, right: 28 }]} pointerEvents="none">
                        <Sparkle size={7} color={isSel ? Colors.sakuraDeep : Colors.line} />
                      </View>
                      <View style={[styles.cardDeco, { top: 6, right: 26 }]} pointerEvents="none">
                        <Heart size={7} color={isSel ? Colors.sakuraDeep : Colors.sakura} />
                      </View>
                    </>
                  )}

                  {/* Monthly deco — small hearts */}
                  {isMonthly && (
                    <>
                      <View style={[styles.cardDeco, { top: 8, right: 12 }]} pointerEvents="none">
                        <Heart size={12} color={isSel ? Colors.lavenderDeep : Colors.lavender} />
                      </View>
                      <View style={[styles.cardDeco, { bottom: 8, right: 30 }]} pointerEvents="none">
                        <Sparkle size={7} color={isSel ? Colors.lavenderDeep : Colors.lavender} />
                      </View>
                    </>
                  )}

                  {/* Weekly deco */}
                  {isWeekly && (
                    <View style={[styles.cardDeco, { top: 8, right: 12 }]} pointerEvents="none">
                      <Sparkle size={9} color={Colors.line} />
                    </View>
                  )}

                  <View style={styles.planCardRow}>
                    {/* Left Column */}
                    <View style={styles.planLeft}>
                      <View style={styles.planNameRow}>
                        <Text style={[styles.planName, isSel && styles.planNameSel]}>
                          {displayTitle}
                        </Text>
                        {/* Trial badge */}
                        {trial && (
                          <View style={styles.trialInlineBadge}>
                            <Text style={styles.trialInlineTxt}>{trial.toUpperCase()}</Text>
                          </View>
                        )}
                        {/* Plan label badge */}
                        {isAnnual && (
                          <View style={[styles.planLabelBadge, styles.planLabelBadgeDeal]}>
                            <Text style={styles.planLabelTxt}>BEST DEAL</Text>
                          </View>
                        )}
                        {isMonthly && (
                          <View style={[styles.planLabelBadge, styles.planLabelBadgeFlex]}>
                            <Text style={[styles.planLabelTxt, { color: Colors.lavenderDeep }]}>MOST FLEXIBLE</Text>
                          </View>
                        )}
                      </View>

                      {isWeekly ? (
                        <Text style={styles.planSubLabel}>billed weekly · cancel anytime</Text>
                      ) : savings ? (
                        <Text style={styles.planSubLabel}>{savings.weeklyEquivalent}/week</Text>
                      ) : (() => {
                        const calculatedEquiv = getWeeklyEquivalentOnly(pkg);
                        return calculatedEquiv ? (
                          <Text style={styles.planSubLabel}>{calculatedEquiv}/week</Text>
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
            if (!selected) return <Text style={styles.ctaTxt}>Subscribe now ♡</Text>;
            const trial = trialLabel(selected);
            const period = periodLabel(selected);
            const price = selected.product.priceString;
            const suffix = period ? `${price} / ${period}` : price;
            return (
              <Text style={styles.ctaTxt}>
                {trial ? `Try free for ${trial.replace(' free', '')} →` : `Continue · ${suffix}`}
              </Text>
            );
          })()}
        </Pressable>

        {/* Sub-CTA note */}
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
      <CozyModal
        visible={!!alertModal}
        title={alertModal?.title}
        message={alertModal?.message}
        confirmText="OK"
        onClose={() => {
          const cb = alertModal?.onClose;
          setAlertModal(null);
          cb?.();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: Spacing.s4,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: { fontSize: 13, color: Colors.ink3, fontFamily: FontFamily.ui, lineHeight: 14 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s9 + 20 },

  heroSection: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
    marginTop: 4,
  },
  abs: { position: 'absolute' },
  iconCard: {
    alignItems: 'center',
    shadowColor: '#8b3a4a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  heroIcon: {
    width: 148,
    height: 148,
    borderRadius: 28,
  },
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
    fontFamily: FontFamily.script, fontSize: 17, color: Colors.ink2,
    lineHeight: 24, marginBottom: Spacing.s4,
  },

  featCard: {
    backgroundColor: Colors.sakuraSoft,
    borderRadius: Radius.r3,
    borderWidth: 1.5,
    borderColor: Colors.sakura,
    marginBottom: Spacing.s4,
    overflow: 'hidden',
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: Spacing.s4,
  },
  featRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.sakura,
  },
  featPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.sakuraDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featPillTxt: { fontSize: 10, color: '#fff' },
  featLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: 13, color: Colors.ink, flex: 1 },
  // kept for compat
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureDot: { fontSize: 12, color: Colors.sakuraDeep },
  featureTxt: { fontFamily: FontFamily.ui, fontSize: FontSize.caption, color: Colors.ink },

  plans: { gap: 14, marginTop: Spacing.s4 },
  planCard: {
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: Radius.r3,
    paddingVertical: Spacing.s4,
    paddingHorizontal: Spacing.s4,
    backgroundColor: Colors.vellum,
    position: 'relative',
  },
  planCardSel: { borderColor: Colors.sakuraDeep, backgroundColor: Colors.sakuraSoft },
  planCardAnnual: { borderColor: Colors.sakura },
  planCardMonthly: { borderColor: Colors.lavender },
  cardDeco: { position: 'absolute' },
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
    fontFamily: FontFamily.uiSemiBold, fontSize: 18, color: Colors.ink,
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
  planLabelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  planLabelBadgeDeal: {
    backgroundColor: Colors.sakuraSoft,
    borderColor: Colors.sakuraDeep,
  },
  planLabelBadgeFlex: {
    backgroundColor: Colors.lavenderSoft,
    borderColor: Colors.lavenderDeep,
  },
  planLabelTxt: {
    fontFamily: FontFamily.uiSemiBold,
    fontSize: 7.5,
    color: Colors.sakuraDeep,
    fontWeight: '800',
    letterSpacing: 0.3,
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
