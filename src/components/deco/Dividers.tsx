import { Colors } from '@/constants/theme';
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Bullets } from './Bullets';

type DividerProps = {
  color?: string;
  style?: ViewStyle;
};

export function DividerHeart({ color = Colors.sakuraDeep, style }: DividerProps) {
  return (
    <View style={[s.container, style]}>
      <View style={[s.line, { backgroundColor: color }]} />
      <View style={s.bulletContainer}>
        <Bullets.Heart size={10} color={color} />
      </View>
      <View style={[s.line, { backgroundColor: color }]} />
    </View>
  );
}

export function DividerSakura({ color = Colors.sakuraDeep, style }: DividerProps) {
  return (
    <View style={[s.container, style]}>
      <View style={[s.dashedLine, { borderColor: Colors.lineStrong }]} />
      <View style={s.bulletContainer}>
        <Bullets.Sakura size={11} color={color} />
      </View>
      <View style={[s.dashedLine, { borderColor: Colors.lineStrong }]} />
    </View>
  );
}

export function DividerStar({ color = Colors.lavenderDeep, style }: DividerProps) {
  return (
    <View style={[s.container, style]}>
      <View style={[s.line, { backgroundColor: color }]} />
      <View style={[s.bulletContainer, { flexDirection: 'row', gap: 4 }]}>
        <Bullets.Star size={11} color={color} />
        <View style={{ justifyContent: 'center' }}>
          <Bullets.Dot size={6} color={color} />
        </View>
        <Bullets.Star size={11} color={color} />
      </View>
      <View style={[s.line, { backgroundColor: color }]} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dashedLine: {
    flex: 1,
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
  },
  bulletContainer: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
