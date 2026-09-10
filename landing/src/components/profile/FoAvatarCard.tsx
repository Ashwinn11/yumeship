import { Link } from 'react-router-dom';

type Props = {
  id?: string;
  href?: string;
  name: string;
  avatarUri?: string;
  tagline?: string;
  onClick?: () => void;
};

/** F/O preview card shown in the horizontal row on a profile — name and bio only, matching mobile app FoAvatarCard */
export function FoAvatarCard({ id, href, name, avatarUri, tagline, onClick }: Props) {
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
      <div className="fo-card-bio">{tagline ?? ''}</div>
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
