import { Colors } from '../../constants/theme';
import { Heart } from '../deco/Heart';

/** Small heart+caps heading used above every section that sits below the
 *  hero card (about, songs/gallery, etc.) — one shared definition so each
 *  section reads as part of the same page instead of its own styling. */
export function SectionLabel({ children }: { children: string }) {
  return (
    <div className="section-label-row">
      <Heart size={9} color={Colors.sakuraDeep} outline />
      <span className="section-label-title">{children}</span>
    </div>
  );
}
