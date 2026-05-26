import { Colors } from '@/constants/theme';
import Svg, { Path } from 'react-native-svg';

// design/deco.jsx — Star
type Props = {
  size?: number;
  color?: string;
};

export function Star({ size = 14, color = Colors.butterDeep }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        d="M8 1 L9.8 5.8 L15 6.3 L11 9.7 L12.3 14.8 L8 12 L3.7 14.8 L5 9.7 L1 6.3 L6.2 5.8 Z"
        fill={color}
      />
    </Svg>
  );
}
