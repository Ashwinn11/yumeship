import { TextInput, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize } from '@/constants/theme';

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
};

export function UnderInput({ value, onChangeText, placeholder }: Props) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.ink3}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineStrong,
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 0,
    fontSize: FontSize.h6,
    fontFamily: FontFamily.displayItalic,
    color: Colors.ink,
  },
});
