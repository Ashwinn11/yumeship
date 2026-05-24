import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, spacing } from '@/tokens/theme';

export default function Screen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹ back</Text>
      </Pressable>
      <View style={styles.empty}>
        <Text style={styles.text}>message thread</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  back: { padding: spacing.s4 },
  backText: { fontSize: 16, color: colors.ink2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: 'InstrumentSerif_Italic', fontSize: 22, color: colors.ink3 },
});
