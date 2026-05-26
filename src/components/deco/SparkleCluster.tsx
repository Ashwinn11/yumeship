import { Colors } from '@/constants/theme';
import { View, ViewStyle } from 'react-native';
import { Sparkle } from './Sparkle';

// design/deco.jsx — SparkleCluster
// 3 sparkles at different positions/opacities
type Props = {
  color?: string;
  style?: ViewStyle;
};

export function SparkleCluster({ color = Colors.sakuraDeep, style }: Props) {
  return (
    <View style={[{ width: 24, height: 24, position: 'relative' }, style]}>
      <View style={{ position: 'absolute', top: 0, left: 4 }}>
        <Sparkle size={10} color={color} />
      </View>
      <View style={{ position: 'absolute', top: 8, left: 12 }}>
        <Sparkle size={6} color={color} opacity={0.7} />
      </View>
      <View style={{ position: 'absolute', top: 14, left: 2 }}>
        <Sparkle size={5} color={color} opacity={0.5} />
      </View>
    </View>
  );
}
