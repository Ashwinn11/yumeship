import { useEffect, useState } from 'react';
import { getDb, newId } from '@/db/client';
import { trackMeaningfulAction } from './review';

export type TotPair = {
  id: string;
  shipId: string;
  leftOpt: string;
  rightOpt: string;
  choice: 'left' | 'right' | '';
  sortOrder: number;
  createdAt: number;
};

const DEFAULT_PAIRS: [string, string][] = [
  ['coffee', 'tea'],
  ['morning', 'night'],
  ['listener', 'talker'],
  ['sweet', 'savory'],
  ['sun', 'moon'],
  ['forehead kiss', 'hand kiss'],
  ['loud laugh', 'quiet smile'],
  ['letters', 'calls'],
  ['winter', 'summer'],
  ['roses', 'wildflowers'],
];

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

function rowToPair(row: Record<string, unknown>): TotPair {
  return {
    id: row.id as string,
    shipId: row.ship_id as string,
    leftOpt: row.left_opt as string,
    rightOpt: row.right_opt as string,
    choice: (row.choice as string) as 'left' | 'right' | '',
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as number,
  };
}

export function getPairs(shipId: string): TotPair[] {
  return (getDb().getAllSync(
    'SELECT * FROM this_or_that_pairs WHERE ship_id = ? ORDER BY sort_order ASC, created_at ASC',
    shipId,
  ) as Record<string, unknown>[]).map(rowToPair);
}

export function ensureDefaultPairs(shipId: string) {
  const existing = getPairs(shipId);
  if (existing.length > 0) return;
  const now = Date.now();
  DEFAULT_PAIRS.forEach(([left, right], i) => {
    getDb().runSync(
      'INSERT INTO this_or_that_pairs (id, ship_id, left_opt, right_opt, choice, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      `${now}_${i}`, shipId, left, right, '', i, now,
    );
  });
  notify();
}

export function addPair(shipId: string, leftOpt: string, rightOpt: string): string {
  const id = newId();
  const row = getDb().getFirstSync(
    'SELECT MAX(sort_order) as m FROM this_or_that_pairs WHERE ship_id = ?',
    shipId,
  ) as { m: number | null };
  const maxOrder = row?.m ?? -1;
  getDb().runSync(
    'INSERT INTO this_or_that_pairs (id, ship_id, left_opt, right_opt, choice, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    id, shipId, leftOpt, rightOpt, '', maxOrder + 1, Date.now(),
  );
  notify();
  return id;
}

export function updatePairOpts(id: string, leftOpt: string, rightOpt: string) {
  getDb().runSync('UPDATE this_or_that_pairs SET left_opt = ?, right_opt = ? WHERE id = ?', leftOpt, rightOpt, id);
  notify();
}

export function setPairChoice(id: string, choice: 'left' | 'right' | '') {
  getDb().runSync('UPDATE this_or_that_pairs SET choice = ? WHERE id = ?', choice, id);
  notify();
  trackMeaningfulAction();
}

export function deletePair(id: string) {
  getDb().runSync('DELETE FROM this_or_that_pairs WHERE id = ?', id);
  notify();
}

export function usePairs(shipId: string): TotPair[] {
  const [pairs, setPairs] = useState<TotPair[]>(() => getPairs(shipId));
  useEffect(() => {
    const fn = () => setPairs(getPairs(shipId));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [shipId]);
  return pairs;
}
