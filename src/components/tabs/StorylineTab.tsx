import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useIPad } from '@/hooks/use-ipad';

import { StorylineContent } from '@/app/template/storyline';
import { getShip } from '@/store/ships';
import { TemplateDataCtx, loadTemplateData, saveTemplateData, buildPreFill } from '@/store/templateData';
import { Spacing } from '@/constants/theme';

export function StorylineTab({ shipId, shipName }: { shipId: string; shipName: string }) {
  const { column } = useIPad();
  const ship = getShip(shipId);
  const templateKey = 'storyline';

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
      <View style={[s.tab, column]}>
        <StorylineContent editing />
      </View>
    </TemplateDataCtx.Provider>
  );
}

const s = StyleSheet.create({
  tab: {
    flex: 1,
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s6,
  },
});
