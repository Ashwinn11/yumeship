import { Colors } from '@/constants/theme';
import Svg, { Circle } from 'react-native-svg';

// design/components.jsx — Mark
// Two intersecting circles: filled = S/I (you), outline = F/O (them)
type Props = {
  size?: number;
  color?: string; // undefined = default brand (ink + sakura fill)
};

export function Mark({ size = 48, color }: Props) {
  const isDefault = color === undefined;
  const fillColor  = isDefault ? Colors.sakura : color;
  const strokeColor = isDefault ? Colors.ink   : color;
  const dotColor   = isDefault ? Colors.vellum : Colors.paper;

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx="18" cy="24" r="13" fill={fillColor} opacity={0.85} />
      <Circle cx="30" cy="24" r="13" fill="none" stroke={strokeColor} strokeWidth="1.5" />
      <Circle cx="24" cy="24" r="1.2" fill={dotColor} />
    </Svg>
  );
}
