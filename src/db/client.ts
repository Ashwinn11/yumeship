import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) _db = SQLite.openDatabaseSync('yumeship.db');
  return _db;
}

let idCounter = 0;

/**
 * Unique row id. Date.now() alone collides when rows are inserted in the
 * same millisecond (e.g. multi-photo import) and these are PRIMARY KEYs.
 */
export function newId(): string {
  return `${Date.now()}-${(idCounter++).toString(36)}`;
}
