import { useEffect, useState } from 'react';
import { getDb, newId } from '@/db/client';
import { notifyDates } from './dates';

export type ShipMember = {
  id: string;
  name: string;
  pronouns?: string;
  sex?: string;
  word?: string;
  photoUri?: string;
  /** true for the user's own member in a polyship roster */
  isMe?: boolean;
};

export type Ship = {
  id: string;
  name: string;
  shipName: string;
  myName: string;
  fandom: string;
  relType: 'romantic' | 'platonic' | 'familial';
  shareType: string;
  aboutText: string;
  gradStart: string;
  gradEnd: string;
  tapePattern: string;
  tapeColor: string;
  coverUri: string;
  pinned: boolean;
  startDate: string;
  templateKey: string;
  kind: 'single' | 'poly';
  members: ShipMember[];
  createdAt: number;
};

// Accent palette for polyship members — index-based, matches the poly-chart design.
export const MEMBER_PAL = ['#d77a8d', '#8b6fc4', '#6e8762', '#b8902a', '#b76b48', '#4f8a9e', '#c25b7a', '#7a9b54'];
export function memberColor(index: number): string {
  return MEMBER_PAL[index % MEMBER_PAL.length];
}
export function isPoly(ship: Ship | undefined): boolean {
  return ship?.kind === 'poly';
}
export function getMembers(ship: Ship | undefined): ShipMember[] {
  return ship?.members ?? [];
}
// ─── Poly-aware name resolution ───────────────────────────────────────────────
// The ship title (works for both kinds — poly sets name = shipName).
export function shipTitle(ship: Ship | undefined): string {
  return ship?.shipName || ship?.name || '';
}
// Joined roster names for a polyship, e.g. "Kael × Rin × me".
export function membersLabel(ship: Ship | undefined): string {
  return getMembers(ship).map((m) => m.name).filter(Boolean).join(' × ');
}
// The non-"me" members — i.e. the F/O(s) of a polyship.
export function shipPartners(ship: Ship | undefined): ShipMember[] {
  return getMembers(ship).filter((m) => !m.isMe);
}
// The user's own member in a polyship roster, if marked.
export function shipMe(ship: Ship | undefined): ShipMember | undefined {
  return getMembers(ship).find((m) => m.isMe);
}
function parseMembers(raw: unknown): ShipMember[] {
  if (typeof raw !== 'string' || !raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

function rowToShip(row: Record<string, unknown>): Ship {
  return {
    id: row.id as string,
    name: row.name as string,
    shipName: (row.ship_name as string) ?? '',
    myName: (row.my_name as string) ?? '',
    fandom: row.fandom as string,
    relType: (row.rel_type as Ship['relType']) ?? 'romantic',
    shareType: row.share_type as string,
    aboutText: row.about_text as string,
    gradStart: row.grad_start as string,
    gradEnd: row.grad_end as string,
    tapePattern: row.tape_pattern as string,
    tapeColor: row.tape_color as string,
    coverUri: (row.cover_uri as string) ?? '',
    pinned: !!(row.pinned as number),
    startDate: row.start_date as string,
    templateKey: (row.template_key as string) ?? 'get-to-know',
    kind: (row.kind as Ship['kind']) ?? 'single',
    members: parseMembers(row.members),
    createdAt: row.created_at as number,
  };
}

export function getAllShips(): Ship[] {
  return (getDb().getAllSync('SELECT * FROM ships ORDER BY pinned DESC, created_at DESC') as Record<string, unknown>[])
    .map(rowToShip);
}

export function getShip(id: string): Ship | undefined {
  const row = getDb().getFirstSync('SELECT * FROM ships WHERE id = ?', id) as Record<string, unknown> | null;
  return row ? rowToShip(row) : undefined;
}

export function addShip(d: {
  name: string;
  shipName?: string;
  myName?: string;
  fandom?: string;
  relType?: string;
  shareType?: string;
  gradStart?: string;
  gradEnd?: string;
  tapePattern?: string;
  tapeColor?: string;
  coverUri?: string;
  templateKey?: string;
  kind?: string;
  members?: ShipMember[];
}): string {
  const id = newId();
  getDb().runSync(
    `INSERT INTO ships (id, name, ship_name, my_name, fandom, rel_type, share_type, nickname, grad_start, grad_end, tape_pattern, tape_color, cover_uri, template_key, kind, members, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    d.name,
    d.shipName ?? '',
    d.myName ?? '',
    d.fandom ?? '',
    d.relType ?? 'romantic',
    d.shareType ?? '',
    '',
    d.gradStart ?? '#f3b6c4',
    d.gradEnd ?? '#d77a8d',
    d.tapePattern ?? 'heart',
    d.tapeColor ?? 'rgba(255,255,255,0.9)',
    d.coverUri ?? '',
    d.templateKey ?? 'get-to-know',
    d.kind ?? 'single',
    JSON.stringify(d.members ?? []),
    Date.now(),
  );
  notify();
  return id;
}

export function updateShip(id: string, d: Partial<Omit<Ship, 'id' | 'createdAt'>>) {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (d.name !== undefined)        { fields.push('name = ?');         values.push(d.name); }
  if (d.shipName !== undefined)    { fields.push('ship_name = ?');    values.push(d.shipName); }
  if (d.myName !== undefined)      { fields.push('my_name = ?');      values.push(d.myName); }
  if (d.fandom !== undefined)      { fields.push('fandom = ?');        values.push(d.fandom); }
  if (d.relType !== undefined)     { fields.push('rel_type = ?');      values.push(d.relType); }
  if (d.shareType !== undefined)   { fields.push('share_type = ?');    values.push(d.shareType); }
  if (d.aboutText !== undefined)   { fields.push('about_text = ?');    values.push(d.aboutText); }
  if (d.gradStart !== undefined)   { fields.push('grad_start = ?');    values.push(d.gradStart); }
  if (d.gradEnd !== undefined)     { fields.push('grad_end = ?');      values.push(d.gradEnd); }
  if (d.tapePattern !== undefined) { fields.push('tape_pattern = ?');  values.push(d.tapePattern); }
  if (d.tapeColor !== undefined)   { fields.push('tape_color = ?');    values.push(d.tapeColor); }
  if (d.coverUri !== undefined)    { fields.push('cover_uri = ?');     values.push(d.coverUri); }
  if (d.pinned !== undefined)      { fields.push('pinned = ?');        values.push(d.pinned ? 1 : 0); }
  if (d.startDate !== undefined)    { fields.push('start_date = ?');     values.push(d.startDate); }
  if (d.templateKey !== undefined)  { fields.push('template_key = ?');   values.push(d.templateKey); }
  if (d.kind !== undefined)         { fields.push('kind = ?');           values.push(d.kind); }
  if (d.members !== undefined)      { fields.push('members = ?');        values.push(JSON.stringify(d.members)); }

  if (!fields.length) return;
  getDb().runSync(
    `UPDATE ships SET ${fields.join(', ')} WHERE id = ?`,
    ...([...values, id] as import('expo-sqlite').SQLiteBindValue[]),
  );
  notify();
  if (d.startDate !== undefined) {
    notifyDates();
  }
}

export function deleteShip(id: string) {
  getDb().runSync('DELETE FROM ships WHERE id = ?', id);
  getDb().runSync('DELETE FROM headcanons WHERE ship_id = ?', id);
  getDb().runSync('DELETE FROM scenarios WHERE ship_id = ?', id);
  getDb().runSync('DELETE FROM dates WHERE ship_id = ?', id);
  getDb().runSync('DELETE FROM message_threads WHERE ship_id = ?', id);
  getDb().runSync('DELETE FROM messages WHERE thread_id NOT IN (SELECT id FROM message_threads)', []);
  getDb().runSync('DELETE FROM albums WHERE ship_id = ?', id);
  getDb().runSync('DELETE FROM album_photos WHERE album_id NOT IN (SELECT id FROM albums)', []);
  getDb().runSync('DELETE FROM storyline_events WHERE ship_id = ?', id);
  getDb().runSync('DELETE FROM fo_messages WHERE ship_id = ?', id);
  getDb().runSync('DELETE FROM template_data WHERE ship_id = ?', id);
  notify();
  notifyDates();
}

export function deleteAllData() {
  const db = getDb();
  db.execSync(`
    DELETE FROM ships;
    DELETE FROM headcanons;
    DELETE FROM scenarios;
    DELETE FROM dates;
    DELETE FROM message_threads;
    DELETE FROM messages;
    DELETE FROM albums;
    DELETE FROM album_photos;
    DELETE FROM storyline_events;
    DELETE FROM fo_messages;
    DELETE FROM template_data;
  `);
  notify();
  notifyDates();
}

export function useShips(): Ship[] {
  const [ships, setShips] = useState<Ship[]>(() => getAllShips());
  useEffect(() => {
    const fn = () => setShips(getAllShips());
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return ships;
}

export function useShip(id: string | undefined): Ship | undefined {
  const [ship, setShip] = useState<Ship | undefined>(() => id ? getShip(id) : undefined);
  useEffect(() => {
    const fn = () => setShip(id ? getShip(id) : undefined);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [id]);
  return ship;
}

export function daysTogetherLabel(startDate: string): string {
  if (!startDate) return '';
  // parse YYYY-MM-DD as local time, not UTC, or the count shifts a day
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(startDate.trim());
  const start = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()
    : new Date(startDate).getTime();
  if (isNaN(start)) return '';
  const days = Math.floor((Date.now() - start) / 86_400_000);
  if (days < 0) return '';
  if (days === 0) return 'today ♡';
  if (days < 365) return `${days}d`;
  const years = Math.floor(days / 365);
  const rem = days % 365;
  return rem === 0 ? `${years}y` : `${years}y ${rem}d`;
}

export function daysAgo(createdAt: number): string {
  const d = Math.floor((Date.now() - createdAt) / 86_400_000);
  return d === 0 ? 'today' : `${d}d`;
}

export const REL_GRADS: Record<string, [string, string]> = {
  romantic: ['#f3b6c4', '#d77a8d'],
  platonic: ['#b4c8a5', '#6e8762'],
  familial: ['#f4b89a', '#b76b48'],
};
