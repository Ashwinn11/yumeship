import { useEffect, useRef, useState } from 'react';
import { BLINKIE_BY_ID, type EquippedBlinkie } from '../../constants/blinkies';
import { Blinkie } from './Blinkie';

const GAP = 4;
// the web card is wide enough for three badges per row — scaled to actually
// fill the row, not a fixed 150px square with room to spare beside it
const COLUMNS = 3;

/** The equipped set, laid out three per row — the profile-page equivalent of
 *  blinkies.cafe's own "wall" of badges. Row width is measured so each badge
 *  scales to exactly fill a COLUMNS-wide row; centered so one badge sits
 *  centered alone and a partial last row centers as a group instead of
 *  stacking flush against the left edge. A slot whose template was removed
 *  from the catalog, or whose text is still empty, is silently skipped. */
export function BlinkieWall({ items }: { items?: EquippedBlinkie[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const update = () => setWidth(ref.current?.clientWidth ?? 0);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const badgeWidth = width ? (width - GAP * (COLUMNS - 1)) / COLUMNS : 150;

  const rows = (items ?? [])
    .map((it) => ({ template: BLINKIE_BY_ID[it.templateId], text: it.text.trim() }))
    .filter((r): r is { template: NonNullable<typeof r.template>; text: string } => !!r.template && !!r.text);
  if (!rows.length) return null;

  return (
    <div className="blinkie-wall" ref={ref}>
      {rows.map((r, i) => (
        <Blinkie key={`${r.template.id}-${i}`} template={r.template} text={r.text} width={badgeWidth} />
      ))}
    </div>
  );
}
