import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchProfileByUsername,
  fetchUserFoProfiles,
  fetchFoProfile,
  type WebProfile,
  type WebFoProfile,
} from '../lib/profile';
import { ProfileCard } from '../components/profile/ProfileCard';
import { pairedProps } from '../components/profile/cardProps';
import { FoAvatarCard } from '../components/profile/FoAvatarCard';
import { ProfileScreenHeader } from '../components/profile/ProfileScreenHeader';
import { CreateProfileCta } from '../components/profile/CreateProfileCta';
import { Sakura } from '../components/deco/Sakura';
import { Sparkle } from '../components/deco/Sparkle';

function ProfileSkeleton() {
  return (
    <div className="profile-skeleton">
      <div className="skeleton-avatar" />
      <div className="skeleton-name" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  );
}

function NotFound({ username }: { username: string }) {
  return (
    <div className="profile-not-found">
      <p className="not-found-emoji">✦</p>
      <p className="not-found-text">@{username} doesn't exist here</p>
      <p className="not-found-sub">the profile may have been removed or the username is incorrect</p>
    </div>
  );
}

export function ProfilePage() {
  const { handle = '' } = useParams<{ handle: string }>();
  // Support both /@username and /username — strip the leading @
  const username = handle.replace(/^@/, '');
  const [profile, setProfile] = useState<WebProfile | null | undefined>(undefined); // undefined = loading
  const [fos, setFos] = useState<WebFoProfile[]>([]);
  const [pairedFo, setPairedFo] = useState<WebFoProfile | null>(null);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;

    setProfile(undefined);
    setFos([]);
    setPairedFo(null);

    // Resolve username → profile + fo list
    fetchProfileByUsername(username).then(async (p) => {
      if (cancelled) return;
      setProfile(p);
      if (!p) return;

      // Update meta tags
      document.title = `${p.name || username} (@${p.username}) · YumeShip`;
      const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = document.title;
      const ogImg = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
      if (ogImg && p.avatarUrl) ogImg.content = p.avatarUrl;

      const foList = await fetchUserFoProfiles(p.id);
      if (cancelled) return;
      setFos(foList);

      if (p.identifyFoId) {
        const inList = foList.find((f) => f.id === p.identifyFoId);
        if (inList) {
          setPairedFo(inList);
        } else {
          const fo = await fetchFoProfile(p.identifyFoId);
          if (!cancelled) setPairedFo(fo);
        }
      }
    });

    return () => { cancelled = true; };
  }, [username]);

  // Page background from profile theme
  const pageBgStyle: React.CSSProperties = profile
    ? profile.pageBgImage
      ? { backgroundImage: `url(${profile.pageBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : profile.pageBgColor
        ? { backgroundColor: profile.pageBgColor }
        : {}
    : {};

  const isLoading = profile === undefined;
  const notFound = profile === null;

  return (
    <main className="profile-page" style={pageBgStyle}>
      {/* Corner decorations matching mobile app */}
      <div className="deco-tl" aria-hidden="true">
        <Sakura size={24} color="#f3b6c4" />
      </div>
      <div className="deco-br" aria-hidden="true">
        <Sparkle size={16} color="#8b6fc4" />
      </div>

      <div className="profile-container">
        <ProfileScreenHeader
          title={profile?.name || 'their profile'}
          right={
            profile ? (
              <a
                href={`yumeship://user/${profile.id}`}
                className="header-round-btn"
                title="Open in app"
              >
                <span className="header-btn-dots">⋯</span>
              </a>
            ) : undefined
          }
        />

        <div className="profile-body-content">
          {isLoading && <ProfileSkeleton />}
          {notFound && <NotFound username={username} />}
          {profile && (
            <>
              {/* Profile Card Sections — 1:1 props matching mobile app */}
              <ProfileCard
                name={profile.name || 'someone soft'}
                pronouns={profile.pronouns}
                username={profile.username}
                bio={profile.bio}
                tagline={profile.tagline}
                photoUri={profile.avatarUrl}
                fallbackColor={profile.color}
                height={profile.height}
                weight={profile.weight}
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
                {...pairedProps(
                  pairedFo && {
                    name: pairedFo.name,
                    pronouns: pairedFo.pronouns,
                    avatarUri: pairedFo.avatarUrl,
                  }
                )}
                followerCount={profile.followerCount}
                followingCount={profile.followingCount}
                followAction={
                  <a
                    href={`yumeship://user/${profile.id}`}
                    className="open-in-app-pill"
                    aria-label="Open in YumeShip app"
                  >
                    open in app ✦
                  </a>
                }
              />

              <p className="profile-footnote">this is you, in their world ♡</p>

              {/* F/Os Section */}
              {fos.length > 0 && (
                <div className="profile-posts-block">
                  <h2 className="profile-posts-label">f/os</h2>
                  <div className="fo-strip">
                    {fos.map((fo) => (
                      <FoAvatarCard
                        key={fo.id}
                        id={fo.id}
                        href={`/@${username}/${fo.id}`}
                        name={fo.name}
                        avatarUri={fo.avatarUrl}
                        pronouns={fo.pronouns}
                        bio={fo.bio}
                        flags={fo.flags}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement CTA */}
              <CreateProfileCta />
            </>
          )}
        </div>

        {/* Soft footer attribution */}
        <footer className="profile-page-footer">
          <a href="/" className="profile-footer-link">
            <img src="/assets/icon.png" alt="YumeShip" className="profile-footer-icon" />
            YumeShip
          </a>
          <span className="profile-footer-sep">·</span>
          <a
            href="https://apps.apple.com/app/yumeship-anime-kpop-canon/id6773642234"
            target="_blank"
            rel="noopener noreferrer"
            className="profile-footer-link"
          >
            download the app
          </a>
        </footer>
      </div>
    </main>
  );
}
