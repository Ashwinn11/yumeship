import { Colors, Duration, Shadow } from '@/constants/theme';
import { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';

// design/components.jsx — Toggle
// w=40 h=22 track, w=18 h=18 thumb. translateX = 18 when on.
type Props = {
  value: boolean;
  onValueChange?: (value: boolean) => void;
};

export function Toggle({ value, onValueChange }: Props) {
  const translateX = useRef(new Animated.Value(value ? 18 : 0)).current;
  const bgAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: value ? 18 : 0,
        duration: Duration.d2,
        useNativeDriver: true,
      }),
      Animated.timing(bgAnim, {
        toValue: value ? 1 : 0,
        duration: Duration.d2,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value]);

  const trackColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.lineStrong, Colors.sakuraDeep],
  });

  return (
    <Pressable onPress={() => onValueChange?.(!value)}>
      <Animated.View
        style={{
          width: 40,
          height: 22,
          borderRadius: 999,
          backgroundColor: trackColor,
          padding: 2,
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: 18,
            height: 18,
            borderRadius: 999,
            backgroundColor: Colors.vellum,
            transform: [{ translateX }],
            ...Shadow.s1,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
