import { Colors } from '@/constants/theme';
import { useMemo } from 'react';
import Svg, { Circle, Defs, Path, Pattern as SvgPattern } from 'react-native-svg';

// A scalloped lace "mat" band framing a card, like a doily under a photo —
// the outer edge matches the card's own rounded rect, the inner edge scallops
// inward with a tiled dot pattern filling the band between them.
type Props = {
  width: number;
  height: number;
  radius?: number;
  bandWidth?: number;
  scallopSize?: number;
  color?: string;
};

function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x + rr} ${y} H${x + w - rr} A${rr} ${rr} 0 0 1 ${x + w} ${y + rr} V${y + h - rr} A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h} H${x + rr} A${rr} ${rr} 0 0 1 ${x} ${y + h - rr} V${y + rr} A${rr} ${rr} 0 0 1 ${x + rr} ${y} Z`;
}

// One straight edge redrawn as a run of outward-bulging quadratic bumps.
function scallopEdge(x0: number, y0: number, x1: number, y1: number, bump: number, scallop: number, vertical: boolean) {
  const len = vertical ? y1 - y0 : x1 - x0;
  const count = Math.max(1, Math.round(Math.abs(len) / scallop));
  const step = len / count;
  let d = '';
  for (let i = 0; i < count; i++) {
    if (vertical) {
      const ym = y0 + step * (i + 0.5);
      const ye = y0 + step * (i + 1);
      d += ` Q${x0 + bump} ${ym} ${x0} ${ye}`;
    } else {
      const xm = x0 + step * (i + 0.5);
      const xe = x0 + step * (i + 1);
      d += ` Q${xm} ${y0 + bump} ${xe} ${y0}`;
    }
  }
  return d;
}

function scallopedRectPath(x: number, y: number, w: number, h: number, scallop: number) {
  const bump = scallop * 0.55;
  const x0 = x, y0 = y, x1 = x + w, y1 = y + h;
  let d = `M${x0} ${y0}`;
  d += scallopEdge(x0, y0, x1, y0, -bump, scallop, false); // top: bulge up
  d += scallopEdge(x1, y0, x1, y1, bump, scallop, true); // right: bulge right
  d += scallopEdge(x1, y1, x0, y1, bump, scallop, false); // bottom: bulge down
  d += scallopEdge(x0, y1, x0, y0, -bump, scallop, true); // left: bulge left
  d += ' Z';
  return d;
}

export function LaceFrame({ width, height, radius = 18, bandWidth = 13, scallopSize = 9, color = Colors.sakuraDeep }: Props) {
  const id = useMemo(() => 'lace-' + Math.random().toString(36).slice(2, 7), []);
  if (width < bandWidth * 3 || height < bandWidth * 3) return null;

  const outer = roundedRectPath(0, 0, width, height, radius);
  const inner = scallopedRectPath(bandWidth, bandWidth, width - bandWidth * 2, height - bandWidth * 2, scallopSize);

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <SvgPattern id={id} width="9" height="9" patternUnits="userSpaceOnUse">
          <Circle cx="4.5" cy="4.5" r="1" fill={color} opacity={0.55} />
        </SvgPattern>
      </Defs>
      <Path d={`${outer} ${inner}`} fill={`url(#${id})`} fillRule="evenodd" />
      <Path d={inner} fill="none" stroke={color} strokeWidth={1} opacity={0.5} />
    </Svg>
  );
}
