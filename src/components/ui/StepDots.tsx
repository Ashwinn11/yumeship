import { View, StyleSheet } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

type Props = { step: number; total?: number };

export function StepDots({ step, total = 5 }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: i === step ? 18 : 6,
              backgroundColor:
                i === step ? Colors.sakuraDeep : i < step ? Colors.sakura : Colors.paperDeep,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  dot: {
    height: 6,
    borderRadius: Radius.pill,
  },
});
