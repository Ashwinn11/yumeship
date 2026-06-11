import { useEffect, useState } from 'react';
import { getDb, newId } from '@/db/client';
import { trackMeaningfulAction } from './review';

export type StorylineEvent = {
  id: string;
  shipId: string;
  emoji: string;
  title: string;
  date: string;
  body: string;
  createdAt: number;
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

function rowToEvent(r: Record<string, unknown>): StorylineEvent {
  return {
    id: r.id as string,
    shipId: r.ship_id as string,
    emoji: (r.emoji as string) || '✦',
    title: r.title as string,
    date: r.date as string,
    body: r.body as string,
    createdAt: r.created_at as number,
  };
}

export function getStorylineEvents(shipId: string): StorylineEvent[] {
  return (getDb().getAllSync(
    'SELECT * FROM storyline_events WHERE ship_id = ? ORDER BY date ASC, created_at ASC',
    shipId,
  ) as Record<string, unknown>[]).map(rowToEvent);
}

export function addStorylineEvent(shipId: string, d: { emoji?: string; title: string; date?: string; body?: string }): string {
  const id = newId();
  getDb().runSync(
    'INSERT INTO storyline_events (id, ship_id, emoji, title, date, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    id, shipId, d.emoji ?? '✦', d.title, d.date ?? '', d.body ?? '', Date.now(),
  );
  notify();
  trackMeaningfulAction();
  return id;
}

export function deleteStorylineEvent(id: string) {
  getDb().runSync('DELETE FROM storyline_events WHERE id = ?', id);
  notify();
}

export function useStorylineEvents(shipId: string): StorylineEvent[] {
  const [events, setEvents] = useState<StorylineEvent[]>(() => getStorylineEvents(shipId));
  useEffect(() => {
    const fn = () => setEvents(getStorylineEvents(shipId));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [shipId]);
  return events;
}
