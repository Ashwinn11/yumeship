import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StickerWaxSeal } from '@/components/deco/Stickers';
import { Colors, FontFamily, FontSize, Radius, Spacing ,sf } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled app error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.screen}>
        <StickerWaxSeal size={88} />
        <Text style={styles.title}>something slipped</Text>
        <Pressable style={styles.button} onPress={() => this.setState({ error: null })}>
          <Text style={styles.buttonText}>try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 40,
    padding: Spacing.s7,
    backgroundColor: Colors.paper,
  },
  title: {
    fontFamily: FontFamily.script,
    fontSize: sf(34),
    lineHeight: sf(36),
    color: Colors.ink,
    textAlign: 'center',
  },
  body: {
    marginTop: Spacing.s4,
    fontFamily: FontFamily.script,
    fontSize: FontSize.h5,
    lineHeight: 26,
    color: Colors.ink2,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'center',
    marginTop: Spacing.s6,
    paddingHorizontal: Spacing.s6,
    paddingVertical: Spacing.s3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep,
  },
  buttonText: {
    fontFamily: FontFamily.uiMedium,
    fontSize: FontSize.body,
    color: Colors.vellum,
  },
});
