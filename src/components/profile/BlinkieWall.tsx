import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { BLINKIE_BY_ID, type EquippedBlinkie } from '@/constants/blinkies';
import { Blinkie } from './Blinkie';

const GAP = 4;
// a phone card fits two badges per row — scaled to actually fill the row,
// not a fixed 150px square with room to spare beside it
const COLUMNS = 2;

/** The equipped set, laid out two per row — the profile-card equivalent of
 *  blinkies.cafe's own "wall" of badges. Row width is measured so each badge
 *  scales to exactly fill a COLUMNS-wide row; centered so one badge sits
 *  centered alone and a partial last row centers as a group instead of
 *  stacking flush against the left edge. A slot whose template was removed
 *  from the catalog, or whose text is still empty, is silently skipped. */
export function BlinkieWall({ items }: { items?: EquippedBlinkie[] }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const badgeWidth = width ? (width - GAP * (COLUMNS - 1)) / COLUMNS : 150;

  const rows = (items ?? [])
    .map((it) => ({ template: BLINKIE_BY_ID[it.templateId], text: it.text.trim() }))
    .filter((r): r is { template: NonNullable<typeof r.template>; text: string } => !!r.template && !!r.text);
  if (!rows.length) return null;

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {rows.map((r, i) => (
        <Blinkie key={`${r.template.id}-${i}`} template={r.template} text={r.text} width={badgeWidth} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: GAP },
});
