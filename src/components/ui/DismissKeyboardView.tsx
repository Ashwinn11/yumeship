import { Keyboard, StyleProp, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';

// Tap anywhere on this view's background (not on a nested Pressable/TextInput,
// which claim the touch first) to dismiss the keyboard. Same pattern already
// used correctly in StorylineTab.tsx, pulled out so every screen gets it.
// No default flex — pass `style={{ flex: 1 }}` yourself when wrapping a whole
// screen's root; content sitting inside a ScrollView should stay unsized.
export function DismissKeyboardView({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={style}>{children}</View>
    </TouchableWithoutFeedback>
  );
}
