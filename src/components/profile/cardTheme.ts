// Shared shape for profile-card presentation customization — same fields for
// the "me" profile (stored in global settings) and each F/O profile (stored
// on the fo table), so one sheet/component can theme either.
export type CardTheme = {
  pageBgColor: string;
  pageBgImage: string;
  cardBgColor: string;
  cardBgImage: string;
  textColor: string;
};
