import { int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ─── Personas (S/I characters) ───────────────────────────────────────────────
export const personas = sqliteTable('personas', {
  id:          text('id').primaryKey(),
  name:        text('name').notNull(),
  avatarPath:  text('avatar_path'),
  description: text('description').notNull().default(''),
  pronouns:    text('pronouns').notNull().default(''),
  accentColor: text('accent_color').notNull().default('sakura'),
  isActive:    int('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt:   int('created_at', { mode: 'timestamp' }).notNull(),
});

// ─── Fictional Others (F/Os) ─────────────────────────────────────────────────
export const fictionalOthers = sqliteTable('fictional_others', {
  id:                   text('id').primaryKey(),
  personaId:            text('persona_id').notNull().references(() => personas.id, { onDelete: 'cascade' }),
  name:                 text('name').notNull(),
  fandom:               text('fandom').notNull().default(''),
  coverImagePath:       text('cover_image_path'),
  relationshipType:     text('relationship_type').notNull().default('romantic'), // romantic | platonic | familial
  nickname:             text('nickname').notNull().default(''),
  sharingPreference:    text('sharing_preference').notNull().default('ng'), // ng | welcome | mirror
  tags:                 text('tags').notNull().default('[]'), // JSON string[]
  notes:                text('notes').notNull().default(''),
  relationshipStartDate:int('relationship_start_date', { mode: 'timestamp' }),
  isPinned:             int('is_pinned', { mode: 'boolean' }).notNull().default(false),
  sortOrder:            int('sort_order').notNull().default(0),
  createdAt:            int('created_at', { mode: 'timestamp' }).notNull(),
});

// ─── Headcanons ───────────────────────────────────────────────────────────────
export const headcanons = sqliteTable('headcanons', {
  id:        text('id').primaryKey(),
  foId:      text('fo_id').notNull().references(() => fictionalOthers.id, { onDelete: 'cascade' }),
  content:   text('content').notNull(),
  category:  text('category').notNull().default('random'), // personality | habits | favorites | how_met | in_their_world | random
  sortOrder: int('sort_order').notNull().default(0),
  createdAt: int('created_at', { mode: 'timestamp' }).notNull(),
});

// ─── Albums ───────────────────────────────────────────────────────────────────
export const albums = sqliteTable('albums', {
  id:        text('id').primaryKey(),
  foId:      text('fo_id').notNull().references(() => fictionalOthers.id, { onDelete: 'cascade' }),
  title:     text('title').notNull(),
  sortOrder: int('sort_order').notNull().default(0),
  createdAt: int('created_at', { mode: 'timestamp' }).notNull(),
});

export const albumItems = sqliteTable('album_items', {
  id:          text('id').primaryKey(),
  albumId:     text('album_id').notNull().references(() => albums.id, { onDelete: 'cascade' }),
  imagePath:   text('image_path').notNull(),
  caption:     text('caption').notNull().default(''),
  stickerData: text('sticker_data').notNull().default('[]'), // JSON PlacedSticker[]
  sortOrder:   int('sort_order').notNull().default(0),
  createdAt:   int('created_at', { mode: 'timestamp' }).notNull(),
});

// ─── Aesthetic Images (mood board) ───────────────────────────────────────────
export const aestheticImages = sqliteTable('aesthetic_images', {
  id:        text('id').primaryKey(),
  foId:      text('fo_id').notNull().references(() => fictionalOthers.id, { onDelete: 'cascade' }),
  imagePath: text('image_path').notNull(),
  caption:   text('caption').notNull().default(''),
  sortOrder: int('sort_order').notNull().default(0),
});

// ─── Playlist ─────────────────────────────────────────────────────────────────
export const playlistItems = sqliteTable('playlist_items', {
  id:        text('id').primaryKey(),
  foId:      text('fo_id').notNull().references(() => fictionalOthers.id, { onDelete: 'cascade' }),
  songTitle: text('song_title').notNull(),
  artist:    text('artist').notNull().default(''),
  note:      text('note').notNull().default(''),
  sortOrder: int('sort_order').notNull().default(0),
});

// ─── Scenarios ────────────────────────────────────────────────────────────────
export const scenarios = sqliteTable('scenarios', {
  id:        text('id').primaryKey(),
  foId:      text('fo_id').notNull().references(() => fictionalOthers.id, { onDelete: 'cascade' }),
  title:     text('title').notNull(),
  content:   text('content').notNull().default(''),
  createdAt: int('created_at', { mode: 'timestamp' }).notNull(),
});

// ─── Storyline Events ─────────────────────────────────────────────────────────
export const storylineEvents = sqliteTable('storyline_events', {
  id:          text('id').primaryKey(),
  foId:        text('fo_id').notNull().references(() => fictionalOthers.id, { onDelete: 'cascade' }),
  emoji:       text('emoji').notNull().default('♡'),
  title:       text('title').notNull(),
  description: text('description').notNull().default(''),
  date:        int('date', { mode: 'timestamp' }).notNull(),
  sortOrder:   int('sort_order').notNull().default(0),
});

// ─── Anniversaries ───────────────────────────────────────────────────────────
export const anniversaries = sqliteTable('anniversaries', {
  id:                  text('id').primaryKey(),
  foId:                text('fo_id').notNull().references(() => fictionalOthers.id, { onDelete: 'cascade' }),
  title:               text('title').notNull(),
  date:                int('date', { mode: 'timestamp' }).notNull(),
  repeatYearly:        int('repeat_yearly', { mode: 'boolean' }).notNull().default(true),
  notificationEnabled: int('notification_enabled', { mode: 'boolean' }).notNull().default(false),
  notificationId:      text('notification_id'),
  createdAt:           int('created_at', { mode: 'timestamp' }).notNull(),
});

// ─── Outfits ──────────────────────────────────────────────────────────────────
export const outfits = sqliteTable('outfits', {
  id:        text('id').primaryKey(),
  foId:      text('fo_id').notNull().references(() => fictionalOthers.id, { onDelete: 'cascade' }),
  title:     text('title').notNull(),
  imagePath: text('image_path'),
  occasion:  text('occasion').notNull().default('casual'), // casual | date | matching | formal | other
  notes:     text('notes').notNull().default(''),
  createdAt: int('created_at', { mode: 'timestamp' }).notNull(),
});

// ─── Message Threads ──────────────────────────────────────────────────────────
export const messageThreads = sqliteTable('message_threads', {
  id:        text('id').primaryKey(),
  foId:      text('fo_id').notNull().references(() => fictionalOthers.id, { onDelete: 'cascade' }),
  title:     text('title').notNull(),
  createdAt: int('created_at', { mode: 'timestamp' }).notNull(),
});

export const messages = sqliteTable('messages', {
  id:         text('id').primaryKey(),
  threadId:   text('thread_id').notNull().references(() => messageThreads.id, { onDelete: 'cascade' }),
  content:    text('content').notNull(),
  isFromUser: int('is_from_user', { mode: 'boolean' }).notNull(),
  timestamp:  int('timestamp', { mode: 'timestamp' }).notNull(),
});

// ─── Polycules ────────────────────────────────────────────────────────────────
export const polycules = sqliteTable('polycules', {
  id:        text('id').primaryKey(),
  personaId: text('persona_id').notNull().references(() => personas.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  notes:     text('notes').notNull().default(''),
  createdAt: int('created_at', { mode: 'timestamp' }).notNull(),
});

export const polyculeMembers = sqliteTable('polycule_members', {
  polyculeId: text('polycule_id').notNull().references(() => polycules.id, { onDelete: 'cascade' }),
  foId:       text('fo_id').notNull().references(() => fictionalOthers.id, { onDelete: 'cascade' }),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type Persona         = typeof personas.$inferSelect;
export type FictionalOther  = typeof fictionalOthers.$inferSelect;
export type Headcanon       = typeof headcanons.$inferSelect;
export type Album           = typeof albums.$inferSelect;
export type AlbumItem       = typeof albumItems.$inferSelect;
export type AestheticImage  = typeof aestheticImages.$inferSelect;
export type PlaylistItem    = typeof playlistItems.$inferSelect;
export type Scenario        = typeof scenarios.$inferSelect;
export type StorylineEvent  = typeof storylineEvents.$inferSelect;
export type Anniversary     = typeof anniversaries.$inferSelect;
export type Outfit          = typeof outfits.$inferSelect;
export type MessageThread   = typeof messageThreads.$inferSelect;
export type Message         = typeof messages.$inferSelect;
export type Polycule        = typeof polycules.$inferSelect;

export type PlacedSticker = {
  stickerId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};
