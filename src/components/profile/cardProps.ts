import { RelationshipColors, RelationshipLabels, SharingColors, SharingLabels } from '@/constants/theme';
import type { ProfileStatus } from './ProfileCard';

/**
 * Derived-prop builders shared by every ProfileCard caller (own profile, own
 * F/O, public profile, public F/O), so a field can't be added to one screen and
 * missed on its counterpart — the exact failure that left the local profile
 * screen showing no follower/following counts while the public one had them.
 * Each screen still passes its own 1:1 fields (name, bio, photo…) directly;
 * only the values that involve a lookup or a shape transform go through here.
 */


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
 * `paired*` props. A missing field here is exactly what silently drops
 * "profile identify" pairing on one screen while another still shows it.
 */
export function pairedProps(paired: PairedSource) {
  return {
    showPairedIdentity: !!paired,
    pairedName: paired?.name,
    pairedPronouns: paired?.pronouns,
    pairedAvatarUri: paired?.avatarUri,
  };
}
