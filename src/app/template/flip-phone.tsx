import { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TemplateScreenWrapper } from '@/components/templates/TemplateScreenWrapper';
import {
  MarkerCard, BlankPill, PhotoBox, INK,
} from '@/components/templates/primitives';
import { WashiTape } from '@/components/deco/WashiTape';
import { Bullets } from '@/components/deco';
import { useTemplateCtx } from '@/store/templateData';
import { Colors, FontFamily ,sf } from '@/constants/theme';

// Y2K OS-style window chrome — faithful port of design/templates.jsx Y2KWindow
function Y2KWindow({ title, children, tint, ink, mini = false }: { title: string; children: React.ReactNode; tint: string; ink: string; mini?: boolean }) {
  return (
    <View style={[y.win, { borderColor: Colors.sakuraInk }]}>
      <View style={[y.titleBar, { backgroundColor: tint }]}>
        <Text style={[y.titleText, { color: ink }]}>{title}</Text>
        <View style={y.dots}>
          {[0, 1, 2].map(i => <View key={i} style={y.dot} />)}
        </View>
      </View>
      <View style={[y.body, { backgroundColor: tint, minHeight: mini ? 0 : 60, padding: mini ? 4 : 8 }]}>
        {children}
      </View>
    </View>
  );
}

export function FlipPhoneContent({ editing = false }: { editing?: boolean }) {
  const ctx = useTemplateCtx();
  const customBg = ctx.bgColor || ctx.bgImage;
  const ink = ctx.textColor || '#fff';
  const [vals, setVals] = useState<Record<string, string>>(() => ({
    chat:     ctx.get('chat', 'xx says:\ni miss you\nxx says:\ncome over?\nxx says:\n♡♡♡'),
    name:     ctx.get('name', ''),
    nickname: ctx.get('nickname', ''),
    age:      ctx.get('age', ''),
    bday:     ctx.get('bday', ''),
    occ:      ctx.get('occ', ''),
    valentine:ctx.get('valentine', ''),
    sharing:  ctx.get('sharing', 'Selective'),
    free:     ctx.get('free', ''),
    song:     ctx.get('song', '♪ Theme Song'),
    photo:    ctx.get('photo', ''),
  }));

  const setVal = (key: string, v: string) => {
    setVals(p => ({ ...p, [key]: v }));
    ctx.set(key, v);
  };

  const e = editing;
  const tint = customBg ? 'rgba(0,0,0,0.18)' : Colors.sakura + 'b0';

  return (
    <View style={[s.bg, customBg ? { backgroundColor: 'transparent' } : null]}>
      <View style={[s.card, customBg ? { backgroundColor: 'transparent' } : null]}>
        {/* Washi tape */}
        <View style={s.tape} pointerEvents="none">
          <WashiTape width={70} height={14} pattern="floral" color={Colors.sakuraInk} rotate={-8} />
        </View>

        {/* Title */}
        <View style={s.titleBlock}>
          <Text style={[s.titleText, { color: ink }]}>My YumeShip</Text>
          <Text style={[s.hearts, { color: ink }]}>♡ ♡ ♡ ♡ ♡</Text>
        </View>

        {/* Top row: To: (chat) + About Me */}
        <View style={s.row2}>
          <Y2KWindow title="To:" tint={tint} ink={ink}>
            {e ? (
              <BlankPill value={vals.chat} onChangeText={v => setVal('chat', v)} placeholder="xx says: ..." style={[s.chatInput, { color: ink }]} />
            ) : (
              <Text style={[s.windowText, { color: ink }]}>{vals.chat}</Text>
            )}
            <View style={[s.chatBar, customBg ? { backgroundColor: 'rgba(255,255,255,0.3)' } : null]} />
          </Y2KWindow>
          <Y2KWindow title="About Me" tint={tint} ink={ink}>
            {[
              ['Name', 'name'],
              ['Nickname', 'nickname'],
              ['Age', 'age'],
              ['Birthday', 'bday'],
              ['Occupation', 'occ'],
            ].map(([label, key]) => (
              <View key={key} style={s.aboutRow}>
                <Text style={[s.aboutKey, { color: ink }]}>{label}: </Text>
                {e ? (
                  <BlankPill value={vals[key]} onChangeText={v => setVal(key, v)} placeholder="——" style={[s.aboutVal, { color: ink }]} />
                ) : (
                  <Text style={[s.aboutVal2, { color: ink }]}>{vals[key] || '——'}</Text>
                )}
              </View>
            ))}
            {e ? (
              <BlankPill value={vals.valentine} onChangeText={v => setVal('valentine', v)} placeholder="My Valentine ♡" style={[s.aboutVal, { color: ink, marginTop: 4 }]} />
            ) : (
              <Text style={[s.windowText, { color: ink, marginTop: 4 }]}>{vals.valentine || 'My Valentine ♡'}</Text>
            )}
          </Y2KWindow>
        </View>

        {/* Middle: phone-frame photo picker */}
        <View style={s.phoneWrap}>
          <View style={[s.phoneOuter, customBg ? { backgroundColor: 'transparent' } : null]}>
            <Text style={[s.phoneDots, { color: ink }]}>+ + + +</Text>
            <View style={s.phoneInner}>
              <PhotoBox
                width={84}
                height={106}
                editing={e}
                uri={vals.photo}
                onUriChange={e ? (u) => setVal('photo', u) : undefined}
                label="tap to add"
                style={{ borderRadius: 6 }}
              />
            </View>
            <View style={s.phoneNub} />
          </View>
        </View>

        {/* Bottom row: Sharing + Free space */}
        <View style={s.rowBottom}>
          <Y2KWindow title="!" tint={Colors.sakura + '80'} ink={ink} mini>
            <View style={s.sharingHeader}>
              <Text style={[s.sharingWarn, { color: ink }]}>⚠</Text>
              <Text style={[s.sharingLabel, { color: ink }]}>SHARING</Text>
            </View>
            {e ? (
              <View style={s.sharingPills}>
                {(['Yes', 'No', 'Selective'] as const).map(opt => (
                  <Pressable key={opt} onPress={() => setVal('sharing', opt)} style={[s.sPill, { borderColor: ink }, vals.sharing === opt && { backgroundColor: ink }]}>
                    <Text style={[s.sPillText, { color: ink }, vals.sharing === opt && s.sPillTextOn]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={[s.sharingBox, customBg ? { backgroundColor: 'rgba(255,255,255,0.25)' } : null]}>
                <Text style={s.sharingBoxText}>{vals.sharing}</Text>
              </View>
            )}
          </Y2KWindow>
          <Y2KWindow title="Free space" tint={tint} ink={ink}>
            {e ? (
              <BlankPill value={vals.free} onChangeText={v => setVal('free', v)} placeholder="he kissed me on the rooftop..." style={[s.freeInput, { color: ink }]} />
            ) : (
              <Text style={[s.freeText, { color: ink }]}>{vals.free || '——'}</Text>
            )}
            <View style={s.bulletRow}>
              <Bullets.Heart size={10} color="white" />
              <Bullets.Sakura size={10} color="white" />
              <Bullets.Star size={10} color="white" />
            </View>
          </Y2KWindow>
        </View>

        {/* Theme song player */}
        <View style={[s.songBar, { backgroundColor: tint, borderColor: ink }, customBg ? { borderColor: 'rgba(255,255,255,0.4)' } : null]}>
          {e ? (
            <TextInput
              value={vals.song}
              onChangeText={v => setVal('song', v)}
              placeholder="♪ Theme Song"
              placeholderTextColor={ink + '80'}
              style={[s.songTitle, { color: ink }]}
              textAlign="center"
            />
          ) : (
            <Text style={[s.songTitle, { color: ink }]}>{vals.song || '♪ Theme Song'}</Text>
          )}
          <View style={s.progressRow}>
            <Text style={[s.timeText, { color: ink }]}>0:00</Text>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { backgroundColor: ink }]} />
              <View style={[s.progressThumb, { borderColor: ink }]} />
            </View>
            <Text style={[s.timeText, { color: ink }]}>3:50</Text>
          </View>
        </View>

      </View>
    </View>
  );
}

export default function TemplateFlipPhone() {
  const { shipId } = useLocalSearchParams<{ shipId?: string }>();
  return (
    <TemplateScreenWrapper templateKey="flip-phone" shipId={shipId}>
      <FlipPhoneContent editing />
    </TemplateScreenWrapper>
  );
}

const y = StyleSheet.create({
  win: { borderWidth: 1.5, borderRadius: 8, overflow: 'hidden', flex: 1 },
  titleBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, paddingVertical: 3, borderBottomWidth: 1.5, borderBottomColor: Colors.sakuraInk },
  titleText: { fontFamily: FontFamily.markerBold, fontSize: sf(9), color: '#fff', textTransform: 'uppercase', letterSpacing: 0.4 },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.7)' },
  body: {},
});

const s = StyleSheet.create({
  bg: {
    // checkered pattern via nested views is not trivial; use subtle pink bg instead
    backgroundColor: Colors.sakuraSoft,
  },
  card: {
    backgroundColor: Colors.sakura,
    borderWidth: 2, borderColor: Colors.sakuraInk,
    borderRadius: 18, padding: 14,
    position: 'relative',
    gap: 8,
    shadowColor: 'rgba(110,58,90,0.20)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 6,
  },
  tape: { position: 'absolute', top: -8, left: 12, zIndex: 2 },
  titleBlock: { alignItems: 'center', marginTop: 4 },
  titleText: { fontFamily: FontFamily.displayItalic, fontSize: sf(22), color: '#fff', letterSpacing: -0.3 },
  titlePill: { alignSelf: 'stretch' },
  hearts: { fontFamily: FontFamily.script, fontSize: sf(14), color: '#fff', opacity: 0.85, marginTop: 2 },
  row2: { flexDirection: 'row', gap: 8 },
  windowText: { fontFamily: FontFamily.ja, fontSize: sf(9), color: '#fff', lineHeight: 12 },
  chatInput: { height: 54, textAlignVertical: 'top', fontFamily: FontFamily.ja, fontSize: sf(9), color: '#fff', backgroundColor: 'transparent', borderColor: 'transparent' },
  chatBar: { marginTop: 4, height: 12, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: Colors.sakuraInk },
  aboutRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'nowrap' },
  aboutKey: { fontFamily: FontFamily.ja, fontSize: sf(9), color: '#fff' },
  aboutVal: { flex: 1, height: 14, backgroundColor: 'transparent', borderColor: 'transparent', fontSize: sf(9), color: '#fff' },
  aboutVal2: { fontFamily: FontFamily.ja, fontSize: sf(9), color: '#fff' },
  phoneWrap: { alignItems: 'center' },
  phoneOuter: { width: 100, alignItems: 'center', backgroundColor: Colors.sakuraSoft, borderWidth: 2, borderColor: Colors.sakuraInk, borderRadius: 14, padding: 6, position: 'relative' },
  phoneDots: { fontFamily: FontFamily.markerBold, fontSize: sf(8), color: '#fff', letterSpacing: 3, marginBottom: 2 },
  phoneInner: { backgroundColor: '#fff', borderRadius: 6, overflow: 'hidden', width: 84, height: 106 },
  phoneNub: { width: 18, height: 6, backgroundColor: Colors.sakuraInk, borderRadius: 6, marginTop: 4 },
  rowBottom: { flexDirection: 'row', gap: 8 },
  sharingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 2 },
  sharingWarn: { fontSize: sf(12), fontWeight: '700', color: '#fff' },
  sharingLabel: { fontFamily: FontFamily.markerBold, fontSize: sf(9), color: '#fff', letterSpacing: 0.4 },
  sharingBox: { backgroundColor: '#fff', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'center', borderWidth: 1, borderColor: Colors.sakuraInk },
  sharingBoxText: { fontFamily: FontFamily.ja, fontSize: sf(9), color: Colors.sakuraInk },
  sharingPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 3 },
  sPill: { paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, borderWidth: 1, borderColor: '#fff' },
  sPillOn: { backgroundColor: '#fff' },
  sPillText: { fontFamily: FontFamily.ja, fontSize: sf(7), color: '#fff' },
  sPillTextOn: { color: Colors.sakuraInk },
  freeInput: { height: 50, textAlignVertical: 'top', fontFamily: FontFamily.script, fontSize: sf(11), backgroundColor: 'transparent', borderColor: 'transparent', color: '#fff' },
  freeText: { fontFamily: FontFamily.script, fontSize: sf(13), color: '#fff', lineHeight: 15 },
  bulletRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  songBar: { borderWidth: 1.5, borderColor: Colors.sakuraInk, borderRadius: 10, padding: 8, gap: 4 },
  songTitle: { fontFamily: FontFamily.script, fontSize: sf(13), color: '#fff', textAlign: 'center' },
  songPill: { alignSelf: 'stretch' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontFamily: FontFamily.marker, fontSize: sf(8), color: '#fff' },
  progressTrack: { flex: 1, height: 3, backgroundColor: '#fff', borderRadius: 2, position: 'relative' },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', backgroundColor: Colors.sakuraInk, borderRadius: 2 },
  progressThumb: { position: 'absolute', left: '40%', top: -2, width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.sakuraInk },
});
