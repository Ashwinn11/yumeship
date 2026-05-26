import { Colors } from '@/constants/theme';

// Returns a fixed light-mode color map shaped for the Expo starter components.
// This app is light-only; dark mode is not designed yet.
export function useTheme() {
  return {
    text:                Colors.ink,
    background:          Colors.paper,
    backgroundElement:   Colors.paperDeep,
    backgroundSelected:  Colors.paperSoft,
    textSecondary:       Colors.ink3,
  } as const;
}
