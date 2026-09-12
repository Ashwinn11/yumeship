import { Colors } from '@/constants/theme';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

// design/components.jsx — I (inline icon set)
// All icons 14×14, 1.3–1.4px stroke, round caps/joins, no fill

type IconProps = {
  size?: number;
  color?: string;
};

export function IconPlus({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path d="M7 1.5v11M1.5 7h11" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

export function IconPalette({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M7 1.5a5.5 5.5 0 1 0 0 11c.7 0 1.2-.6 1.2-1.2 0-.3-.15-.6-.35-.8-.2-.2-.35-.5-.35-.8 0-.66.55-1.2 1.2-1.2h1.4A2.9 2.9 0 0 0 13 5.6c0-2.3-2.7-4.1-6-4.1Z"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <Circle cx="4.3" cy="5.6" r="0.85" fill={color} />
      <Circle cx="7" cy="4" r="0.85" fill={color} />
      <Circle cx="9.7" cy="5.6" r="0.85" fill={color} />
    </Svg>
  );
}

export function IconChevronLeft({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path d="M8.5 2.5L4.5 7l4 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconHeart({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M7 12C3 9 1.5 7.2 1.5 4.8c0-1.5 1.2-2.8 2.8-2.8 1 0 1.9.5 2.7 1.5C7.8 2.5 8.7 2 9.7 2c1.6 0 2.8 1.3 2.8 2.8C12.5 7.2 11 9 7 12z"
        stroke={color} strokeWidth="1.3" fill="none"
      />
    </Svg>
  );
}

export function IconBookmark({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path d="M3 1.5h8v11l-4-2.5-4 2.5v-11z" stroke={color} strokeWidth="1.3" fill="none" />
    </Svg>
  );
}

export function IconSend({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M1.5 7 12.5 1.5 9.5 12.5 7 8 1.5 7z"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconEdit({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M2 11l1-3 7-7 2 2-7 7-3 1zM8.5 2.5l2 2"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconMoon({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M11.5 8.5A4.5 4.5 0 0 1 5.5 2.5 5 5 0 1 0 11.5 8.5z"
        stroke={color} strokeWidth="1.3" fill="none"
      />
    </Svg>
  );
}

export function IconBell({ size = 14, color = Colors.ink, solid = false }: IconProps & { solid?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M3 10V6.5a4 4 0 1 1 8 0V10l1 1.5H2L3 10zM5.5 12.5a1.5 1.5 0 0 0 3 0"
        stroke={color} strokeWidth="1.3" fill={solid ? color : 'none'} strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A tilted thumbtack, same "pinned" glyph WhatsApp/Telegram/Instagram use —
 *  not a map-pin teardrop, which reads as "location" instead. */
export function IconPin({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <G rotation={45} origin="7, 7">
        <Path
          d="M5.3 2.4h3.4l-.35 3.35 1.55 1.55H4.1l1.55-1.55-.35-3.35z"
          stroke={color}
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Path d="M7 7.3v4.3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

/** A die, for "use this template" on a shared bingo card — same 14×14/1.3
 *  stroke convention as the rest of the set, replacing a raw 🎲 emoji. */
export function IconDice({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Rect x="1.5" y="1.5" width="11" height="11" rx="2.5" stroke={color} strokeWidth="1.3" />
      <Circle cx="4.4" cy="4.4" r="0.9" fill={color} />
      <Circle cx="9.6" cy="4.4" r="0.9" fill={color} />
      <Circle cx="7" cy="7" r="0.9" fill={color} />
      <Circle cx="4.4" cy="9.6" r="0.9" fill={color} />
      <Circle cx="9.6" cy="9.6" r="0.9" fill={color} />
    </Svg>
  );
}

export function IconSearch({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Circle cx="6" cy="6" r="4.2" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M9.5 9.5l3 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  );
}

export function IconLock({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Rect x="2.5" y="6.5" width="9" height="6.5" rx="1.2" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M4.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2" stroke={color} strokeWidth="1.3" fill="none" />
    </Svg>
  );
}

// ─── Custom Cozy Outline Icons ───────────────────────────────────────────────

export function IconHomeOutline({ size = 20, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M2 6.5L8 2L14 6.5V14H2V6.5Z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 14V9H10V14"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconJournalOutline({ size = 20, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 13.5C6.5 12.2 4.5 12.2 2 12.2V2.5C4.5 2.5 6.5 2.5 8 3.8C9.5 2.5 11.5 2.5 14 2.5v9.7c-2.5 0-4.5 0-6 1.3Z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 3.8v9.7"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconMailOutline({ size = 20, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Rect
        x="2"
        y="3.5"
        width="12"
        height="9"
        rx="1.5"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 4.5L8 8.5L14 4.5"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconProfileOutline({ size = 20, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle
        cx="8"
        cy="5"
        r="2.5"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 13.5A5 5 0 0 1 13 13.5"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconCommunityOutline({ size = 20, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M5 13.5a4 4 0 0 1 8 0"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="9"
        cy="5.5"
        r="2.2"
        stroke={color}
        strokeWidth="1.4"
      />
      <Path
        d="M2 13.5a3 3 0 0 1 4.5-2.6"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <Circle
        cx="5"
        cy="6.2"
        r="1.8"
        stroke={color}
        strokeWidth="1.4"
      />
    </Svg>
  );
}


// ─── Custom Solid Pink Icons ──────────────────────────────────────────────────

export function IconBellSolid({ size = 14, color = Colors.sakuraDeep }: IconProps) {
  return <IconBell size={size} color={color} solid />;
}

export function IconTicketSolid({ size = 14, color = Colors.sakuraDeep }: IconProps) {
  // Filled star — premium subscription
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <Path d="M8 1.5l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.1l-3.8 2.2.7-4.3-3.1-3 4.3-.6z" />
    </Svg>
  );
}

export function IconRestoreSolid({ size = 14, color = Colors.sakuraDeep }: IconProps) {
  // Filled clock — restore/history
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <Path fillRule="evenodd" d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Zm.75 3a.75.75 0 0 0-1.5 0v3.25c0 .27.14.52.37.65l2.5 1.5a.75.75 0 0 0 .76-1.3L8.75 7.9V5Z" clipRule="evenodd" />
    </Svg>
  );
}

export function IconStorageSolid({ size = 14, color = Colors.sakuraDeep }: IconProps) {
  // Three stacked layers — storage
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <Path d="M8 1.5C4.96 1.5 2 2.57 2 4s2.96 2.5 6 2.5S14 5.43 14 4 11.04 1.5 8 1.5Z" />
      <Path d="M2 6.25v2.25C2 9.93 4.96 11 8 11s6-1.07 6-2.5V6.25C12.7 7.3 10.45 7.75 8 7.75s-4.7-.45-6-1.5Z" />
      <Path d="M2 10.5v1.75C2 13.68 4.96 14.5 8 14.5s6-.82 6-2.25V10.5C12.7 11.55 10.45 12 8 12s-4.7-.45-6-1.5Z" />
    </Svg>
  );
}

export function IconTrashSolid({ size = 14, color = Colors.sakuraDeep }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <Path d="M5.5 1a1 1 0 0 0-1 1H1.5a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1h-3a1 1 0 0 0-1-1h-5ZM2.5 4h11v9.5a1.5 1.5 0 0 1-1.5 1.5h-8a1.5 1.5 0 0 1-1.5-1.5V4Z" />
    </Svg>
  );
}

export function IconDocumentSolid({ size = 14, color = Colors.sakuraDeep }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <Path d="M2.5 1.5A1.5 1.5 0 0 1 4 0h5.3a1.5 1.5 0 0 1 1 .4l3.8 3.8a1.5 1.5 0 0 1 .4 1V14.5a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5v-13Zm1.5 0v13h8v-9H9a1 1 0 0 1-1-1v-3H4Z" />
    </Svg>
  );
}

export function IconExport({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M8 1v8M5 4l3-3 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 10v3.5A1.5 1.5 0 0 0 3.5 15h9A1.5 1.5 0 0 0 14 13.5V10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function IconLockSolid({ size = 14, color = Colors.sakuraDeep }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <Path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H3.5A1.5 1.5 0 0 0 2 7.5v6A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 12.5 6H11.5V4.5A3.5 3.5 0 0 0 8 1Zm2 5V4.5a2 2 0 1 0-4 0V6h4Z" clipRule="evenodd" />
    </Svg>
  );
}

export function IconPhoto({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        rx="2"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="5"
        cy="5"
        r="1.2"
        stroke={color}
        strokeWidth="1.3"
      />
      <Path
        d="M1.5 11l4-4 4.5 4.5M8 9.5l3.5-3.5 3 3"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
