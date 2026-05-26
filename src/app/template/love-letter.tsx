import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, TitleHeader, MarkerHeader, BlankPill, INK,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { FontFamily } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';

const BLANK_THINGS = ['', '', '', '', ''];

export function LoveLetterContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();

  const [vals, setVals] = useState<{ dearName: string; letterBody: string; signName: string; things: string[] }>(() => ({
    dearName: ctx.get('dearName'),
    letterBody: ctx.get('letterBody'),
    signName: ctx.get('signName'),
    things: JSON.parse(ctx.get('things', 'null')) ?? [...BLANK_THINGS],
  }));

  const e = editing;

  const set = (key: 'dearName' | 'letterBody' | 'signName') => (v: string) => {
    setVals((p) => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };

  const setThing = (i: number) =>
    e ? (v: string) => {
      setVals((p) => {
        const next = p.things.map((t, j) => (j === i ? v : t));
        ctx.set('things', JSON.stringify(next));
        return { ...p, things: next };
      });
    } : undefined;

  const { dearName, letterBody, signName, things } = vals;

  return (
    <MarkerCard tint="#fff5f0">
      <View style={s.watermark} pointerEvents="none">
        <Heart size={140} color={INK} />
      </View>

      <TitleHeader title="A LOVE LETTER" subtitle="for the one i never got to send" by="@inkdrop.diary" />

      <View style={s.letterBox}>
        <View style={s.dearLabel}>
          <View style={s.dearRow}>
            <Text style={s.dearText}>DEAR </Text>
            {e ? (
              <TextInput
                value={dearName}
                onChangeText={set('dearName')}
                placeholder="name"
                placeholderTextColor={INK + '44'}
                underlineColorAndroid="transparent"
                style={s.dearNameInput}
              />
            ) : (
              <Text style={s.dearName}>{dearName || ' — '}</Text>
            )}
            <Text style={s.dearText}>,</Text>
          </View>
        </View>

        {e ? (
          <TextInput
            value={letterBody}
            onChangeText={set('letterBody')}
            placeholder="write your letter here..."
            placeholderTextColor={INK + '33'}
            multiline
            underlineColorAndroid="transparent"
            style={s.letterBody}
          />
        ) : (
          <Text style={s.letterBody}>{letterBody || '...'}</Text>
        )}

        <Text style={s.signoff}>yours, always —</Text>
        <View style={s.signName}>
          <BlankPill
            value={signName}
            onChangeText={e ? set('signName') : undefined}
            width={120}
          />
        </View>
      </View>

      <View style={s.thingsSection}>
        <MarkerHeader size={13} style={s.thingsTitle}>5 THINGS I LOVE</MarkerHeader>
        <View style={s.thingsGrid}>
          {things.map((_, i) => (
            <View key={i} style={s.thingCard}>
              <Heart size={11} color={INK} outline={i === 4} />
              <View style={s.thingTextBox}>
                {e ? (
                  <TextInput
                    value={things[i]}
                    onChangeText={setThing(i)}
                    placeholder=""
                    underlineColorAndroid="transparent"
                    style={[
                      { fontFamily: FontFamily.ja, fontSize: 11, color: INK, padding: 0, minHeight: 18 },
                      !things[i] && {
                        height: 14,
                        backgroundColor: '#e9d8cb',
                        borderWidth: 1.5,
                        borderColor: INK,
                        borderRadius: 999,
                      }
                    ]}
                  />
                ) : (
                  things[i] ? (
                    <Text style={{ fontFamily: FontFamily.ja, fontSize: 11, color: INK }}>{things[i]}</Text>
                  ) : (
                    <View style={{
                      height: 14,
                      backgroundColor: '#e9d8cb',
                      borderWidth: 1.5,
                      borderColor: INK,
                      borderRadius: 999,
                    }} />
                  )
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </MarkerCard>
  );
}

export default function TemplateLoveLetter() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="love-letter" shipId={shipId}>
      <LoveLetterContent editing />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
  watermark: { position: 'absolute', top: 28, right: 24, opacity: 0.12 },
  letterBox: {
    marginTop: 12,
    padding: 16,
    paddingTop: 20,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 200,
    position: 'relative',
  },
  dearLabel: {
    position: 'absolute',
    top: -10,
    left: 14,
    backgroundColor: '#fff5f0',
    paddingHorizontal: 8,
  },
  dearRow: { flexDirection: 'row', alignItems: 'center' },
  dearText: {
    fontFamily: FontFamily.markerBold,
    fontWeight: '700',
    fontSize: 11,
    color: INK,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  dearName: {
    fontFamily: FontFamily.ja,
    fontWeight: '400',
    fontSize: 11,
    color: INK,
  },
  dearNameInput: {
    fontFamily: FontFamily.ja,
    fontSize: 11,
    color: INK,
    minWidth: 60,
    padding: 0,
    paddingHorizontal: 2,
  },
  letterBody: {
    fontFamily: FontFamily.ja,
    fontSize: 12,
    color: INK,
    lineHeight: 20,
    marginTop: 4,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  signoff: {
    fontFamily: FontFamily.script,
    fontSize: 16,
    color: INK,
    marginTop: 12,
  },
  signName: { marginTop: 8 },
  thingsSection: { marginTop: 14 },
  thingsTitle: { marginBottom: 8 },
  thingsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  thingCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: INK,
    borderRadius: 4,
  },
  thingTextBox: { flex: 1 },
});
