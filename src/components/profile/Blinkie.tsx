import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { BlinkieTemplate } from '@/constants/blinkies';
import { FontFamily } from '@/constants/theme';

// Metro requires static require() paths, so every frame of every background
// the catalog can reference has to be listed here explicitly — these are
// real multi-frame GIF-style animations from blinkies.cafe (2-10 frames
// each), not static images. See constants/blinkies.ts for which ids are in
// play, and /NOTICE.md for their origin.
const BLINKIE_ASSETS: Record<string, number> = {
  '0001-saucer-0.png': require('../../../assets/blinkies/0001-saucer-0.png'),
  '0001-saucer-1.png': require('../../../assets/blinkies/0001-saucer-1.png'),
  '0002-mushroom-0.png': require('../../../assets/blinkies/0002-mushroom-0.png'),
  '0002-mushroom-1.png': require('../../../assets/blinkies/0002-mushroom-1.png'),
  '0003-ghost-0.png': require('../../../assets/blinkies/0003-ghost-0.png'),
  '0003-ghost-1.png': require('../../../assets/blinkies/0003-ghost-1.png'),
  '0004-peachy-0.png': require('../../../assets/blinkies/0004-peachy-0.png'),
  '0004-peachy-1.png': require('../../../assets/blinkies/0004-peachy-1.png'),
  '0005-citystars-0.png': require('../../../assets/blinkies/0005-citystars-0.png'),
  '0005-citystars-1.png': require('../../../assets/blinkies/0005-citystars-1.png'),
  '0006-purple-0.png': require('../../../assets/blinkies/0006-purple-0.png'),
  '0006-purple-1.png': require('../../../assets/blinkies/0006-purple-1.png'),
  '0007-chocolate-0.png': require('../../../assets/blinkies/0007-chocolate-0.png'),
  '0007-chocolate-1.png': require('../../../assets/blinkies/0007-chocolate-1.png'),
  '0008-pink-0.png': require('../../../assets/blinkies/0008-pink-0.png'),
  '0008-pink-1.png': require('../../../assets/blinkies/0008-pink-1.png'),
  '0009-gradient-pink-0.png': require('../../../assets/blinkies/0009-gradient-pink-0.png'),
  '0009-gradient-pink-1.png': require('../../../assets/blinkies/0009-gradient-pink-1.png'),
  '0010-blue-0.png': require('../../../assets/blinkies/0010-blue-0.png'),
  '0010-blue-1.png': require('../../../assets/blinkies/0010-blue-1.png'),
  '0011-frog-0.png': require('../../../assets/blinkies/0011-frog-0.png'),
  '0011-frog-1.png': require('../../../assets/blinkies/0011-frog-1.png'),
  '0012-kiss-0.png': require('../../../assets/blinkies/0012-kiss-0.png'),
  '0012-kiss-1.png': require('../../../assets/blinkies/0012-kiss-1.png'),
  '0013-starryeyes-0.png': require('../../../assets/blinkies/0013-starryeyes-0.png'),
  '0013-starryeyes-1.png': require('../../../assets/blinkies/0013-starryeyes-1.png'),
  '0013-starryeyes-2.png': require('../../../assets/blinkies/0013-starryeyes-2.png'),
  '0016-valentine-0.png': require('../../../assets/blinkies/0016-valentine-0.png'),
  '0016-valentine-1.png': require('../../../assets/blinkies/0016-valentine-1.png'),
  '0017-love-0.png': require('../../../assets/blinkies/0017-love-0.png'),
  '0017-love-1.png': require('../../../assets/blinkies/0017-love-1.png'),
  '0017-love-2.png': require('../../../assets/blinkies/0017-love-2.png'),
  '0017-love-3.png': require('../../../assets/blinkies/0017-love-3.png'),
  '0017-love-4.png': require('../../../assets/blinkies/0017-love-4.png'),
  '0017-love-5.png': require('../../../assets/blinkies/0017-love-5.png'),
  '0017-love-6.png': require('../../../assets/blinkies/0017-love-6.png'),
  '0017-love-7.png': require('../../../assets/blinkies/0017-love-7.png'),
  '0018-glitter-0.png': require('../../../assets/blinkies/0018-glitter-0.png'),
  '0018-glitter-1.png': require('../../../assets/blinkies/0018-glitter-1.png'),
  '0018-glitter-2.png': require('../../../assets/blinkies/0018-glitter-2.png'),
  '0019-candy-0.png': require('../../../assets/blinkies/0019-candy-0.png'),
  '0019-candy-1.png': require('../../../assets/blinkies/0019-candy-1.png'),
  '0023-trans-pride-0.png': require('../../../assets/blinkies/0023-trans-pride-0.png'),
  '0023-trans-pride-1.png': require('../../../assets/blinkies/0023-trans-pride-1.png'),
  '0023-trans-pride-2.png': require('../../../assets/blinkies/0023-trans-pride-2.png'),
  '0023-trans-pride-3.png': require('../../../assets/blinkies/0023-trans-pride-3.png'),
  '0023-trans-pride-4.png': require('../../../assets/blinkies/0023-trans-pride-4.png'),
  '0024-red-0.png': require('../../../assets/blinkies/0024-red-0.png'),
  '0024-red-1.png': require('../../../assets/blinkies/0024-red-1.png'),
  '0025-birthdaycake-0.png': require('../../../assets/blinkies/0025-birthdaycake-0.png'),
  '0025-birthdaycake-1.png': require('../../../assets/blinkies/0025-birthdaycake-1.png'),
  '0025-birthdaycake-2.png': require('../../../assets/blinkies/0025-birthdaycake-2.png'),
  '0025-birthdaycake-3.png': require('../../../assets/blinkies/0025-birthdaycake-3.png'),
  '0027-sakura-0.png': require('../../../assets/blinkies/0027-sakura-0.png'),
  '0027-sakura-1.png': require('../../../assets/blinkies/0027-sakura-1.png'),
  '0027-sakura-2.png': require('../../../assets/blinkies/0027-sakura-2.png'),
  '0027-sakura-3.png': require('../../../assets/blinkies/0027-sakura-3.png'),
  '0029-pinksparkle-0.png': require('../../../assets/blinkies/0029-pinksparkle-0.png'),
  '0029-pinksparkle-1.png': require('../../../assets/blinkies/0029-pinksparkle-1.png'),
  '0030-catpaw-0.png': require('../../../assets/blinkies/0030-catpaw-0.png'),
  '0030-catpaw-1.png': require('../../../assets/blinkies/0030-catpaw-1.png'),
  '0031-dogpaw-0.png': require('../../../assets/blinkies/0031-dogpaw-0.png'),
  '0031-dogpaw-1.png': require('../../../assets/blinkies/0031-dogpaw-1.png'),
  '0032-coffeecup-0.png': require('../../../assets/blinkies/0032-coffeecup-0.png'),
  '0032-coffeecup-1.png': require('../../../assets/blinkies/0032-coffeecup-1.png'),
  '0036-fire-0.png': require('../../../assets/blinkies/0036-fire-0.png'),
  '0036-fire-1.png': require('../../../assets/blinkies/0036-fire-1.png'),
  '0036-fire-2.png': require('../../../assets/blinkies/0036-fire-2.png'),
  '0036-fire-3.png': require('../../../assets/blinkies/0036-fire-3.png'),
  '0039-staticrainbow-0.png': require('../../../assets/blinkies/0039-staticrainbow-0.png'),
  '0039-staticrainbow-1.png': require('../../../assets/blinkies/0039-staticrainbow-1.png'),
  '0039-staticrainbow-2.png': require('../../../assets/blinkies/0039-staticrainbow-2.png'),
  '0039-staticrainbow-3.png': require('../../../assets/blinkies/0039-staticrainbow-3.png'),
  '0039-staticrainbow-4.png': require('../../../assets/blinkies/0039-staticrainbow-4.png'),
  '0039-staticrainbow-5.png': require('../../../assets/blinkies/0039-staticrainbow-5.png'),
  '0039-staticrainbow-6.png': require('../../../assets/blinkies/0039-staticrainbow-6.png'),
  '0039-staticrainbow-7.png': require('../../../assets/blinkies/0039-staticrainbow-7.png'),
  '0040-gemini-0.png': require('../../../assets/blinkies/0040-gemini-0.png'),
  '0040-gemini-1.png': require('../../../assets/blinkies/0040-gemini-1.png'),
  '0041-aquarius-0.png': require('../../../assets/blinkies/0041-aquarius-0.png'),
  '0041-aquarius-1.png': require('../../../assets/blinkies/0041-aquarius-1.png'),
  '0042-aries-0.png': require('../../../assets/blinkies/0042-aries-0.png'),
  '0042-aries-1.png': require('../../../assets/blinkies/0042-aries-1.png'),
  '0043-taurus-0.png': require('../../../assets/blinkies/0043-taurus-0.png'),
  '0043-taurus-1.png': require('../../../assets/blinkies/0043-taurus-1.png'),
  '0044-hearts-0.png': require('../../../assets/blinkies/0044-hearts-0.png'),
  '0044-hearts-1.png': require('../../../assets/blinkies/0044-hearts-1.png'),
  '0044-hearts-2.png': require('../../../assets/blinkies/0044-hearts-2.png'),
  '0045-scorpio-0.png': require('../../../assets/blinkies/0045-scorpio-0.png'),
  '0045-scorpio-1.png': require('../../../assets/blinkies/0045-scorpio-1.png'),
  '0046-leo-0.png': require('../../../assets/blinkies/0046-leo-0.png'),
  '0046-leo-1.png': require('../../../assets/blinkies/0046-leo-1.png'),
  '0047-virgo-0.png': require('../../../assets/blinkies/0047-virgo-0.png'),
  '0047-virgo-1.png': require('../../../assets/blinkies/0047-virgo-1.png'),
  '0048-libra-0.png': require('../../../assets/blinkies/0048-libra-0.png'),
  '0048-libra-1.png': require('../../../assets/blinkies/0048-libra-1.png'),
  '0049-sagittarius-0.png': require('../../../assets/blinkies/0049-sagittarius-0.png'),
  '0049-sagittarius-1.png': require('../../../assets/blinkies/0049-sagittarius-1.png'),
  '0050-capricorn-0.png': require('../../../assets/blinkies/0050-capricorn-0.png'),
  '0050-capricorn-1.png': require('../../../assets/blinkies/0050-capricorn-1.png'),
  '0051-pisces-0.png': require('../../../assets/blinkies/0051-pisces-0.png'),
  '0051-pisces-1.png': require('../../../assets/blinkies/0051-pisces-1.png'),
  '0052-cancer-0.png': require('../../../assets/blinkies/0052-cancer-0.png'),
  '0052-cancer-1.png': require('../../../assets/blinkies/0052-cancer-1.png'),
  '0053-pinkchecker-0.png': require('../../../assets/blinkies/0053-pinkchecker-0.png'),
  '0053-pinkchecker-1.png': require('../../../assets/blinkies/0053-pinkchecker-1.png'),
  '0055-rainbowswirl-0.png': require('../../../assets/blinkies/0055-rainbowswirl-0.png'),
  '0055-rainbowswirl-1.png': require('../../../assets/blinkies/0055-rainbowswirl-1.png'),
  '0055-rainbowswirl-2.png': require('../../../assets/blinkies/0055-rainbowswirl-2.png'),
  '0055-rainbowswirl-3.png': require('../../../assets/blinkies/0055-rainbowswirl-3.png'),
  '0055-rainbowswirl-4.png': require('../../../assets/blinkies/0055-rainbowswirl-4.png'),
  '0055-rainbowswirl-5.png': require('../../../assets/blinkies/0055-rainbowswirl-5.png'),
  '0055-rainbowswirl-6.png': require('../../../assets/blinkies/0055-rainbowswirl-6.png'),
  '0055-rainbowswirl-7.png': require('../../../assets/blinkies/0055-rainbowswirl-7.png'),
  '0055-rainbowswirl-8.png': require('../../../assets/blinkies/0055-rainbowswirl-8.png'),
  '0055-rainbowswirl-9.png': require('../../../assets/blinkies/0055-rainbowswirl-9.png'),
  '0057-ophiuchus-0.png': require('../../../assets/blinkies/0057-ophiuchus-0.png'),
  '0057-ophiuchus-1.png': require('../../../assets/blinkies/0057-ophiuchus-1.png'),
  '0062-flower-0.png': require('../../../assets/blinkies/0062-flower-0.png'),
  '0062-flower-1.png': require('../../../assets/blinkies/0062-flower-1.png'),
  '0065-bunnies-0.png': require('../../../assets/blinkies/0065-bunnies-0.png'),
  '0065-bunnies-1.png': require('../../../assets/blinkies/0065-bunnies-1.png'),
  '0065-bunnies-2.png': require('../../../assets/blinkies/0065-bunnies-2.png'),
  '0065-bunnies-3.png': require('../../../assets/blinkies/0065-bunnies-3.png'),
  '0065-bunnies-4.png': require('../../../assets/blinkies/0065-bunnies-4.png'),
  '0065-bunnies-5.png': require('../../../assets/blinkies/0065-bunnies-5.png'),
  '0066-orangekitty-0.png': require('../../../assets/blinkies/0066-orangekitty-0.png'),
  '0066-orangekitty-1.png': require('../../../assets/blinkies/0066-orangekitty-1.png'),
  '0067-moonstars-0.png': require('../../../assets/blinkies/0067-moonstars-0.png'),
  '0067-moonstars-1.png': require('../../../assets/blinkies/0067-moonstars-1.png'),
  '0067-moonstars-2.png': require('../../../assets/blinkies/0067-moonstars-2.png'),
  '0067-moonstars-3.png': require('../../../assets/blinkies/0067-moonstars-3.png'),
  '0067-moonstars-4.png': require('../../../assets/blinkies/0067-moonstars-4.png'),
  '0070-lavalamp-0.png': require('../../../assets/blinkies/0070-lavalamp-0.png'),
  '0070-lavalamp-1.png': require('../../../assets/blinkies/0070-lavalamp-1.png'),
  '0070-lavalamp-2.png': require('../../../assets/blinkies/0070-lavalamp-2.png'),
  '0070-lavalamp-3.png': require('../../../assets/blinkies/0070-lavalamp-3.png'),
  '0070-lavalamp-4.png': require('../../../assets/blinkies/0070-lavalamp-4.png'),
  '0070-lavalamp-5.png': require('../../../assets/blinkies/0070-lavalamp-5.png'),
  '0070-lavalamp-6.png': require('../../../assets/blinkies/0070-lavalamp-6.png'),
  '0070-lavalamp-7.png': require('../../../assets/blinkies/0070-lavalamp-7.png'),
  '0070-lavalamp-8.png': require('../../../assets/blinkies/0070-lavalamp-8.png'),
  '0070-lavalamp-9.png': require('../../../assets/blinkies/0070-lavalamp-9.png'),
  '0071-bi-0.png': require('../../../assets/blinkies/0071-bi-0.png'),
  '0071-bi-1.png': require('../../../assets/blinkies/0071-bi-1.png'),
  '0071-bi-2.png': require('../../../assets/blinkies/0071-bi-2.png'),
  '0071-bi-3.png': require('../../../assets/blinkies/0071-bi-3.png'),
  '0071-bi-4.png': require('../../../assets/blinkies/0071-bi-4.png'),
  '0072-lesbian-0.png': require('../../../assets/blinkies/0072-lesbian-0.png'),
  '0072-lesbian-1.png': require('../../../assets/blinkies/0072-lesbian-1.png'),
  '0072-lesbian-2.png': require('../../../assets/blinkies/0072-lesbian-2.png'),
  '0072-lesbian-3.png': require('../../../assets/blinkies/0072-lesbian-3.png'),
  '0072-lesbian-4.png': require('../../../assets/blinkies/0072-lesbian-4.png'),
  '0073-gay-0.png': require('../../../assets/blinkies/0073-gay-0.png'),
  '0073-gay-1.png': require('../../../assets/blinkies/0073-gay-1.png'),
  '0073-gay-2.png': require('../../../assets/blinkies/0073-gay-2.png'),
  '0073-gay-3.png': require('../../../assets/blinkies/0073-gay-3.png'),
  '0074-pan-0.png': require('../../../assets/blinkies/0074-pan-0.png'),
  '0074-pan-1.png': require('../../../assets/blinkies/0074-pan-1.png'),
  '0074-pan-2.png': require('../../../assets/blinkies/0074-pan-2.png'),
  '0079-nonbinary-0.png': require('../../../assets/blinkies/0079-nonbinary-0.png'),
  '0079-nonbinary-1.png': require('../../../assets/blinkies/0079-nonbinary-1.png'),
  '0079-nonbinary-2.png': require('../../../assets/blinkies/0079-nonbinary-2.png'),
  '0079-nonbinary-3.png': require('../../../assets/blinkies/0079-nonbinary-3.png'),
  '0093-cats-0.png': require('../../../assets/blinkies/0093-cats-0.png'),
  '0093-cats-1.png': require('../../../assets/blinkies/0093-cats-1.png'),
  '0104-redsnowflake-0.png': require('../../../assets/blinkies/0104-redsnowflake-0.png'),
  '0104-redsnowflake-1.png': require('../../../assets/blinkies/0104-redsnowflake-1.png'),
  '0104-redsnowflake-2.png': require('../../../assets/blinkies/0104-redsnowflake-2.png'),
  '0104-redsnowflake-3.png': require('../../../assets/blinkies/0104-redsnowflake-3.png'),
  '0105-gradientpurple-0.png': require('../../../assets/blinkies/0105-gradientpurple-0.png'),
  '0105-gradientpurple-1.png': require('../../../assets/blinkies/0105-gradientpurple-1.png'),
  '0107-gradientorange-0.png': require('../../../assets/blinkies/0107-gradientorange-0.png'),
  '0107-gradientorange-1.png': require('../../../assets/blinkies/0107-gradientorange-1.png'),
  '0109-gradientgreen-0.png': require('../../../assets/blinkies/0109-gradientgreen-0.png'),
  '0109-gradientgreen-1.png': require('../../../assets/blinkies/0109-gradientgreen-1.png'),
  '0111-glittergold-0.png': require('../../../assets/blinkies/0111-glittergold-0.png'),
  '0111-glittergold-1.png': require('../../../assets/blinkies/0111-glittergold-1.png'),
  '0111-glittergold-2.png': require('../../../assets/blinkies/0111-glittergold-2.png'),
  '0119-pastelstars-0.png': require('../../../assets/blinkies/0119-pastelstars-0.png'),
  '0119-pastelstars-1.png': require('../../../assets/blinkies/0119-pastelstars-1.png'),
  '0119-pastelstars-2.png': require('../../../assets/blinkies/0119-pastelstars-2.png'),
  '0119-pastelstars-3.png': require('../../../assets/blinkies/0119-pastelstars-3.png'),
  '0124-stars-0.png': require('../../../assets/blinkies/0124-stars-0.png'),
  '0124-stars-1.png': require('../../../assets/blinkies/0124-stars-1.png'),
  '0124-stars-2.png': require('../../../assets/blinkies/0124-stars-2.png'),
  '0124-stars-3.png': require('../../../assets/blinkies/0124-stars-3.png'),
  '0124-stars-4.png': require('../../../assets/blinkies/0124-stars-4.png'),
  '0124-stars-5.png': require('../../../assets/blinkies/0124-stars-5.png'),
  '0189-whale-0.png': require('../../../assets/blinkies/0189-whale-0.png'),
  '0189-whale-1.png': require('../../../assets/blinkies/0189-whale-1.png'),
  '0226-snowflake-0.png': require('../../../assets/blinkies/0226-snowflake-0.png'),
  '0226-snowflake-1.png': require('../../../assets/blinkies/0226-snowflake-1.png'),
  '0226-snowflake-2.png': require('../../../assets/blinkies/0226-snowflake-2.png'),
  '0229-roses-0.png': require('../../../assets/blinkies/0229-roses-0.png'),
  '0229-roses-1.png': require('../../../assets/blinkies/0229-roses-1.png'),
  '0236-pastelshootingstar-0.png': require('../../../assets/blinkies/0236-pastelshootingstar-0.png'),
  '0236-pastelshootingstar-1.png': require('../../../assets/blinkies/0236-pastelshootingstar-1.png'),
  '0236-pastelshootingstar-2.png': require('../../../assets/blinkies/0236-pastelshootingstar-2.png'),
  '0236-pastelshootingstar-3.png': require('../../../assets/blinkies/0236-pastelshootingstar-3.png'),
  '0247-pinkheart-0.png': require('../../../assets/blinkies/0247-pinkheart-0.png'),
  '0247-pinkheart-1.png': require('../../../assets/blinkies/0247-pinkheart-1.png'),
  '0251-pastelpinkbutterfly-0.png': require('../../../assets/blinkies/0251-pastelpinkbutterfly-0.png'),
  '0251-pastelpinkbutterfly-1.png': require('../../../assets/blinkies/0251-pastelpinkbutterfly-1.png'),
  '0254-strawberrygradient-0.png': require('../../../assets/blinkies/0254-strawberrygradient-0.png'),
  '0254-strawberrygradient-1.png': require('../../../assets/blinkies/0254-strawberrygradient-1.png'),
};

const FRAME_INTERVAL_MS = 150;

// the source art's real resolution — every other size is this ratio scaled,
// never stretched, so the pixel art never distorts
const NATIVE_WIDTH = 150;
const NATIVE_HEIGHT = 20;
const ASPECT_RATIO = NATIVE_WIDTH / NATIVE_HEIGHT;

/**
 * One template's background, rendered at (or scaled proportionally from) the
 * real blinkie resolution (150×20) with a real pixel-art background
 * animation — cycling through its actual frames on an interval, the same
 * way the source GIF would, not a single static frame — and whatever text
 * the owner typed onto it. Text is set in Press Start 2P (a real
 * bitmap-style font, SIL OFL) instead of the app's rounded UI font — that's
 * what actually reads as this genre instead of shrunk normal text.
 */
export function Blinkie({ template, text, width = NATIVE_WIDTH }: { template: BlinkieTemplate; text: string; width?: number }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (template.frameCount <= 1) return;
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % template.frameCount);
    }, FRAME_INTERVAL_MS);
    return () => clearInterval(id);
  }, [template.frameCount]);

  const asset = BLINKIE_ASSETS[`${template.bgBase}-${frame}.png`] ?? BLINKIE_ASSETS[`${template.bgBase}-0.png`];
  const height = width / ASPECT_RATIO;
  const scale = width / NATIVE_WIDTH;

  return (
    <View style={[styles.badge, { width, height }]}>
      {asset && (
        <Image source={asset} style={StyleSheet.absoluteFill} contentFit="fill" cachePolicy="memory-disk" />
      )}
      <View style={[styles.content, { paddingHorizontal: 16 * scale }]}>
        <Text
          style={[styles.text, { color: template.textColor, fontSize: 7 * scale }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FontFamily.pixel,
    textAlign: 'center',
  },
});
