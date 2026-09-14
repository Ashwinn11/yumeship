import { useState, useRef, createContext, useContext } from 'react';
import { Keyboard, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { persistImage } from '@/lib/localMedia';
import { MEDIA_IMAGE } from '@/lib/imageProps';
import * as ImagePicker from 'expo-image-picker';
import Svg, {
  Defs, ClipPath, Path, Rect, Circle, G,
  Image as SvgImage,
  SvgXml,
} from 'react-native-svg';
import { FontFamily ,sf, SHARING_TEMPLATE_OPTS, type SharingTemplateLabel } from '@/constants/theme';

export const INK = '#1f1219';
export const FILL_GRAY = '#e9d8cb';
export const FILL_GRAY_DARK = '#d0bba9';

// ─── TemplateTextColorCtx ──────────────────────────────────────
// Per-template user-chosen text color (parallels the bgColor/bgImage
// convention). Empty string means "use the template's own default ink."
export const TemplateTextColorCtx = createContext<string>('');
export function useThemedInk(): string {
  const c = useContext(TemplateTextColorCtx);
  return c || INK;
}

export function getContrastColor(hexColor: string): string {
  if (!hexColor) return '#ffffff';
  const c = hexColor.replace('#', '').trim();
  let r = 0, g = 0, b = 0;
  if (c.length === 3) {
    r = parseInt(c[0] + c[0], 16);
    g = parseInt(c[1] + c[1], 16);
    b = parseInt(c[2] + c[2], 16);
  } else if (c.length === 6) {
    r = parseInt(c.substring(0, 2), 16);
    g = parseInt(c.substring(2, 4), 16);
    b = parseInt(c.substring(4, 6), 16);
  } else {
    return '#ffffff';
  }
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#1f1219' : '#ffffff';
}

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
  const ink = useThemedInk();
  return (
    <View style={[s.markerCard, { backgroundColor: tint === 'transparent' ? 'transparent' : tint, borderColor: ink, shadowColor: ink }, style]}>
      {children}
    </View>
  );
}

// ─── MarkerHeader ─────────────────────────────────────────────
type MarkerHeaderProps = { children: React.ReactNode; size?: number; style?: object };
export function MarkerHeader({ children, size = 32, style }: MarkerHeaderProps) {
  const ink = useThemedInk();
  return (
    <Text style={[s.markerHeader, { fontSize: size, lineHeight: size, color: ink }, style]}>
      {children}
    </Text>
  );
}

// ─── TitleHeader ──────────────────────────────────────────────
type TitleHeaderProps = { title: string; subtitle?: string };
export function TitleHeader({ title, subtitle }: TitleHeaderProps) {
  const ink = useThemedInk();
  return (
    <View style={s.titleHeader}>
      <MarkerHeader size={26}>{title}</MarkerHeader>
      {subtitle && <Text style={[s.titleSubtitle, { color: ink }]}>{subtitle}</Text>}
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
  multiline?: boolean;
};
export function BlankPill({ width = '100%' as number | string, value, onChangeText, placeholder = '——', style, multiline = false }: BlankPillProps) {
  const ink = useThemedInk();
  if (onChangeText !== undefined) {
    return (
      <TextInput
        value={value ?? ''}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={ink + '88'}
        multiline={multiline}
        returnKeyType={multiline ? undefined : 'done'}
        onSubmitEditing={multiline ? undefined : () => Keyboard.dismiss()}
        style={[s.blankPill, s.blankPillInput, typeof width === 'number' ? { width } : { flex: 1 }, { color: ink, borderColor: ink }, style]}
      />
    );
  }
  return (
    <View style={[
      s.blankPill,
      value ? s.blankPillInput : null,
      typeof width === 'number' ? { width } : { flex: 1 },
      { justifyContent: 'center', borderColor: ink },
      style
    ]}>
      {value ? (
        <Text style={[{ fontFamily: FontFamily.ja, fontSize: sf(11), color: ink }, style && { fontSize: style.fontSize }]}>{value}</Text>
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
  /** value box shows the template's own background through instead of a solid white pill */
  transparent?: boolean;
};
export function TemplateField({ label, value, valueWidth = 90, onChangeText, keyboardType, transparent }: TemplateFieldProps) {
  const ink = useThemedInk();
  const boxTint = transparent ? { backgroundColor: 'transparent' } : null;
  return (
    <View style={s.fieldRow}>
      <Text style={[s.fieldLabel, { color: ink }]}>{label}</Text>
      {onChangeText !== undefined ? (
        <TextInput
          value={value ?? ''}
          onChangeText={onChangeText}
          placeholder="——"
          placeholderTextColor={ink + '88'}
          keyboardType={keyboardType}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
          style={[s.fieldValueBox, s.fieldValueInput, { width: valueWidth, color: ink, borderColor: ink }, boxTint]}
        />
      ) : value ? (
        <View style={[s.fieldValueBox, { width: valueWidth, borderColor: ink }, boxTint]}>
          <Text style={[s.fieldValueText, { color: ink }]}>{value}</Text>
        </View>
      ) : (
        <View style={[s.blankPill, { width: valueWidth, borderColor: ink }, boxTint]} />
      )}
    </View>
  );
}

// ─── Check ────────────────────────────────────────────────────
export function Check({ on = false, size = 14, onPress }: { on?: boolean; size?: number; onPress?: () => void }) {
  const ink = useThemedInk();
  const svg = (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle cx="8" cy="8" r="6.5" fill="none" stroke={ink} strokeWidth="1.6" />
      {on && <Circle cx="8" cy="8" r="3.5" fill={ink} />}
    </Svg>
  );
  if (onPress) return <Pressable onPress={onPress} hitSlop={8}>{svg}</Pressable>;
  return svg;
}

// ─── SquareCheck (used by Boundaries) ─────────────────────────
export function SquareCheck({ on = false, size = 11, stroke }: { on?: boolean; size?: number; stroke?: string }) {
  const themedInk = useThemedInk();
  const strokeColor = stroke ?? themedInk;
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Rect x="1" y="1" width="10" height="10" rx="2" fill="#fff" stroke={strokeColor} strokeWidth="1.4" />
      {on && (
        <Path
          d="M3 6 L 5 8.5 L 9 4"
          stroke={strokeColor}
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
  const ink = useThemedInk();
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
        <Text style={[s.dichotomyText, { color: ink }, choice === 'left' && s.dichotomyChosen]}>{left}</Text>
      </Pressable>
      <Text style={[s.dichotomySlash, { color: ink }]}>/</Text>
      <Pressable onPress={handlePressRight} disabled={!onChoiceChange} hitSlop={{ top: 12, bottom: 12, left: 6, right: 10 }} style={s.dichotomyRight}>
        <Text style={[s.dichotomyText, { color: ink }, choice === 'right' && s.dichotomyChosen]}>{right}</Text>
      </Pressable>
      <Check on={!!choice} />
    </View>
  );
}

// ─── SharingRow ───────────────────────────────────────────────
export function SharingRow({ choice, onChoiceChange }: { choice?: SharingTemplateLabel; onChoiceChange?: (c: SharingTemplateLabel) => void }) {
  const ink = useThemedInk();
  return (
    <View style={s.sharingRow}>
      <Text style={[s.sharingLabel, { color: ink }]}>♡ Sharing:</Text>
      {SHARING_TEMPLATE_OPTS.map((c) => (
        <Pressable key={c} style={s.sharingOption} onPress={() => onChoiceChange?.(c)} disabled={!onChoiceChange} hitSlop={4}>
          <Check on={choice === c} size={13} />
          <Text style={[s.sharingText, { color: ink }, choice === c && s.sharingActive]}>{c}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── AttrSlider ───────────────────────────────────────────────
export function AttrSlider({ label, value = 0, onValueChange }: { label: string; value?: number; onValueChange?: (v: number) => void }) {
  const ink = useThemedInk();
  const { trackRef, responder } = useSliderTrack(onValueChange);
  return (
    <View style={s.sliderCol}>
      <Text style={[s.sliderLabel, { color: ink }]}>{label}</Text>
      <View
        ref={trackRef}
        style={[s.sliderTrack, { borderColor: ink }]}
        {...responder}
      >
        <View style={[s.sliderFill, { width: `${value * 100}%` as any }]} />
        <View style={[s.sliderThumb, { left: `${value * 100}%` as any, borderColor: ink }]} />
      </View>
    </View>
  );
}

// ─── DualSlider ───────────────────────────────────────────────
// Two-person comparison slider: one 0-1 value where the divider position
// shows how far a trait leans toward either person; each side tints with
// that person's color when provided. `ink` overrides the themed default for
// templates that key their own fallback ink (e.g. kawaii-ui's pink).
type DualSliderProps = { label: string; value?: number; onValueChange?: (v: number) => void; leftColor?: string; rightColor?: string; ink?: string };
export function DualSlider({ label, value = 0.5, onValueChange, leftColor, rightColor, ink: inkOverride }: DualSliderProps) {
  const themedInk = useThemedInk();
  const ink = inkOverride || themedInk;
  const { trackRef, responder } = useSliderTrack(onValueChange);
  const pct = `${Math.round(value * 100)}%` as any;
  const rest = `${Math.round((1 - value) * 100)}%` as any;
  return (
    <View style={s.dualSliderWrap}>
      <Text style={[s.dualSliderLabel, { color: ink }]}>{label}</Text>
      <View ref={trackRef} style={[s.dualSliderTrack, { borderColor: ink }]} {...responder}>
        <View style={[s.dualSliderLeft, { width: pct }, { backgroundColor: leftColor ? leftColor + 'cc' : ink }]} />
        <View style={[s.dualSliderRight, { width: rest }, { backgroundColor: rightColor ? rightColor + 'cc' : ink + '44' }]} />
        <View style={[s.dualSliderDivider, { left: pct, backgroundColor: ink }]} />
      </View>
    </View>
  );
}

// ─── PolarSlider ──────────────────────────────────────────────
// Single-person trait slider flanked by two opposite-pole labels
// (e.g. "Friendly" ←→ "Aloof"), value 0-1 leaning toward right pole.
type PolarSliderProps = { left: string; right: string; value?: number; onValueChange?: (v: number) => void };
export function PolarSlider({ left, right, value = 0.5, onValueChange }: PolarSliderProps) {
  const ink = useThemedInk();
  const { trackRef, responder } = useSliderTrack(onValueChange);
  return (
    <View style={s.polarSliderRow}>
      <Text style={[s.polarSliderLabel, s.polarSliderLabelLeft, { color: ink }]} numberOfLines={2}>{left}</Text>
      <View ref={trackRef} style={[s.polarSliderTrack, { borderColor: ink }]} {...responder}>
        <View style={[s.polarSliderFill, { width: `${value * 100}%` as any, backgroundColor: ink }]} />
        <View style={[s.polarSliderThumb, { left: `${value * 100}%` as any, borderColor: ink }]} />
      </View>
      <Text style={[s.polarSliderLabel, s.polarSliderLabelRight, { color: ink }]} numberOfLines={2}>{right}</Text>
    </View>
  );
}

// ─── HeartMark ────────────────────────────────────────────────
// Small filled heart used as a two-person marker (DualPolarSlider
// thumbs, QuadrantPicker dots) instead of a plain circle.
const HEART_MARK_PATH = "M8 14 C 3 11 1 8.5 1 5.5 C 1 3.5 2.5 2 4.5 2 C 6 2 7.3 2.9 8 4.3 C 8.7 2.9 10 2 11.5 2 C 13.5 2 15 3.5 15 5.5 C 15 8.5 13 11 8 14 Z";
function HeartMark({ size = 14, color, ink }: { size?: number; color: string; ink: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d={HEART_MARK_PATH} fill={color} stroke={ink} strokeWidth={0.6} />
    </Svg>
  );
}

// ─── DualPolarSlider ───────────────────────────────────────────
// Two independent thumbs on one trait-pole track — each person gets
// their own value on the same axis (e.g. how jealous "me" is vs how
// jealous "them" is on the same Jealous↔Chill line). Touch grabs
// whichever thumb is nearer, then drags only that one.
type DualPolarSliderProps = {
  left: string; right: string;
  meValue?: number; foValue?: number;
  onMeChange?: (v: number) => void; onFoChange?: (v: number) => void;
  meColor?: string; foColor?: string;
  /** marker glyph — 'heart' (default, used by aesthetic) or a plain colored 'dot' */
  markerShape?: 'heart' | 'dot';
};
export function DualPolarSlider({ left, right, meValue = 0.5, foValue = 0.5, onMeChange, onFoChange, meColor, foColor, markerShape = 'heart' }: DualPolarSliderProps) {
  const ink = useThemedInk();
  const trackRef = useRef<View>(null);
  const geo = useRef({ x: 0, w: 0 });
  const active = useRef<'me' | 'fo' | null>(null);
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  const canDrag = !!(onMeChange || onFoChange);
  const responder = canDrag ? {
    onStartShouldSetResponderCapture: () => true,
    onMoveShouldSetResponderCapture: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (e: any) => {
      const px = e.nativeEvent.pageX;
      (trackRef.current as any)?.measureInWindow?.((x: number, _y: number, w: number) => {
        geo.current = { x, w };
        if (w > 0) {
          const nv = clamp((px - x) / w);
          active.current = Math.abs(nv - meValue) <= Math.abs(nv - foValue) ? 'me' : 'fo';
          if (active.current === 'me') onMeChange?.(nv); else onFoChange?.(nv);
        }
      });
    },
    onResponderMove: (e: any) => {
      const { x, w } = geo.current;
      if (w > 0 && active.current) {
        const nv = clamp((e.nativeEvent.pageX - x) / w);
        if (active.current === 'me') onMeChange?.(nv); else onFoChange?.(nv);
      }
    },
    onResponderRelease: () => { active.current = null; },
  } : {};
  return (
    <View style={s.polarSliderRow}>
      <Text style={[s.polarSliderLabel, s.polarSliderLabelLeft, { color: ink }]} numberOfLines={2}>{left}</Text>
      <View ref={trackRef} style={[s.polarSliderTrack, { borderColor: ink }]} {...responder}>
        <View style={[s.polarSliderHeartWrap, { left: `${meValue * 100}%` as any }]}>
          {markerShape === 'dot' ? (
            <View style={[s.polarSliderDot, { backgroundColor: meColor || ink, borderColor: ink }]} />
          ) : (
            <HeartMark size={13} color={meColor || ink} ink={ink} />
          )}
        </View>
        <View style={[s.polarSliderHeartWrap, { left: `${foValue * 100}%` as any }]}>
          {markerShape === 'dot' ? (
            <View style={[s.polarSliderDot, { backgroundColor: foColor || ink + '66', borderColor: ink }]} />
          ) : (
            <HeartMark size={13} color={foColor || ink + '66'} ink={ink} />
          )}
        </View>
      </View>
      <Text style={[s.polarSliderLabel, s.polarSliderLabelRight, { color: ink }]} numberOfLines={2}>{right}</Text>
    </View>
  );
}

// ─── QuadrantPicker ───────────────────────────────────────────
// N draggable dots on a 2-axis grid (e.g. Similar↔Opposites by
// Harmonious↔Strained). Mirrors poly-chart's AlignGrid touch mechanic:
// touch grabs whichever point is nearest, then drags only that one.
export type QuadrantPoint = { id: string; x: number; y: number; color?: string; filled?: boolean };
type QuadrantPickerProps = {
  top: string; bottom: string; left: string; right: string;
  points: QuadrantPoint[]; // x: 0(left)-1(right), y: 0(top)-1(bottom)
  onPointChange?: (id: string, v: { x: number; y: number }) => void;
};
export function QuadrantPicker({ top, bottom, left, right, points, onPointChange }: QuadrantPickerProps) {
  const ink = useThemedInk();
  const ref = useRef<View>(null);
  const geo = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const active = useRef<string | null>(null);
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
  const nearest = (x: number, y: number) => {
    let best: string | null = null, bd = Infinity;
    points.forEach((p) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = p.id; } });
    return best;
  };
  const responder = onPointChange ? {
    onStartShouldSetResponderCapture: () => true,
    onMoveShouldSetResponderCapture: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (e: any) => {
      const { pageX, pageY } = e.nativeEvent;
      (ref.current as any)?.measureInWindow?.((x: number, y: number, w: number, h: number) => {
        geo.current = { x, y, w, h };
        if (w > 0 && h > 0) {
          const nx = clamp01((pageX - x) / w), ny = clamp01((pageY - y) / h);
          active.current = nearest(nx, ny);
          if (active.current) onPointChange(active.current, { x: nx, y: ny });
        }
      });
    },
    onResponderMove: (e: any) => {
      const { x, y, w, h } = geo.current;
      if (w > 0 && h > 0 && active.current) {
        onPointChange(active.current, { x: clamp01((e.nativeEvent.pageX - x) / w), y: clamp01((e.nativeEvent.pageY - y) / h) });
      }
    },
    onResponderRelease: () => { active.current = null; },
  } : {};
  return (
    <View style={s.quadrantWrap}>
      <View ref={ref} style={[s.quadrantBox, { borderColor: ink }]} {...responder}>
        <View style={[s.quadrantVLine, { backgroundColor: ink + '33' }]} />
        <View style={[s.quadrantHLine, { backgroundColor: ink + '33' }]} />
        <Text style={[s.quadrantAxis, s.quadrantTop, { color: ink }]}>{top}</Text>
        <Text style={[s.quadrantAxis, s.quadrantBottom, { color: ink }]}>{bottom}</Text>
        <Text style={[s.quadrantAxis, s.quadrantLeft, { color: ink }]}>{left}</Text>
        <Text style={[s.quadrantAxis, s.quadrantRight, { color: ink }]}>{right}</Text>
        {points.map((p) => (
          <View key={p.id} style={[s.quadrantHeartWrap, { left: `${p.x * 100}%` as any, top: `${p.y * 100}%` as any }]}>
            <HeartMark size={16} color={p.color || (p.filled === false ? ink + '66' : ink)} ink={ink} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── ChoiceRow ────────────────────────────────────────────────
// Label + N single-select pills, e.g. "Me" / "Them" / "Both" for a
// relationship-firsts or role checklist row.
type ChoiceRowProps = {
  label: string;
  options: readonly string[];
  value?: string;
  onChange?: (v: string) => void;
  /** per-option fill color when selected, parallel to `options` (falls back to ink when absent) */
  optionColors?: readonly (string | undefined)[];
};
export function ChoiceRow({ label, options, value, onChange, optionColors }: ChoiceRowProps) {
  const ink = useThemedInk();
  return (
    <View style={s.choiceRow}>
      <Text style={[s.choiceLabel, { color: ink }]} numberOfLines={2}>{label}</Text>
      <View style={s.choiceOpts}>
        {options.map((opt, i) => {
          const on = value === opt;
          const fill = optionColors?.[i] || ink;
          return (
            <Pressable
              key={opt}
              disabled={!onChange}
              onPress={onChange ? () => onChange(on ? '' : opt) : undefined}
              style={[s.choicePill, { borderColor: ink }, on && { backgroundColor: fill, borderColor: fill }]}
            >
              <Text style={[s.choicePillText, { color: on ? getContrastColor(fill) : ink }]}>{opt}</Text>
            </Pressable>
          );
        })}
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
  /** inline SVG source rendered when no image is set (preview portraits) */
  svgXml?: string;
};
export function PhotoBox({ size, round, label, style, width, height, onPress, editing, uri: controlledUri, onUriChange, svgXml }: PhotoBoxProps) {
  const ink = useThemedInk();
  const [localUri, setLocalUri] = useState<string | null>(null);
  const imageUri = controlledUri !== undefined ? (controlledUri || null) : localUri;
  // preview data can pass raw SVG markup where a picked-photo uri normally lives
  const inlineSvg = svgXml ?? (imageUri?.trimStart().startsWith('<') ? imageUri : undefined);

  const handlePress = async () => {
    if (onPress) { onPress(); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      // copy out of the picker cache so the photo outlives the next reinstall
      const u = await persistImage(result.assets[0].uri);
      if (onUriChange) onUriChange(u);
      else setLocalUri(u);
    }
  };

  const boxStyle = [
    s.photoBox,
    { borderColor: ink },
    round && s.photoBoxRound,
    size ? { width: size, height: size } : null,
    width ? { width } : null,
    height ? { height } : null,
    style,
  ] as any;

  const content = (
    <>
      {inlineSvg ? (
        <View style={[StyleSheet.absoluteFill, { borderRadius: round ? 999 : 6, overflow: 'hidden' }]}>
          <SvgXml xml={inlineSvg} width="100%" height="100%" />
        </View>
      ) : imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[StyleSheet.absoluteFill, { borderRadius: round ? 999 : 6 }]}
          resizeMode="cover"
        />
      ) : (
        <>
          {label && <Text style={[s.photoBoxLabel, { color: ink }]}>{label}</Text>}
          {editing && !label && <Text style={[s.photoBoxLabel, { color: ink }]}>tap to add</Text>}
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
  const ink = useThemedInk();
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
    <View style={[s.polaroid, { width: size, borderColor: ink, shadowColor: ink, transform: [{ rotate: `${rotate}deg` }] }, style]}>
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
        <View style={[s.polaroidPhoto, { width: size - 16, borderColor: ink }]}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={[StyleSheet.absoluteFill, { borderRadius: 2 }]} contentFit="cover" {...MEDIA_IMAGE} />
          )}
          {editing && !imageUri && <Text style={[s.photoBoxLabel, { color: ink, position: 'absolute', alignSelf: 'center', top: '40%' as any }]}>tap</Text>}
        </View>
      </Pressable>
      {editing && onCaptionChange !== undefined ? (
        <TextInput
          value={caption ?? ''}
          onChangeText={onCaptionChange}
          placeholder="caption..."
          placeholderTextColor={ink + '88'}
          underlineColorAndroid="transparent"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
          style={[s.polaroidCaptionInput, { color: ink }]}
        />
      ) : caption ? (
        <Text style={[s.polaroidCaption, { color: ink }]}>{caption}</Text>
      ) : null}
    </View>
  );
}

// ─── MemoriesFooter ───────────────────────────────────────────
// Shared closing section for every template: a small captioned-photo strip
// + a song row. Standardized keys (memPhoto0/1/2, memCap0/1/2, song) so
// switching templates never drops these via FIELD_MAP.
export type MemoryPhoto = { uri: string; caption: string };
const MEMORY_TAPE = ['#f3b6c4', '#c9b8e8', '#f0daa0'];
const MEMORY_ROTATE = [-5, 4, -3];
type MemoriesFooterProps = {
  editing?: boolean;
  photos: MemoryPhoto[]; // length 3
  onPhotoChange?: (i: number, uri: string) => void;
  onCaptionChange?: (i: number, caption: string) => void;
  song?: string;
  onSongChange?: (v: string) => void;
  style?: object;
  /** song card shows the template's own background through instead of solid white */
  transparentBg?: boolean;
};
// Just the captioned-photo strip, no song — for templates that want the
// memories gallery without the (now largely-deprecated) theme-song feature.
type MemoriesPhotoRowProps = {
  editing?: boolean;
  photos: MemoryPhoto[]; // length 3
  onPhotoChange?: (i: number, uri: string) => void;
  onCaptionChange?: (i: number, caption: string) => void;
  style?: object;
};
export function MemoriesPhotoRow({ editing, photos, onPhotoChange, onCaptionChange, style }: MemoriesPhotoRowProps) {
  return (
    <View style={[s.memoriesRow, style]}>
      {[0, 1, 2].map((i) => (
        <Polaroid
          key={i}
          size={92}
          rotate={MEMORY_ROTATE[i]}
          tapeColor={MEMORY_TAPE[i]}
          editing={editing}
          uri={photos[i]?.uri}
          onUriChange={onPhotoChange ? (u) => onPhotoChange(i, u) : undefined}
          caption={photos[i]?.caption}
          onCaptionChange={onCaptionChange ? (c) => onCaptionChange(i, c) : undefined}
        />
      ))}
    </View>
  );
}

export function MemoriesFooter({ editing, photos, onPhotoChange, onCaptionChange, song, onSongChange, style, transparentBg }: MemoriesFooterProps) {
  const ink = useThemedInk();
  return (
    <View style={[s.memoriesWrap, style]}>
      <MemoriesPhotoRow editing={editing} photos={photos} onPhotoChange={onPhotoChange} onCaptionChange={onCaptionChange} />
      <WindowFrame title="Our song" style={transparentBg ? { backgroundColor: 'transparent' } : undefined}>
        <View style={{ padding: 2 }}>
          {editing ? (
            <TextInput
              value={song ?? ''}
              onChangeText={onSongChange}
              placeholder="song title..."
              placeholderTextColor={ink + '88'}
              underlineColorAndroid="transparent"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              style={[s.memoriesSongInput, { color: ink }]}
            />
          ) : song ? (
            <Text style={[s.memoriesSongText, { color: ink }]}>{song}</Text>
          ) : null}
          <MusicPlayer />
        </View>
      </WindowFrame>
    </View>
  );
}

// ─── WindowFrame ──────────────────────────────────────────────
type WindowFrameProps = { title: string; children: React.ReactNode; style?: object };
export function WindowFrame({ title, children, style }: WindowFrameProps) {
  const ink = useThemedInk();
  return (
    <View style={[s.windowFrame, { borderColor: ink }, style]}>
      <View style={[s.windowTitleBar, { borderBottomColor: ink }]}>
        <Text style={[s.windowTitle, { color: ink }]}>{title}</Text>
        <View style={s.windowControls}>
          {/* heart / min / max / close as simple shapes */}
          <Svg width="11" height="11" viewBox="0 0 16 16">
            <Path
              d="M8 14 C 3 11 1 8.5 1 5.5 C 1 3.5 2.5 2 4.5 2 C 6 2 7.3 2.9 8 4.3 C 8.7 2.9 10 2 11.5 2 C 13.5 2 15 3.5 15 5.5 C 15 8.5 13 11 8 14 Z"
              fill="none" stroke={ink} strokeWidth="1.4"
            />
          </Svg>
          <Svg width="11" height="11" viewBox="0 0 11 11">
            <Path d="M2 6 L9 6" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
          <Svg width="11" height="11" viewBox="0 0 11 11">
            <Rect x="2" y="2" width="7" height="7" stroke={ink} strokeWidth="1.5" fill="none" />
          </Svg>
          <Svg width="11" height="11" viewBox="0 0 11 11">
            <Path d="M2 2 L9 9 M9 2 L2 9" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        </View>
      </View>
      <View style={s.windowBody}>{children}</View>
    </View>
  );
}

// ─── MusicPlayer ──────────────────────────────────────────────
export function MusicPlayer({ track }: { track?: string }) {
  const ink = useThemedInk();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0.62);
  const { trackRef: barRef, responder: scrubProps } = useSliderTrack(setProgress);
  return (
    <View style={s.musicPlayer}>
      {track && <Text style={[s.musicTrack, { color: ink }]}>{track}</Text>}
      <View style={s.musicScrubRow}>
        <View
          ref={barRef}
          style={[s.musicBar, { borderColor: ink }]}
          {...scrubProps}
        >
          <View style={[s.musicFill, { width: `${progress * 100}%` as any }]} />
          <View style={[s.musicThumb, { left: `${progress * 100}%` as any, borderColor: ink }]} />
        </View>
        <Svg width="18" height="18" viewBox="0 0 16 16" fill={ink}>
          <Path d="M6 2 L12 4 L12 11 A 2 2 0 1 1 10 9 L10 5 L8 4 L8 12 A 2 2 0 1 1 6 10 Z" fill={ink} />
        </Svg>
      </View>
      <View style={s.musicControls}>
        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <Path d="M3 8 a5 5 0 0 1 9 -3 M3 5 L3 8 L6 8 M13 8 a5 5 0 0 1 -9 3 M13 11 L13 8 L10 8" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
        <Svg width="16" height="16" viewBox="0 0 16 16" fill={ink}>
          <Path d="M9 4 L4 8 L9 12 Z" /><Rect x="2" y="4" width="1.6" height="8" fill={ink} />
        </Svg>
        <Pressable style={[s.musicPlayBtn, { borderColor: ink }]} onPress={() => setPlaying((p) => !p)} hitSlop={8}>
          <Svg width="9" height="9" viewBox="0 0 9 9">
            {playing ? (
              <>
                <Rect x="1.5" y="1" width="2" height="7" rx="0.5" fill={ink} />
                <Rect x="5.5" y="1" width="2" height="7" rx="0.5" fill={ink} />
              </>
            ) : (
              <Path d="M2 1 L8 4.5 L2 8 Z" fill={ink} />
            )}
          </Svg>
        </Pressable>
        <Svg width="16" height="16" viewBox="0 0 16 16" fill={ink}>
          <Path d="M7 4 L12 8 L7 12 Z" /><Rect x="12.4" y="4" width="1.6" height="8" fill={ink} />
        </Svg>
        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <Path d="M3 3 L13 13 M13 3 L3 13" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
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
  /** which side the photo sits on — lets two stacked blocks mirror each other, photos facing outward */
  photoSide?: 'left' | 'right';
  /** block + field boxes show the template's own background through instead of solid white */
  transparent?: boolean;
};
export function ProfileBlock({ who, filled = {}, onFilledChange, dicho = {}, onDichoChange, sliders = [['TRUST', 0], ['CLINGY', 0], ['JEALOUSY', 0]], onSliderChange, showPhoto, photoUri, onPhotoUriChange, photoSide = 'left', transparent }: ProfileBlockProps) {
  const ink = useThemedInk();
  const f = (field: keyof FilledState) => onFilledChange ? (v: string) => onFilledChange(field, v) : undefined;
  const d = (field: keyof DichoState) => onDichoChange ? (c: 'left' | 'right' | null) => onDichoChange(field, c) : undefined;
  return (
    <View style={[s.profileBlock, { borderColor: ink }, photoSide === 'right' && s.profileBlockReverse, transparent && { backgroundColor: 'transparent' }]}>
      {!showPhoto && <PhotoBox size={80} style={s.profilePhoto} editing={!!onFilledChange} uri={photoUri} onUriChange={onPhotoUriChange} />}
      <View style={s.profileContent}>
        <View style={s.profileTopRow}>
          <View style={[s.profileWhoTag, { borderColor: ink }]}>
            <Text style={[s.profileWhoText, { color: ink }]}>{who}</Text>
          </View>
          <TemplateField label="Age" value={filled.age} onChangeText={f('age')} valueWidth={32} keyboardType="numeric" transparent={transparent} />
          <TemplateField label="Height" value={filled.height} onChangeText={f('height')} valueWidth={44} transparent={transparent} />
        </View>
        <TemplateField label="Occupation" value={filled.occupation} onChangeText={f('occupation')} valueWidth={120} transparent={transparent} />
        <View style={s.profileDichoCol}>
          <Dichotomy left="Big spoon" right="Little spoon" choice={dicho.spoon} onChoiceChange={d('spoon')} />
          <Dichotomy left="Confident" right="Shy" choice={dicho.energy} onChoiceChange={d('energy')} />
          <Dichotomy left="PDA" right="Reserved" choice={dicho.pda} onChoiceChange={d('pda')} />
        </View>
        <View style={s.profileGoodRow}>
          <Text style={[s.profileGoodLabel, { color: ink }]}>I'm good at</Text>
          {onFilledChange !== undefined ? (
            <TextInput
              value={filled.good ?? ''}
              onChangeText={f('good')}
              placeholder="your strengths"
              placeholderTextColor={ink + '88'}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              style={[s.profileGoodInput, { color: ink }]}
            />
          ) : (
            <Text style={[s.profileGoodText, { color: ink }]}>{filled.good || '——'}</Text>
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
type TwinProfileProps = {
  who: string;
  info: [string, string?][];
  onInfoChange?: (index: number, value: string) => void;
  /** body shows the template's own background through instead of solid white */
  transparent?: boolean;
};
export function TwinProfile({ who, info, onInfoChange, transparent }: TwinProfileProps) {
  const ink = useThemedInk();
  return (
    <View style={[s.twinProfile, { borderColor: ink }, transparent && { backgroundColor: 'transparent' }]}>
      <View style={[s.twinProfileHeader, { borderBottomColor: ink }]}>
        <Text style={[s.twinProfileWho, { color: ink }]}>{who}</Text>
      </View>
      <View style={s.twinProfileBody}>
        {info.map(([k, v], i) => (
          <View key={k} style={s.twinProfileRow}>
            <Text style={[s.twinProfileKey, { color: ink }]}>{k}</Text>
            {onInfoChange ? (
              <TextInput
                value={v ?? ''}
                onChangeText={(t) => onInfoChange(i, t)}
                placeholder="——"
                placeholderTextColor={ink + '88'}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                style={[s.twinProfileVal, s.twinProfileInput, { color: ink, borderColor: ink + '55' }]}
              />
            ) : v ? (
              <Text style={[s.twinProfileVal, { color: ink }]}>{v}</Text>
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
  const ink = useThemedInk();
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
            <Path d="M45 72 L45 88 M37 80 L53 80" stroke={ink} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          ) : null}

          {/* Right half */}
          <Rect x="90" y="0" width="90" height="160" fill={FILL_GRAY_DARK} />
          {rightUri ? (
            <SvgImage x="90" y="0" width="90" height="160" href={rightUri} preserveAspectRatio="xMidYMid slice" />
          ) : editing ? (
            <Path d="M135 72 L135 88 M127 80 L143 80" stroke={ink} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          ) : null}
        </G>

        {/* Outline + divider */}
        <Path d={HEART_PATH} fill="none" stroke={ink} strokeWidth="2.2" />
        <Path d="M90 8 L90 142" stroke={ink} strokeWidth="1.4" strokeDasharray="4,4" />
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
  dualSliderWrap:    { gap: 2 },
  dualSliderLabel:   { fontFamily: FontFamily.markerBold, fontSize: sf(10), color: INK, textAlign: 'center' },
  dualSliderTrack:   { height: 9, flexDirection: 'row', borderWidth: 1.2, borderColor: INK, borderRadius: 999, overflow: 'hidden', position: 'relative' },
  dualSliderLeft:    { height: '100%', backgroundColor: INK },
  dualSliderRight:   { flex: 1, height: '100%', backgroundColor: INK + '44' },
  dualSliderDivider: { position: 'absolute', top: -2, bottom: -2, width: 1.5, backgroundColor: INK },
  polarSliderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  polarSliderLabel: { fontFamily: FontFamily.markerBold, fontSize: sf(8), textTransform: 'uppercase', letterSpacing: 0.3, lineHeight: sf(10) },
  polarSliderLabelLeft: { width: 78, textAlign: 'right' },
  polarSliderLabelRight: { width: 78, textAlign: 'left' },
  polarSliderTrack: { flex: 1, height: 8, backgroundColor: '#fff', borderWidth: 1.2, borderRadius: 999, position: 'relative' },
  polarSliderFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999, opacity: 0.75 },
  polarSliderThumb: { position: 'absolute', top: '50%' as any, marginTop: -5, marginLeft: -5, width: 10, height: 10, backgroundColor: '#fff', borderWidth: 1.2, borderRadius: 999 },
  polarSliderHeartWrap: { position: 'absolute', top: '50%' as any, marginTop: -6.5, marginLeft: -6.5 },
  polarSliderDot: { width: 13, height: 13, borderRadius: 999, borderWidth: 1.2 },
  quadrantWrap: { alignItems: 'center' },
  quadrantBox: { width: 150, height: 150, backgroundColor: '#fffdfb', borderWidth: 1.5, borderColor: INK, borderRadius: 8, position: 'relative' },
  quadrantVLine: { position: 'absolute', left: '50%', top: 8, bottom: 8, width: 1 },
  quadrantHLine: { position: 'absolute', top: '50%', left: 8, right: 8, height: 1 },
  quadrantAxis: { position: 'absolute', fontFamily: FontFamily.markerBold, fontSize: sf(8), textTransform: 'uppercase', letterSpacing: 0.4 },
  quadrantTop: { top: 4, alignSelf: 'center', left: 0, right: 0, textAlign: 'center' },
  quadrantBottom: { bottom: 4, alignSelf: 'center', left: 0, right: 0, textAlign: 'center' },
  quadrantLeft: { left: 4, top: '46%' },
  quadrantRight: { right: 4, top: '46%' },
  quadrantDot: { position: 'absolute', width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: 999, borderWidth: 1.5 },
  quadrantHeartWrap: { position: 'absolute', marginLeft: -8, marginTop: -8 },
  choiceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  choiceLabel: { flex: 1, fontFamily: FontFamily.ui, fontSize: sf(11) },
  choiceOpts: { flexDirection: 'row', gap: 5 },
  choicePill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  choicePillText: { fontFamily: FontFamily.marker, fontSize: sf(9) },
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
  memoriesWrap: { marginTop: 14, gap: 10 },
  memoriesRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 6, gap: 2 },
  memoriesSongInput: { fontFamily: FontFamily.ui, fontSize: sf(14), color: INK, marginBottom: 6, padding: 0 },
  memoriesSongText: { fontFamily: FontFamily.ui, fontSize: sf(14), color: INK, marginBottom: 6 },
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
  profileBlockReverse: { flexDirection: 'row-reverse' },
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
    lineHeight: sf(16),
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
