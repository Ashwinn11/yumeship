import { useEffect, useState } from 'react';
import { getDb, newId } from '@/db/client';
import { trackMeaningfulAction } from './review';

export type Scenario = {
  id: string;
  shipId: string;
  title: string;
  body: string;
  createdAt: number;
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

function rowToScenario(row: Record<string, unknown>): Scenario {
  return {
    id: row.id as string,
    shipId: row.ship_id as string,
    title: row.title as string,
    body: row.body as string,
    createdAt: row.created_at as number,
  };
}

export function getScenarios(shipId: string): Scenario[] {
  return (getDb().getAllSync('SELECT * FROM scenarios WHERE ship_id = ? ORDER BY created_at DESC', shipId) as Record<string, unknown>[])
    .map(rowToScenario);
}

export function addScenario(shipId: string, title: string, body: string): string {
  const id = newId();
  getDb().runSync(
    'INSERT INTO scenarios (id, ship_id, title, body, created_at) VALUES (?, ?, ?, ?, ?)',
    id, shipId, title, body, Date.now(),
  );
  notify();
  trackMeaningfulAction();
  return id;
}

export function updateScenario(id: string, d: { title?: string; body?: string }) {
  if (d.title !== undefined) getDb().runSync('UPDATE scenarios SET title = ? WHERE id = ?', d.title, id);
  if (d.body !== undefined) getDb().runSync('UPDATE scenarios SET body = ? WHERE id = ?', d.body, id);
  notify();
}

export function deleteScenario(id: string) {
  getDb().runSync('DELETE FROM scenarios WHERE id = ?', id);
  notify();
}

export function useScenarios(shipId: string): Scenario[] {
  const [scenarios, setScenarios] = useState<Scenario[]>(() => getScenarios(shipId));
  useEffect(() => {
    const fn = () => setScenarios(getScenarios(shipId));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [shipId]);
  return scenarios;
}
