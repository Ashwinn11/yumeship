export type OnbState = {
  userName: string;
  pronouns: string;
  foName: string;
  fandom: string;
  relType: string;
  shareType: string;
};

let state: OnbState = {
  userName: '',
  pronouns: 'she/her',
  foName: '',
  fandom: '',
  relType: 'romantic',
  shareType: 'mirror',
};

export function getOnbState(): OnbState { return state; }

export function setOnbField<K extends keyof OnbState>(key: K, value: OnbState[K]) {
  state = { ...state, [key]: value };
}

export function resetOnb() {
  state = { userName: '', pronouns: 'she/her', foName: '', fandom: '', relType: 'romantic', shareType: 'mirror' };
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
      break;
    case 'headcanons':
      if (s.foName)  d.fo     = s.foName;
      if (s.fandom)  d.source = s.fandom;
      break;
  }
  return d;
}
