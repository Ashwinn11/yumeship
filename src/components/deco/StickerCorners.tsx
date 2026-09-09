import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { Heart } from './Heart';
import { Ribbon } from './Ribbon';
import { Sakura } from './Sakura';
import { Sparkle } from './Sparkle';
import { Star } from './Star';

// Stickers scattered thickly around a card's edges — some half-hanging off
// the border, some sitting fully on top of it — the "someone spent an hour
// covering this in stickers by hand" look, not a tidy symmetric accent.
export function StickerCorners() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.spot, { top: -10, left: 16, transform: [{ rotate: '-18deg' }] }]}>
        <Star size={26} color={Colors.butterDeep} />
      </View>
      <View style={[styles.spot, { top: -12, right: 4, transform: [{ rotate: '12deg' }] }]}>
        <Ribbon size={40} color={Colors.sakura} />
      </View>
      <View style={[styles.spot, { top: 6, left: -10, transform: [{ rotate: '-6deg' }] }]}>
        <Sparkle size={18} color={Colors.lavenderDeep} />
      </View>
      <View style={[styles.spot, { bottom: -9, left: 2, transform: [{ rotate: '14deg' }] }]}>
        <Heart size={24} color={Colors.sakuraDeep} />
      </View>
      <View style={[styles.spot, { bottom: -8, right: 20, transform: [{ rotate: '-10deg' }] }]}>
        <Sparkle size={22} color={Colors.lavenderDeep} />
      </View>
      <View style={[styles.spot, { bottom: 30, right: -11, transform: [{ rotate: '8deg' }] }]}>
        <Sakura size={22} />
      </View>
      <View style={[styles.spot, { top: '38%', right: -9, transform: [{ rotate: '-8deg' }] }]}>
        <Heart size={15} color={Colors.sakura} outline />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spot: { position: 'absolute' },
});
