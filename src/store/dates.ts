import { useEffect, useState } from 'react';
import { getDb } from '@/db/client';

export type ShipDate = {
  id: string;
  shipId: string;
  title: string;
  date: string;
  yearly: boolean;
  notify: boolean;
  subtitle: string;
  createdAt: number;
};

export const listeners = new Set<() => void>();
export function notifyDates() { listeners.forEach((fn) => fn()); }

function rowToDate(r: Record<string, unknown>): ShipDate {
  return {
    id: r.id as string,
    shipId: r.ship_id as string,
    title: r.title as string,
    date: r.date as string,
    yearly: !!(r.yearly as number),
    notify: !!(r.notify as number),
    subtitle: (r.subtitle as string) ?? '',
    createdAt: r.created_at as number,
  };
}

export function getDates(shipId: string): ShipDate[] {
  const dbDates = (getDb().getAllSync(
    'SELECT * FROM dates WHERE ship_id = ? ORDER BY date ASC',
    shipId,
  ) as Record<string, unknown>[]).map(rowToDate);

  const ship = getDb().getFirstSync('SELECT start_date FROM ships WHERE id = ?', shipId) as { start_date: string } | null;
  if (ship && ship.start_date) {
    dbDates.push({
      id: `ship-ann-${shipId}`,
      shipId: shipId,
      title: 'Our Anniversary',
      date: ship.start_date,
      yearly: true,
      notify: false,
      subtitle: 'the day we met',
      createdAt: 0,
    });
  }

  return dbDates.sort((a, b) => a.date.localeCompare(b.date));
}

export function getAllUpcomingDates(): (ShipDate & { shipName: string; relType: string })[] {
  const dbDates = (getDb().getAllSync(
    `SELECT d.*, s.name as ship_name, s.rel_type as rel_type FROM dates d
     JOIN ships s ON s.id = d.ship_id
     ORDER BY d.date ASC`,
  ) as Record<string, unknown>[]).map((r) => ({
    ...rowToDate(r),
    shipName: r.ship_name as string,
    relType: (r.rel_type as string) ?? 'romantic',
  }));

  const dbShips = getDb().getAllSync('SELECT id, name, start_date, rel_type FROM ships WHERE start_date IS NOT NULL AND start_date != ""') as { id: string; name: string; start_date: string; rel_type: string }[];
  
  const shipAnniversaries = dbShips.map((s) => ({
    id: `ship-ann-${s.id}`,
    shipId: s.id,
    title: 'Our Anniversary',
    date: s.start_date,
    yearly: true,
    notify: false,
    subtitle: 'the day we met',
    createdAt: 0,
    shipName: s.name,
    relType: s.rel_type ?? 'romantic',
  }));

  const all = [...dbDates, ...shipAnniversaries];
  return all.sort((a, b) => {
    const daysA = daysUntil(a.date, a.yearly) ?? 9999;
    const daysB = daysUntil(b.date, b.yearly) ?? 9999;
    return daysA - daysB;
  });
}

export function addDate(shipId: string, d: { title: string; date: string; yearly?: boolean; notify?: boolean; subtitle?: string }): string {
  const id = String(Date.now());
  getDb().runSync(
    'INSERT INTO dates (id, ship_id, title, date, yearly, notify, subtitle, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    id, shipId, d.title, d.date, d.yearly ? 1 : 0, d.notify ? 1 : 0, d.subtitle ?? '', Date.now(),
  );
  notifyDates();
  return id;
}

export function deleteDate(id: string) {
  getDb().runSync('DELETE FROM dates WHERE id = ?', id);
  notifyDates();
}

export function daysUntil(dateStr: string, yearly: boolean): number | null {
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (yearly) {
    target.setFullYear(now.getFullYear());
    if (target < now) target.setFullYear(now.getFullYear() + 1);
  }
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

export function useDates(shipId: string): ShipDate[] {
  const [dates, setDates] = useState<ShipDate[]>(() => getDates(shipId));
  useEffect(() => {
    const fn = () => setDates(getDates(shipId));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [shipId]);
  return dates;
}

export function useAllUpcomingDates(): (ShipDate & { shipName: string; relType: string })[] {
  const [dates, setDates] = useState(() => getAllUpcomingDates());
  useEffect(() => {
    const fn = () => setDates(getAllUpcomingDates());
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return dates;
}
