import { createContext, useContext } from 'react';
import { getDb } from '@/db/client';
import type { Ship } from './ships';
import { isPoly } from './ships';
import { getGlobalSetting } from './onboarding';
import { getFo } from './fo';

type TemplateCtx = {
  get: (key: string, fallback?: string) => string;
  set: (key: string, val: string) => void;
  bgColor: string;
  bgImage: string;
};

export const TemplateDataCtx = createContext<TemplateCtx>({
  get: (_, fb = '') => fb,
  set: () => {},
  bgColor: '',
  bgImage: '',
});

export function useTemplateCtx() {
  return useContext(TemplateDataCtx);
}

export function loadTemplateData(shipId: string, templateKey: string): Record<string, string> {
  const row = getDb().getFirstSync(
    'SELECT data_json FROM template_data WHERE ship_id = ? AND template_key = ?',
    shipId, templateKey,
  ) as { data_json: string } | null;
  if (!row) return {};
  try { return JSON.parse(row.data_json); } catch { return {}; }
}

export function saveTemplateData(shipId: string, templateKey: string, data: Record<string, string>) {
  getDb().runSync(
    `INSERT INTO template_data (ship_id, template_key, data_json, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(ship_id, template_key) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`,
    shipId, templateKey, JSON.stringify(data), Date.now(),
  );
}

// Maps logical field names to each template's actual storage key.
// mainPhoto = primary portrait/photo of the F/O
const FIELD_MAP: Record<string, Record<string, string>> = {
  'get-to-know': { foName: 'themName', myName: 'meName', sharing: 'sharing', song: 'song', mainPhoto: 'themPhoto', photo1: 'photo1' },
  'kawaii-ui':   { foName: 'name',     sharing: 'sharing', song: 'song', anniv: 'anniv',   mainPhoto: 'portrait' },
  'heart-frame': { foName: 'themName', myName: 'meName', sharing: 'sharing', anniv: 'anniv', mainPhoto: 'themPhoto', myPhoto: 'mePhoto' },
  'love-letter': { foName: 'dearName', myName: 'signName' },
  'aesthetic':   { song: 'song',       mainPhoto: 'photo0', photo1: 'photo1', photo2: 'photo2' },
  'this-or-that': { foName: 'name' },
  'headcanons':  { foName: 'fo' },
  'talking-about': { foName: 'foName', myName: 'meName', sharing: 'sharing', mainPhoto: 'photoL', myPhoto: 'photoR' },
  'flip-phone':  { foName: 'name', sharing: 'sharing', song: 'song' },
  'bond-banner': { myName: 'meName', foName: 'foName' },
  // poly templates store their roster on the ship and their viz data in dedicated keys; no shared logical fields.
  'poly-chart':    {},
  'poly-quick':    {},
  'poly-dynamics': {},
};

// Migrate compatible fields from old template data into the new template (only fills gaps)
export function migrateTemplateData(shipId: string, fromKey: string, toKey: string) {
  const oldData = loadTemplateData(shipId, fromKey);
  const newData = loadTemplateData(shipId, toKey);

  const fromMap = FIELD_MAP[fromKey] ?? {};
  const toMap = FIELD_MAP[toKey] ?? {};

  // Invert fromMap: templateKey → logicalKey
  const fromInverse: Record<string, string> = {};
  for (const [logical, tKey] of Object.entries(fromMap)) {
    if (tKey) fromInverse[tKey] = logical;
  }

  const merged = { ...newData };
  for (const [logical, toFieldKey] of Object.entries(toMap)) {
    if (!toFieldKey || merged[toFieldKey]) continue; // already has a value
    const fromFieldKey = fromMap[logical];
    if (fromFieldKey && oldData[fromFieldKey]) {
      merged[toFieldKey] = oldData[fromFieldKey];
    }
  }

  if (Object.keys(merged).length > 0) {
    saveTemplateData(shipId, toKey, merged);
  }
}

// Pre-fill fields from ship + F/O + me profile data when no saved data exists
// for this ship+template. Runs once per ship+template (see TemplateScreenWrapper's
// initData merge — prefill only ever fills gaps, never overwrites saved edits).
export function buildPreFill(ship: Ship, templateKey: string): Record<string, string> {
  const base: Record<string, string> = {};
  // Templates store the same yes/no/selective vocabulary, just capitalized for display.
  const shareMap: Record<string, string> = { yes: 'Yes', no: 'No', selective: 'Selective' };
  const userName = ship.myName || getGlobalSetting('user_name');
  const userPronouns = getGlobalSetting('user_pronouns');
  const userHeight = getGlobalSetting('user_height');
  const userPhoto = getGlobalSetting('user_avatar');
  // For polyship, `ship.name` is the ship label, not an F/O — never seed it as a character name.
  const foSeed = isPoly(ship) ? '' : ship.name;
  const fo = !isPoly(ship) && ship.foId ? getFo(ship.foId) : undefined;

  switch (templateKey) {
    case 'get-to-know':
      if (foSeed)         base['themName'] = foSeed;
      if (ship.shareType) base['sharing'] = shareMap[ship.shareType] ?? '';
      if (userName)       base['meName'] = userName;
      if (fo?.photoUri)   base['themPhoto'] = fo.photoUri;
      if (fo?.height)     base['themFilled'] = JSON.stringify({ height: fo.height });
      if (userHeight)     base['meFilled'] = JSON.stringify({ height: userHeight });
      break;
    case 'kawaii-ui':
      if (foSeed)         base['name'] = foSeed;
      if (ship.fandom)    base['from'] = ship.fandom;
      if (ship.relType)   base['type'] = ship.relType;
      if (fo?.pronouns)   base['pronouns'] = fo.pronouns;
      if (fo?.photoUri)   base['portrait'] = fo.photoUri;
      break;
    case 'heart-frame':
      if (foSeed)         base['themName'] = foSeed;
      if (userName)       base['meName'] = userName;
      if (fo?.photoUri)   base['themPhoto'] = fo.photoUri;
      if (userPhoto)      base['mePhoto'] = userPhoto;
      if (fo?.pronouns || userPronouns) {
        base['themInfo'] = JSON.stringify(['', fo?.pronouns ?? '', '', '']);
        base['meInfo'] = JSON.stringify(['', userPronouns, '', '']);
      }
      break;
    case 'love-letter':
      if (foSeed)         base['dearName'] = foSeed;
      if (userName)       base['signName'] = userName;
      break;
    case 'this-or-that':
      if (foSeed)         base['name'] = foSeed;
      break;
    case 'headcanons':
      if (foSeed)         base['fo'] = foSeed;
      if (ship.fandom)    base['source'] = ship.fandom;
      break;
    case 'talking-about':
      if (foSeed)         base['foName'] = foSeed;
      if (userName)       base['meName'] = userName;
      if (ship.shareType) base['sharing'] = shareMap[ship.shareType] ?? '';
      if (fo?.photoUri)   base['photoL'] = fo.photoUri;
      if (userPhoto)      base['photoR'] = userPhoto;
      if (fo?.pronouns)   base['foPron'] = fo.pronouns;
      if (userPronouns)   base['mePron'] = userPronouns;
      if (fo?.height)     base['foH'] = fo.height;
      if (userHeight)     base['meH'] = userHeight;
      break;
    case 'flip-phone':
      if (foSeed)         base['name'] = foSeed;
      if (ship.shareType) base['sharing'] = shareMap[ship.shareType] ?? '';
      break;
    case 'bond-banner':
      if (foSeed)         base['foName'] = foSeed;
      if (userName)       base['meName'] = userName;
      break;
  }
  return base;
}
