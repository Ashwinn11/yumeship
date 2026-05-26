import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Sparkle } from '@/components/deco/Sparkle';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';

type Props = {
  ja: string;
  name: string;
  tint: string;
  tintBg: string;
  active?: boolean;
  onPress?: () => void;
};

export function PickerOption({ ja, name, tint, tintBg, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: active ? tintBg : Colors.vellum,
          borderColor: active ? tint : Colors.line,
          borderWidth: active ? 1.5 : 1,
        },
      ]}
    >
      {active && (
        <View style={styles.sparkle}>
          <Sparkle size={10} color={tint} />
        </View>
      )}
      <Text style={[styles.ja, { color: tint }]}>{ja}</Text>
      <Text
        style={[
          styles.name,
          { color: active ? tint : Colors.ink2, fontWeight: active ? '600' : '500' },
        ]}
      >
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: Radius.r3,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    top: -5,
    right: -3,
    zIndex: 1,
  },
  ja: {
    fontFamily: FontFamily.ja,
    fontSize: FontSize.h6,
    fontWeight: '600',
  },
  name: {
    fontSize: 10,
    fontFamily: FontFamily.ui,
    letterSpacing: 0.2,
  },
});
