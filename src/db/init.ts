import { mediaUriFor, rescueImageSync } from '@/lib/localMedia';
import { getDb, newId } from './client';

export function initDb() {
  const db = getDb();
  // migrations for existing tables
  try { db.execSync(`ALTER TABLE ships ADD COLUMN template_key TEXT NOT NULL DEFAULT 'get-to-know'`); } catch (_) {}
  try { db.execSync(`ALTER TABLE ships ADD COLUMN ship_name TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE ships ADD COLUMN my_name TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE ships ADD COLUMN cover_uri TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE ships ADD COLUMN kind TEXT NOT NULL DEFAULT 'single'`); } catch (_) {}
  try { db.execSync(`ALTER TABLE ships ADD COLUMN members TEXT NOT NULL DEFAULT '[]'`); } catch (_) {}
  try { db.execSync(`ALTER TABLE ships ADD COLUMN fo_id TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN page_bg_color TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN page_bg_image TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN card_bg_color TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN card_bg_image TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN text_color TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN song TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN song_link TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN gallery TEXT NOT NULL DEFAULT '[]'`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN avatar_synced_uri TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN gallery_sync_map TEXT NOT NULL DEFAULT '{}'`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN card_bg_gradient TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN card_transparent INTEGER NOT NULL DEFAULT 0`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN border_style TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN decoration TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN name_font TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN status_label TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN notif_id TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN sender_name TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN current_index INTEGER NOT NULL DEFAULT 0`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN scheduled_minute INTEGER NOT NULL DEFAULT 0`); } catch (_) {}
  try { db.execSync(`ALTER TABLE dates ADD COLUMN subtitle TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE dates ADD COLUMN notif_id TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE messages ADD COLUMN image_uri TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN arrival_day TEXT NOT NULL DEFAULT 'everyday'`); } catch (_) {}
  // notification face, kept apart from the profile photo so a user can show a
  // different picture on the lock screen than on the F/O's card
  try { db.execSync(`ALTER TABLE fo ADD COLUMN notif_photo_uri TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  db.execSync(`
    CREATE TABLE IF NOT EXISTS ships (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      ship_name TEXT NOT NULL DEFAULT '',
      my_name TEXT NOT NULL DEFAULT '',
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
      template_key TEXT NOT NULL DEFAULT 'get-to-know',
      kind TEXT NOT NULL DEFAULT 'single',
      members TEXT NOT NULL DEFAULT '[]',
      fo_id TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS fo (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      pronouns TEXT NOT NULL DEFAULT '',
      fandom TEXT NOT NULL DEFAULT '',
      rel_status TEXT NOT NULL DEFAULT 'romantic',
      share_status TEXT NOT NULL DEFAULT 'selective',
      bio TEXT NOT NULL DEFAULT '',
      height TEXT NOT NULL DEFAULT '',
      weight TEXT NOT NULL DEFAULT '',
      photo_uri TEXT NOT NULL DEFAULT '',
      notif_photo_uri TEXT NOT NULL DEFAULT '',
      page_bg_color TEXT NOT NULL DEFAULT '',
      page_bg_image TEXT NOT NULL DEFAULT '',
      card_bg_color TEXT NOT NULL DEFAULT '',
      card_bg_image TEXT NOT NULL DEFAULT '',
      text_color TEXT NOT NULL DEFAULT '',
      song TEXT NOT NULL DEFAULT '',
      song_link TEXT NOT NULL DEFAULT '',
      gallery TEXT NOT NULL DEFAULT '[]',
      is_public INTEGER NOT NULL DEFAULT 0,
      avatar_synced_uri TEXT NOT NULL DEFAULT '',
      gallery_sync_map TEXT NOT NULL DEFAULT '{}',
      card_bg_gradient TEXT NOT NULL DEFAULT '',
      card_transparent INTEGER NOT NULL DEFAULT 0,
      border_style TEXT NOT NULL DEFAULT '',
      decoration TEXT NOT NULL DEFAULT '',
      name_font TEXT NOT NULL DEFAULT '',
      status_label TEXT NOT NULL DEFAULT '',
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
      image_uri TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS dates (
      id TEXT PRIMARY KEY,
      ship_id TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      yearly INTEGER NOT NULL DEFAULT 1,
      notify INTEGER NOT NULL DEFAULT 0,
      notif_id TEXT NOT NULL DEFAULT '',
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
      notif_id TEXT NOT NULL DEFAULT '',
      scheduled_hour INTEGER NOT NULL DEFAULT 9,
      scheduled_minute INTEGER NOT NULL DEFAULT 0,
      arrival_day TEXT NOT NULL DEFAULT 'everyday',
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
    CREATE TABLE IF NOT EXISTS scenario_prompts (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS custom_stickers (
      id TEXT PRIMARY KEY,
      uri TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  migrateShareVocabulary();
  backfillFos();
  repairMediaPaths();
}

// One-time rename: sharing status used to be stored as ng/welcome/mirror
// (matching the old kanji badge). Every surface now shares one vocabulary —
// yes/no/selective — so old rows get renamed in place. Idempotent: once
// renamed, these WHERE clauses match nothing on future runs.
function migrateShareVocabulary() {
  const db = getDb();
  const rename: [string, string][] = [['ng', 'no'], ['welcome', 'yes'], ['mirror', 'selective']];
  for (const [from, to] of rename) {
    db.runSync(`UPDATE ships SET share_type = ? WHERE share_type = ?`, to, from);
    db.runSync(`UPDATE fo SET share_status = ? WHERE share_status = ?`, to, from);
  }
}

// One-time link: single ships created before the fo table existed get an fo row
// seeded from their flattened identity fields. fo_id = '' guard keeps it idempotent.
function backfillFos() {
  const db = getDb();
  const orphans = db.getAllSync(
    `SELECT id, name, fandom, rel_type, share_type, about_text FROM ships WHERE kind = 'single' AND fo_id = ''`
  ) as { id: string; name: string; fandom: string; rel_type: string; share_type: string; about_text: string }[];
  for (const s of orphans) {
    const foId = newId();
    db.runSync(
      `INSERT INTO fo (id, name, fandom, rel_status, share_status, bio, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      foId, s.name ?? '', s.fandom ?? '', s.rel_type || 'romantic', s.share_type || 'selective', s.about_text ?? '', Date.now(),
    );
    db.runSync(`UPDATE ships SET fo_id = ? WHERE id = ?`, foId, s.id);
  }
}


// Runs every launch: iOS regenerates the app container uuid on reinstall, so an
// absolute path saved before a rebuild points nowhere afterwards even though the
// file is still sitting there under the same name. Rewriting the prefix here —
// once, centrally — is what lets every store keep holding a plain uri string
// with no media-aware read logic. A no-op when the prefixes already match, so
// it is safe to run on every start.
function repairMediaPaths() {
  const db = getDb();
  const prefix = mediaUriFor('');
  // matches any container's media folder, plus refs written by an earlier attempt
  const stale = /file:\/\/\/[^"']*?\/Documents\/media\//g;
  const legacyRef = /media:\/\//g;

  // Anything still sitting in Caches is readable today and gone tomorrow — iOS
  // empties that folder whenever it likes, and the container uuid in the path
  // changes on reinstall regardless. Copy each one somewhere permanent while it
  // still exists; a file already lost is left alone for the caller to notice.
  const cachesPath = /file:\/\/\/[^"']*?\/Library\/Caches\/[^"']+/g;
  const rescue = (v: string) => v.replace(cachesPath, (m) => rescueImageSync(m) ?? m);

  const fix = (v: string) => rescue(v.replace(stale, prefix).replace(legacyRef, prefix));

  // every text column that can hold a picked-image path, including the JSON
  // blobs — a string-level replace handles those without parsing them
  // template_data is keyed on a pair, so keys are a list everywhere
  const targets: [table: string, keys: string[], cols: string[]][] = [
    ['ships', ['id'], ['cover_uri', 'members']],
    ['fo', ['id'], ['photo_uri', 'notif_photo_uri', 'page_bg_image', 'card_bg_image', 'gallery']],
    ['messages', ['id'], ['image_uri']],
    ['album_photos', ['id'], ['uri']],
    ['outfits', ['id'], ['uri']],
    ['custom_stickers', ['id'], ['uri']],
    ['template_data', ['ship_id', 'template_key'], ['data_json']],
    ['settings', ['key'], ['value']],
  ];

  for (const [table, keys, cols] of targets) {
    let rows: Record<string, string>[];
    try {
      rows = db.getAllSync(`SELECT ${[...keys, ...cols].join(', ')} FROM ${table}`) as Record<string, string>[];
    } catch (e) {
      // a genuinely absent table is fine; a wrong column name is a bug, and
      // staying silent about it is how this pass would quietly do nothing
      console.warn(`[repairMediaPaths] skipped ${table}:`, e);
      continue;
    }
    const where = keys.map((k) => `${k} = ?`).join(' AND ');
    for (const row of rows) {
      for (const col of cols) {
        const before = row[col] ?? '';
        if (!before) continue;
        const after = fix(before);
        if (after !== before) {
          db.runSync(`UPDATE ${table} SET ${col} = ? WHERE ${where}`, after, ...keys.map((k) => row[k]));
        }
      }
    }
  }
}
