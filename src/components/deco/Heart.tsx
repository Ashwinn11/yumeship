import { Colors } from '@/constants/theme';
import Svg, { Path } from 'react-native-svg';

// design/deco.jsx — Heart
// Chunky soft heart. outline=true → stroke only, no fill.
type Props = {
  size?: number;
  color?: string;
  outline?: boolean;
};

export function Heart({ size = 14, color = Colors.sakuraDeep, outline = false }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        d="M8 14 C 3 11 1 8.5 1 5.5 C 1 3.5 2.5 2 4.5 2 C 6 2 7.3 2.9 8 4.3 C 8.7 2.9 10 2 11.5 2 C 13.5 2 15 3.5 15 5.5 C 15 8.5 13 11 8 14 Z"
        fill={outline ? 'none' : color}
        stroke={color}
        strokeWidth={outline ? 1.4 : 0}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
