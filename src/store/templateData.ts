import { createContext, useContext } from 'react';
import { getDb } from '@/db/client';
import type { Ship } from './ships';
import { isPoly } from './ships';
import { getGlobalSetting, getMediaSetting } from './onboarding';
import { getFo } from './fo';

type TemplateCtx = {
  get: (key: string, fallback?: string) => string;
  set: (key: string, val: string) => void;
  bgColor: string;
  bgImage: string;
  textColor: string;
};

export const TemplateDataCtx = createContext<TemplateCtx>({
  get: (_, fb = '') => fb,
  set: () => {},
  bgColor: '',
  bgImage: '',
  textColor: '',
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

// Shared across every template — the "memories" closing section (MemoriesFooter
// primitive) always uses these exact key names, so this maps 1:1 and just needs
// spreading into each template's entry for migrateTemplateData to carry it over.
const MEMORY_FIELDS: Record<string, string> = {
  memPhoto0: 'memPhoto0', memPhoto1: 'memPhoto1', memPhoto2: 'memPhoto2',
  memCap0: 'memCap0', memCap1: 'memCap1', memCap2: 'memCap2',
};

// Maps logical field names to each template's actual storage key.
// mainPhoto = primary portrait/photo of the F/O
const FIELD_MAP: Record<string, Record<string, string>> = {
  'get-to-know': { ...MEMORY_FIELDS, foName: 'themName', myName: 'meName', sharing: 'sharing', song: 'song', mainPhoto: 'themPhoto', myPhoto: 'mePhoto' },
  'kawaii-ui':   { ...MEMORY_FIELDS, shipName: 'shipName', foName: 'theirName', myName: 'myName', sharing: 'sharing', anniv: 'anniv', mainPhoto: 'theirPortrait', myPhoto: 'myPortrait' },
  'heart-frame': { ...MEMORY_FIELDS, foName: 'themName', myName: 'meName', sharing: 'sharing', anniv: 'anniv', mainPhoto: 'themPhoto', myPhoto: 'mePhoto' },
  'love-letter': { foName: 'dearName', myName: 'signName' },
  'aesthetic':   { foName: 'foName', myName: 'meName', mainPhoto: 'foPhoto', myPhoto: 'mePhoto' },
  'this-or-that': { foName: 'name' },
  'headcanons':  { foName: 'fo' },
  'talking-about': { ...MEMORY_FIELDS, foName: 'foName', myName: 'meName', sharing: 'sharing', song: 'song', mainPhoto: 'photoL', myPhoto: 'photoR' },
  'flip-phone':  { ...MEMORY_FIELDS, foName: 'name', myName: 'myName', sharing: 'sharing', song: 'song' },
  'bond-banner': { myName: 'meName', foName: 'foName', sharing: 'sharing', anniv: 'anniv', mainPhoto: 'shieldPhoto' },
  'ask-meme':    { sharing: 'sharing' },
  'playlist':    {},
  'bucket-list': {},
  'how-we-met':  { ...MEMORY_FIELDS, foName: 'foName', myName: 'myName', anniv: 'anniv', mainPhoto: 'heroPhoto' },
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
  const userPhoto = getMediaSetting('user_avatar');
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
      if (foSeed)         base['shipName'] = foSeed;
      if (ship.fandom)    base['from'] = ship.fandom;
      if (ship.relType)   base['type'] = ship.relType;
      if (foSeed)         base['theirName'] = foSeed;
      if (fo?.pronouns)   base['theirPronouns'] = fo.pronouns;
      if (fo?.height)     base['theirHeight'] = fo.height;
      if (fo?.photoUri)   base['theirPortrait'] = fo.photoUri;
      if (userName)       base['myName'] = userName;
      if (userPronouns)   base['myPronouns'] = userPronouns;
      if (userHeight)     base['myHeight'] = userHeight;
      if (userPhoto)      base['myPortrait'] = userPhoto;
      break;
    case 'heart-frame':
      if (foSeed)         base['themName'] = foSeed;
      if (userName)       base['meName'] = userName;
      if (fo?.photoUri)   base['themPhoto'] = fo.photoUri;
      if (userPhoto)      base['mePhoto'] = userPhoto;
      if (fo?.pronouns || userPronouns) {
        base['themInfo'] = JSON.stringify([fo?.pronouns ?? '', '', '', '']);
        base['meInfo'] = JSON.stringify([userPronouns ?? '', '', '', '']);
      }
      break;
    case 'love-letter':
      if (foSeed)         base['dearName'] = foSeed;
      if (userName)       base['signName'] = userName;
      break;
    case 'aesthetic':
      if (foSeed)         base['foName'] = foSeed;
      if (userName)       base['meName'] = userName;
      if (fo?.photoUri)   base['foPhoto'] = fo.photoUri;
      if (userPhoto)      base['mePhoto'] = userPhoto;
      if (fo?.height)     base['foHeight'] = fo.height;
      if (userHeight)     base['meHeight'] = userHeight;
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
      if (foSeed)         base['chat'] = `${foSeed} says:\ni miss you\n${foSeed} says:\ncome over?\n${foSeed} says:\n♡♡♡`;
      if (ship.shareType) base['sharing'] = shareMap[ship.shareType] ?? '';
      if (userName)       base['myName'] = userName;
      break;
    case 'bond-banner':
      if (foSeed)         base['foName'] = foSeed;
      if (userName)       base['meName'] = userName;
      if (fo?.pronouns)   base['foPronouns'] = fo.pronouns;
      if (userPronouns)   base['mePronouns'] = userPronouns;
      if (fo?.photoUri)   base['shieldPhoto'] = fo.photoUri;
      if (ship.shareType) base['sharing'] = shareMap[ship.shareType] ?? '';
      break;
    case 'how-we-met':
      if (foSeed)         base['foName'] = foSeed;
      if (userName)       base['myName'] = userName;
      if (fo?.photoUri)   base['heroPhoto'] = fo.photoUri;
      break;
  }
  return base;
}
