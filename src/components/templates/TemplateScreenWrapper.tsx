import { useState, useRef, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addShip, updateShip, getShip } from '@/store/ships';
import { TemplateDataCtx } from '@/store/templateData';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

type Props = {
  templateKey: string;
  shipId?: string;
  children: React.ReactNode;
};

export function TemplateScreenWrapper({ templateKey, shipId, children }: Props) {
  const insets = useSafeAreaInsets();
  const existing = shipId ? getShip(shipId) : undefined;

  // useRef so ctx never changes reference → children never re-render from data writes
  const dataRef = useRef<Record<string, string>>(existing?.data ?? {});

  const ctx = useMemo(() => ({
    get: (key: string, fb = '') => dataRef.current[key] ?? fb,
    set: (key: string, val: string) => { dataRef.current[key] = val; },
  }), []);

  const [foName, setFoName] = useState(existing?.foName ?? '');

  const save = () => {
    const data = { ...dataRef.current };
    if (shipId) {
      updateShip(shipId, { foName: foName.trim() || 'untitled', data });
    } else {
      addShip({ templateKey, foName: foName.trim() || 'untitled', data });
    }
    router.replace('/(tabs)' as any);
  };

  return (
    <TemplateDataCtx.Provider value={ctx}>
      <View style={[s.screen, { paddingTop: insets.top }]}>
        <View style={s.appBar}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)' as any);
              }
            }}
            style={s.back}
          >
            <Text style={s.backText}>‹</Text>
          </Pressable>

          <TextInput
            value={foName}
            onChangeText={setFoName}
            placeholder="their name..."
            placeholderTextColor={Colors.ink3}
            style={s.nameInput}
            returnKeyType="done"
          />

          <Pressable onPress={save} style={s.saveBtn}>
            <Text style={s.saveBtnText}>{shipId ? 'update ♡' : 'save ♡'}</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    </TemplateDataCtx.Provider>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s2,
    gap: Spacing.s3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: Colors.ink2, fontFamily: FontFamily.ui },
  nameInput: {
    flex: 1,
    fontFamily: FontFamily.displayItalic,
    fontSize: 18,
    color: Colors.ink,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.line,
    paddingBottom: 2,
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Colors.sakuraDeep,
    borderRadius: 999,
  },
  saveBtnText: {
    fontFamily: FontFamily.markerBold,
    fontSize: 12,
    color: Colors.vellum,
    letterSpacing: 0.3,
  },
  scroll: { padding: Spacing.s5, paddingBottom: Spacing.s8 },
});
