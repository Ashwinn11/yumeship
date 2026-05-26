import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MarkerCard, TitleHeader, MarkerHeader, Polaroid, BlankPill, INK,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

type EventEntry = { d: string; t: string; body: string };
const BLANK_EVENTS: EventEntry[] = Array.from({ length: 5 }, () => ({ d: '', t: '', body: '' }));

export function StorylineContent({ editing = false }: { editing?: boolean }) {
  const [events, setEvents] = useState<EventEntry[]>(BLANK_EVENTS);
  const e = editing;

  const setField = (i: number, field: keyof EventEntry) =>
    e ? (v: string) => setEvents((p) => p.map((ev, j) => (j === i ? { ...ev, [field]: v } : ev))) : undefined;

  return (
    <MarkerCard tint="#fffbf6" style={s.card}>
      <TitleHeader title="OUR STORYLINE" subtitle="the year so far" by="@plumstamps" />

      <View style={s.timeline}>
        <View style={s.timelineLine} />
        {events.map((ev, i) => {
          const isLast = i === events.length - 1;
          return (
            <View key={i} style={s.event}>
              <View style={[s.dot, isLast && s.dotFilled]} />
              <View style={s.eventContent}>
                <View style={s.eventHeader}>
                  <View style={s.dateBadge}>
                    <BlankPill
                      width={54}
                      value={e ? ev.d : undefined}
                      onChangeText={setField(i, 'd')}
                      placeholder="date"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <BlankPill
                      value={e ? ev.t : undefined}
                      onChangeText={setField(i, 't')}
                      placeholder="title"
                    />
                  </View>
                  {isLast && <Heart size={14} color={INK} />}
                </View>
                {e ? (
                  <TextInput
                    value={ev.body}
                    onChangeText={setField(i, 'body')}
                    placeholder="what happened..."
                    placeholderTextColor={INK + '33'}
                    multiline
                    style={s.eventBody}
                  />
                ) : (
                  <View style={{ height: 18 }}><BlankPill /></View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={s.polaroidRow}>
        <Polaroid size={110} rotate={6} tapeColor="#fadde5" />
      </View>
    </MarkerCard>
  );
}

export default function TemplateStoryline() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.appBar}>
        <Pressable onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>‹</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <StorylineContent editing />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  appBar: { paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: Colors.ink2, fontFamily: FontFamily.ui },
  scroll: { padding: Spacing.s5, paddingBottom: Spacing.s8 },
  card: { position: 'relative' },
  timeline: { position: 'relative', paddingLeft: 26, marginTop: 14 },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 6,
    bottom: 6,
    width: 0,
    borderLeftWidth: 1.5,
    borderLeftColor: INK,
    borderStyle: 'dashed',
  },
  event: { position: 'relative', marginBottom: 18 },
  dot: {
    position: 'absolute',
    left: -23,
    top: 4,
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: INK,
  },
  dotFilled: { backgroundColor: INK },
  eventContent: { gap: 3 },
  eventHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  dateBadge: {
    backgroundColor: '#e9d8cb',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1.2,
    borderColor: INK,
  },
  eventBody: {
    fontFamily: FontFamily.ja,
    fontSize: 12,
    color: INK,
    lineHeight: 18,
    minHeight: 18,
    textAlignVertical: 'top',
  },
  polaroidRow: { alignItems: 'flex-end', marginTop: 16 },
});
