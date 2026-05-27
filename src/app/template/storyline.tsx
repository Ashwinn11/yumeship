import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useLocalSearchParams } from 'expo-router';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, TitleHeader, Polaroid, INK,
} from '@/components/templates/primitives';
import { Bullets, WashiTape } from '@/components/deco';
import { FontFamily } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';
import { DateField } from '@/components/ui/DateField';

type EventEntry = { d: string; t: string; body: string };
const BLANK_EVENTS: EventEntry[] = Array.from({ length: 5 }, () => ({ d: '', t: '', body: '' }));

export function StorylineContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();

  const [events, setEvents] = useState<EventEntry[]>(() =>
    JSON.parse(ctx.get('events', 'null')) ?? BLANK_EVENTS
  );
  const [polPhoto, setPolPhoto] = useState(() => ctx.get('polPhoto'));
  const [timelineH, setTimelineH] = useState(0);
  const e = editing;

  const setField = (i: number, field: keyof EventEntry) =>
    e ? (v: string) => {
      setEvents((p) => {
        const next = p.map((ev, j) => (j === i ? { ...ev, [field]: v } : ev));
        ctx.set('events', JSON.stringify(next));
        return next;
      });
    } : undefined;

  return (
    <MarkerCard tint="#fffbf6" style={s.card}>
      <View style={{ position: 'absolute', top: -7, right: 24, zIndex: 10 }}>
        <WashiTape width={65} height={14} pattern="star" color="#b8902a" rotate={5} />
      </View>
      <TitleHeader title="OUR STORYLINE" subtitle="the year so far" by="@plumstamps" />

      <View style={s.timeline} onLayout={(ev) => setTimelineH(ev.nativeEvent.layout.height)}>
        {timelineH > 0 && (
          <Svg style={StyleSheet.absoluteFill} width="100%" height={timelineH}>
            <Line x1="7" y1="6" x2="7" y2={timelineH - 6} stroke={INK} strokeWidth="1.5" strokeDasharray="4,4" />
          </Svg>
        )}
        {events.map((ev, i) => {
          const isLast = i === events.length - 1;
          return (
            <View key={i} style={s.event}>
              <View style={{ position: 'absolute', left: -26, top: 4, width: 14, height: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fffbf6', borderRadius: 999 }}>
                {(() => {
                  if (isLast) return <Bullets.Heart size={12} color={INK} />;
                  switch (i % 3) {
                    case 0: return <Bullets.Sakura size={12} color={INK} />;
                    case 1: return <Bullets.Star size={12} color={INK} />;
                    default: return <Bullets.Crescent size={12} color={INK} />;
                  }
                })()}
              </View>
              <View style={s.eventContent}>
                <View style={s.eventHeader}>
                  <View style={s.dateBadge}>
                    <DateField
                      value={ev.d}
                      onChange={setField(i, 'd') || (() => {})}
                      editing={e}
                      placeholder="when?"
                      style={{
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        height: 'auto',
                        paddingHorizontal: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        minWidth: 54,
                      }}
                      textStyle={{
                        fontFamily: FontFamily.markerBold,
                        fontSize: 10,
                        color: INK,
                        textAlign: 'center',
                        fontWeight: '600',
                      }}
                      displayValue={ev.d || undefined}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    {e ? (
                      <TextInput
                        value={ev.t}
                        onChangeText={setField(i, 't') || (() => {})}
                        placeholder="WHAT HAPPENED?"
                        placeholderTextColor={INK + '55'}
                        autoCapitalize="characters"
                        underlineColorAndroid="transparent"
                        style={s.eventTitle}
                      />
                    ) : (
                      <Text style={s.eventTitle}>{ev.t || '———'}</Text>
                    )}
                  </View>
                  {isLast && <Bullets.Heart size={14} color={INK} />}
                </View>
                {e ? (
                  <TextInput
                    value={ev.body}
                    onChangeText={setField(i, 'body')}
                    placeholder="what happened..."
                    placeholderTextColor={INK + '88'}
                    multiline
                    underlineColorAndroid="transparent"
                    style={s.eventBody}
                  />
                ) : (
                  <Text style={s.eventBody}>{ev.body || '...'}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={s.polaroidRow}>
        <Polaroid size={110} rotate={6} tapeColor="#fadde5" editing={e} uri={polPhoto} onUriChange={e ? (u) => { setPolPhoto(u); ctx.set('polPhoto', u); } : undefined} />
      </View>
    </MarkerCard>
  );
}

export default function TemplateStoryline() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="storyline" shipId={shipId}>
      <StorylineContent editing />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
  card: { position: 'relative' },
  timeline: { position: 'relative', paddingLeft: 26, marginTop: 14 },
  event: { position: 'relative', marginBottom: 18 },
  dot: {
    position: 'absolute',
    left: -26,
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
  eventTitle: {
    fontFamily: FontFamily.markerBold,
    fontWeight: '800',
    fontSize: 14,
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    flex: 1,
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
