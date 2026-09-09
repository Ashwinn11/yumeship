import { useEffect, useState } from 'react';
import { getDb, newId } from '@/db/client';
import { getAllFos, getFo } from './fo';
import { getShip } from './ships';
import { cancelNotification, getScheduledNotifications, scheduleFoNotification, scheduleOneShotAtDate } from './notifications';

export type SenderOption = {
  id: string;
  name: string;
  /** profile photo — what the picker chip shows */
  photoUri: string;
  /** notification face, when this sender is an F/O with one set */
  notifPhotoUri: string;
  /** false for ship members with no F/O record — nothing to attach a face to */
  isFo: boolean;
};

/** The picture a notification from this sender should wear. */
export function senderFace(o: SenderOption | undefined): string {
  return o ? o.notifPhotoUri || o.photoUri : '';
}

/**
 * Who a message can be "from", and the face that goes with each.
 *
 * Ordered by closeness to this ship — its own roster and linked F/O first —
 * but every other F/O follows, because a message is not required to come from
 * someone already on the ship. Deduped by name since that is what the avatar
 * lookup matches on.
 */
export function senderOptions(shipId: string, shipName = ''): SenderOption[] {
  const ship = getShip(shipId);
  const out: SenderOption[] = [];
  const byName = new Map<string, SenderOption>();

  // Ship members are listed first for ordering, but they rarely carry a photo —
  // ShipMember.photoUri is only ever set on the poly-dynamics screen. So a
  // duplicate name is not skipped outright: if the later entry (usually the F/O
  // record) has the face this one is missing, it fills the gap in place.
  const push = (o: SenderOption) => {
    const key = o.name.trim().toLowerCase();
    if (!key) return;
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, o);
      out.push(o);
      return;
    }
    // an F/O record arriving after a same-named ship member supplies the face
    // and identity that member entry lacks
    if (o.isFo && !existing.isFo) {
      existing.id = o.id;
      existing.isFo = true;
      existing.notifPhotoUri = o.notifPhotoUri;
      if (!existing.photoUri) existing.photoUri = o.photoUri;
    } else if (!existing.photoUri && o.photoUri) {
      existing.photoUri = o.photoUri;
    }
  };

  for (const m of ship?.members ?? []) {
    if (!m.isMe) {
      push({ id: m.id, name: m.name, photoUri: m.photoUri ?? '', notifPhotoUri: '', isFo: false });
    }
  }
  const linked = getFo(ship?.foId ?? '');
  if (linked) {
    push({ id: linked.id, name: linked.name, photoUri: linked.photoUri, notifPhotoUri: linked.notifPhotoUri, isFo: true });
  }
  for (const fo of getAllFos()) {
    push({ id: fo.id, name: fo.name, photoUri: fo.photoUri, notifPhotoUri: fo.notifPhotoUri, isFo: true });
  }

  if (out.length === 0) {
    const name = shipName || ship?.shipName || ship?.name || '';
    if (name) push({ id: shipId, name, photoUri: '', notifPhotoUri: '', isFo: false });
  }

  return out;
}

/**
 * The face for a specific sender. Matching on name (rather than the ship's one
 * linked F/O) is what keeps a polyship honest — a message from one partner must
 * not arrive wearing another's photo. No match means no avatar, and the
 * scheduler quietly falls back to a plain notification.
 */
function foIdentity(shipId: string, senderName: string, senderId = ''): { avatarUri: string; conversationId: string } {
  const options = senderOptions(shipId);
  const match = options.find((o) => o.id === senderId) ?? options.find(
    (o) => o.name.trim().toLowerCase() === senderName.trim().toLowerCase(),
  );
  const face = senderFace(match);
  if (face) return { avatarUri: face, conversationId: match!.id };
  return { avatarUri: '', conversationId: match?.id ?? shipId };
}

export type FoMessage = {
  id: string;
  shipId: string;
  body: string;
  senderName: string;
  senderId: string;
  scheduledHour: number;
  scheduledMinute: number;
  arrivalDay: 'now' | 'today' | 'tomorrow' | 'everyday' | 'random';
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
    senderId: (r.sender_id as string) ?? '',
    scheduledHour: r.scheduled_hour as number,
    scheduledMinute: (r.scheduled_minute as number) ?? 0,
    arrivalDay: (r.arrival_day as FoMessage['arrivalDay']) ?? 'everyday',
    active: !!(r.active as number),
    notifId: (r.notif_id as string) ?? '',
    currentIndex: (r.current_index as number) ?? 0,
    createdAt: r.created_at as number,
  };
}

// ─── Random scheduling helpers ──────────────────────────────────────────────

const RANDOM_HOUR_POOL = [6, 8, 10, 12, 14, 16, 18, 20, 22];
const RANDOM_DAYS_AHEAD = 7;

/**
 * Seeded shuffle of the hour pool for a given calendar date.
 * Using the date as a seed means every call for the same day gets the same shuffle,
 * so different messages can independently pick non-colliding lanes.
 */
function shufflePoolForDay(date: Date): number[] {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const arr = [...RANDOM_HOUR_POOL];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = Math.imul(s, 1664525) + 1013904223;
    const j = Math.abs(s) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Schedules RANDOM_DAYS_AHEAD one-shot notifications for a random message.
 * Each day gets a different hour (seeded per-day), and the lane index ensures
 * multiple random messages from the same ship don't collide.
 * Returns a JSON-encoded array of notification IDs.
 */
async function scheduleRandomDays(
  shipId: string,
  msgId: string,
  body: string,
  foName: string,
  daysAhead = RANDOM_DAYS_AHEAD,
): Promise<string> {
  // Hours already locked in by non-random messages (everyday/today/tomorrow)
  const fixedMsgs = getDb().getAllSync(
    'SELECT scheduled_hour FROM fo_messages WHERE ship_id = ? AND active = 1 AND arrival_day != "random" AND id != ?',
    shipId, msgId,
  ) as { scheduled_hour: number }[];
  const takenHours = new Set(fixedMsgs.map((r) => r.scheduled_hour));

  // Pool with fixed-time hours excluded
  const availablePool = RANDOM_HOUR_POOL.filter((h) => !takenHours.has(h));
  // Fallback to full pool if all hours are somehow taken
  const pool = availablePool.length > 0 ? availablePool : RANDOM_HOUR_POOL;

  // Determine lane: how many other active random messages exist for this ship
  const existing = getDb().getAllSync(
    'SELECT id FROM fo_messages WHERE ship_id = ? AND arrival_day = "random" AND active = 1 AND id != ?',
    shipId, msgId,
  ) as { id: string }[];
  const lane = existing.length % pool.length;

  const ids: string[] = [];

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setSeconds(0, 0);

    const shuffled = shufflePoolForDay(date).filter((h) => pool.includes(h));
    const hour = shuffled[lane % shuffled.length];
    date.setHours(hour, 0, 0, 0);

    // If the slot is already in the past, push it to tomorrow
    if (date.getTime() <= Date.now()) {
      date.setDate(date.getDate() + 1);
    }

    const id = await scheduleOneShotAtDate(body, foName, date);
    if (id) ids.push(id);
  }

  return JSON.stringify(ids);
}

/**
 * Parses a notifId field that may be a single ID string or a JSON array of IDs.
 */
function parseNotifIds(notifId: string): string[] {
  if (!notifId) return [];
  if (notifId.startsWith('[')) {
    try { return JSON.parse(notifId) as string[]; } catch (_) {}
  }
  return [notifId];
}

/**
 * Cancels all notification IDs stored in a notifId field.
 */
async function cancelAllNotifIds(notifId: string): Promise<void> {
  for (const id of parseNotifIds(notifId)) {
    await cancelNotification(id);
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

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
  senderId = '',
): Promise<string> {
  const id = newId();
  getDb().runSync(
    'INSERT INTO fo_messages (id, ship_id, body, sender_name, sender_id, scheduled_hour, scheduled_minute, arrival_day, active, notif_id, current_index, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)',
    id, shipId, body, senderName, senderId, scheduledHour, scheduledMinute, arrivalDay, active, '', Date.now(),
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

  let notifId = '';

  if (active === 1) {
    if (arrivalDay === 'random') {
      notifId = await scheduleRandomDays(shipId, id, triggerBody, senderName);
    } else {
      // Calculate stagger index for "now" type
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

      const { avatarUri, conversationId } = foIdentity(shipId, senderName, senderId);
      const nid = await scheduleFoNotification(triggerBody, senderName, arrivalDay, targetHour, targetMinute, staggerIndex, avatarUri, conversationId);
      if (nid) notifId = nid;
    }

    if (notifId) {
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
    await cancelAllNotifIds(msg.notifId);
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

    let newNotifId = '';

    if (msg.arrivalDay === 'random') {
      newNotifId = await scheduleRandomDays(msg.shipId, id, triggerBody, msg.senderName || foName);
    } else {
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

      const { avatarUri, conversationId } = foIdentity(msg.shipId, msg.senderName || foName, msg.senderId);
      const nid = await scheduleFoNotification(triggerBody, msg.senderName || foName, msg.arrivalDay, targetHour, targetMinute, staggerIndex, avatarUri, conversationId);
      if (nid) newNotifId = nid;
    }

    const nextIndex = parsedLength > 1 ? (msg.currentIndex + 1) % parsedLength : 0;
    getDb().runSync(
      'UPDATE fo_messages SET active = 1, notif_id = ?, current_index = ? WHERE id = ?',
      newNotifId, nextIndex, id,
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
  senderId = '',
): Promise<void> {
  const row = getDb().getFirstSync('SELECT * FROM fo_messages WHERE id = ?', id) as Record<string, unknown> | null;
  if (!row) return;
  const msg = rowToMsg(row);

  if (msg.notifId) {
    await cancelAllNotifIds(msg.notifId);
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

    if (arrivalDay === 'random') {
      notifId = await scheduleRandomDays(msg.shipId, id, triggerBody, senderName);
    } else {
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

      const { avatarUri, conversationId } = foIdentity(msg.shipId, senderName, senderId || msg.senderId);
      notifId = await scheduleFoNotification(triggerBody, senderName, arrivalDay, targetHour, targetMinute, staggerIndex, avatarUri, conversationId) ?? '';
    }

    newIndex = parsedLength > 1 ? 1 : 0;
  }

  getDb().runSync(
    'UPDATE fo_messages SET body = ?, sender_name = ?, sender_id = ?, scheduled_hour = ?, scheduled_minute = ?, arrival_day = ?, notif_id = ?, current_index = ? WHERE id = ?',
    body, senderName, senderId || msg.senderId, scheduledHour, scheduledMinute, arrivalDay, notifId, newIndex, id,
  );

  notify();
}

export async function deleteFoMessage(id: string): Promise<void> {
  const row = getDb().getFirstSync('SELECT notif_id FROM fo_messages WHERE id = ?', id) as { notif_id: string } | null;
  if (row?.notif_id) await cancelAllNotifIds(row.notif_id);
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
              await cancelAllNotifIds(msg.notifId);
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

    // 2. Sync expired / partially-consumed notifications
    const scheduled = await getScheduledNotifications();
    const scheduledIds = new Set(scheduled.map((s) => s.identifier));

    const activeMsgs = getDb().getAllSync(
      'SELECT id, ship_id, body, sender_name, notif_id, arrival_day FROM fo_messages WHERE active = 1 AND notif_id != ""'
    ) as { id: string; ship_id: string; body: string; sender_name: string; notif_id: string; arrival_day: string }[];

    let changed = false;

    for (const msg of activeMsgs) {
      const ids = parseNotifIds(msg.notif_id);

      if (msg.arrival_day === 'random') {
        // Filter to only the IDs still pending
        const remaining = ids.filter((i) => scheduledIds.has(i));

        if (remaining.length < RANDOM_DAYS_AHEAD) {
          // Top up: schedule enough days to reach RANDOM_DAYS_AHEAD again
          const needed = RANDOM_DAYS_AHEAD - remaining.length;
          const newIds = await scheduleRandomDays(msg.ship_id, msg.id, msg.body, msg.sender_name, needed);
          const merged = JSON.stringify([...remaining, ...JSON.parse(newIds)]);
          getDb().runSync('UPDATE fo_messages SET notif_id = ? WHERE id = ?', merged, msg.id);
          changed = true;
        }
      } else {
        // One-shot modes: mark inactive once the notification has fired
        const isOneShot = msg.arrival_day === 'now' || msg.arrival_day === 'today' || msg.arrival_day === 'tomorrow';
        if (isOneShot && !scheduledIds.has(ids[0] ?? '')) {
          getDb().runSync('UPDATE fo_messages SET active = 0, notif_id = "" WHERE id = ?', msg.id);
          changed = true;
        }
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
