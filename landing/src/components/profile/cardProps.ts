// Web mirror of src/components/profile/cardProps.ts
// Derived-prop builders shared across profile cards.

import { RelationshipColors, RelationshipLabels, SharingColors, SharingLabels } from '../../constants/theme';
import type { ProfileStatus } from './ProfileCard';

/** The F/O "type" badge — same derivation whether the F/O is local or public. */
export function relationshipStatus(relStatus: string): ProfileStatus {
  return {
    label: RelationshipLabels[relStatus as keyof typeof RelationshipLabels] ?? relStatus,
    color: RelationshipColors[relStatus as keyof typeof RelationshipColors] ?? RelationshipColors.romantic,
  };
}

/** The F/O "sharing" badge — same derivation whether the F/O is local or public. */
export function sharingStatus(shareStatus: string): ProfileStatus {
  return {
    label: SharingLabels[shareStatus as keyof typeof SharingLabels] ?? shareStatus,
    color: SharingColors[shareStatus as keyof typeof SharingColors] ?? SharingColors.selective,
  };
}

export type PairedSource = {
  name: string;
  pronouns: string;
  avatarUri: string;
} | null | undefined;

/**
 * Spreads a paired F/O (or lack of one) into ProfileCard's separate
 * `paired*` props. Identical to mobile cardProps.ts.
 */
export function pairedProps(paired: PairedSource) {
  return {
    showPairedIdentity: !!paired,
    pairedName: paired?.name,
    pairedPronouns: paired?.pronouns,
    pairedAvatarUri: paired?.avatarUri,
  };
}
