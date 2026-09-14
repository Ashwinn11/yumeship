import { router } from 'expo-router';
import { useState } from 'react';

import { FoEditor, type FoDraft } from '@/components/fo/FoEditor';
import { addFo } from '@/store/fo';
import { usePremium } from '@/store/premium';

const EMPTY: FoDraft = {
  name: '', pronouns: '', fandom: '', relStatus: 'romantic', shareStatus: 'selective', color: '',
  tagline: '', about: '', sinceDate: '',
  photoUri: '', songs: [], gallery: [], flags: [], links: [], blinkies: [],
};

export default function NewFoScreen() {
  const [value, setValue] = useState<FoDraft>(EMPTY);
  const [notice, setNotice] = useState('');
  const premium = usePremium();

  function handleAdd() {
    if (!value.name.trim()) {
      setNotice('give them a name first — everything else can wait');
      return;
    }
    addFo({ ...value, name: value.name.trim() });
    router.back();
  }

  // Same editor as editing an existing F/O, in create mode: it opens on the
  // essentials, and nothing is written until "add them".
  return (
    <FoEditor
      mode="create"
      value={value}
      onChange={(p) => setValue((v) => ({ ...v, ...p }))}
      onClose={() => router.back()}
      onDone={handleAdd}
      notice={notice}
      premium={premium}
    />
  );
}
