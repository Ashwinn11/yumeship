import { Keyboard, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize } from '@/constants/theme';

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  multiline?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
};

export function UnderInput({
  value, onChangeText, placeholder, autoCapitalize, autoCorrect, keyboardType,
  multiline, returnKeyType, onSubmitEditing,
}: Props) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.ink3}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      keyboardType={keyboardType}
      multiline={multiline}
      returnKeyType={multiline ? returnKeyType : (returnKeyType ?? 'done')}
      onSubmitEditing={multiline ? onSubmitEditing : (onSubmitEditing ?? (() => Keyboard.dismiss()))}
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
    fontSize: FontSize.h6 - 2,
    fontFamily: FontFamily.ui,
    color: Colors.ink,
  },
});
