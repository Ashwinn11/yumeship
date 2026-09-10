import { localFileMissing, mediaUriFor, rescueImageSync } from '@/lib/localMedia';
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
  try { db.execSync(`ALTER TABLE fo ADD COLUMN color TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN border_style TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN name_font TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN status_label TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN notif_id TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN sender_name TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN sender_id TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN current_index INTEGER NOT NULL DEFAULT 0`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN scheduled_minute INTEGER NOT NULL DEFAULT 0`); } catch (_) {}
  try { db.execSync(`ALTER TABLE dates ADD COLUMN subtitle TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE dates ADD COLUMN notif_id TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE messages ADD COLUMN image_uri TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo_messages ADD COLUMN arrival_day TEXT NOT NULL DEFAULT 'everyday'`); } catch (_) {}
  // notification face, kept apart from the profile photo so a user can show a
  // different picture on the lock screen than on the F/O's card
  try { db.execSync(`ALTER TABLE fo ADD COLUMN notif_photo_uri TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  // free text like height/weight — a character's birthday is often a day with no
  // year ("March 3"), and their age is as often "looks 20, canonically ancient"
  try { db.execSync(`ALTER TABLE fo ADD COLUMN age TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN birthday TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN labels TEXT NOT NULL DEFAULT '[]'`); } catch (_) {}
  // flags absorbed the old `labels` list and the single `status_label`; tagline is
  // the short bio that sits on the card itself — see migrateFlags below
  try { db.execSync(`ALTER TABLE fo ADD COLUMN flags TEXT NOT NULL DEFAULT '[]'`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN tagline TEXT NOT NULL DEFAULT ''`); } catch (_) {}
  try { db.execSync(`ALTER TABLE fo ADD COLUMN links TEXT NOT NULL DEFAULT '[]'`); } catch (_) {}
  // the profile card's "about" section is gone — tagline is the one bio-like
  // field that lives on the card itself now
  try { db.execSync(`ALTER TABLE fo DROP COLUMN bio`); } catch (_) {}
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
      tagline TEXT NOT NULL DEFAULT '',
      links TEXT NOT NULL DEFAULT '[]',
      height TEXT NOT NULL DEFAULT '',
      weight TEXT NOT NULL DEFAULT '',
      age TEXT NOT NULL DEFAULT '',
      birthday TEXT NOT NULL DEFAULT '',
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
      name_font TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '',
      status_label TEXT NOT NULL DEFAULT '',
      flags TEXT NOT NULL DEFAULT '[]',
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
      sender_id TEXT NOT NULL DEFAULT '',
      notif_id TEXT NOT NULL DEFAULT '',
      scheduled_hour INTEGER NOT NULL DEFAULT 9,
      scheduled_minute INTEGER NOT NULL DEFAULT 0,
      arrival_day TEXT NOT NULL DEFAULT 'everyday',
      active INTEGER NOT NULL DEFAULT 1,
      current_index INTEGER NOT NULL DEFAULT 0,
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
  migrateFlags();
  backfillFos();
  repairMediaPaths();
  applyRemoteFallbacks();
}

// One-time rename: sharing status used to be stored as ng/welcome/mirror
// (matching the old kanji badge). Every surface now shares one vocabulary —
// yes/no/selective — so old rows get renamed in place. Idempotent: once
// renamed, these WHERE clauses match nothing on future runs.
// Flags and sexuality were two fields for one idea. Fold the old `labels` list
// and the single `status_label` into `flags`, keeping both. Idempotent — only
// touches rows whose flags are still empty.
function migrateFlags() {
  const db = getDb();
  type Legacy = { id?: string; icon?: string; flag?: string; imageUrl?: string; text?: string };
  const toFlags = (rawLabels: string, statusLabel: string) => {
    let parsed: unknown = [];
    try { parsed = JSON.parse(rawLabels || '[]'); } catch { parsed = []; }
    const list = (Array.isArray(parsed) ? parsed : []).map((e: Legacy) => ({
      id: e?.id ?? newId(),
      flag: e?.flag ?? e?.icon ?? '',
      imageUrl: e?.imageUrl ?? '',
      text: e?.text ?? '',
    }));
    // the old text doubles as the flag key when it names one we can draw
    if (statusLabel) list.push({ id: 'legacy-sexuality', flag: statusLabel.toLowerCase(), imageUrl: '', text: statusLabel });
    return list;
  };

  try {
    const rows = db.getAllSync(`SELECT id, labels, status_label FROM fo WHERE flags = '[]'`) as
      { id: string; labels: string | null; status_label: string | null }[];
    for (const r of rows) {
      const flags = toFlags(r.labels ?? '', r.status_label ?? '');
      if (flags.length) db.runSync(`UPDATE fo SET flags = ? WHERE id = ?`, JSON.stringify(flags), r.id);
    }
  } catch (_) {}

  try {
    const read = (k: string) =>
      (db.getFirstSync(`SELECT value FROM settings WHERE key = ?`, k) as { value?: string } | null)?.value ?? '';
    if (!read('user_flags')) {
      const flags = toFlags(read('user_labels'), read('user_status_label'));
      if (flags.length) {
        db.runSync(
          `INSERT INTO settings (key, value) VALUES ('user_flags', ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
          JSON.stringify(flags),
        );
      }
    }
  } catch (_) {}
}

// Runs on every launch, so it must only ever rename vocabulary that is no longer
// valid. 'mirror' was once folded into 'selective' here; it is a real stance
// again (mirror-sharing), so renaming it now would wipe the value on restart.
function migrateShareVocabulary() {
  const db = getDb();
  const rename: [string, string][] = [['ng', 'no'], ['welcome', 'yes']];
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
    `SELECT id, name, fandom, rel_type, share_type FROM ships WHERE kind = 'single' AND fo_id = ''`
  ) as { id: string; name: string; fandom: string; rel_type: string; share_type: string }[];
  for (const s of orphans) {
    const foId = newId();
    db.runSync(
      `INSERT INTO fo (id, name, fandom, rel_status, share_status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      foId, s.name ?? '', s.fandom ?? '', s.rel_type || 'romantic', s.share_type || 'selective', Date.now(),
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

  // a legacy `media://` ref that never had a filename (no photo was set when it
  // was written) rewrites to the bare directory itself — not a usable file, so
  // strip it back down to empty rather than leave something that throws the
  // moment any code tries to open it as a file
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const danglingDir = new RegExp(`${escapedPrefix}(?=["'},]|$)`, 'g');
  const fix = (v: string) => rescue(v.replace(stale, prefix).replace(legacyRef, prefix).replace(danglingDir, ''));

  // every text column that can hold a picked-image path, including the JSON
  // blobs — a string-level replace handles those without parsing them
  // template_data is keyed on a pair, so keys are a list everywhere
  const targets: [table: string, keys: string[], cols: string[]][] = [
    ['ships', ['id'], ['cover_uri', 'members']],
    // avatar_synced_uri and gallery_sync_map are keyed *by local path*, so they
    // have to move in lockstep — otherwise a rescued photo no longer matches its
    // own bookkeeping and the next publish re-uploads everything
    ['fo', ['id'], ['photo_uri', 'notif_photo_uri', 'page_bg_image', 'card_bg_image', 'gallery', 'labels',
                    'avatar_synced_uri', 'gallery_sync_map']],
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

// Part B of the media-durability work: a picked photo can still be lost after
// publish — evicted cache, a device wipe, a rescue that ran too late — even
// though an exact copy is already sitting on the server. Rather than teach
// every screen to fall back at read time, resolve it once here: if a stored
// local path is missing on disk *and* the {localUri: remoteUrl} sync map has a
// matching entry, swap the column to the remote url outright. From then on the
// row just holds a normal url, same as any other, and the invariant that
// stores hold one plain string per field is never broken.
//
// Only the two record kinds that are ever published carry a sync map — ships,
// messages, albums, outfits and stickers have nothing to fall back to, so they
// are untouched here (the previous pass already rescued what it could of those).
function applyRemoteFallbacks() {
  const db = getDb();

  function fallback(value: string, syncMap: Record<string, string>): string {
    if (!value || !localFileMissing(value)) return value;
    return syncMap[value] ?? value;
  }

  function fallbackGallery(raw: string, syncMap: Record<string, string>): string {
    let photos: { uri?: string; caption?: string }[];
    try {
      const parsed = JSON.parse(raw || '[]');
      if (!Array.isArray(parsed)) return raw;
      photos = parsed;
    } catch {
      return raw;
    }
    let changed = false;
    const next = photos.map((p) => {
      if (typeof p?.uri !== 'string') return p;
      const swapped = fallback(p.uri, syncMap);
      if (swapped !== p.uri) changed = true;
      return changed ? { ...p, uri: swapped } : p;
    });
    return changed ? JSON.stringify(next) : raw;
  }

  // Labels store their custom image under `imageUrl` rather than `uri` — same
  // shape/logic as fallbackGallery otherwise, since a label's image rides the
  // exact same {localUri: remoteUrl} map (see labelImageUris in community.ts).
  function fallbackLabels(raw: string, syncMap: Record<string, string>): string {
    let labels: { imageUrl?: string }[];
    try {
      const parsed = JSON.parse(raw || '[]');
      if (!Array.isArray(parsed)) return raw;
      labels = parsed;
    } catch {
      return raw;
    }
    let changed = false;
    const next = labels.map((l) => {
      if (typeof l?.imageUrl !== 'string' || !l.imageUrl) return l;
      const swapped = fallback(l.imageUrl, syncMap);
      if (swapped !== l.imageUrl) changed = true;
      return changed ? { ...l, imageUrl: swapped } : l;
    });
    return changed ? JSON.stringify(next) : raw;
  }

  // F/O profiles: one sync map per row
  let foRows: Record<string, string>[];
  try {
    foRows = db.getAllSync(
      'SELECT id, photo_uri, page_bg_image, card_bg_image, gallery, labels, gallery_sync_map FROM fo',
    ) as Record<string, string>[];
  } catch (e) {
    console.warn('[applyRemoteFallbacks] skipped fo:', e);
    foRows = [];
  }
  for (const row of foRows) {
    let syncMap: Record<string, string>;
    try {
      syncMap = JSON.parse(row.gallery_sync_map || '{}');
    } catch {
      continue;
    }
    if (!syncMap || Object.keys(syncMap).length === 0) continue;

    const photoUri = fallback(row.photo_uri, syncMap);
    const pageBgImage = fallback(row.page_bg_image, syncMap);
    const cardBgImage = fallback(row.card_bg_image, syncMap);
    const gallery = fallbackGallery(row.gallery, syncMap);
    const labels = fallbackLabels(row.labels, syncMap);

    if (
      photoUri !== row.photo_uri ||
      pageBgImage !== row.page_bg_image ||
      cardBgImage !== row.card_bg_image ||
      gallery !== row.gallery ||
      labels !== row.labels
    ) {
      db.runSync(
        'UPDATE fo SET photo_uri = ?, page_bg_image = ?, card_bg_image = ?, gallery = ?, labels = ? WHERE id = ?',
        photoUri, pageBgImage, cardBgImage, gallery, labels, row.id,
      );
    }
  }

  // The user's own profile: settings is a flat key/value table, not one row —
  // read the handful of keys involved directly rather than looping generically.
  let settingsRow: { user_avatar: string; user_card_bg_image: string; user_page_bg_image: string; user_gallery: string; user_labels: string; user_gallery_sync_map: string } | null = null;
  try {
    const rows = db.getAllSync(
      `SELECT key, value FROM settings WHERE key IN ('user_avatar','user_card_bg_image','user_page_bg_image','user_gallery','user_labels','user_gallery_sync_map')`,
    ) as { key: string; value: string }[];
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    settingsRow = {
      user_avatar: byKey.user_avatar ?? '',
      user_card_bg_image: byKey.user_card_bg_image ?? '',
      user_page_bg_image: byKey.user_page_bg_image ?? '',
      user_gallery: byKey.user_gallery ?? '',
      user_labels: byKey.user_labels ?? '',
      user_gallery_sync_map: byKey.user_gallery_sync_map ?? '',
    };
  } catch (e) {
    console.warn('[applyRemoteFallbacks] skipped settings:', e);
  }

  if (settingsRow) {
    let syncMap: Record<string, string>;
    try {
      syncMap = JSON.parse(settingsRow.user_gallery_sync_map || '{}');
    } catch {
      syncMap = {};
    }
    if (Object.keys(syncMap).length > 0) {
      const updates: [string, string][] = [];

      const avatar = fallback(settingsRow.user_avatar, syncMap);
      if (avatar !== settingsRow.user_avatar) updates.push(['user_avatar', avatar]);

      const cardBg = fallback(settingsRow.user_card_bg_image, syncMap);
      if (cardBg !== settingsRow.user_card_bg_image) updates.push(['user_card_bg_image', cardBg]);

      const pageBg = fallback(settingsRow.user_page_bg_image, syncMap);
      if (pageBg !== settingsRow.user_page_bg_image) updates.push(['user_page_bg_image', pageBg]);

      const gallery = fallbackGallery(settingsRow.user_gallery, syncMap);
      if (gallery !== settingsRow.user_gallery) updates.push(['user_gallery', gallery]);

      const labels = fallbackLabels(settingsRow.user_labels, syncMap);
      if (labels !== settingsRow.user_labels) updates.push(['user_labels', labels]);

      for (const [key, value] of updates) {
        db.runSync('UPDATE settings SET value = ? WHERE key = ?', value, key);
      }
    }
  }
}
