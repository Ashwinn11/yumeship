import { Colors, Sakura as SakuraColors } from '@/constants/theme';
import Svg, { Circle, Ellipse } from 'react-native-svg';

// design/deco.jsx — Sakura
// 5-petal flower with a core dot
type Props = {
  size?: number;
  color?: string;
  core?: string;
};

const ROTATIONS = [0, 72, 144, 216, 288];

export function Sakura({ size = 18, color = SakuraColors.sakura, core = Colors.butter }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {ROTATIONS.map((rot) => (
        <Ellipse
          key={rot}
          cx="12"
          cy="6.5"
          rx="3.6"
          ry="5.5"
          fill={color}
          transform={`rotate(${rot} 12 12)`}
        />
      ))}
      <Circle cx="12" cy="12" r="1.8" fill={core} />
    </Svg>
  );
}
