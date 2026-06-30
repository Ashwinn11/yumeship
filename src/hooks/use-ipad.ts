import { useWindowDimensions } from 'react-native';

const IPAD_BREAKPOINT = 768;
const MAX_CONTENT_WIDTH = 760;

export function useIPad() {
  const { width } = useWindowDimensions();
  const isIPad = width >= IPAD_BREAKPOINT;

  // Scale multiplier for icon sizes, image dimensions, etc.
  const scale = isIPad ? 1.22 : 1.0;

  // Put on ScrollView's contentContainerStyle — makes content fill height so centering works
  const scrollFill = isIPad
    ? ({ flexGrow: 1 as const, justifyContent: 'center' as const })
    : undefined;

  // Wrap all ScrollView children AND the fixed actions bar with this to constrain + center
  const column = isIPad
    ? ({ maxWidth: MAX_CONTENT_WIDTH, width: '100%' as const, alignSelf: 'center' as const })
    : undefined;

  return { isIPad, scale, scrollFill, column };
}
