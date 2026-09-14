import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchFoProfile, type WebFoProfile } from '../lib/profile';
import { ProfileCard } from '../components/profile/ProfileCard';
import { AboutSection } from '../components/profile/AboutSection';
import { ProfileMediaGrid } from '../components/profile/ProfileMediaGrid';
import { relationshipStatus, sharingStatus } from '../components/profile/cardProps';
import { ProfileScreenHeader } from '../components/profile/ProfileScreenHeader';
import { CreateProfileCta } from '../components/profile/CreateProfileCta';
import { Sakura } from '../components/deco/Sakura';
import { Sparkle } from '../components/deco/Sparkle';
import { Colors } from '../constants/theme';

function FoSkeleton() {
  return (
    <div className="profile-skeleton">
      <div className="skeleton-avatar" />
      <div className="skeleton-name" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="profile-not-found">
      <p className="not-found-emoji">✦</p>
      <p className="not-found-text">this f/o profile isn't available</p>
      <p className="not-found-sub">the profile may be private or the link is incorrect</p>
    </div>
  );
}

export function FoProfilePage() {
  const { handle = '', id = '' } = useParams<{ handle?: string; id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<WebFoProfile | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    // reset to "loading" before the async fetch below settles, so a changed
    // id doesn't briefly show the previous F/O's stale profile
    // oxlint-disable-next-line react/set-state-in-effect
    setProfile(undefined);

    fetchFoProfile(id).then((p) => {
      if (cancelled) return;
      setProfile(p);
      if (!p) return;

      // Update meta tags
      const handlePrefix = handle ? `@${handle.replace(/^@/, '')}'s ` : '';
      document.title = `${p.name || 'F/O'}${p.fandom ? ` (${p.fandom})` : ''} · ${handlePrefix}YumeShip`;
      const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = document.title;
      const ogImg = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
      if (ogImg && p.avatarUrl) ogImg.content = p.avatarUrl;
    });

    return () => { cancelled = true; };
  }, [id, handle]);

  const pageBgStyle: React.CSSProperties = profile
    ? profile.pageBgImage
      ? { backgroundImage: `url(${profile.pageBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : profile.pageBgColor
        ? { backgroundColor: profile.pageBgColor }
        : {}
    : {};

  const isLoading = profile === undefined;
  const notFound = profile === null;

  function handleBack() {
    if (handle) {
      const clean = handle.startsWith('@') ? handle : `@${handle}`;
      navigate(`/${clean}`);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }

  return (
    <main className="profile-page" style={pageBgStyle}>
      {/* Corner decorations */}
      <div className="deco-tl" aria-hidden="true">
        <Sakura size={24} color="#f3b6c4" />
      </div>
      <div className="deco-br" aria-hidden="true">
        <Sparkle size={16} color="#8b6fc4" />
      </div>

      <div className="profile-container">
        <ProfileScreenHeader onBack={handleBack} title={profile?.name || 'their profile'} />

        <div className="profile-body-content">
          {isLoading && <FoSkeleton />}
          {notFound && <NotFound />}
          {profile && (
            <>
              {/* F/O Profile Card — 1:1 props matching mobile app PublicFoProfileScreen */}
              <ProfileCard
                name={profile.name || 'untitled'}
                pronouns={profile.pronouns}
                subtitle={profile.fandom} // F/O fandom shown as subtitle; NO username!
                tagline={profile.tagline}
                photoUri={profile.avatarUrl}
                fallbackColor={profile.color || Colors.lavender}
                type={relationshipStatus(profile.relStatus)}
                sharing={sharingStatus(profile.shareStatus)}
                since={profile.sinceDate}
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
              />
              <AboutSection about={profile.about} />
              <ProfileMediaGrid songs={profile.songs} gallery={profile.gallery} textColor={profile.textColor} />

              {/* Engagement CTA */}
              <CreateProfileCta />
            </>
          )}
        </div>

        {/* Soft footer attribution — uses single /assets/icon.png */}
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
