/**
 * RevenueCat purchases store
 *
 * All plans, prices, trial eligibility, and period info come
 * dynamically from RevenueCat offerings at runtime — nothing is
 * hardcoded here except the env-var references.
 */
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PACKAGE_TYPE,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

// RevenueCat issues a separate public API key per store (Apple / Google Play).
const RC_API_KEY =
  Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID ?? ''
    : process.env.EXPO_PUBLIC_RC_API_KEY ?? '';
const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_ID ?? '';
let configured = false;

function canUsePurchases() {
  return configured && !!RC_API_KEY && !!ENTITLEMENT_ID;
}

// ─── Configure ────────────────────────────────────────────────────────────────

export function configureRevenueCat(userId?: string | null) {
  if (!RC_API_KEY || !ENTITLEMENT_ID) {
    console.warn(
      Platform.OS === 'android'
        ? 'RevenueCat is not configured. Missing EXPO_PUBLIC_RC_API_KEY_ANDROID or EXPO_PUBLIC_RC_ENTITLEMENT_ID.'
        : 'RevenueCat is not configured. Missing EXPO_PUBLIC_RC_API_KEY or EXPO_PUBLIC_RC_ENTITLEMENT_ID.',
    );
    return;
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
  Purchases.configure({ apiKey: RC_API_KEY, appUserID: userId ?? null });
  configured = true;
}

// ─── Customer & entitlement ───────────────────────────────────────────────────

export async function getCustomerInfo(): Promise<CustomerInfo> {
  if (!canUsePurchases()) throw new Error('RevenueCat is not configured.');
  return Purchases.getCustomerInfo();
}

/** Returns true if the user has an active "premium" entitlement */
export async function isPremium(): Promise<boolean> {
  try {
    if (!canUsePurchases()) return false;
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

// ─── Offerings (fully dynamic) ────────────────────────────────────────────────

/**
 * Returns the current RevenueCat offering.
 * Prices, plans, trial period, eligibility — all come from RevenueCat,
 * nothing is hardcoded.
 */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  try {
    if (!canUsePurchases()) return null;
    const { current } = await Purchases.getOfferings();
    return current ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns all available packages in the current offering,
 * sorted: annual first, then monthly, then weekly, then lifetime, then custom.
 */
export async function getAvailablePackages(): Promise<PurchasesPackage[]> {
  const offering = await getCurrentOffering();
  if (!offering) return [];

  const order: Record<string, number> = {
    [PACKAGE_TYPE.WEEKLY]: 0,
    [PACKAGE_TYPE.MONTHLY]: 1,
    [PACKAGE_TYPE.THREE_MONTH]: 2,
    [PACKAGE_TYPE.SIX_MONTH]: 3,
    [PACKAGE_TYPE.ANNUAL]: 4,
    [PACKAGE_TYPE.LIFETIME]: 5,
    [PACKAGE_TYPE.CUSTOM]: 6,
  };

  return [...offering.availablePackages].sort(
    (a, b) => (order[a.packageType] ?? 99) - (order[b.packageType] ?? 99),
  );
}

/**
 * Checks if the user is eligible for an intro/trial offer on a given package.
 * Returns the intro price info (includes trial days) or null if not eligible.
 */
export function getIntroOfferInfo(pkg: PurchasesPackage) {
  const intro = pkg.product.introPrice;
  if (!intro) return null;
  return {
    price: intro.priceString,            // e.g. "$0.00"
    period: intro.period,                // e.g. "P7D" ISO 8601
    periodUnit: intro.periodUnit,        // "DAY" | "WEEK" | "MONTH" | "YEAR"
    periodUnits: intro.periodNumberOfUnits, // e.g. 7
    cycles: intro.cycles,                // number of intro periods
    isFree: intro.price === 0,           // true = free trial
  };
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<{ success: boolean; customerInfo?: CustomerInfo; cancelled?: boolean; error?: string }> {
  try {
    if (!canUsePurchases()) return { success: false, error: 'RevenueCat is not configured.' };
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (e: any) {
    if (e.userCancelled) return { success: false, cancelled: true };
    return { success: false, error: e.message ?? 'Purchase failed' };
  }
}

// ─── Restore ──────────────────────────────────────────────────────────────────

export async function restorePurchases(): Promise<{
  isPremium: boolean;
  customerInfo: CustomerInfo;
}> {
  if (!canUsePurchases()) throw new Error('RevenueCat is not configured.');
  const customerInfo = await Purchases.restorePurchases();
  return {
    isPremium: customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined,
    customerInfo,
  };
}

// ─── Manage subscriptions ─────────────────────────────────────────────────────

export async function manageSubscriptions(): Promise<void> {
  if (!canUsePurchases()) return;
  await Purchases.showManageSubscriptions();
}
