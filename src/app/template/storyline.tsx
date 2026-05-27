import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useLocalSearchParams } from 'expo-router';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, TitleHeader, INK,
} from '@/components/templates/primitives';
import { Bullets, WashiTape } from '@/components/deco';
import { Colors, FontFamily } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';
import { DateField } from '@/components/ui/DateField';
import { DecoBar } from '@/components/templates/DecoBar';

type EventEntry = { d: string; t: string; body: string };
const BLANK_EVENTS: EventEntry[] = Array.from({ length: 5 }, () => ({ d: '', t: '', body: '' }));

export function StorylineContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();

  const [events, setEvents] = useState<EventEntry[]>(() =>
    JSON.parse(ctx.get('events', 'null')) ?? BLANK_EVENTS
  );
  const [decoItemsJson, setDecoItemsJson] = useState(() => ctx.get('decoItems', '[]'));
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
            <Line x1="11" y1="8" x2="11" y2={timelineH - 8} stroke={INK} strokeWidth="1.5" strokeDasharray="4,4" />
          </Svg>
        )}
        {events.map((ev, i) => {
          const isLast = i === events.length - 1;
          return (
            <View key={i} style={s.event}>
              {(() => {
                if (isLast) {
                  return (
                    <View style={[s.dotCircle, { borderColor: Colors.sakuraDeep }]}>
                      <Bullets.Heart size={13} color={Colors.sakuraDeep} />
                    </View>
                  );
                }
                switch (i % 3) {
                  case 0: return (
                    <View style={[s.dotCircle, { borderColor: Colors.sakura }]}>
                      <Bullets.Sakura size={13} color={Colors.sakuraDeep} />
                    </View>
                  );
                  case 1: return (
                    <View style={[s.dotCircle, { borderColor: Colors.butterDeep }]}>
                      <Bullets.Star size={13} color={Colors.butterDeep} />
                    </View>
                  );
                  default: return (
                    <View style={[s.dotCircle, { borderColor: Colors.lavenderDeep }]}>
                      <Bullets.Dot size={10} color={Colors.lavenderDeep} />
                    </View>
                  );
                }
              })()}
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

      <DecoBar
        editing={e}
        itemsJson={decoItemsJson}
        onItemsChange={(j) => { setDecoItemsJson(j); ctx.set('decoItems', j); }}
      />
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
  timeline: { position: 'relative', paddingLeft: 32, marginTop: 14 },
  event: { position: 'relative', marginBottom: 18 },
  dotCircle: {
    position: 'absolute',
    left: -30,
    top: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fffbf6',
    borderWidth: 1.5,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
});
