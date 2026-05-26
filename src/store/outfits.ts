import { useEffect, useState } from 'react';
import { getDb } from '@/db/client';

export type Outfit = {
  id: string;
  shipId: string;
  title: string;
  uri: string;
  occasion: string;
  notes: string;
  createdAt: number;
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

export function getOutfits(shipId: string): Outfit[] {
  return (getDb().getAllSync(
    'SELECT * FROM outfits WHERE ship_id = ? ORDER BY created_at DESC',
    shipId,
  ) as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    shipId: r.ship_id as string,
    title: r.title as string,
    uri: r.uri as string,
    occasion: r.occasion as string,
    notes: r.notes as string,
    createdAt: r.created_at as number,
  }));
}

export function addOutfit(shipId: string, d: { title: string; uri?: string; occasion?: string; notes?: string }): string {
  const id = String(Date.now());
  getDb().runSync(
    'INSERT INTO outfits (id, ship_id, title, uri, occasion, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    id, shipId, d.title, d.uri ?? '', d.occasion ?? '', d.notes ?? '', Date.now(),
  );
  notify();
  return id;
}

export function deleteOutfit(id: string) {
  getDb().runSync('DELETE FROM outfits WHERE id = ?', id);
  notify();
}

export function useOutfits(shipId: string): Outfit[] {
  const [outfits, setOutfits] = useState<Outfit[]>(() => getOutfits(shipId));
  useEffect(() => {
    const fn = () => setOutfits(getOutfits(shipId));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [shipId]);
  return outfits;
}
