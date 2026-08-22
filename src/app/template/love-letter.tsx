import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, TitleHeader, MarkerHeader, BlankPill, INK, useThemedInk,
} from '@/components/templates/primitives';
import { Heart } from '@/components/deco/Heart';
import { FontFamily, SheetColumn ,sf } from '@/constants/theme';
import { useTemplateCtx } from '@/store/templateData';
import { DecoBar } from '@/components/templates/DecoBar';
import { getMembers, isPoly, Ship, useShip } from '@/store/ships';
import { MemberPicker } from '@/components/nav/MemberPicker';

const BLANK_THINGS = ['', '', '', '', ''];

export function LoveLetterContent({ editing = false, ship }: { editing?: boolean; ship?: Ship }) {
  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;
  const ink = useThemedInk();

  const [vals, setVals] = useState<{ dearName: string; letterBody: string; signName: string; things: string[] }>(() => ({
    dearName: ctx.get('dearName'),
    letterBody: ctx.get('letterBody'),
    signName: ctx.get('signName') || ctx.get('meName') || ctx.get('name') || '',
    things: JSON.parse(ctx.get('things', 'null')) ?? [...BLANK_THINGS],
  }));
  const [decoItemsJson, setDecoItemsJson] = useState(() => ctx.get('decoItems', '[]'));
  const [pickingTo, setPickingTo] = useState(false);

  const e = editing;
  const polyRecipient = isPoly(ship) && getMembers(ship).some((m) => !m.isMe);

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
    <MarkerCard tint={customBg ? 'transparent' : '#fff5f0'}>
      <View style={s.watermark} pointerEvents="none">
        <Heart size={140} color={ink} />
      </View>

      <TitleHeader title="A LOVE LETTER" subtitle="for the one i never got to send" />

      <View style={[s.letterBox, { borderColor: ink }]}>
        <View style={s.dearLabel}>
          <View style={s.dearRow}>
            <Text style={[s.dearText, { color: ink }]}>DEAR </Text>
            {e && polyRecipient ? (
              <Pressable onPress={() => setPickingTo(true)}>
                <Text style={[s.dearName, s.dearNameTap, { color: ink }]}>{dearName || 'tap to choose ▾'}</Text>
              </Pressable>
            ) : e ? (
              <TextInput
                value={dearName}
                onChangeText={set('dearName')}
                placeholder="name"
                placeholderTextColor={ink + '88'}
                underlineColorAndroid="transparent"
                style={[s.dearNameInput, { color: ink }]}
              />
            ) : (
              <Text style={[s.dearName, { color: ink }]}>{dearName || ' — '}</Text>
            )}
            <Text style={[s.dearText, { color: ink }]}>,</Text>
          </View>
        </View>

        {e ? (
          <TextInput
            value={letterBody}
            onChangeText={set('letterBody')}
            placeholder="write your letter here..."
            placeholderTextColor={ink + '88'}
            multiline
            underlineColorAndroid="transparent"
            style={[s.letterBody, { color: ink }]}
          />
        ) : (
          <Text style={[s.letterBody, { color: ink }]}>{letterBody || '...'}</Text>
        )}

        <Text style={[s.signoff, { color: ink }]}>yours, always —</Text>
        <View style={s.signName}>
          {e ? (
                   <TextInput
                     value={signName}
                     onChangeText={set('signName')}
                     placeholder="your name..."
                     placeholderTextColor={ink + '88'}
                     underlineColorAndroid="transparent"
                     style={{
                       fontFamily: FontFamily.ui,
                       fontSize: sf(15),
                       color: ink,
                       padding: 0,
                       minWidth: 120,
                     }}
                   />
                 ) : (
                   <Text style={{
                     fontFamily: FontFamily.ui,
                     fontSize: sf(15),
                     color: ink,
                   }}>
                     {signName || '——'}
                   </Text>
                 )}
        </View>
      </View>

      <View style={s.thingsSection}>
        <MarkerHeader size={13} style={s.thingsTitle}>5 THINGS I LOVE</MarkerHeader>
        <View style={s.thingsGrid}>
          {things.map((_, i) => (
            <View key={i} style={[s.thingCard, { borderColor: ink }]}>
              <Heart size={11} color={ink} outline={i === 4} />
              <View style={s.thingTextBox}>
                {e ? (
                  <TextInput
                    value={things[i]}
                    onChangeText={setThing(i)}
                    placeholder=""
                    underlineColorAndroid="transparent"
                    style={[
                      { fontFamily: FontFamily.ja, fontSize: sf(11), color: ink, padding: 0, minHeight: 18 },
                      !things[i] && {
                        height: 14,
                        backgroundColor: '#e9d8cb',
                        borderWidth: 1.5,
                        borderColor: ink,
                        borderRadius: 999,
                      }
                    ]}
                  />
                ) : (
                  things[i] ? (
                    <Text style={{ fontFamily: FontFamily.ja, fontSize: sf(11), color: ink }}>{things[i]}</Text>
                  ) : (
                    <View style={{
                      height: 14,
                      backgroundColor: '#e9d8cb',
                      borderWidth: 1.5,
                      borderColor: ink,
                      borderRadius: 999,
                    }} />
                  )
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <DecoBar
        editing={e}
        itemsJson={decoItemsJson}
        onItemsChange={(j) => { setDecoItemsJson(j); ctx.set('decoItems', j); }}
      />

      <Modal visible={pickingTo} transparent animationType="fade" onRequestClose={() => setPickingTo(false)}>
        <Pressable style={s.pickOverlay} onPress={() => setPickingTo(false)} />
        <View style={s.pickSheet}>
         <View style={[s.pickCard, SheetColumn, { borderColor: ink }]}>
          <Text style={[s.pickTitle, { color: ink }]}>who is this letter to?</Text>
          <MemberPicker
            ship={ship}
            selectedId={getMembers(ship).find((m) => m.name === dearName)?.id}
            onSelect={(_, name) => { set('dearName')(name); setPickingTo(false); }}
          />
         </View>
        </View>
      </Modal>
    </MarkerCard>
  );
}

export default function TemplateLoveLetter() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  const ship = useShip(shipId);
  return (
    <TemplateScreenWrapper templateKey="love-letter" shipId={shipId}>
      <LoveLetterContent editing ship={ship} />
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
    fontSize: sf(11),
    color: INK,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  dearName: {
    fontFamily: FontFamily.ja,
    fontSize: sf(11),
    color: INK,
  },
  dearNameInput: {
    fontFamily: FontFamily.ja,
    fontSize: sf(11),
    color: INK,
    minWidth: 60,
    padding: 0,
    paddingHorizontal: 2,
  },
  dearNameTap: {
    color: '#6e3a5a',
    textDecorationLine: 'underline',
  },
  pickOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(43,26,38,0.4)' },
  pickSheet: {
    position: 'absolute', left: 0, right: 0, top: '38%',
    alignItems: 'center', paddingHorizontal: 24,
  },
  pickCard: {
    width: '100%',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: INK, borderRadius: 16, padding: 16, gap: 10,
  },
  pickTitle: { fontFamily: FontFamily.markerBold, fontSize: sf(13), color: '#6e3a5a', textAlign: 'center' },
  letterBody: {
    fontFamily: FontFamily.ja,
    fontSize: sf(12),
    color: INK,
    lineHeight: sf(20),
    marginTop: 4,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  signoff: {
    fontFamily: FontFamily.ui,
    fontSize: sf(13),
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
