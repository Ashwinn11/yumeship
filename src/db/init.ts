import { getDb } from './client';

export function initDb() {
  const db = getDb();
  // migrations for existing tables
  try { db.execSync(`ALTER TABLE ships ADD COLUMN template_key TEXT NOT NULL DEFAULT 'get-to-know'`); } catch (_) {}
  try { db.execSync(`ALTER TABLE ships ADD COLUMN ship_name TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE ships ADD COLUMN my_name TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN notif_id TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN sender_name TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN current_index INTEGER NOT NULL DEFAULT 0`); } catch (_) {}
  try { db.execSync(`ALTER TABLE dates ADD COLUMN subtitle TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  db.execSync(`
    CREATE TABLE IF NOT EXISTS ships (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      fandom TEXT NOT NULL DEFAULT '',
      rel_type TEXT NOT NULL DEFAULT 'romantic',
      share_type TEXT NOT NULL DEFAULT '',
      nickname TEXT NOT NULL DEFAULT '',
      cover_uri TEXT NOT NULL DEFAULT '',
      about_text TEXT NOT NULL DEFAULT '',
      grad_start TEXT NOT NULL DEFAULT '#f3b6c4',
      grad_end TEXT NOT NULL DEFAULT '#d77a8d',
      tape_pattern TEXT NOT NULL DEFAULT 'heart',
      tape_color TEXT NOT NULL DEFAULT 'rgba(255,255,255,0.9)',
      pinned INTEGER NOT NULL DEFAULT 0,
      start_date TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS headcanons (
      id TEXT PRIMARY KEY,
      ship_id TEXT NOT NULL,
      category TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      ship_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS message_threads (
      id TEXT PRIMARY KEY,
      ship_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS dates (
      id TEXT PRIMARY KEY,
      ship_id TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      yearly INTEGER NOT NULL DEFAULT 1,
      notify INTEGER NOT NULL DEFAULT 0,
      subtitle TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      ship_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS album_photos (
      id TEXT PRIMARY KEY,
      album_id TEXT NOT NULL,
      uri TEXT NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS outfits (
      id TEXT PRIMARY KEY,
      ship_id TEXT NOT NULL,
      title TEXT NOT NULL,
      uri TEXT NOT NULL DEFAULT '',
      occasion TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS template_data (
      ship_id TEXT NOT NULL,
      template_key TEXT NOT NULL,
      data_json TEXT NOT NULL DEFAULT '{}',
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (ship_id, template_key)
    );
    CREATE TABLE IF NOT EXISTS fo_messages (
      id TEXT PRIMARY KEY,
      ship_id TEXT NOT NULL,
      body TEXT NOT NULL,
      sender_name TEXT NOT NULL DEFAULT '',
      scheduled_hour INTEGER NOT NULL DEFAULT 9,
      active INTEGER NOT NULL DEFAULT 1,
      current_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS storyline_events (
      id TEXT PRIMARY KEY,
      ship_id TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '✦',
      title TEXT NOT NULL,
      date TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS this_or_that_pairs (
      id TEXT PRIMARY KEY,
      ship_id TEXT NOT NULL,
      left_opt TEXT NOT NULL DEFAULT '',
      right_opt TEXT NOT NULL DEFAULT '',
      choice TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS love_letters (
      id TEXT PRIMARY KEY,
      ship_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      paper TEXT NOT NULL DEFAULT 'lined',
      sticker TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
