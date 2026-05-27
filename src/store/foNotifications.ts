import { useEffect, useState } from 'react';
import { getDb } from '@/db/client';
import { cancelNotification, scheduleDailyNotification } from './notifications';

export type FoMessage = {
  id: string;
  shipId: string;
  body: string;
  senderName: string;
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
    senderName: (r.sender_name as string) ?? '',
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
  senderName = '',
): Promise<string> {
  const id = String(Date.now());
  getDb().runSync(
    'INSERT INTO fo_messages (id, ship_id, body, sender_name, scheduled_hour, active, notif_id, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)',
    id, shipId, body, senderName, scheduledHour, '', Date.now(),
  );

  let triggerBody = body;
  try {
    if (body.startsWith('[')) {
      const parsed = JSON.parse(body);
      if (Array.isArray(parsed) && parsed.length > 0) {
        triggerBody = parsed[Math.floor(Math.random() * parsed.length)];
      }
    }
  } catch (_) {}

  const isImmediate = scheduledHour === -2;
  const targetHour = scheduledHour === -1
    ? [6, 8, 10, 12, 14, 16, 18, 20, 22][Math.floor(Math.random() * 9)]
    : isImmediate ? 0 : scheduledHour;

  const notifId = await scheduleDailyNotification(triggerBody, targetHour, senderName, isImmediate);
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
    let triggerBody = msg.body;
    try {
      if (msg.body.startsWith('[')) {
        const parsed = JSON.parse(msg.body);
        if (Array.isArray(parsed) && parsed.length > 0) {
          triggerBody = parsed[Math.floor(Math.random() * parsed.length)];
        }
      }
    } catch (_) {}

    const isImmediate = msg.scheduledHour === -2;
    const targetHour = msg.scheduledHour === -1
      ? [6, 8, 10, 12, 14, 16, 18, 20, 22][Math.floor(Math.random() * 9)]
      : isImmediate ? 0 : msg.scheduledHour;

    const newId = await scheduleDailyNotification(triggerBody, targetHour, msg.senderName || foName, isImmediate);
    getDb().runSync(
      'UPDATE fo_messages SET active = 1, notif_id = ? WHERE id = ?',
      newId ?? '', id,
    );
  }

  notify();
}

export async function updateFoMessage(
  id: string,
  body: string,
  scheduledHour: number,
  senderName: string,
  foName = '',
): Promise<void> {
  const row = getDb().getFirstSync('SELECT * FROM fo_messages WHERE id = ?', id) as Record<string, unknown> | null;
  if (!row) return;
  const msg = rowToMsg(row);

  if (msg.notifId) {
    await cancelNotification(msg.notifId);
  }

  let notifId = '';
  if (msg.active) {
    let triggerBody = body;
    try {
      if (body.startsWith('[')) {
        const parsed = JSON.parse(body);
        if (Array.isArray(parsed) && parsed.length > 0) {
          triggerBody = parsed[Math.floor(Math.random() * parsed.length)];
        }
      }
    } catch (_) {}

    const isImmediate = scheduledHour === -2;
    const targetHour = scheduledHour === -1
      ? [6, 8, 10, 12, 14, 16, 18, 20, 22][Math.floor(Math.random() * 9)]
      : isImmediate ? 0 : scheduledHour;

    notifId = await scheduleDailyNotification(triggerBody, targetHour, senderName, isImmediate) ?? '';
  }

  getDb().runSync(
    'UPDATE fo_messages SET body = ?, sender_name = ?, scheduled_hour = ?, notif_id = ? WHERE id = ?',
    body, senderName, scheduledHour, notifId, id,
  );

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
