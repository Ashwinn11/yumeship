import { useEffect, useState } from 'react';
import { getDb } from '@/db/client';

export type PaperStyle = 'plain' | 'lined' | 'grid' | 'scallop';
export type LetterSticker = '' | 'envelope' | 'sakura' | 'polaroid' | 'ticket' | 'waxseal' | 'heartpatch' | 'sakuraflower';

export type LoveLetter = {
  id: string;
  shipId: string;
  title: string;
  body: string;
  paper: PaperStyle;
  sticker: LetterSticker;
  createdAt: number;
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

function rowToLetter(row: Record<string, unknown>): LoveLetter {
  return {
    id: row.id as string,
    shipId: row.ship_id as string,
    title: row.title as string,
    body: row.body as string,
    paper: (row.paper as PaperStyle) || 'lined',
    sticker: (row.sticker as LetterSticker) || '',
    createdAt: row.created_at as number,
  };
}

export function getLetters(shipId: string): LoveLetter[] {
  return (getDb().getAllSync(
    'SELECT * FROM love_letters WHERE ship_id = ? ORDER BY created_at DESC',
    shipId,
  ) as Record<string, unknown>[]).map(rowToLetter);
}

export function addLetter(
  shipId: string,
  title: string,
  body: string,
  paper: PaperStyle,
  sticker: LetterSticker,
): string {
  const id = String(Date.now());
  getDb().runSync(
    'INSERT INTO love_letters (id, ship_id, title, body, paper, sticker, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    id, shipId, title, body, paper, sticker, Date.now(),
  );
  notify();
  return id;
}

export function deleteLetter(id: string) {
  getDb().runSync('DELETE FROM love_letters WHERE id = ?', id);
  notify();
}

export function useLetters(shipId: string): LoveLetter[] {
  const [letters, setLetters] = useState<LoveLetter[]>(() => getLetters(shipId));
  useEffect(() => {
    const fn = () => setLetters(getLetters(shipId));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [shipId]);
  return letters;
}
