import { useState, useEffect } from 'react';

export type Ship = {
  id: string;
  templateKey: string;
  foName: string;
  data: Record<string, string>;
  createdAt: number;
};

let ships: Ship[] = [];
const listeners = new Set<() => void>();

function notify() { listeners.forEach((fn) => fn()); }

export function addShip(d: { templateKey: string; foName: string; data?: Record<string, string> }): string {
  const id = String(Date.now());
  ships = [{ ...d, data: d.data ?? {}, id, createdAt: Date.now() }, ...ships];
  notify();
  return id;
}

export function updateShip(id: string, d: { foName?: string; data?: Record<string, string> }) {
  ships = ships.map((s) => (s.id === id ? { ...s, ...d } : s));
  notify();
}

export function deleteShip(id: string) {
  ships = ships.filter((s) => s.id !== id);
  notify();
}

export function getShip(id: string): Ship | undefined {
  return ships.find((s) => s.id === id);
}

export function useShips(): Ship[] {
  const [, rerender] = useState(0);
  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return ships;
}

export function daysAgo(createdAt: number): string {
  const d = Math.floor((Date.now() - createdAt) / 86_400_000);
  return d === 0 ? 'today' : `${d}d`;
}
