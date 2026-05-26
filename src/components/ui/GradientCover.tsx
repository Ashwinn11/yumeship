import { useState } from 'react';
import { View, StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';

type Props = {
  gradStart: string;
  gradEnd: string;
  style?: ViewStyle;
  children?: React.ReactNode;
};

export function GradientCover({ gradStart, gradEnd, style, children }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  function onLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  }

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {size.width > 0 && (
        <Svg style={StyleSheet.absoluteFill} width={size.width} height={size.height}>
          <Defs>
            <SvgLinearGradient id="g" x1="0" y1="0" x2="0.8" y2="1">
              <Stop offset="0" stopColor={gradStart} />
              <Stop offset="1" stopColor={gradEnd} />
            </SvgLinearGradient>
          </Defs>
          <Rect x="0" y="0" width={size.width} height={size.height} fill="url(#g)" />
        </Svg>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
