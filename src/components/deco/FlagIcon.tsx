import { Colors } from '@/constants/theme';
import Svg, { Rect } from 'react-native-svg';

// Simple horizontal-stripe flag — accurate for every pride flag we show
// (they're all equal horizontal bands). No colors = a blank placeholder chip.
type Props = {
  colors?: string[];
  width?: number;
  height?: number;
};

export function FlagIcon({ colors, width = 26, height = 17 }: Props) {
  if (!colors || colors.length === 0) {
    return (
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Rect x={0} y={0} width={width} height={height} fill={Colors.paperDeep} stroke={Colors.line} strokeWidth={1} />
      </Svg>
    );
  }
  const stripeH = height / colors.length;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {colors.map((c, i) => (
        <Rect key={i} x={0} y={i * stripeH} width={width} height={stripeH + 0.5} fill={c} />
      ))}
    </Svg>
  );
}
