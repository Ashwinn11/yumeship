import { useEffect, useState } from 'react';
import { getDb } from '@/db/client';
import { cancelNotification, scheduleDailyNotification } from './notifications';

export type FoMessage = {
  id: string;
  shipId: string;
  body: string;
  scheduledHour: number;
  active: boolean;
  notifId: string;
  createdAt: number;
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

function rowToMsg(r: Record<string, unknown>): FoMessage {
  return {
    id: r.id as string,
    shipId: r.ship_id as string,
    body: r.body as string,
    scheduledHour: r.scheduled_hour as number,
    active: !!(r.active as number),
    notifId: (r.notif_id as string) ?? '',
    createdAt: r.created_at as number,
  };
}

export function getFoMessages(shipId: string): FoMessage[] {
  return (getDb().getAllSync(
    'SELECT * FROM fo_messages WHERE ship_id = ? ORDER BY created_at DESC',
    shipId,
  ) as Record<string, unknown>[]).map(rowToMsg);
}

export async function addFoMessage(
  shipId: string,
  body: string,
  scheduledHour = 9,
  foName = '',
): Promise<string> {
  const id = String(Date.now());
  getDb().runSync(
    'INSERT INTO fo_messages (id, ship_id, body, scheduled_hour, active, notif_id, created_at) VALUES (?, ?, ?, ?, 1, ?, ?)',
    id, shipId, body, scheduledHour, '', Date.now(),
  );

  const notifId = await scheduleDailyNotification(body, scheduledHour, foName);
  if (notifId) {
    getDb().runSync('UPDATE fo_messages SET notif_id = ? WHERE id = ?', notifId, id);
  }

  notify();
  return id;
}

export async function toggleFoMessage(id: string, active: boolean, foName = ''): Promise<void> {
  const row = getDb().getFirstSync('SELECT * FROM fo_messages WHERE id = ?', id) as Record<string, unknown> | null;
  if (!row) return;
  const msg = rowToMsg(row);

  if (!active && msg.notifId) {
    await cancelNotification(msg.notifId);
    getDb().runSync('UPDATE fo_messages SET active = 0, notif_id = ? WHERE id = ?', '', id);
  } else if (active) {
    const newId = await scheduleDailyNotification(msg.body, msg.scheduledHour, foName);
    getDb().runSync(
      'UPDATE fo_messages SET active = 1, notif_id = ? WHERE id = ?',
      newId ?? '', id,
    );
  }

  notify();
}

export async function deleteFoMessage(id: string): Promise<void> {
  const row = getDb().getFirstSync('SELECT notif_id FROM fo_messages WHERE id = ?', id) as { notif_id: string } | null;
  if (row?.notif_id) await cancelNotification(row.notif_id);
  getDb().runSync('DELETE FROM fo_messages WHERE id = ?', id);
  notify();
}

export function useFoMessages(shipId: string): FoMessage[] {
  const [msgs, setMsgs] = useState<FoMessage[]>(() => getFoMessages(shipId));
  useEffect(() => {
    const fn = () => setMsgs(getFoMessages(shipId));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [shipId]);
  return msgs;
}
