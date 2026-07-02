import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { Spacing } from '@/constants/theme';

// ─── Full-device iPhone mockup ─────────────────────────────────────────────────
// Ported from the Figma spec (base frame 1280 × 2642, screen inset 55, r 165).
// Frame layers use the app's sakura-pink titanium instead of graphite.

const BASE_W = 1280;
const BASE_H = 2642;

const FRAME = {
  body: '#000000',
  borderDark: '#5e2531', // outermost hairline (was #303640)
  borderPrimary: '#d77a8d', // titanium band (was #515868)
  borderHighlight: '#f3b6c4', // inner sheen (was #717989)
  bezelReflect: '#646464',
};

// Status bar + Dynamic Island — pixel-perfect SVG shared with the vault
// notification preview. `tint` colors the cellular/wifi/battery cluster,
// `batteryText` is the "99" over the battery fill.
export function MockStatusBar({ tint = '#ffffff', batteryText = '#000000' }: { tint?: string; batteryText?: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 906 102" preserveAspectRatio="xMidYMin meet">
      {/* Dynamic Island */}
      <Path d="M274.054 0H631.015V31.0902V31.9875C631.015 53.7501 613.373 71.3922 591.611 71.3922H314.75C292.274 71.3922 274.054 53.1721 274.054 30.6963V0Z" fill="black" />
      {/* Camera lens glint */}
      <Path d="M591 36 a13 13 0 1 0 0.001 0Z" fill="#121212" />
      <Path d="M591 42 a7 7 0 1 0 0.001 0Z" fill="#26408d" opacity={0.55} />
      {/* Cellular bars */}
      <Path d="M709.317 52.9684C709.317 51.6965 710.29 50.6654 711.492 50.6654H713.667C714.868 50.6654 715.842 51.6965 715.842 52.9684V57.5744C715.842 58.8463 714.868 59.8773 713.667 59.8773H711.492C710.29 59.8773 709.317 58.8463 709.317 57.5744V52.9684Z" fill={tint} />
      <Path d="M720.192 47.211C720.192 45.9391 721.166 44.908 722.367 44.908H724.542C725.743 44.908 726.717 45.9391 726.717 47.211V57.5744C726.717 58.8463 725.743 59.8773 724.542 59.8773H722.367C721.166 59.8773 720.192 58.8463 720.192 57.5744V47.211Z" fill={tint} />
      <Path d="M731.067 39.1506C731.067 37.8787 732.041 36.8476 733.242 36.8476H735.417C736.618 36.8476 737.592 37.8787 737.592 39.1506V57.5744C737.592 58.8463 736.618 59.8773 735.417 59.8773H733.242C732.041 59.8773 731.067 58.8463 731.067 57.5744V39.1506Z" fill={tint} />
      <Path d="M741.942 34.5446C741.942 33.2727 742.916 32.2416 744.117 32.2416H746.292C747.493 32.2416 748.467 33.2727 748.467 34.5446V57.5744C748.467 58.8463 747.493 59.8773 746.292 59.8773H744.117C742.916 59.8773 741.942 58.8463 741.942 57.5744V34.5446Z" fill={tint} />
      {/* WiFi */}
      <Path fillRule="evenodd" clipRule="evenodd" d="M777.255 38.3918C782.936 38.392 788.399 40.6199 792.516 44.6151C792.826 44.9235 793.321 44.9196 793.627 44.6063L796.59 41.5536C796.745 41.3947 796.831 41.1794 796.83 40.9555C796.828 40.7316 796.74 40.5174 796.583 40.3604C785.778 29.7902 768.731 29.7902 757.926 40.3604C757.769 40.5173 757.68 40.7314 757.679 40.9553C757.678 41.1793 757.764 41.3946 757.918 41.5536L760.882 44.6063C761.187 44.9201 761.683 44.924 761.993 44.6151C766.111 40.6197 771.574 38.3917 777.255 38.3918ZM777.337 47.6079C780.458 47.6077 783.468 48.7918 785.781 50.9302C786.094 51.2337 786.587 51.2271 786.892 50.9153L789.852 47.8626C790.008 47.7024 790.094 47.4852 790.092 47.2595C790.09 47.0338 789.999 46.8184 789.84 46.6615C782.795 39.9723 771.885 39.9723 764.84 46.6615C764.681 46.8184 764.59 47.0339 764.588 47.2597C764.586 47.4855 764.673 47.7027 764.829 47.8626L767.788 50.9153C768.093 51.2271 768.586 51.2337 768.899 50.9302C771.211 48.7932 774.218 47.6092 777.337 47.6079ZM783.357 53.5665C783.361 53.7928 783.274 54.0111 783.116 54.1696L777.996 59.444C777.846 59.599 777.641 59.6862 777.428 59.6862C777.214 59.6862 777.009 59.599 776.859 59.444L771.738 54.1696C771.58 54.0109 771.493 53.7926 771.498 53.5663C771.502 53.3399 771.598 53.1256 771.763 52.9738C775.033 50.1507 779.822 50.1507 783.092 52.9738C783.257 53.1257 783.352 53.3401 783.357 53.5665Z" fill={tint} />
      {/* Battery outline */}
      <Rect x="806.041" y="31.0901" width="57.5744" height="29.9387" rx="9.2119" fill={tint} fillOpacity="0.4" />
      {/* Battery fill */}
      <Path d="M806.041 45.8292C806.041 40.67 806.041 38.0905 807.045 36.1199C807.929 34.3866 809.338 32.9774 811.071 32.0942C813.042 31.0901 815.621 31.0901 820.78 31.0901H854.404V61.0288H820.78C815.621 61.0288 813.042 61.0288 811.071 60.0248C809.338 59.1416 807.929 57.7324 807.045 55.999C806.041 54.0285 806.041 51.4489 806.041 46.2898V45.8292Z" fill={tint} />
      {/* Battery nub */}
      <Path d="M864.767 41.4535C865.683 41.4535 866.562 41.9388 867.21 42.8026C867.858 43.6663 868.222 44.8379 868.222 46.0595C868.222 47.281 867.858 48.4526 867.21 49.3164C866.562 50.1801 865.683 50.6654 864.767 50.6654L864.767 46.0595V41.4535Z" fill={tint} />
      {/* Battery 99% */}
      <Path d="M826.732 37.4363C830.488 37.4363 833.434 40.1126 833.434 45.8138V45.8363C833.434 51.2677 830.87 54.495 826.71 54.495C823.572 54.495 821.245 52.6395 820.739 50.0982L820.716 49.997H824.045L824.078 50.0982C824.472 51.1102 825.394 51.7962 826.699 51.7962C829.049 51.7962 830.083 49.4909 830.207 46.5335C830.207 46.4211 830.207 46.2974 830.207 46.1737H829.982C829.397 47.4219 828.048 48.5464 825.799 48.5464C822.639 48.5464 820.514 46.2974 820.514 43.2275V43.205C820.514 39.8877 823.078 37.4363 826.732 37.4363ZM826.732 46.0387C828.408 46.0387 829.701 44.8468 829.701 43.1713V43.1488C829.701 41.4508 828.408 40.1351 826.755 40.1351C825.113 40.1351 823.797 41.4283 823.797 43.0813V43.1038C823.797 44.813 825.034 46.0387 826.732 46.0387ZM842.475 37.4363C846.231 37.4363 849.177 40.1126 849.177 45.8138V45.8363C849.177 51.2677 846.613 54.495 842.453 54.495C839.315 54.495 836.988 52.6395 836.482 50.0982L836.459 49.997H839.788L839.821 50.0982C840.215 51.1102 841.137 51.7962 842.442 51.7962C844.792 51.7962 845.826 49.4909 845.95 46.5335C845.95 46.4211 845.95 46.2974 845.95 46.1737H845.725C845.14 47.4219 843.791 48.5464 841.542 48.5464C838.382 48.5464 836.257 46.2974 836.257 43.2275V43.205C836.257 39.8877 838.821 37.4363 842.475 37.4363ZM842.475 46.0387C844.151 46.0387 845.444 44.8468 845.444 43.1713V43.1488C845.444 41.4508 844.151 40.1351 842.498 40.1351C840.856 40.1351 839.54 41.4283 839.54 43.0813V43.1038C839.54 44.813 840.777 46.0387 842.475 46.0387Z" fill={batteryText} />
    </Svg>
  );
}

type MockPhoneProps = {
  width?: number;
  children: React.ReactNode;
  /** screen background behind the content */
  screenColor?: string;
  /** color of the status-bar time + icons — white for dark wallpapers, ink for light app screens */
  statusTint?: string;
  showStatusBar?: boolean;
};

export function MockPhone({ width = 220, children, screenColor = '#ffffff', statusTint = '#ffffff', showStatusBar = true }: MockPhoneProps) {
  const s = width / BASE_W;
  const r = (n: number) => n * s;
  const height = Math.round(BASE_H * s);
  const screenW = width - 2 * r(55);
  // svg viewBox is 906×102 fit to screen width → rendered glyph height scales with it
  const statusH = screenW * (102 / 906);

  const border = (inset: number, borderW: number, color: string, radius: number, opacity = 1) => (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: r(inset), right: r(inset), top: r(inset), bottom: r(inset),
        borderWidth: Math.max(1, r(borderW)),
        borderColor: color,
        borderRadius: r(radius),
        opacity,
      }}
    />
  );

  return (
    <View style={{ width, height, alignSelf: 'center' }}>
      {/* body */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: FRAME.body, borderRadius: r(210) }} />
      {/* titanium band */}
      {border(5, 13, FRAME.borderPrimary, 205)}
      {/* inner sheen */}
      {border(10, 5, FRAME.borderHighlight, 200, 0.9)}
      {/* outer hairline */}
      {border(0, 5, FRAME.borderDark, 210)}
      {/* bezel reflection */}
      {border(23, 2, FRAME.bezelReflect, 187, 0.8)}

      {/* screen */}
      <View style={{
        position: 'absolute',
        left: r(55), right: r(55), top: r(55), bottom: r(55),
        borderRadius: r(165),
        backgroundColor: screenColor,
        overflow: 'hidden',
      }}>
        {children}

        {showStatusBar && (
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: statusH }}>
            <MockStatusBar tint={statusTint} batteryText={statusTint === '#ffffff' ? '#000000' : '#ffffff'} />
            <Text style={{
              position: 'absolute',
              left: screenW * 0.115,
              top: statusH * 0.26,
              fontSize: screenW * 0.047,
              fontWeight: '600',
              color: statusTint,
            }}>
              9:41
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Top-half variant (vault notification preview) ─────────────────────────────
export function MockPhoneTop({ children, width = 256 }: { children: React.ReactNode; width?: number }) {
  const W = width;
  const s = W / 377;
  const r = (n: number) => Math.round(n * s);
  const btnStyle = {
    position: 'absolute' as const,
    borderRadius: r(2),
    backgroundColor: '#eeb2c1',
    borderWidth: 0.5,
    borderColor: 'rgba(139,58,74,0.8)',
  };
  return (
    <View style={{ alignSelf: 'center', marginBottom: Spacing.s4 }}>
      {/* Power button */}
      <View style={[btnStyle, { right: -r(4), top: r(151), width: r(5), height: r(96) }]} />
      {/* Mute + volume */}
      {([{ t: 165, h: 31 }, { t: 237, h: 56 }, { t: 310, h: 56 }] as const).map((b, i) => (
        <View key={i} style={[btnStyle, { left: -r(4), top: r(b.t), width: r(5), height: r(b.h) }]} />
      ))}
      {/* Titanium frame */}
      <View style={{
        width: W,
        borderTopLeftRadius: r(62), borderTopRightRadius: r(62),
        backgroundColor: '#f3b6c4',
        borderWidth: 1, borderColor: 'rgba(139,58,74,0.5)',
        overflow: 'hidden',
        shadowColor: '#d77a8d', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9, shadowRadius: 3, elevation: 4,
      }}>
        {/* Bezel */}
        <View style={{
          margin: r(4), marginBottom: 0,
          borderTopLeftRadius: r(58), borderTopRightRadius: r(58),
          backgroundColor: '#0D0D0D', overflow: 'hidden',
        }}>
          {/* Screen */}
          <View style={{
            margin: r(4), marginBottom: 0,
            borderTopLeftRadius: r(52), borderTopRightRadius: r(52),
            overflow: 'hidden',
          }}>
            {children}
          </View>
        </View>
      </View>
    </View>
  );
}
