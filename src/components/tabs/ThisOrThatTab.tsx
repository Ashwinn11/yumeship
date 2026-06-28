import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useIPad } from '@/hooks/use-ipad';

import { ThisOrThatContent, DEFAULT_PAIRS } from '@/app/template/this-or-that';
import { getShip } from '@/store/ships';
import { TemplateDataCtx, loadTemplateData, saveTemplateData, buildPreFill } from '@/store/templateData';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { IconPlus, IconTrashSolid } from '@/components/ui/Icon';

export function ThisOrThatTab({ shipId }: { shipId: string }) {
  const { column } = useIPad();
  const ship = getShip(shipId);
  const templateKey = 'this-or-that';
  const [editing, setEditing] = useState(false);

  const initData = (): Record<string, string> => {
    const saved = loadTemplateData(shipId, templateKey);
    if (Object.keys(saved).length > 0) return saved;
    return ship ? buildPreFill(ship, templateKey) : {};
  };

  const dataRef = useRef<Record<string, string>>(null as unknown as Record<string, string>);
  if (dataRef.current === null) {
    dataRef.current = initData();
  }

  const ctx = useMemo(() => ({
    get: (key: string, fb = '') => (dataRef.current as Record<string, string>)[key] ?? fb,
    set: (key: string, val: string) => {
      (dataRef.current as Record<string, string>)[key] = val;
      saveTemplateData(shipId, templateKey, dataRef.current as Record<string, string>);
    },
    bgColor: '',
    bgImage: '',
  }), [shipId]);

  const getPairs = (): [string, string][] => {
    const raw = ctx.get('pairs');
    if (raw) {
      try { return JSON.parse(raw); } catch (_) {}
    }
    return DEFAULT_PAIRS;
  };

  const savePairs = (pairs: [string, string][]) => {
    ctx.set('pairs', JSON.stringify(pairs));
  };

  if (editing) {
    return (
      <PairsEditor
        initialPairs={getPairs()}
        onDone={(pairs) => { savePairs(pairs); setEditing(false); }}
      />
    );
  }

  return (
    <TemplateDataCtx.Provider value={ctx}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.tab, column]}>
        <ThisOrThatContent editing getPairs={getPairs} onEdit={() => setEditing(true)} ship={ship} />
      </ScrollView>
    </TemplateDataCtx.Provider>
  );
}

function PairsEditor({ initialPairs, onDone }: {
  initialPairs: [string, string][];
  onDone: (pairs: [string, string][]) => void;
}) {
  const [pairs, setPairs] = useState<[string, string][]>(initialPairs);

  function update(i: number, side: 0 | 1, val: string) {
    setPairs((prev) => prev.map((p, j) => j === i ? (side === 0 ? [val, p[1]] : [p[0], val]) : p) as [string, string][]);
  }

  function remove(i: number) {
    setPairs((prev) => prev.filter((_, j) => j !== i));
  }

  function add() {
    setPairs((prev) => [...prev, ['', '']]);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={120}>
      <View style={e.header}>
        <Text style={e.headerTitle}>edit pairs</Text>
        <Pressable style={e.doneBtn} onPress={() => onDone(pairs.filter(([a, b]) => a.trim() || b.trim()))}>
          <Text style={e.doneBtnText}>done</Text>
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={e.list}>
        {pairs.map(([a, b], i) => (
          <View key={i} style={e.row}>
            <Text style={e.rowNum}>{String(i + 1).padStart(2, '0')}</Text>
            <TextInput
              value={a}
              onChangeText={(v) => update(i, 0, v)}
              placeholder="this"
              placeholderTextColor={Colors.ink3}
              style={e.input}
            />
            <Text style={e.slash}>/</Text>
            <TextInput
              value={b}
              onChangeText={(v) => update(i, 1, v)}
              placeholder="that"
              placeholderTextColor={Colors.ink3}
              style={e.input}
            />
            <Pressable hitSlop={8} onPress={() => remove(i)}>
              <IconTrashSolid size={13} color={Colors.ink3} />
            </Pressable>
          </View>
        ))}
        <Pressable style={e.addRow} onPress={add}>
          <IconPlus size={13} color={Colors.sakuraDeep} />
          <Text style={e.addText}>add pair</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  tab: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s6,
  },
});

const e = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5,
    paddingVertical: Spacing.s3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  headerTitle: {
    fontFamily: FontFamily.uiSemiBold,
    fontSize: sf(14),
    color: Colors.ink,
  },
  doneBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep,
  },
  doneBtnText: {
    fontFamily: FontFamily.uiMedium,
    fontSize: sf(13),
    color: Colors.vellum,
  },
  list: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s3,
    paddingBottom: Spacing.s9,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rowNum: {
    fontFamily: FontFamily.marker,
    fontSize: sf(9),
    color: Colors.ink3,
    width: 18,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.ui,
    fontSize: sf(13),
    color: Colors.ink,
  },
  slash: {
    fontFamily: FontFamily.marker,
    fontSize: sf(11),
    color: Colors.ink3,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  addText: {
    fontFamily: FontFamily.uiMedium,
    fontSize: sf(13),
    color: Colors.sakuraDeep,
  },
});
