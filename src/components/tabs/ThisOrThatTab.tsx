import { useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useIPad } from '@/hooks/use-ipad';

import { ThisOrThatContent } from '@/app/template/this-or-that';
import { getShip } from '@/store/ships';
import { TemplateDataCtx, loadTemplateData, saveTemplateData, buildPreFill } from '@/store/templateData';
import { Spacing } from '@/constants/theme';

export function ThisOrThatTab({ shipId }: { shipId: string }) {
  const { column } = useIPad();
  const ship = getShip(shipId);
  const templateKey = 'this-or-that';

  const initData = (): Record<string, string> => {
    const saved = loadTemplateData(shipId, templateKey);
    if (Object.keys(saved).length > 0) return saved;
    return ship ? buildPreFill(ship, templateKey) : {};
  };

  const dataRef = useRef<Record<string, string>>(null as unknown as Record<string, string>);
  if (dataRef.current === null) {
    dataRef.current = initData();
  }

  const ctx = useMemo(() => ({
    get: (key: string, fb = '') => (dataRef.current as Record<string, string>)[key] ?? fb,
    set: (key: string, val: string) => {
      (dataRef.current as Record<string, string>)[key] = val;
      saveTemplateData(shipId, templateKey, dataRef.current as Record<string, string>);
    },
    bgColor: '',
    bgImage: '',
  }), [shipId]);

  return (
    <TemplateDataCtx.Provider value={ctx}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.tab, column]}>
        <ThisOrThatContent editing />
      </ScrollView>
    </TemplateDataCtx.Provider>
  );
}

const s = StyleSheet.create({
  tab: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s6,
  },
});
