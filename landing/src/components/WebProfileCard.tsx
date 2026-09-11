// Re-exports ProfileCard and provides WebProfileCard compatibility wrapper
import React from 'react';
import { ProfileCard, type ProfileCardProps, type ProfileStatus } from './profile/ProfileCard';
import { pairedProps, relationshipStatus, sharingStatus } from './profile/cardProps';
import type { WebProfile, WebFoProfile } from '../lib/profile';

export { ProfileCard, type ProfileCardProps, type ProfileStatus };

type WebProfileCardProps = {
  profile: WebProfile;
  pairedFo?: WebFoProfile | null;
  followAction?: React.ReactNode;
};

export function WebProfileCard({ profile, pairedFo, followAction }: WebProfileCardProps) {
  const pairedData = pairedFo
    ? {
        name: pairedFo.name,
        pronouns: pairedFo.pronouns,
        avatarUri: pairedFo.avatarUrl,
      }
    : null;

  return (
    <ProfileCard
      name={profile.name || 'someone soft'}
      pronouns={profile.pronouns}
      username={profile.username}
      tagline={profile.tagline}
      photoUri={profile.avatarUrl}
      fallbackColor={profile.color}
      type={pairedFo?.relStatus ? relationshipStatus(pairedFo.relStatus) : undefined}
      sharing={pairedFo?.shareStatus ? sharingStatus(pairedFo.shareStatus) : undefined}
      since={pairedFo?.sinceDate}
      song={profile.song}
      songLink={profile.songLink}
      gallery={profile.gallery}
      cardBgColor={profile.cardBgColor}
      cardBgImage={profile.cardBgImage}
      cardBgGradient={profile.cardBgGradient}
      cardTransparent={profile.cardTransparent}
      textColor={profile.textColor}
      borderStyle={profile.borderStyle}
      nameFont={profile.nameFont}
      flags={profile.flags}
      links={profile.links}
      {...pairedProps(pairedData)}
      followerCount={profile.followerCount}
      followingCount={profile.followingCount}
      followAction={followAction}
    />
  );
}
