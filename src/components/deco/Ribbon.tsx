import { Colors } from '@/constants/theme';
import { View, ViewStyle } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
  style?: ViewStyle;
};

export function Ribbon({ size = 36, color = Colors.sakura, style }: Props) {
  const w = size;
  const h = size * 0.7;

  return (
    <View
      style={[
        {
          width: w,
          height: h,
          shadowColor: 'rgba(110, 58, 90, 0.18)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 3,
          elevation: 2,
        },
        style,
      ]}
    >
      <Svg width={w} height={h} viewBox="0 0 36 26">
        <G stroke="white" strokeWidth="3" strokeLinejoin="round" fill="white">
          <Path d="M2 13 C 2 6 8 4 14 8 L18 13 L14 18 C 8 22 2 20 2 13 Z" />
          <Path d="M34 13 C 34 6 28 4 22 8 L18 13 L22 18 C 28 22 34 20 34 13 Z" />
          <Circle cx="18" cy="13" r="3" />
        </G>
        <Path
          d="M2 13 C 2 6 8 4 14 8 L18 13 L14 18 C 8 22 2 20 2 13 Z"
          fill={color}
          stroke="#c46a82"
          strokeWidth="0.8"
        />
        <Path
          d="M34 13 C 34 6 28 4 22 8 L18 13 L22 18 C 28 22 34 20 34 13 Z"
          fill={color}
          stroke="#c46a82"
          strokeWidth="0.8"
        />
        <Circle cx="18" cy="13" r="3" fill="#d77a8d" stroke="#8b3a4a" strokeWidth="0.7" />
        {/* highlights */}
        <Path d="M5 11 Q 8 9 12 9" stroke="#fadde5" strokeWidth="0.8" fill="none" opacity="0.7" />
        <Path d="M24 9 Q 28 9 31 11" stroke="#fadde5" strokeWidth="0.8" fill="none" opacity="0.7" />
      </Svg>
    </View>
  );
}
