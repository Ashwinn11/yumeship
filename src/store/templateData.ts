import { createContext, useContext } from 'react';
import { getDb } from '@/db/client';
import type { Ship } from './ships';
import { getGlobalSetting } from './onboarding';

type TemplateCtx = {
  get: (key: string, fallback?: string) => string;
  set: (key: string, val: string) => void;
};

export const TemplateDataCtx = createContext<TemplateCtx>({
  get: (_, fb = '') => fb,
  set: () => {},
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

// Pre-fill fields from ship data when no saved data exists for this ship+template
export function buildPreFill(ship: Ship, templateKey: string): Record<string, string> {
  const base: Record<string, string> = {};
  const shareMap: Record<string, string> = { ng: 'No', welcome: 'Yes', mirror: 'Selective' };
  const userName = getGlobalSetting('user_name');

  switch (templateKey) {
    case 'get-to-know':
      if (ship.name)      base['themName'] = ship.name;
      if (ship.shareType) base['sharing'] = shareMap[ship.shareType] ?? '';
      if (userName)       base['meName'] = userName;
      break;
    case 'kawaii-ui':
      if (ship.name)      base['name'] = ship.name;
      if (ship.fandom)    base['from'] = ship.fandom;
      if (ship.relType)   base['type'] = ship.relType;
      break;
    case 'heart-frame':
      if (ship.name)      base['themName'] = ship.name;
      if (userName)       base['meName'] = userName;
      break;
    case 'love-letter':
      if (ship.name)      base['dearName'] = ship.name;
      if (userName)       base['signName'] = userName;
      break;
    case 'this-or-that':
      if (ship.name)      base['name'] = ship.name;
      break;
    case 'headcanons':
      if (ship.name)      base['fo'] = ship.name;
      if (ship.fandom)    base['source'] = ship.fandom;
      break;
  }
  return base;
}
