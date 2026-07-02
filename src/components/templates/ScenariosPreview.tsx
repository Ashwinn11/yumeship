import { Text, View } from 'react-native';

import { WashiTape } from '@/components/deco/WashiTape';
import { Colors, FontFamily, sf } from '@/constants/theme';

// Static, pre-filled mock of the Scenarios feature (the real one lives in the
// vault tab and is DB-backed) — used only for onboarding preview thumbnails.

const CARDS = [
  {
    title: 'the umbrella scene',
    body: 'rain again. he holds the umbrella too far to his own side, like always, and pretends his shoulder is not soaked. "i run warm," he says. a lie. i love him for it.',
    date: 'JUN 02',
    tape: 'dot' as const,
    tapeColor: Colors.sakura,
  },
  {
    title: 'if we met in a bookstore',
    body: 'we reach for the same worn paperback. neither of us lets go. "you can have it," we say at the same time — and that is the whole story of us, really.',
    date: 'MAY 28',
    tape: 'floral' as const,
    tapeColor: Colors.lavender,
  },
  {
    title: '3am, the call',
    body: '"did i wake you?" you did. i will never admit it. i would take a hundred ruined mornings for this voice.',
    date: 'MAY 19',
    tape: 'dot' as const,
    tapeColor: Colors.sakura,
  },
];

export function ScenariosPreview() {
  return (
    <View style={{ padding: 16, backgroundColor: Colors.paper }}>
      {/* header row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, paddingHorizontal: 4 }}>
        <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.sakuraDeep, letterSpacing: 1.4, textTransform: 'uppercase' }}>
          SCENARIOS · 3 SAVED
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            height: 32, paddingHorizontal: 12, borderRadius: 16,
            backgroundColor: Colors.sakuraSoft, borderWidth: 1, borderColor: Colors.sakura,
          }}>
            <Text style={{ fontSize: sf(12) }}>✨</Text>
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.sakuraDeep }}>prompts</Text>
          </View>
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: Colors.sakuraDeep, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: Colors.vellum, fontSize: sf(16), lineHeight: sf(18) }}>+</Text>
          </View>
        </View>
      </View>

      {CARDS.map((c) => (
        <View
          key={c.title}
          style={{
            backgroundColor: Colors.vellum,
            borderColor: Colors.line,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            marginVertical: 6,
          }}
        >
          <View style={{ position: 'absolute', top: -7, left: '50%', transform: [{ translateX: -35 }], zIndex: 10 }}>
            <WashiTape width={70} height={14} pattern={c.tape} color={c.tapeColor} rotate={0} />
          </View>
          <View style={{ paddingVertical: 4 }}>
            <Text style={{ fontFamily: FontFamily.uiSemiBold, fontSize: sf(16), color: Colors.ink }} numberOfLines={2}>
              {c.title}
            </Text>
            <Text style={{ fontFamily: FontFamily.ui, fontSize: sf(13), lineHeight: 19, color: Colors.ink2, marginTop: 4 }} numberOfLines={3}>
              {c.body}
            </Text>
            <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.sakuraDeep, letterSpacing: 1, textAlign: 'right', marginTop: 10 }}>
              {c.date}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
