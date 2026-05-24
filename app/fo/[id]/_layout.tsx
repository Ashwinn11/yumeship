import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Tabs, useLocalSearchParams, router } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Sparkle } from '@/deco';

const FO_TABS = [
  { id: 'profile',   label: 'Profile' },
  { id: 'albums',    label: 'Albums' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'storyline', label: 'Storyline' },
  { id: 'messages',  label: 'Messages' },
  { id: 'outfits',   label: 'Outfits' },
  { id: 'dates',     label: 'Dates' },
];

export default function FOLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
      tabBar={(props) => <FOTabBar {...props} />}
    >
      {FO_TABS.map((t) => (
        <Tabs.Screen key={t.id} name={t.id} />
      ))}
    </Tabs>
  );
}

function FOTabBar({ state, navigation }: any) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabBarContent}
      style={styles.tabBar}
    >
      <View style={styles.pill}>
        {FO_TABS.map((tab, i) => {
          const active = state.index === i;
          return (
            <Pressable
              key={tab.id}
              onPress={() => navigation.navigate(tab.id)}
              style={[styles.tab, active && styles.tabActive]}
            >
              {active && (
                <View style={styles.tabSparkle}>
                  <Sparkle size={8} color={colors.butter} />
                </View>
              )}
              <Text style={[styles.tabLabel, { color: active ? colors.vellum : colors.ink2 }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.paper,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  tabBarContent: { padding: spacing.s1, paddingHorizontal: spacing.s3 },
  pill: {
    flexDirection: 'row',
    backgroundColor: colors.vellum,
    borderRadius: radii.pill,
    borderWidth: 1, borderColor: colors.line,
    padding: 4, gap: 2,
    ...shadows.sm,
  },
  tab: {
    paddingVertical: 6, paddingHorizontal: 11,
    borderRadius: radii.pill,
    position: 'relative',
  },
  tabActive: { backgroundColor: colors.sakuraDeep },
  tabSparkle: { position: 'absolute', left: -3, top: -3 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
});
