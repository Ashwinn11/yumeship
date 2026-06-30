import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getMembers, memberColor, Ship } from '@/store/ships';
import { Colors, FontFamily, Radius, sf } from '@/constants/theme';

// A chip row to pick one member of a polyship. Colors match the member's
// index in the full roster (so they line up with the poly templates).
// By default only partners (non-"me") are shown; pass includeMe for senders.
type Props = {
  ship: Ship | undefined;
  selectedId?: string | null;
  onSelect: (id: string, name: string) => void;
  includeMe?: boolean;
  label?: string;
};

export function MemberPicker({ ship, selectedId, onSelect, includeMe = false, label }: Props) {
  const all = getMembers(ship);
  const shown = includeMe ? all : all.filter((m) => !m.isMe);
  if (shown.length === 0) return null;

  const colorFor = (id: string) => memberColor(Math.max(0, all.findIndex((m) => m.id === id)));

  return (
    <View style={s.wrap}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={s.row}>
        {shown.map((m) => {
          const on = m.id === selectedId;
          const c = colorFor(m.id);
          return (
            <Pressable
              key={m.id}
              onPress={() => onSelect(m.id, m.name)}
              style={[s.chip, { borderColor: c, backgroundColor: on ? c : Colors.paperDeep }]}
            >
              <View style={[s.dot, { backgroundColor: on ? '#fff' : c }]} />
              <Text style={[s.chipText, { color: on ? '#fff' : Colors.ink2 }]} numberOfLines={1}>
                {m.name || '—'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontFamily: FontFamily.marker, fontSize: sf(8), letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.ink3 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderRadius: Radius.pill, paddingVertical: 4, paddingHorizontal: 10 },
  dot: { width: 9, height: 9, borderRadius: Radius.pill },
  chipText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), maxWidth: 120 },
});
