import { useEffect, useState } from 'react';
import { getDb } from '@/db/client';

export type FoMessage = {
  id: string;
  shipId: string;
  body: string;
  scheduledHour: number;
  active: boolean;
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
    createdAt: r.created_at as number,
  };
}

export function getFoMessages(shipId: string): FoMessage[] {
  return (getDb().getAllSync(
    'SELECT * FROM fo_messages WHERE ship_id = ? ORDER BY created_at DESC',
    shipId,
  ) as Record<string, unknown>[]).map(rowToMsg);
}

export function addFoMessage(shipId: string, body: string, scheduledHour = 9): string {
  const id = String(Date.now());
  getDb().runSync(
    'INSERT INTO fo_messages (id, ship_id, body, scheduled_hour, active, created_at) VALUES (?, ?, ?, ?, 1, ?)',
    id, shipId, body, scheduledHour, Date.now(),
  );
  notify();
  return id;
}

export function toggleFoMessage(id: string, active: boolean) {
  getDb().runSync('UPDATE fo_messages SET active = ? WHERE id = ?', active ? 1 : 0, id);
  notify();
}

export function deleteFoMessage(id: string) {
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
