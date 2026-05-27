import { useEffect, useState } from 'react';
import { isPremium as checkPremium } from './purchases';

let cachedPremium = false;
let initialized = false;
const listeners = new Set<() => void>();

function notifyListeners() { listeners.forEach((fn) => fn()); }

export async function refreshPremium(): Promise<void> {
  const val = await checkPremium();
  cachedPremium = val;
  initialized = true;
  notifyListeners();
}

export function getPremium(): boolean {
  return cachedPremium;
}

export function usePremium(): boolean {
  const [premium, setPremium] = useState(cachedPremium);
  useEffect(() => {
    const fn = () => setPremium(cachedPremium);
    listeners.add(fn);
    if (!initialized) refreshPremium();
    return () => { listeners.delete(fn); };
  }, []);
  return premium;
}
