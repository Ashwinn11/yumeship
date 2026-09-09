import { Link } from 'react-router-dom';
import type { ProfileFlag } from '../../lib/profile';
import { FlagIcon, SEXUALITY_OPTIONS } from './ProfileFlags';

const BY_KEY = new Map(SEXUALITY_OPTIONS.map((o) => [o.key, o]));

type Props = {
  id?: string;
  href?: string;
  name: string;
  avatarUri?: string;
  pronouns?: string;
  bio?: string;
  flags?: ProfileFlag[];
  onClick?: () => void;
};

/** F/O preview card shown in the horizontal row on a profile — matching mobile app FoAvatarCard */
export function FoAvatarCard({ id, href, name, avatarUri, pronouns, bio, flags = [], onClick }: Props) {
  const first = flags.find((f) => f.imageUrl || BY_KEY.get(f.flag?.toLowerCase())?.colors || f.flag) ?? null;
  const stripes = first ? BY_KEY.get(first.flag?.toLowerCase())?.colors : undefined;
  const initial = name.trim().charAt(0).toUpperCase() || '♡';
  const targetHref = href || (id ? `/fo/${id}` : undefined);

  const content = (
    <>
      <div className="fo-card-avatar" style={{ backgroundColor: '#f3b6c4' }}>
        {avatarUri ? (
          <img src={avatarUri} alt={name} className="fo-card-avatar-img" loading="lazy" />
        ) : (
          <span className="fo-card-avatar-initial">{initial}</span>
        )}
      </div>
      <div className="fo-card-name" title={name}>{name || 'untitled'}</div>
      <div className="fo-card-pronouns-row">
        {!!pronouns && <span className="fo-card-pronouns">{pronouns}</span>}
      </div>
      <div className="fo-card-flag-row">
        {first?.imageUrl ? (
          <img src={first.imageUrl} alt="" className="fo-card-flag-img" />
        ) : stripes ? (
          <FlagIcon colors={stripes} width={18} height={12} />
        ) : first?.flag ? (
          <span className="fo-card-flag-glyph">{first.flag}</span>
        ) : null}
      </div>
      <div className="fo-card-bio">{bio ?? ''}</div>
    </>
  );

  if (targetHref) {
    return (
      <Link to={targetHref} className="fo-card" onClick={onClick} title={`View ${name || 'F/O'}'s profile`}>
        {content}
      </Link>
    );
  }

  return (
    <div className="fo-card" onClick={onClick}>
      {content}
    </div>
  );
}
