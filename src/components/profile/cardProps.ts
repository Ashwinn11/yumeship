import { RelationshipColors, SharingColors } from '@/constants/theme';
import type { ProfileStatus } from './ProfileCard';

/**
 * Derived-prop builders shared by every ProfileCard caller (own profile, own
 * F/O, public profile, public F/O), so a field can't be added to one screen and
 * missed on its counterpart — the exact failure that left the local profile
 * screen showing no follower/following counts while the public one had them.
 * Each screen still passes its own 1:1 fields (name, bio, photo…) directly;
 * only the values that involve a lookup or a shape transform go through here.
 */

const REL_LABEL: Record<string, string> = { romantic: 'romantic', platonic: 'platonic', familial: 'familial' };
const SHARE_LABEL: Record<string, string> = { yes: 'Yes', no: 'No', selective: 'Selective' };

/** The F/O "type" badge — same derivation whether the F/O is local or public. */
export function relationshipStatus(relStatus: string): ProfileStatus {
  return {
    label: REL_LABEL[relStatus] ?? relStatus,
    color: RelationshipColors[relStatus as keyof typeof RelationshipColors] ?? RelationshipColors.romantic,
  };
}

/** The F/O "sharing" badge — same derivation whether the F/O is local or public. */
export function sharingStatus(shareStatus: string): ProfileStatus {
  return {
    label: SHARE_LABEL[shareStatus] ?? shareStatus,
    color: SharingColors[shareStatus as keyof typeof SharingColors] ?? SharingColors.selective,
  };
}

export type PairedSource = {
  name: string;
  pronouns: string;
  avatarUri: string;
  statusLabel: string;
} | null | undefined;

/**
 * Spreads a paired F/O (or lack of one) into ProfileCard's five separate
 * `paired*` props. A missing field here is exactly what silently drops
 * "profile identify" pairing on one screen while another still shows it.
 */
export function pairedProps(paired: PairedSource) {
  return {
    showPairedIdentity: !!paired,
    pairedName: paired?.name,
    pairedPronouns: paired?.pronouns,
    pairedAvatarUri: paired?.avatarUri,
    pairedStatusLabel: paired?.statusLabel,
  };
}
