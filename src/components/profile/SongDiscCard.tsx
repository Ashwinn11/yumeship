import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, Linking } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import { IconArrowUpRight } from '@/components/ui/Icon';
import type { ProfileSong } from './cardTheme';

/** Three bars bouncing out of phase — the "now playing" indicator iOS/iPadOS
 *  widgets use (Control Center's Now Playing card, Music app rows). Reads as
 *  "this is playing" at a glance, the way the disc alone doesn't. */
function EqualizerBars({ height = 12 }: { height?: number }) {
  const bars = [0, 120, 240];
  return (
    <View style={[styles.eqRow, { height }]}>
      {bars.map((delay, i) => (
        <EqBar key={i} delay={delay} height={height} />
      ))}
    </View>
  );
}

function EqBar({ delay, height }: { delay: number; height: number }) {
  const scale = useSharedValue(0.3);
  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 350 }), withTiming(0.3, { duration: 350 })), -1),
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: scale.value }] }));
  return <Animated.View style={[styles.eqBar, { height }, style]} />;
}

/**
 * A distinct music card, not a reskinned Polaroid — real "now playing" UI
 * (Spin, Apple Music) puts the disc front and center, not boxed inside a
 * plain bordered card matching the photo strip beside it. The disc fills
 * most of the card and never stops spinning; card background is plain white.
 */
export function SongDiscCard({ song, size = 110 }: { song: ProfileSong; size?: number }) {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1, false);
  }, []);

  const discStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  const discSize = size * 0.72;

  return (
    <Pressable
      style={[styles.card, { width: size }]}
      onPress={song.link ? () => Linking.openURL(song.link) : undefined}
      disabled={!song.link}
    >
      <Animated.View style={[styles.disc, { width: discSize, height: discSize, borderRadius: discSize / 2 }, discStyle]}>
        <View
          style={[
            styles.discGroove,
            { width: discSize * 0.78, height: discSize * 0.78, borderRadius: (discSize * 0.78) / 2, top: discSize * 0.11, left: discSize * 0.11 },
          ]}
        />
        <View
          style={[
            styles.discGroove,
            { width: discSize * 0.58, height: discSize * 0.58, borderRadius: (discSize * 0.58) / 2, top: discSize * 0.21, left: discSize * 0.21 },
          ]}
        />
        <View
          style={[
            styles.discLabel,
            { width: discSize * 0.38, height: discSize * 0.38, borderRadius: (discSize * 0.38) / 2, top: discSize * 0.31, left: discSize * 0.31 },
          ]}
        >
          <Text style={[styles.discNote, { fontSize: discSize * 0.16 }]}>♪</Text>
        </View>
      </Animated.View>

      <EqualizerBars />
      <Text style={styles.title} numberOfLines={1}>{song.title}</Text>

      {/* only shown when there's somewhere to actually go — the card is
          still the disc + title even for a linkless song, this just marks
          the ones that are tappable */}
      {!!song.link && (
        <View style={styles.linkBadge}>
          <IconArrowUpRight size={9} color={Colors.sakuraDeep} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1,
    borderRadius: Radius.r4,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  disc: {
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  discGroove: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', position: 'absolute' },
  discLabel: { backgroundColor: Colors.sakuraDeep, position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  discNote: { color: '#fff' },
  eqRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  eqBar: { width: 3, borderRadius: 1.5, backgroundColor: Colors.sakuraDeep },
  title: {
    fontFamily: FontFamily.uiSemiBold,
    fontSize: sf(11),
    color: Colors.ink,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  linkBadge: {
    position: 'absolute', top: 6, right: 6,
    width: 18, height: 18, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
});
