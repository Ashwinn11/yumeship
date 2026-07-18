import { useEffect, useState } from 'react';
import { getDb, newId } from '@/db/client';
import { cancelNotification, scheduleDailyNotification } from './notifications';

export type FoMessage = {
  id: string;
  shipId: string;
  body: string;
  senderName: string;
  scheduledHour: number;
  scheduledMinute: number;
  photoUri: string;
  active: boolean;
  notifId: string;
  currentIndex: number;
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
    scheduledMinute: (r.scheduled_minute as number) ?? 0,
    photoUri: (r.photo_uri as string) ?? '',
    active: !!(r.active as number),
    notifId: (r.notif_id as string) ?? '',
    currentIndex: (r.current_index as number) ?? 0,
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
  scheduledMinute = 0,
  photoUri = '',
): Promise<string> {
  const id = newId();
  getDb().runSync(
    'INSERT INTO fo_messages (id, ship_id, body, sender_name, scheduled_hour, scheduled_minute, photo_uri, active, notif_id, current_index, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 0, ?)',
    id, shipId, body, senderName, scheduledHour, scheduledMinute, photoUri, '', Date.now(),
  );

  let triggerBody = body;
  let parsedLength = 1;
  try {
    if (body.startsWith('[')) {
      const parsed = JSON.parse(body);
      if (Array.isArray(parsed) && parsed.length > 0) {
        triggerBody = parsed[0];
        parsedLength = parsed.length;
      }
    }
  } catch (_) {}

  const isImmediate = scheduledHour === -2;
  const targetHour = scheduledHour === -1
    ? [6, 8, 10, 12, 14, 16, 18, 20, 22][Math.floor(Math.random() * 9)]
    : isImmediate ? 0 : scheduledHour;
  const targetMinute = (scheduledHour === -1 || isImmediate) ? 0 : scheduledMinute;

  const notifId = await scheduleDailyNotification(triggerBody, targetHour, senderName, isImmediate, targetMinute, photoUri);
  if (notifId) {
    const nextIndex = parsedLength > 1 ? 1 : 0;
    getDb().runSync('UPDATE fo_messages SET notif_id = ?, current_index = ? WHERE id = ?', notifId, nextIndex, id);
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
    let parsedLength = 1;
    try {
      if (msg.body.startsWith('[')) {
        const parsed = JSON.parse(msg.body);
        if (Array.isArray(parsed) && parsed.length > 0) {
          triggerBody = parsed[msg.currentIndex % parsed.length];
          parsedLength = parsed.length;
        }
      }
    } catch (_) {}

    const isImmediate = msg.scheduledHour === -2;
    const targetHour = msg.scheduledHour === -1
      ? [6, 8, 10, 12, 14, 16, 18, 20, 22][Math.floor(Math.random() * 9)]
      : isImmediate ? 0 : msg.scheduledHour;
    const targetMinute = (msg.scheduledHour === -1 || isImmediate) ? 0 : msg.scheduledMinute;

    const newId = await scheduleDailyNotification(triggerBody, targetHour, msg.senderName || foName, isImmediate, targetMinute, msg.photoUri);
    const nextIndex = parsedLength > 1 ? (msg.currentIndex + 1) % parsedLength : 0;
    getDb().runSync(
      'UPDATE fo_messages SET active = 1, notif_id = ?, current_index = ? WHERE id = ?',
      newId ?? '', nextIndex, id,
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
  scheduledMinute = 0,
  photoUri = '',
): Promise<void> {
  const row = getDb().getFirstSync('SELECT * FROM fo_messages WHERE id = ?', id) as Record<string, unknown> | null;
  if (!row) return;
  const msg = rowToMsg(row);

  if (msg.notifId) {
    await cancelNotification(msg.notifId);
  }

  let notifId = '';
  let newIndex = 0;
  if (msg.active) {
    let triggerBody = body;
    let parsedLength = 1;
    try {
      if (body.startsWith('[')) {
        const parsed = JSON.parse(body);
        if (Array.isArray(parsed) && parsed.length > 0) {
          triggerBody = parsed[0];
          parsedLength = parsed.length;
        }
      }
    } catch (_) {}

    const isImmediate = scheduledHour === -2;
    const targetHour = scheduledHour === -1
      ? [6, 8, 10, 12, 14, 16, 18, 20, 22][Math.floor(Math.random() * 9)]
      : isImmediate ? 0 : scheduledHour;
    const targetMinute = (scheduledHour === -1 || isImmediate) ? 0 : scheduledMinute;

    notifId = await scheduleDailyNotification(triggerBody, targetHour, senderName, isImmediate, targetMinute, photoUri) ?? '';
    newIndex = parsedLength > 1 ? 1 : 0;
  }

  getDb().runSync(
    'UPDATE fo_messages SET body = ?, sender_name = ?, scheduled_hour = ?, scheduled_minute = ?, photo_uri = ?, notif_id = ?, current_index = ? WHERE id = ?',
    body, senderName, scheduledHour, scheduledMinute, photoUri, notifId, newIndex, id,
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
