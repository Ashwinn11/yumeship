import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchProfileByUsername,
  fetchUserFoProfiles,
  type WebProfile,
  type WebFoProfile,
} from '../lib/profile';
import { ProfileCard } from '../components/profile/ProfileCard';
import { AboutSection } from '../components/profile/AboutSection';
import { ProfileMediaGrid } from '../components/profile/ProfileMediaGrid';
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
  const navigate = useNavigate();
  // Support both /@username and /username — strip the leading @
  const username = handle.replace(/^@/, '');

  function handleBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  }
  const [profile, setProfile] = useState<WebProfile | null | undefined>(undefined); // undefined = loading
  const [fos, setFos] = useState<WebFoProfile[]>([]);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;

    // reset to "loading" before the async fetch below settles, so a changed
    // username doesn't briefly show the previous user's stale profile
    // oxlint-disable-next-line react/set-state-in-effect
    setProfile(undefined);
    setFos([]);

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
        <ProfileScreenHeader onBack={handleBack} title={profile?.name || 'their profile'} />

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
                tagline={profile.tagline}
                photoUri={profile.avatarUrl}
                fallbackColor={profile.color}
                cardBgColor={profile.cardBgColor}
                cardBgImage={profile.cardBgImage}
                cardBgGradient={profile.cardBgGradient}
                cardTransparent={profile.cardTransparent}
                textColor={profile.textColor}
                borderStyle={profile.borderStyle}
                nameFont={profile.nameFont}
                cardLayout={profile.cardLayout}
                blinkies={profile.blinkies}
                flags={profile.flags}
                links={profile.links}
                followerCount={profile.followerCount}
                followingCount={profile.followingCount}
              />
              <AboutSection
                about={profile.about}
                cardBgColor={profile.cardBgColor}
                cardBgImage={profile.cardBgImage}
                cardBgGradient={profile.cardBgGradient}
                cardTransparent={profile.cardTransparent}
                textColor={profile.textColor}
                borderStyle={profile.borderStyle}
              />
              <ProfileMediaGrid songs={profile.songs} gallery={profile.gallery} textColor={profile.textColor} />

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
                        tagline={fo.tagline}
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
