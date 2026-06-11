import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, TitleHeader, TemplateField, SharingRow, TwinProfile, HeartClipPhoto, BlankPill, INK, FILL_GRAY,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { FontFamily ,sf } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';
import { DateField, calcElapsed } from '@/components/ui/DateField';

const BLANK_INFO = ['', '', '', ''];
const INFO_LABELS = ['age', 'pronouns', 'pet name', 'love language'];

export function HeartFrameContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;

  const [vals, setVals] = useState<{
    sharing: 'Yes' | 'No' | 'Selective' | undefined;
    meName: string;
    themName: string;
    meInfo: string[];
    themInfo: string[];
    metText: string;
    anniv: string;
    mePhoto: string;
    themPhoto: string;
  }>(() => {
    const sharingRaw = ctx.get('sharing');
    return {
      sharing: (sharingRaw as 'Yes' | 'No' | 'Selective') || undefined,
      meName: ctx.get('meName'),
      themName: ctx.get('themName'),
      meInfo: JSON.parse(ctx.get('meInfo', 'null')) ?? [...BLANK_INFO],
      themInfo: JSON.parse(ctx.get('themInfo', 'null')) ?? [...BLANK_INFO],
      metText: ctx.get('metText'),
      anniv: ctx.get('anniv'),
      mePhoto: ctx.get('mePhoto'),
      themPhoto: ctx.get('themPhoto'),
    };
  });

  const e = editing;

  const set = (key: 'meName' | 'themName' | 'metText' | 'anniv') => (v: string) => {
    setVals((p) => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };

  const setSharing = (v: 'Yes' | 'No' | 'Selective') => {
    setVals((p) => ({ ...p, sharing: v }));
    ctx.set('sharing', v);
  };

  const setMeInfo = (i: number, v: string) => {
    setVals((p) => {
      const next = p.meInfo.map((x, j) => (j === i ? v : x));
      ctx.set('meInfo', JSON.stringify(next));
      return { ...p, meInfo: next };
    });
  };

  const setThemInfo = (i: number, v: string) => {
    setVals((p) => {
      const next = p.themInfo.map((x, j) => (j === i ? v : x));
      ctx.set('themInfo', JSON.stringify(next));
      return { ...p, themInfo: next };
    });
  };

  const { sharing, meName, themName, meInfo, themInfo, metText, anniv, mePhoto, themPhoto } = vals;

  const meInfoPairs: [string, string?][] = INFO_LABELS.map((l, i) => [l, meInfo[i]]);
  const themInfoPairs: [string, string?][] = INFO_LABELS.map((l, i) => [l, themInfo[i]]);

  return (
    <MarkerCard tint={customBg ? 'transparent' : '#fff5f6'}>
      <TitleHeader title="ALL ABOUT MY YUMESHIP!!" subtitle="our love in one page" />

      <View style={s.mt6}>
        <SharingRow choice={sharing} onChoiceChange={e ? setSharing : undefined} />
      </View>

      <View style={s.heartPhotoRow}>
        <HeartClipPhoto
          width={180}
          height={160}
          editing={e}
          leftUri={mePhoto || undefined}
          rightUri={themPhoto || undefined}
          onLeftUriChange={e ? (u) => { setVals((p) => ({ ...p, mePhoto: u })); ctx.set('mePhoto', u); } : undefined}
          onRightUriChange={e ? (u) => { setVals((p) => ({ ...p, themPhoto: u })); ctx.set('themPhoto', u); } : undefined}
        />
      </View>

      <View style={s.namesRow}>
        <Text style={s.nameLabel}>ME</Text>
        <View style={s.namePillContainer}>
          <BlankPill value={meName} onChangeText={e ? set('meName') : undefined} width={80} />
        </View>
        <Heart size={16} color={INK} />
        <Text style={s.nameLabel}>THEM</Text>
        <View style={s.namePillContainer}>
          <BlankPill value={themName} onChangeText={e ? set('themName') : undefined} width={80} />
        </View>
      </View>

      <View style={s.twinGrid}>
        <View style={s.twinCol}>
          <TwinProfile
            who="ME"
            info={meInfoPairs}
            onInfoChange={e ? (i, v) => setMeInfo(i, v) : undefined}
          />
        </View>
        <View style={s.twinCol}>
          <TwinProfile
            who="THEM"
            info={themInfoPairs}
            onInfoChange={e ? (i, v) => setThemInfo(i, v) : undefined}
          />
        </View>
      </View>

      <View style={[s.metBox, customBg ? { backgroundColor: 'transparent' } : null]}>
        <Text style={s.metLabel}>how we met</Text>
        {e ? (
          <TextInput
            value={metText}
            onChangeText={set('metText')}
            placeholder="our story..."
            placeholderTextColor={INK + '88'}
            multiline
            underlineColorAndroid="transparent"
            style={s.metText}
          />
        ) : (
          <Text style={s.metText}>{metText || 'our story...'}</Text>
        )}
      </View>

      <View style={[s.anniversaryPill, customBg ? { backgroundColor: 'transparent' } : null]}>
        <Text style={s.anniversaryLabel}>♡ anniversary</Text>
        <View style={{ alignItems: 'flex-end' }}>
          {e ? (
            <DateField
              value={anniv}
              onChange={set('anniv')}
              editing={e}
              placeholder="pick a date"
              style={{
                borderWidth: 0,
                backgroundColor: 'transparent',
                paddingHorizontal: 0,
                height: 'auto',
                justifyContent: 'center',
              }}
              textStyle={{
                fontFamily: FontFamily.ja,
                fontSize: sf(13),
                color: INK,
              }}
              displayValue={(() => {
                const el = calcElapsed(anniv);
                return el ? `${el.since} · ${el.label}` : undefined;
              })()}
            />
          ) : (
            <Text style={{ fontFamily: FontFamily.ja, fontSize: sf(13), color: INK }}>
              {anniv ? `${calcElapsed(anniv)?.since} · ${calcElapsed(anniv)?.label}` : '——'}
            </Text>
          )}
        </View>
      </View>
    </MarkerCard>
  );
}

export default function TemplateHeartFrame() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="heart-frame" shipId={shipId}>
      <HeartFrameContent editing />
    </TemplateScreenWrapper>
  );
}

const s = StyleSheet.create({
  mt6: { marginTop: 6, marginBottom: 12 },
  heartPhotoRow: { alignItems: 'center', marginVertical: 10 },
  namesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 12 },
  twinGrid: { flexDirection: 'row', gap: 10 },
  twinCol: { flex: 1 },
  metBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 8,
  },
  metLabel: {
    fontFamily: FontFamily.markerBold,
    fontWeight: '700',
    fontSize: sf(9),
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: INK,
    opacity: 0.7,
    marginBottom: 4,
  },
  metText: {
    fontFamily: FontFamily.ja,
    fontSize: sf(12),
    color: INK,
    lineHeight: 18,
    minHeight: 60,
    textAlignVertical: 'top',
    fontWeight: '600',
  },
  anniversaryPill: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: FILL_GRAY,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 999,
    gap: 10,
  },
  anniversaryLabel: { fontFamily: FontFamily.markerBold, fontWeight: '700', fontSize: sf(10), color: INK, letterSpacing: 0.8, textTransform: 'uppercase' },
  nameLabel: {
    fontFamily: FontFamily.markerBold,
    fontWeight: '700',
    fontSize: sf(12),
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  namePillContainer: {
    width: 80,
    height: 18,
  },
});
