export type OnbState = {
  /** template the user lingered on in the showcase carousel — preselects the style step */
  templateKey: string;
  userName: string;
  pronouns: string;
  foName: string;
  shipName: string;
  fandom: string;
  relType: string;
  shareType: string;
  gradStart: string;
  gradEnd: string;
  coverUri: string;
  kind: 'single' | 'poly';
};

import { getDb } from '@/db/client';

export function saveGlobalSetting(key: string, val: string) {
  try {
    getDb().runSync(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      key, val
    );
  } catch (err) {
    console.error('Error saving global setting:', err);
  }
}

export function getGlobalSetting(key: string, fallback = ''): string {
  try {
    const row = getDb().getFirstSync('SELECT value FROM settings WHERE key = ?', key) as { value: string } | null;
    return row ? row.value : fallback;
  } catch (_) {
    return fallback;
  }
}

let state: OnbState = {
  templateKey: '',
  userName: getGlobalSetting('user_name'),
  pronouns: 'she/her',
  foName: '',
  shipName: '',
  fandom: '',
  relType: 'romantic',
  shareType: 'mirror',
  gradStart: '',
  gradEnd: '',
  coverUri: '',
  kind: 'single',
};

export function getOnbState(): OnbState {
  if (!state.userName) {
    state.userName = getGlobalSetting('user_name');
  }
  return state;
}

export function setOnbField<K extends keyof OnbState>(key: K, value: OnbState[K]) {
  state = { ...state, [key]: value };
  if (key === 'userName') {
    saveGlobalSetting('user_name', value as string);
  }
}

export function resetOnb() {
  state = {
    templateKey: '',
    userName: getGlobalSetting('user_name'),
    pronouns: 'she/her',
    foName: '',
    shipName: '',
    fandom: '',
    relType: 'romantic',
    shareType: 'mirror',
    gradStart: '',
    gradEnd: '',
    coverUri: '',
    kind: 'single',
  };
}

export function buildInitialData(templateKey: string, s: OnbState): Record<string, string> {
  const d: Record<string, string> = {};
  switch (templateKey) {
    case 'kawaii-ui':
      if (s.foName)  d.name = s.foName;
      if (s.fandom)  d.from = s.fandom;
      if (s.relType) d.type = s.relType;
      break;
    case 'get-to-know':
      if (s.userName) d.meName   = s.userName;
      if (s.foName)   d.themName = s.foName;
      break;
    case 'heart-frame':
      if (s.userName) d.meName   = s.userName;
      if (s.foName)   d.themName = s.foName;
      break;
    case 'this-or-that':
      if (s.foName) d.name = s.foName;
      break;
    case 'love-letter':
      if (s.foName) d.dearName = s.foName;
      if (s.userName) d.signName = s.userName;
      break;
    case 'headcanons':
      if (s.foName)  d.fo     = s.foName;
      if (s.fandom)  d.source = s.fandom;
      break;
  }
  return d;
}
