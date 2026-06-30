import { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, {
  Defs, ClipPath, Path, Rect, Circle, G,
  Image as SvgImage,
  LinearGradient as SvgLinearGradient, Stop,
  Pattern as SvgPattern,
} from 'react-native-svg';
import { FontFamily ,sf } from '@/constants/theme';

export const INK = '#1f1219';
export const FILL_GRAY = '#e9d8cb';
export const FILL_GRAY_DARK = '#d0bba9';

// ─── useSliderTrack ───────────────────────────────────────────
// Shared touch handling for horizontal value sliders. Uses pageX
// against the track's measured screen position rather than locationX,
// because locationX is reported relative to whichever child view
// (thumb/fill/divider) is under the finger, which makes the value jump.
// Re-measures on each grant so it stays correct after the page scrolls.
export function useSliderTrack(onChange?: (v: number) => void) {
  const trackRef = useRef<View>(null);
  const geo = useRef({ x: 0, w: 0 });
  const clamp = (x: number) => Math.max(0, Math.min(1, x));
  const responder = onChange ? {
    onStartShouldSetResponderCapture: () => true,
    onMoveShouldSetResponderCapture: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (e: any) => {
      (trackRef.current as any)?.requestDisallowInterceptTouchEvent?.(true);
      const px = e.nativeEvent.pageX;
      (trackRef.current as any)?.measureInWindow?.((x: number, _y: number, w: number) => {
        geo.current = { x, w };
        if (w > 0) onChange(clamp((px - x) / w));
      });
    },
    onResponderMove: (e: any) => {
      (trackRef.current as any)?.requestDisallowInterceptTouchEvent?.(true);
      const { x, w } = geo.current;
      if (w > 0) onChange(clamp((e.nativeEvent.pageX - x) / w));
    },
  } : {};
  return { trackRef, responder };
}

// ─── MarkerCard ───────────────────────────────────────────────
type MarkerCardProps = {
  children: React.ReactNode;
  tint?: string;
  style?: object;
};
export function MarkerCard({ children, tint = '#fffbf6', style }: MarkerCardProps) {
  return (
    <View style={[s.markerCard, { backgroundColor: tint === 'transparent' ? 'transparent' : tint }, style]}>
      {children}
    </View>
  );
}

// ─── MarkerHeader ─────────────────────────────────────────────
type MarkerHeaderProps = { children: React.ReactNode; size?: number; style?: object };
export function MarkerHeader({ children, size = 32, style }: MarkerHeaderProps) {
  return (
    <Text style={[s.markerHeader, { fontSize: size, lineHeight: size }, style]}>
      {children}
    </Text>
  );
}

// ─── TitleHeader ──────────────────────────────────────────────
type TitleHeaderProps = { title: string; subtitle?: string };
export function TitleHeader({ title, subtitle }: TitleHeaderProps) {
  return (
    <View style={s.titleHeader}>
      <MarkerHeader size={26}>{title}</MarkerHeader>
      {subtitle && <Text style={s.titleSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ─── BlankPill ────────────────────────────────────────────────
type BlankPillProps = {
  width?: number | string;
  value?: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  style?: any;
};
export function BlankPill({ width = '100%' as number | string, value, onChangeText, placeholder = '——', style }: BlankPillProps) {
  if (onChangeText !== undefined) {
    return (
      <TextInput
        value={value ?? ''}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={INK + '88'}
        style={[s.blankPill, s.blankPillInput, typeof width === 'number' ? { width } : { flex: 1 }, style]}
      />
    );
  }
  return (
    <View style={[
      s.blankPill,
      value ? s.blankPillInput : null,
      typeof width === 'number' ? { width } : { flex: 1 },
      { justifyContent: 'center' },
      style
    ]}>
      {value ? (
        <Text style={[{ fontFamily: FontFamily.ja, fontSize: sf(11), color: INK }, style && { fontSize: style.fontSize }]}>{value}</Text>
      ) : null}
    </View>
  );
}

// ─── TemplateField ────────────────────────────────────────────
type TemplateFieldProps = {
  label: string;
  value?: string;
  valueWidth?: number;
  onChangeText?: (t: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'number-pad';
};
export function TemplateField({ label, value, valueWidth = 90, onChangeText, keyboardType }: TemplateFieldProps) {
  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      {onChangeText !== undefined ? (
        <TextInput
          value={value ?? ''}
          onChangeText={onChangeText}
          placeholder="——"
          placeholderTextColor={INK + '88'}
          keyboardType={keyboardType}
          style={[s.fieldValueBox, s.fieldValueInput, { width: valueWidth }]}
        />
      ) : value ? (
        <View style={[s.fieldValueBox, { width: valueWidth }]}>
          <Text style={s.fieldValueText}>{value}</Text>
        </View>
      ) : (
        <View style={[s.blankPill, { width: valueWidth }]} />
      )}
    </View>
  );
}

// ─── Check ────────────────────────────────────────────────────
export function Check({ on = false, size = 14, onPress }: { on?: boolean; size?: number; onPress?: () => void }) {
  const svg = (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle cx="8" cy="8" r="6.5" fill="none" stroke={INK} strokeWidth="1.6" />
      {on && <Circle cx="8" cy="8" r="3.5" fill={INK} />}
    </Svg>
  );
  if (onPress) return <Pressable onPress={onPress} hitSlop={8}>{svg}</Pressable>;
  return svg;
}

// ─── SquareCheck (used by Boundaries) ─────────────────────────
export function SquareCheck({ on = false, size = 11, stroke = INK }: { on?: boolean; size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Rect x="1" y="1" width="10" height="10" rx="2" fill="#fff" stroke={stroke} strokeWidth="1.4" />
      {on && (
        <Path
          d="M3 6 L 5 8.5 L 9 4"
          stroke={stroke}
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

// ─── Dichotomy ────────────────────────────────────────────────
type DichotomyProps = {
  left: string;
  right: string;
  choice?: 'left' | 'right' | null;
  onChoiceChange?: (c: 'left' | 'right' | null) => void;
};
export function Dichotomy({ left, right, choice, onChoiceChange }: DichotomyProps) {
  const handlePressLeft = () => {
    if (choice === 'left') {
      onChoiceChange?.(null);
    } else {
      onChoiceChange?.('left');
    }
  };

  const handlePressRight = () => {
    if (choice === 'right') {
      onChoiceChange?.(null);
    } else {
      onChoiceChange?.('right');
    }
  };

  return (
    <View style={s.dichotomyRow}>
      <Pressable onPress={handlePressLeft} disabled={!onChoiceChange} hitSlop={{ top: 12, bottom: 12, left: 10, right: 6 }}>
        <Text style={[s.dichotomyText, choice === 'left' && s.dichotomyChosen]}>{left}</Text>
      </Pressable>
      <Text style={s.dichotomySlash}>/</Text>
      <Pressable onPress={handlePressRight} disabled={!onChoiceChange} hitSlop={{ top: 12, bottom: 12, left: 6, right: 10 }} style={s.dichotomyRight}>
        <Text style={[s.dichotomyText, choice === 'right' && s.dichotomyChosen]}>{right}</Text>
      </Pressable>
      <Check on={!!choice} />
    </View>
  );
}

// ─── SharingRow ───────────────────────────────────────────────
export function SharingRow({ choice, onChoiceChange }: { choice?: 'Yes' | 'No' | 'Selective'; onChoiceChange?: (c: 'Yes' | 'No' | 'Selective') => void }) {
  return (
    <View style={s.sharingRow}>
      <Text style={s.sharingLabel}>♡ Sharing:</Text>
      {(['Yes', 'No', 'Selective'] as const).map((c) => (
        <Pressable key={c} style={s.sharingOption} onPress={() => onChoiceChange?.(c)} disabled={!onChoiceChange} hitSlop={4}>
          <Check on={choice === c} size={13} />
          <Text style={[s.sharingText, choice === c && s.sharingActive]}>{c}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── AttrSlider ───────────────────────────────────────────────
export function AttrSlider({ label, value = 0, onValueChange }: { label: string; value?: number; onValueChange?: (v: number) => void }) {
  const { trackRef, responder } = useSliderTrack(onValueChange);
  return (
    <View style={s.sliderCol}>
      <Text style={s.sliderLabel}>{label}</Text>
      <View
        ref={trackRef}
        style={s.sliderTrack}
        {...responder}
      >
        <View style={[s.sliderFill, { width: `${value * 100}%` as any }]} />
        <View style={[s.sliderThumb, { left: `${value * 100}%` as any }]} />
      </View>
    </View>
  );
}

// ─── PhotoBox ─────────────────────────────────────────────────
type PhotoBoxProps = {
  size?: number;
  round?: boolean;
  label?: string;
  style?: object;
  width?: number | string;
  height?: number;
  onPress?: () => void;
  editing?: boolean;
  uri?: string;
  onUriChange?: (uri: string) => void;
};
export function PhotoBox({ size, round, label, style, width, height, onPress, editing, uri: controlledUri, onUriChange }: PhotoBoxProps) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const imageUri = controlledUri !== undefined ? (controlledUri || null) : localUri;

  const handlePress = async () => {
    if (onPress) { onPress(); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      const u = result.assets[0].uri;
      if (onUriChange) onUriChange(u);
      else setLocalUri(u);
    }
  };

  const boxStyle = [
    s.photoBox,
    round && s.photoBoxRound,
    size ? { width: size, height: size } : null,
    width ? { width } : null,
    height ? { height } : null,
    style,
  ] as any;

  const content = (
    <>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[StyleSheet.absoluteFill, { borderRadius: round ? 999 : 6 }]}
          resizeMode="cover"
        />
      ) : (
        <>
          {label && <Text style={s.photoBoxLabel}>{label}</Text>}
          {editing && !label && <Text style={s.photoBoxLabel}>tap to add</Text>}
        </>
      )}
    </>
  );

  if (editing || onPress) return <Pressable style={boxStyle} onPress={handlePress}>{content}</Pressable>;
  return <View style={boxStyle}>{content}</View>;
}

// ─── Polaroid ─────────────────────────────────────────────────
type PolaroidProps = {
  size?: number;
  rotate?: number;
  caption?: string;
  onCaptionChange?: (v: string) => void;
  tapeColor?: string;
  style?: object;
  editing?: boolean;
  uri?: string;
  onUriChange?: (uri: string) => void;
};
export function Polaroid({ size = 130, rotate = -4, caption, onCaptionChange, tapeColor = '#f3b6c4', style, editing, uri: controlledUri, onUriChange }: PolaroidProps) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const imageUri = controlledUri !== undefined ? (controlledUri || null) : localUri;

  const handlePhotoPress = async () => {
    if (!editing) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      const u = result.assets[0].uri;
      if (onUriChange) onUriChange(u);
      else setLocalUri(u);
    }
  };

  return (
    <View style={[s.polaroid, { width: size, transform: [{ rotate: `${rotate}deg` }] }, style]}>
      <View
        style={[
          s.polaroidTape,
          {
            width: size * 0.5,
            backgroundColor: tapeColor,
            transform: [{ rotate: '-12deg' }],
            left: size * 0.25,
          },
        ]}
      />
      <Pressable onPress={editing ? handlePhotoPress : undefined} disabled={!editing}>
        <View style={[s.polaroidPhoto, { width: size - 16 }]}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={[StyleSheet.absoluteFill, { borderRadius: 2 }]} resizeMode="cover" />
          )}
          {editing && !imageUri && <Text style={[s.photoBoxLabel, { position: 'absolute', alignSelf: 'center', top: '40%' as any }]}>tap</Text>}
        </View>
      </Pressable>
      {editing && onCaptionChange !== undefined ? (
        <TextInput
          value={caption ?? ''}
          onChangeText={onCaptionChange}
          placeholder="caption..."
          placeholderTextColor={INK + '88'}
          underlineColorAndroid="transparent"
          style={s.polaroidCaptionInput}
        />
      ) : caption ? (
        <Text style={s.polaroidCaption}>{caption}</Text>
      ) : null}
    </View>
  );
}

// ─── WindowFrame ──────────────────────────────────────────────
type WindowFrameProps = { title: string; children: React.ReactNode; style?: object };
export function WindowFrame({ title, children, style }: WindowFrameProps) {
  return (
    <View style={[s.windowFrame, style]}>
      <View style={s.windowTitleBar}>
        <Text style={s.windowTitle}>{title}</Text>
        <View style={s.windowControls}>
          {/* heart / min / max / close as simple shapes */}
          <Svg width="11" height="11" viewBox="0 0 16 16">
            <Path
              d="M8 14 C 3 11 1 8.5 1 5.5 C 1 3.5 2.5 2 4.5 2 C 6 2 7.3 2.9 8 4.3 C 8.7 2.9 10 2 11.5 2 C 13.5 2 15 3.5 15 5.5 C 15 8.5 13 11 8 14 Z"
              fill="none" stroke={INK} strokeWidth="1.4"
            />
          </Svg>
          <Svg width="11" height="11" viewBox="0 0 11 11">
            <Path d="M2 6 L9 6" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
          <Svg width="11" height="11" viewBox="0 0 11 11">
            <Rect x="2" y="2" width="7" height="7" stroke={INK} strokeWidth="1.5" fill="none" />
          </Svg>
          <Svg width="11" height="11" viewBox="0 0 11 11">
            <Path d="M2 2 L9 9 M9 2 L2 9" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        </View>
      </View>
      <View style={s.windowBody}>{children}</View>
    </View>
  );
}

// ─── MusicPlayer ──────────────────────────────────────────────
export function MusicPlayer({ track }: { track?: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0.62);
  const { trackRef: barRef, responder: scrubProps } = useSliderTrack(setProgress);
  return (
    <View style={s.musicPlayer}>
      {track && <Text style={s.musicTrack}>{track}</Text>}
      <View style={s.musicScrubRow}>
        <View
          ref={barRef}
          style={s.musicBar}
          {...scrubProps}
        >
          <View style={[s.musicFill, { width: `${progress * 100}%` as any }]} />
          <View style={[s.musicThumb, { left: `${progress * 100}%` as any }]} />
        </View>
        <Svg width="18" height="18" viewBox="0 0 16 16" fill={INK}>
          <Path d="M6 2 L12 4 L12 11 A 2 2 0 1 1 10 9 L10 5 L8 4 L8 12 A 2 2 0 1 1 6 10 Z" fill={INK} />
        </Svg>
      </View>
      <View style={s.musicControls}>
        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <Path d="M3 8 a5 5 0 0 1 9 -3 M3 5 L3 8 L6 8 M13 8 a5 5 0 0 1 -9 3 M13 11 L13 8 L10 8" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
        <Svg width="16" height="16" viewBox="0 0 16 16" fill={INK}>
          <Path d="M9 4 L4 8 L9 12 Z" /><Rect x="2" y="4" width="1.6" height="8" fill={INK} />
        </Svg>
        <Pressable style={s.musicPlayBtn} onPress={() => setPlaying((p) => !p)} hitSlop={8}>
          <Svg width="9" height="9" viewBox="0 0 9 9">
            {playing ? (
              <>
                <Rect x="1.5" y="1" width="2" height="7" rx="0.5" fill={INK} />
                <Rect x="5.5" y="1" width="2" height="7" rx="0.5" fill={INK} />
              </>
            ) : (
              <Path d="M2 1 L8 4.5 L2 8 Z" fill={INK} />
            )}
          </Svg>
        </Pressable>
        <Svg width="16" height="16" viewBox="0 0 16 16" fill={INK}>
          <Path d="M7 4 L12 8 L7 12 Z" /><Rect x="12.4" y="4" width="1.6" height="8" fill={INK} />
        </Svg>
        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <Path d="M3 3 L13 13 M13 3 L3 13" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        </Svg>
      </View>
    </View>
  );
}

// ─── KawaiiPanel ──────────────────────────────────────────────
type KawaiiPanelProps = { children: React.ReactNode; edge: string; bg: string; style?: object };
export function KawaiiPanel({ children, edge, bg, style }: KawaiiPanelProps) {
  return (
    <View style={[s.kawaiiPanel, { borderColor: edge, backgroundColor: bg }, style]}>
      {children}
    </View>
  );
}

// ─── ProfileBlock ─────────────────────────────────────────────
type FilledState = Partial<{ age: string; height: string; occupation: string; good: string }>;
type DichoState = Partial<{ spoon: 'left' | 'right'; energy: 'left' | 'right'; pda: 'left' | 'right' }>;
type ProfileBlockProps = {
  who: 'ME' | 'THEM';
  filled?: FilledState;
  onFilledChange?: (field: keyof FilledState, value: string) => void;
  dicho?: DichoState;
  onDichoChange?: (field: keyof DichoState, choice: 'left' | 'right' | null) => void;
  sliders?: [string, number][];
  onSliderChange?: (label: string, value: number) => void;
  showPhoto?: boolean;
  photoUri?: string;
  onPhotoUriChange?: (uri: string) => void;
};
export function ProfileBlock({ who, filled = {}, onFilledChange, dicho = {}, onDichoChange, sliders = [['TRUST', 0], ['CLINGY', 0], ['JEALOUSY', 0]], onSliderChange, showPhoto, photoUri, onPhotoUriChange }: ProfileBlockProps) {
  const f = (field: keyof FilledState) => onFilledChange ? (v: string) => onFilledChange(field, v) : undefined;
  const d = (field: keyof DichoState) => onDichoChange ? (c: 'left' | 'right' | null) => onDichoChange(field, c) : undefined;
  return (
    <View style={s.profileBlock}>
      {!showPhoto && <PhotoBox size={80} style={s.profilePhoto} editing={!!onFilledChange} uri={photoUri} onUriChange={onPhotoUriChange} />}
      <View style={s.profileContent}>
        <View style={s.profileTopRow}>
          <View style={s.profileWhoTag}>
            <Text style={s.profileWhoText}>{who}</Text>
          </View>
          <TemplateField label="Age" value={filled.age} onChangeText={f('age')} valueWidth={32} keyboardType="numeric" />
          <TemplateField label="Height" value={filled.height} onChangeText={f('height')} valueWidth={44} />
        </View>
        <TemplateField label="Occupation" value={filled.occupation} onChangeText={f('occupation')} valueWidth={120} />
        <View style={s.profileDichoCol}>
          <Dichotomy left="Big spoon" right="Little spoon" choice={dicho.spoon} onChoiceChange={d('spoon')} />
          <Dichotomy left="Confident" right="Shy" choice={dicho.energy} onChoiceChange={d('energy')} />
          <Dichotomy left="PDA" right="Reserved" choice={dicho.pda} onChoiceChange={d('pda')} />
        </View>
        <View style={s.profileGoodRow}>
          <Text style={s.profileGoodLabel}>I'm good at</Text>
          {onFilledChange !== undefined ? (
            <TextInput
              value={filled.good ?? ''}
              onChangeText={f('good')}
              placeholder="your strengths"
              placeholderTextColor={INK + '88'}
              style={s.profileGoodInput}
            />
          ) : (
            <Text style={s.profileGoodText}>{filled.good || '——'}</Text>
          )}
        </View>
        <View style={s.profileSliders}>
          {sliders.map(([l, v]) => (
            <View key={l} style={s.profileSliderItem}>
              <AttrSlider label={l} value={v} onValueChange={onSliderChange ? (nv) => onSliderChange(l, nv) : undefined} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── TwinProfile ──────────────────────────────────────────────
type TwinProfileProps = { who: string; info: [string, string?][]; onInfoChange?: (index: number, value: string) => void };
export function TwinProfile({ who, info, onInfoChange }: TwinProfileProps) {
  return (
    <View style={s.twinProfile}>
      <View style={s.twinProfileHeader}>
        <Text style={s.twinProfileWho}>{who}</Text>
      </View>
      <View style={s.twinProfileBody}>
        {info.map(([k, v], i) => (
          <View key={k} style={s.twinProfileRow}>
            <Text style={s.twinProfileKey}>{k}</Text>
            {onInfoChange ? (
              <TextInput
                value={v ?? ''}
                onChangeText={(t) => onInfoChange(i, t)}
                placeholder="——"
                placeholderTextColor={INK + '88'}
                style={[s.twinProfileVal, s.twinProfileInput]}
              />
            ) : v ? (
              <Text style={s.twinProfileVal}>{v}</Text>
            ) : (
              <View style={{ flex: 1 }}><BlankPill /></View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── HeartClipPhoto ───────────────────────────────────────────
const HEART_PATH = "M90 145 C 30 110, 5 75, 5 45 C 5 22, 25 5, 50 5 C 68 5, 82 16, 90 35 C 98 16, 112 5, 130 5 C 155 5, 175 22, 175 45 C 175 75, 150 110, 90 145 Z";

type HeartClipPhotoProps = {
  width?: number;
  height?: number;
  leftUri?: string;
  rightUri?: string;
  editing?: boolean;
  onLeftUriChange?: (uri: string) => void;
  onRightUriChange?: (uri: string) => void;
};
export function HeartClipPhoto({ width = 180, height = 160, leftUri, rightUri, editing, onLeftUriChange, onRightUriChange }: HeartClipPhotoProps) {
  const pickLeft = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as ImagePicker.MediaType[], allowsEditing: true, quality: 0.85 });
    if (!result.canceled && result.assets[0]) onLeftUriChange?.(result.assets[0].uri);
  };
  const pickRight = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as ImagePicker.MediaType[], allowsEditing: true, quality: 0.85 });
    if (!result.canceled && result.assets[0]) onRightUriChange?.(result.assets[0].uri);
  };

  const half = width / 2;

  return (
    <View style={{ width, height, position: 'relative' }}>
      <Svg width={width} height={height} viewBox="0 0 180 160">
        <Defs>
          <ClipPath id="heartclip">
            <Path d={HEART_PATH} />
          </ClipPath>
        </Defs>

        <G clipPath="url(#heartclip)">
          {/* Left half */}
          <Rect x="0" y="0" width="90" height="160" fill={FILL_GRAY} />
          {leftUri ? (
            <SvgImage x="0" y="0" width="90" height="160" href={leftUri} preserveAspectRatio="xMidYMid slice" />
          ) : editing ? (
            <Path d="M45 72 L45 88 M37 80 L53 80" stroke={INK} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          ) : null}

          {/* Right half */}
          <Rect x="90" y="0" width="90" height="160" fill={FILL_GRAY_DARK} />
          {rightUri ? (
            <SvgImage x="90" y="0" width="90" height="160" href={rightUri} preserveAspectRatio="xMidYMid slice" />
          ) : editing ? (
            <Path d="M135 72 L135 88 M127 80 L143 80" stroke={INK} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          ) : null}
        </G>

        {/* Outline + divider */}
        <Path d={HEART_PATH} fill="none" stroke={INK} strokeWidth="2.2" />
        <Path d="M90 8 L90 142" stroke={INK} strokeWidth="1.4" strokeDasharray="4,4" />
      </Svg>

      {/* Tap areas when editing */}
      {editing && (
        <>
          <Pressable
            style={{ position: 'absolute', left: 0, top: 0, width: half, height }}
            onPress={pickLeft}
          />
          <Pressable
            style={{ position: 'absolute', left: half, top: 0, width: half, height }}
            onPress={pickRight}
          />
        </>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  markerCard: {
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 14,
    padding: 20,
    overflow: 'hidden',
    shadowColor: INK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  markerHeader: {
    fontFamily: FontFamily.markerBold,
    letterSpacing: -0.3,
    color: INK,
    textTransform: 'uppercase',
  },
  titleHeader: {
    marginBottom: 12,
    gap: 3,
  },
  titleSubtitle: {
    fontFamily: FontFamily.script,
    fontSize: sf(13),
    color: INK,
    marginTop: 3,
  },
  blankPill: {
    height: 18,
    backgroundColor: 'rgba(0,0,0,0.07)',
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 999,
  },
  blankPillInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 0,
    fontFamily: FontFamily.ja,
    fontSize: sf(11),
    color: INK,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldLabel: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(11),
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  fieldValueBox: {
    height: 18,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 4,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldValueInput: {
    fontFamily: FontFamily.ja,
    fontSize: sf(11),
    color: INK,
    textAlign: 'center',
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  fieldValueText: {
    fontFamily: FontFamily.ja,
    fontSize: sf(11),
    color: INK,
    textAlign: 'center',
  },
  dichotomyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dichotomyText: {
    fontFamily: FontFamily.marker,
    fontSize: sf(11),
    color: INK,
  },
  dichotomyRight: {
    flex: 1,
  },
  dichotomyChosen: {
    fontFamily: FontFamily.markerBold,
    textDecorationLine: 'underline',
  },
  dichotomySlash: {
    fontFamily: FontFamily.marker,
    fontSize: sf(11),
    color: INK,
    opacity: 0.5,
  },
  sharingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  sharingLabel: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(13),
    color: INK,
    textTransform: 'uppercase',
  },
  sharingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sharingText: {
    fontFamily: FontFamily.marker,
    fontSize: sf(12),
    color: INK,
  },
  sharingActive: {
    fontFamily: FontFamily.markerBold,
  },
  sliderCol: {
    gap: 4,
    flex: 1,
  },
  sliderLabel: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(9),
    color: INK,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  sliderTrack: {
    position: 'relative',
    height: 8,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 999,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: FILL_GRAY_DARK,
    borderRadius: 999,
  },
  sliderThumb: {
    position: 'absolute',
    top: '50%' as any,
    marginTop: -6,
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 999,
  },
  photoBox: {
    backgroundColor: FILL_GRAY,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoBoxRound: {
    borderRadius: 999,
  },
  photoBoxLabel: {
    fontFamily: FontFamily.marker,
    fontSize: sf(9),
    color: INK,
    opacity: 0.55,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  polaroid: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: INK,
    padding: 8,
    paddingBottom: 28,
    shadowColor: INK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  polaroidTape: {
    position: 'absolute',
    top: -8,
    height: 14,
    opacity: 0.7,
    borderWidth: 1,
    borderColor: 'rgba(31,18,25,0.15)',
    zIndex: 1,
  },
  polaroidPhoto: {
    aspectRatio: 1,
    backgroundColor: FILL_GRAY,
    borderWidth: 1,
    borderColor: INK,
  },
  polaroidCaption: {
    marginTop: 6,
    fontFamily: FontFamily.script,
    fontSize: sf(12),
    color: INK,
    textAlign: 'center',
  },
  polaroidCaptionInput: {
    marginTop: 6,
    fontFamily: FontFamily.script,
    fontSize: sf(12),
    color: INK,
    textAlign: 'center',
    padding: 0,
    height: 20,
  },
  windowFrame: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 6,
    overflow: 'hidden',
  },
  windowTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: INK,
  },
  windowTitle: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(12),
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  windowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  windowBody: {
    padding: 10,
  },
  musicPlayer: {
    paddingHorizontal: 2,
    gap: 6,
  },
  musicTrack: {
    fontFamily: FontFamily.script,
    fontSize: sf(14),
    color: INK,
    marginBottom: 2,
  },
  musicScrubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  musicBar: {
    flex: 1,
    position: 'relative',
    height: 4,
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: INK,
    borderRadius: 999,
  },
  musicFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '62%',
    backgroundColor: FILL_GRAY_DARK,
    borderRadius: 999,
  },
  musicThumb: {
    position: 'absolute',
    left: '62%' as any,
    top: '50%' as any,
    marginTop: -4,
    marginLeft: -4,
    width: 8,
    height: 8,
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: INK,
    borderRadius: 999,
  },
  musicControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  musicPlayBtn: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kawaiiPanel: {
    padding: 10,
    borderWidth: 1.5,
    borderRadius: 10,
  },
  profileBlock: {
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fff',
  },
  profilePhoto: {
    flexShrink: 0,
  },
  profileContent: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  profileTopRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  profileWhoTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: FILL_GRAY,
    borderWidth: 1.2,
    borderColor: INK,
    borderRadius: 4,
  },
  profileWhoText: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(10),
    color: INK,
    letterSpacing: 0.8,
  },
  profileDichoCol: {
    gap: 4,
    marginTop: 2,
  },
  profileGoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  profileGoodLabel: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(9),
    color: INK,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingTop: 1,
  },
  profileGoodText: {
    fontFamily: FontFamily.ja,
    fontSize: sf(11),
    color: INK,
    flex: 1,
    lineHeight: 16,
  },
  profileGoodInput: {
    fontFamily: FontFamily.ja,
    fontSize: sf(11),
    color: INK,
    flex: 1,
    padding: 0,
    paddingVertical: 0,
    height: 18,
  },
  profileSliders: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  profileSliderItem: {
    flex: 1,
  },
  twinProfile: {
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  twinProfileHeader: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: FILL_GRAY,
    borderBottomWidth: 1.5,
    borderBottomColor: INK,
  },
  twinProfileWho: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(10),
    color: INK,
    letterSpacing: 0.8,
  },
  twinProfileBody: {
    padding: 8,
    gap: 5,
  },
  twinProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  twinProfileKey: {
    fontFamily: FontFamily.markerBold,
    fontSize: sf(8),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: INK,
    opacity: 0.7,
    width: 70,
  },
  twinProfileVal: {
    fontFamily: FontFamily.ja,
    fontSize: sf(11),
    color: INK,
    flex: 1,
  },
  twinProfileInput: {
    height: 16,
    padding: 0,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: INK + '55',
    borderRadius: 3,
  },
});
