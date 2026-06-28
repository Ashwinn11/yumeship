import { useEffect, useState } from 'react';
import { getDb, newId } from '@/db/client';
import { trackMeaningfulAction } from './review';

export type Thread = {
  id: string;
  shipId: string;
  title: string;
  lastMessage: string;
  lastAt: number;
  createdAt: number;
};

export type Message = {
  id: string;
  threadId: string;
  // 'me' / 'them' for single ships (legacy); a member id for polyship group chats.
  sender: string;
  body: string;
  createdAt: number;
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

export function getThreads(shipId: string): Thread[] {
  return (getDb().getAllSync(
    `SELECT t.*,
      (SELECT body FROM messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_at
     FROM message_threads t WHERE t.ship_id = ? ORDER BY t.created_at DESC`,
    shipId,
  ) as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    shipId: r.ship_id as string,
    title: r.title as string,
    lastMessage: (r.last_message as string) ?? '',
    lastAt: (r.last_at as number) ?? (r.created_at as number),
    createdAt: r.created_at as number,
  }));
}

export function addThread(shipId: string, title: string): string {
  const id = newId();
  getDb().runSync(
    'INSERT INTO message_threads (id, ship_id, title, created_at) VALUES (?, ?, ?, ?)',
    id, shipId, title, Date.now(),
  );
  notify();
  return id;
}

export function deleteThread(id: string) {
  getDb().runSync('DELETE FROM messages WHERE thread_id = ?', id);
  getDb().runSync('DELETE FROM message_threads WHERE id = ?', id);
  notify();
}

export function getMessages(threadId: string): Message[] {
  return (getDb().getAllSync(
    'SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC',
    threadId,
  ) as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    threadId: r.thread_id as string,
    sender: r.sender as string,
    body: r.body as string,
    createdAt: r.created_at as number,
  }));
}

export function addMessage(threadId: string, sender: string, body: string): string {
  const id = newId();
  getDb().runSync(
    'INSERT INTO messages (id, thread_id, sender, body, created_at) VALUES (?, ?, ?, ?, ?)',
    id, threadId, sender, body, Date.now(),
  );
  notify();
  trackMeaningfulAction();
  return id;
}

export function deleteMessage(id: string) {
  getDb().runSync('DELETE FROM messages WHERE id = ?', id);
  notify();
}

export function useThreads(shipId: string): Thread[] {
  const [threads, setThreads] = useState<Thread[]>(() => getThreads(shipId));
  useEffect(() => {
    const fn = () => setThreads(getThreads(shipId));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [shipId]);
  return threads;
}

export function useMessages(threadId: string): Message[] {
  const [msgs, setMsgs] = useState<Message[]>(() => getMessages(threadId));
  useEffect(() => {
    const fn = () => setMsgs(getMessages(threadId));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [threadId]);
  return msgs;
}
