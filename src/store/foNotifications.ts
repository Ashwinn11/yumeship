import { useEffect, useState } from 'react';
import { getDb, newId } from '@/db/client';
import { cancelNotification, getScheduledNotifications, scheduleFoNotification } from './notifications';

export type FoMessage = {
  id: string;
  shipId: string;
  body: string;
  senderName: string;
  scheduledHour: number;
  scheduledMinute: number;
  arrivalDay: 'now' | 'today' | 'tomorrow' | 'everyday';
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
    arrivalDay: (r.arrival_day as FoMessage['arrivalDay']) ?? 'everyday',
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
  arrivalDay: FoMessage['arrivalDay'] = 'everyday',
  active = 1,
): Promise<string> {
  const id = newId();
  getDb().runSync(
    'INSERT INTO fo_messages (id, ship_id, body, sender_name, scheduled_hour, scheduled_minute, arrival_day, active, notif_id, current_index, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)',
    id, shipId, body, senderName, scheduledHour, scheduledMinute, arrivalDay, active, '', Date.now(),
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

  // Calculate stagger index for "now" type
  let staggerIndex = 0;
  if (arrivalDay === 'now' && active === 1) {
    const activeImmediates = getDb().getAllSync(
      'SELECT id FROM fo_messages WHERE active = 1 AND arrival_day = "now" AND id != ?',
      id,
    );
    staggerIndex = activeImmediates.length;
  }

  let notifId = '';
  if (active === 1) {
    const targetHour = scheduledHour === -2 ? 0 : scheduledHour;
    const targetMinute = scheduledHour === -2 ? 0 : scheduledMinute;

    const nid = await scheduleFoNotification(triggerBody, senderName, arrivalDay, targetHour, targetMinute, staggerIndex);
    if (nid) {
      notifId = nid;
      const nextIndex = parsedLength > 1 ? 1 : 0;
      getDb().runSync('UPDATE fo_messages SET notif_id = ?, current_index = ? WHERE id = ?', notifId, nextIndex, id);
    }
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

    // Calculate stagger index
    let staggerIndex = 0;
    if (msg.arrivalDay === 'now') {
      const activeImmediates = getDb().getAllSync(
        'SELECT id FROM fo_messages WHERE active = 1 AND arrival_day = "now" AND id != ?',
        id,
      );
      staggerIndex = activeImmediates.length;
    }

    const targetHour = msg.scheduledHour === -2 ? 0 : msg.scheduledHour;
    const targetMinute = msg.scheduledHour === -2 ? 0 : msg.scheduledMinute;

    const newId = await scheduleFoNotification(triggerBody, msg.senderName || foName, msg.arrivalDay, targetHour, targetMinute, staggerIndex);
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
  arrivalDay: FoMessage['arrivalDay'] = 'everyday',
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

    // Calculate stagger index
    let staggerIndex = 0;
    if (arrivalDay === 'now') {
      const activeImmediates = getDb().getAllSync(
        'SELECT id FROM fo_messages WHERE active = 1 AND arrival_day = "now" AND id != ?',
        id,
      );
      staggerIndex = activeImmediates.length;
    }

    const targetHour = scheduledHour === -2 ? 0 : scheduledHour;
    const targetMinute = scheduledHour === -2 ? 0 : scheduledMinute;

    notifId = await scheduleFoNotification(triggerBody, senderName, arrivalDay, targetHour, targetMinute, staggerIndex) ?? '';
    newIndex = parsedLength > 1 ? 1 : 0;
  }

  getDb().runSync(
    'UPDATE fo_messages SET body = ?, sender_name = ?, scheduled_hour = ?, scheduled_minute = ?, arrival_day = ?, notif_id = ?, current_index = ? WHERE id = ?',
    body, senderName, scheduledHour, scheduledMinute, arrivalDay, notifId, newIndex, id,
  );

  notify();
}

export async function deleteFoMessage(id: string): Promise<void> {
  const row = getDb().getFirstSync('SELECT notif_id FROM fo_messages WHERE id = ?', id) as { notif_id: string } | null;
  if (row?.notif_id) await cancelNotification(row.notif_id);
  getDb().runSync('DELETE FROM fo_messages WHERE id = ?', id);
  notify();
}

export async function syncFoMessagesDb(): Promise<void> {
  try {
    // 1. Variations array split migration
    const allMsgs = getDb().getAllSync('SELECT * FROM fo_messages') as Record<string, unknown>[];
    let migrated = false;

    for (const row of allMsgs) {
      const msg = rowToMsg(row);
      if (msg.body.startsWith('[')) {
        try {
          const parsed = JSON.parse(msg.body);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (msg.notifId) {
              await cancelNotification(msg.notifId);
            }
            getDb().runSync('DELETE FROM fo_messages WHERE id = ?', msg.id);

            for (const item of parsed) {
              await addFoMessage(
                msg.shipId,
                String(item),
                msg.scheduledHour,
                msg.senderName,
                msg.scheduledMinute,
                msg.arrivalDay,
                row.active as number,
              );
            }
            migrated = true;
          }
        } catch (_) {}
      }
    }

    // 2. Expired alarm sync
    const scheduled = await getScheduledNotifications();
    const scheduledIds = new Set(scheduled.map((s) => s.identifier));

    const activeMsgs = getDb().getAllSync(
      'SELECT id, notif_id, arrival_day FROM fo_messages WHERE active = 1 AND notif_id != ""'
    ) as { id: string; notif_id: string; arrival_day: string }[];

    let changed = false;
    for (const msg of activeMsgs) {
      const isOneShot = msg.arrival_day === 'now' || msg.arrival_day === 'today' || msg.arrival_day === 'tomorrow';
      if (isOneShot && !scheduledIds.has(msg.notif_id)) {
        getDb().runSync('UPDATE fo_messages SET active = 0, notif_id = "" WHERE id = ?', msg.id);
        changed = true;
      }
    }

    if (changed || migrated) {
      notify();
    }
  } catch (error) {
    console.error('Failed to sync F/O messages database:', error);
  }
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
