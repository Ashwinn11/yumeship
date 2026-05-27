import { useEffect, useState } from 'react';
import { getDb } from '@/db/client';

export type Headcanon = {
  id: string;
  shipId: string;
  category: string;
  body: string;
  createdAt: number;
};

export type HCCategory = 'personality' | 'habits' | 'favorites' | 'howmet';

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

function rowToHC(row: Record<string, unknown>): Headcanon {
  return {
    id: row.id as string,
    shipId: row.ship_id as string,
    category: row.category as string,
    body: row.body as string,
    createdAt: row.created_at as number,
  };
}

export function getHeadcanons(shipId: string, category?: string): Headcanon[] {
  if (category) {
    return (getDb().getAllSync('SELECT * FROM headcanons WHERE ship_id = ? AND category = ? ORDER BY created_at DESC', shipId, category) as Record<string, unknown>[])
      .map(rowToHC);
  }
  return (getDb().getAllSync('SELECT * FROM headcanons WHERE ship_id = ? ORDER BY created_at DESC', shipId) as Record<string, unknown>[])
    .map(rowToHC);
}

export function getHCCounts(shipId: string): Record<string, number> {
  const rows = (getDb().getAllSync(
    'SELECT category, COUNT(*) as cnt FROM headcanons WHERE ship_id = ? GROUP BY category',
    shipId,
  ) as { category: string; cnt: number }[]);
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.category] = r.cnt;
  return counts;
}

export function addHeadcanon(shipId: string, category: string, body: string): string {
  const id = String(Date.now());
  getDb().runSync(
    'INSERT INTO headcanons (id, ship_id, category, body, created_at) VALUES (?, ?, ?, ?, ?)',
    id, shipId, category, body, Date.now(),
  );
  notify();
  return id;
}

export function updateHeadcanon(id: string, body: string) {
  getDb().runSync('UPDATE headcanons SET body = ? WHERE id = ?', body, id);
  notify();
}

export function deleteHeadcanon(id: string) {
  getDb().runSync('DELETE FROM headcanons WHERE id = ?', id);
  notify();
}

export function clearCategoryHeadcanons(shipId: string, category: string) {
  getDb().runSync('DELETE FROM headcanons WHERE ship_id = ? AND category = ?', shipId, category);
  notify();
}

export function useHeadcanonCounts(shipId: string): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>(() => getHCCounts(shipId));
  useEffect(() => {
    const fn = () => setCounts(getHCCounts(shipId));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [shipId]);
  return counts;
}

export function useHeadcanons(shipId: string, category: string): Headcanon[] {
  const [hcs, setHcs] = useState<Headcanon[]>(() => getHeadcanons(shipId, category));
  useEffect(() => {
    const fn = () => setHcs(getHeadcanons(shipId, category));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [shipId, category]);
  return hcs;
}
