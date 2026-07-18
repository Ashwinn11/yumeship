import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PACKAGE_TYPE, PurchasesPackage } from 'react-native-purchases';


import { CozyModal } from '@/components/ui';
import { Colors, FontFamily, FontSize, Radius, Spacing ,sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { resetOnb } from '@/store/onboarding';
import { refreshPremium } from '@/store/premium';
import { askForReview } from '@/store/review';
import { getShip } from '@/store/ships';
import {
  getAvailablePackages,
  purchasePackage,
  restorePurchases,
} from '@/store/purchases';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isLifetimePkg(pkg: PurchasesPackage): boolean {
  return (
    pkg.packageType === PACKAGE_TYPE.LIFETIME ||
    pkg.identifier === '$rc_lifetime' ||
    pkg.identifier.toLowerCase().includes('lifetime') ||
    pkg.product.identifier.toLowerCase().includes('lifetime')
  );
}

function isMonthlyPkg(pkg: PurchasesPackage): boolean {
  return (
    pkg.packageType === PACKAGE_TYPE.MONTHLY ||
    pkg.identifier === '$rc_monthly' ||
    pkg.identifier.toLowerCase().includes('monthly') ||
    pkg.product.identifier.toLowerCase().includes('monthly')
  );
}

function isWeeklyPkg(pkg: PurchasesPackage): boolean {
  return (
    pkg.packageType === PACKAGE_TYPE.WEEKLY ||
    pkg.identifier === '$rc_weekly' ||
    pkg.identifier.toLowerCase().includes('weekly') ||
    pkg.product.identifier.toLowerCase().includes('weekly')
  );
}

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

function getSavingsVsWeekly(
  pkg: PurchasesPackage,
  weeklyPkg?: PurchasesPackage,
): { weeklyEquivalent: string; strikethroughPrice: string; savePercent: number } | null {
  const price = pkg.product.price;
  const weeklyPrice = weeklyPkg?.product.price;
  const priceString = pkg.product.priceString;

  if (!price || !weeklyPrice) return null;

  // only monthly has a meaningful weekly equivalent — lifetime is a
  // one-time purchase, weekly is the baseline itself
  if (!isMonthlyPkg(pkg)) return null;
  const weeks = 4;

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
  if (!isMonthlyPkg(pkg)) return null;

  const weeklyEquiv = price / 4;
  const match = priceString.match(/^[^\d\s]+/);
  const symbol = match?.[0] || '$';
  return `${symbol}${weeklyEquiv.toFixed(2)}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PaywallScreen() {
  const { reason, shipId } = useLocalSearchParams<{ reason?: string; shipId?: string }>();
  const { column } = useIPad();
  const insets = useSafeAreaInsets();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; onClose?: () => void } | null>(null);

  function dismissPaywall() {
    if (reason === 'onboarding') {
      resetOnb();
      const ship = shipId ? getShip(shipId) : undefined;
      if (ship?.id) {
        const template = ship.templateKey ?? 'get-to-know';
        router.replace(`/template/${template}?shipId=${ship.id}` as any);
      } else {
        router.replace('/(tabs)');
      }
    } else {
      router.back();
    }
  }

  useEffect(() => {
    const t = setTimeout(() => setShowClose(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    (async () => {
      const pkgs = await getAvailablePackages();
      // filter out all plans except lifetime, monthly, and weekly
      const filtered = pkgs.filter((p) => isWeeklyPkg(p) || isLifetimePkg(p) || isMonthlyPkg(p));

      // sort lifetime first, then monthly, then weekly
      const sorted = [...filtered].sort((a, b) => {
        const getOrder = (p: PurchasesPackage) => {
          if (isLifetimePkg(p)) return 0;
          if (isMonthlyPkg(p)) return 1;
          return 2; // weekly
        };
        return getOrder(a) - getOrder(b);
      });
      setPackages(sorted);
      // pre-select monthly — lower commitment, better conversion than lifetime default
      const monthlyDefault = sorted.find(isMonthlyPkg) ?? sorted[0];
      setSelected(monthlyDefault);
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
        askForReview();
        setAlertModal({
          title: '🎉 Welcome to Premium!',
          message: 'Premium is now active.',
          onClose: () => dismissPaywall(),
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
          message: 'Your premium access has been restored.',
          onClose: () => dismissPaywall(),
        });
      } else {
        setAlertModal({ title: 'Nothing to restore', message: `No purchases found for this ${Platform.OS === 'android' ? 'Google account' : 'Apple ID'}.` });
      }
    } catch (e: any) {
      setAlertModal({ title: 'Error', message: e.message ?? 'Could not restore purchases.' });
    } finally {
      setRestoring(false);
    }
  }

  return (
    <View style={styles.screen}>
      {/* Close button — delayed so users read the value prop first */}
      {showClose && (
        <Pressable
          style={[styles.closeBtn, { top: insets.top + 10 }]}
          onPress={() => dismissPaywall()}
          id="paywall-close"
        >
          <Text style={styles.closeTxt}>✕</Text>
        </Pressable>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          column,
          {
            paddingTop: insets.top + Spacing.s2,
            paddingBottom: insets.bottom + Spacing.s9 + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          {/* icon card */}
          <View style={styles.iconCard}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.heroIcon}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Features card */}
        <View style={styles.featCard}>
          {[
            { icon: '♡', label: 'Unlimited ships & F/Os' },
            { icon: '♡', label: 'Polyships — your whole polycule, together' },
            { icon: '♡', label: 'Every template & theme, switch anytime' },
            { icon: '♡', label: 'Scenarios, Storyline, Albums & Love Letters' },
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
              const period = periodLabel(pkg);
              const weeklyPkg = packages.find(isWeeklyPkg);
              const savings = getSavingsVsWeekly(pkg, weeklyPkg);
              const isWeekly = isWeeklyPkg(pkg);
              const isLifetime = isLifetimePkg(pkg);
              const isMonthly = isMonthlyPkg(pkg);

              const displayTitle = isLifetime ? 'Lifetime' : isMonthly ? 'Monthly' : 'Weekly';

              return (
                <Pressable
                  key={pkg.identifier}
                  style={[
                    styles.planCard,
                    isSel && styles.planCardSel,
                    isLifetime && styles.planCardLifetime,
                    isMonthly && styles.planCardMonthly,
                  ]}
                  onPress={() => setSelected(pkg)}
                  id={`plan-${pkg.identifier}`}
                >
                  {/* Floating SAVE % badge — monthly */}
                  {savings && savings.savePercent > 0 && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsTxt}>SAVE {savings.savePercent}%</Text>
                    </View>
                  )}



                  <View style={styles.planCardRow}>
                    {/* Left Column */}
                    <View style={styles.planLeft}>
                      <View style={styles.planNameRow}>
                        <Text style={[styles.planName, isSel && styles.planNameSel]}>
                          {displayTitle}
                        </Text>
                        {/* Plan label badge */}
                        {isLifetime && (
                          <View style={[styles.planLabelBadge, styles.planLabelBadgeDeal]}>
                            <Text style={styles.planLabelTxt}>BEST VALUE</Text>
                          </View>
                        )}
                        {isMonthly && (
                          <View style={[styles.planLabelBadge, styles.planLabelBadgeFlex]}>
                            <Text style={[styles.planLabelTxt, { color: Colors.lavenderDeep }]}>MOST FLEXIBLE</Text>
                          </View>
                        )}
                      </View>

                      {isLifetime ? (
                        <Text style={styles.planSubLabel}>pay once · yours forever</Text>
                      ) : isWeekly ? (
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
            if (!selected) return <Text style={styles.ctaTxt}>Continue ♡</Text>;
            const price = selected.product.priceString;
            if (isLifetimePkg(selected)) {
              return <Text style={styles.ctaTxt}>Unlock Lifetime for {price}</Text>;
            }
            const period = periodLabel(selected);
            const suffix = period ? `${price} / ${period}` : price;
            return <Text style={styles.ctaTxt}>Continue · {suffix}</Text>;
          })()}
        </Pressable>

        {/* Sub-CTA note */}
        <Text style={styles.subNote}>
          {selected && isLifetimePkg(selected)
            ? 'One-time payment · no subscription'
            : 'Cancel anytime · 🔒 Secure checkout'}
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
    borderWidth: 2.5,
    borderColor: Colors.ink2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: { fontSize: sf(13), color: Colors.ink3, fontFamily: FontFamily.ui, lineHeight: 14 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s9 + 20 },

  heroSection: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
    marginTop: 0,
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
  featPillTxt: { fontSize: sf(10), color: '#fff' },
  featLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink, flex: 1 },
  // kept for compat
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureDot: { fontSize: sf(12), color: Colors.sakuraDeep },
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
  planCardLifetime: { borderColor: Colors.sakura },
  planCardMonthly: { borderColor: Colors.lavender },
  cardDeco: { position: 'absolute' },
  planName: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink,
  },
  planNameSel: { color: Colors.sakuraDeep },
  planPrice: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(18), color: Colors.ink,
  },
  planPriceSel: { color: Colors.ink },
  planPeriod: {
    fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink2,
  },
  planDesc: {
    fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3, marginTop: 4,
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
  planSubLabel: {
    fontFamily: FontFamily.ui,
    fontSize: sf(11),
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
    fontSize: sf(11),
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
    fontSize: sf(9),
    color: '#fff',
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
    fontSize: sf(8),
    color: Colors.sakuraDeep,
    letterSpacing: 0.3,
  },

  ctaBtn: {
    marginTop: Spacing.s5, backgroundColor: Colors.sakuraDeep,
    borderRadius: Radius.pill, paddingVertical: 15, alignItems: 'center',
  },
  ctaBtnDisabled: { opacity: 0.45 },
  ctaTxt: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), color: '#fff' },

  subNote: {
    textAlign: 'center', marginTop: 10,
    fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3,
  },

  footerRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 12, marginTop: Spacing.s5, marginBottom: Spacing.s2,
  },
  footerLink: {
    fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3,
    textDecorationLine: 'underline',
  },
  footerSep: {
    fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.line,
  },
  noPlans: {
    textAlign: 'center', marginTop: 32,
    fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink3,
  },
});
