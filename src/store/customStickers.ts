import { useEffect, useState } from 'react';
import { getDb, newId } from '@/db/client';

export type CustomSticker = { id: string; uri: string; createdAt: number };

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

export function getCustomStickers(): CustomSticker[] {
  return (getDb().getAllSync('SELECT * FROM custom_stickers ORDER BY created_at DESC') as Record<string, unknown>[])
    .map((row) => ({ id: row.id as string, uri: row.uri as string, createdAt: row.created_at as number }));
}

export function addCustomSticker(uri: string): string {
  const id = newId();
  getDb().runSync('INSERT INTO custom_stickers (id, uri, created_at) VALUES (?, ?, ?)', id, uri, Date.now());
  notify();
  return id;
}

export function deleteCustomSticker(id: string) {
  getDb().runSync('DELETE FROM custom_stickers WHERE id = ?', id);
  notify();
}

export function useCustomStickers(): CustomSticker[] {
  const [stickers, setStickers] = useState<CustomSticker[]>(() => getCustomStickers());
  useEffect(() => {
    const fn = () => setStickers(getCustomStickers());
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return stickers;
}
