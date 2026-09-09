import { FoAvatarCard } from './profile/FoAvatarCard';
import type { WebFoProfile } from '../lib/profile';

export { FoAvatarCard };

export function WebFoAvatarCard({ fo }: { fo: WebFoProfile }) {
  return (
    <FoAvatarCard
      name={fo.name}
      avatarUri={fo.avatarUrl}
      pronouns={fo.pronouns}
      bio={fo.bio}
      flags={fo.flags}
    />
  );
}
