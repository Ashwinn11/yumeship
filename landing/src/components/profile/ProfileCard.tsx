import React, { useRef, useState, useEffect } from 'react';
import { Colors } from '../../constants/theme';
import { Heart } from '../deco/Heart';
import { WashiTape } from '../deco/WashiTape';
import { StickerCassette } from '../deco/StickerCassette';
import { LaceFrame } from '../deco/LaceFrame';
import { PatternBackdrop } from '../deco/PatternBackdrop';
import { ProfileFlags } from './ProfileFlags';
import { Polaroid } from './Polaroid';
import { parseBorderFrame, type ProfileFlag } from './cardTheme';
import type { GalleryPhoto } from '../../lib/profile';

const POLAROID_TAPES = [Colors.sakura, Colors.lavender, Colors.butter, Colors.sage, Colors.peach];

const PILL_SOFT_BY_DEEP: Record<string, string> = {
  [Colors.sakuraDeep]: Colors.sakuraSoft,
  [Colors.sageDeep]: Colors.sageSoft,
  [Colors.peachDeep]: Colors.peachSoft,
  [Colors.lavenderDeep]: Colors.lavenderSoft,
  [Colors.butterDeep]: Colors.butterSoft,
  [Colors.ember]: Colors.paperDeep,
};

export type ProfileStatus = { label: string; color: string };

export type ProfileCardProps = {
  name: string;
  pronouns?: string;
  /** unique public handle, e.g. "ashwin" — rendered as "@ashwin" near pronouns */
  username?: string;
  /** small line under the name, e.g. the F/O's source/fandom */
  subtitle?: string;
  bio?: string;
  /** short bio shown on the card itself, under the name/handle */
  tagline?: string;
  photoUri?: string;
  /** avatar backdrop when there's no photo */
  fallbackColor?: string;
  /** relation status — F/O only, shown in the details grid labeled "type" */
  type?: ProfileStatus;
  /** sharing status — F/O only, shown in the details grid labeled "sharing" */
  sharing?: ProfileStatus;
  height?: string;
  weight?: string;
  /** free text — F/O ages are as often "looks 20, actually 900" as a number */
  age?: string;
  /** free text — usually a day with no year, e.g. "March 3" */
  birthday?: string;
  /** theme song shown in its own row */
  song?: string;
  /** optional Spotify/YouTube/etc link — makes the song row tappable */
  songLink?: string;
  /** extra photos rendered as a scattered polaroid strip */
  gallery?: GalleryPhoto[];
  /** hero-card presentation customization */
  cardBgColor?: string;
  cardBgImage?: string;
  /** two comma-joined hex colors — wins over cardBgColor when set */
  cardBgGradient?: string;
  /** no hero fill at all — the page background shows through */
  cardTransparent?: boolean;
  textColor?: string;
  /** comma-joined border-frame accents: '' (none) | 'lace' | 'pattern' | 'lace,pattern' */
  borderStyle?: string;
  /** '' default display font | 'script' | 'marker' | 'klee' */
  nameFont?: string;
  /** everything they fly under the name */
  flags?: ProfileFlag[];
  /** community follower/following counts, rendered under pronouns */
  followerCount?: number;
  followingCount?: number;
  /** follow/unfollow button slot, rendered under the counts */
  followAction?: React.ReactNode;
  /** "profile identify" — show [me] ♡ [F/O] paired avatars instead of the solo one */
  showPairedIdentity?: boolean;
  pairedName?: string;
  pairedPronouns?: string;
  pairedAvatarUri?: string;
  pairedFallbackColor?: string;
};

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="section-label-row">
      <Heart size={9} color={Colors.sakuraDeep} outline />
      <span className="section-label-title">{children}</span>
    </div>
  );
}

function normalizeUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function ProfileCard({
  name,
  pronouns,
  username,
  subtitle,
  bio,
  tagline,
  photoUri,
  fallbackColor = Colors.sakura,
  type,
  sharing,
  height,
  weight,
  age,
  birthday,
  song,
  songLink,
  gallery = [],
  cardBgColor,
  cardBgImage,
  cardBgGradient,
  cardTransparent,
  textColor,
  borderStyle = '',
  nameFont = '',
  flags = [],
  followerCount,
  followingCount,
  followAction,
  showPairedIdentity,
  pairedName,
  pairedPronouns,
  pairedAvatarUri,
  pairedFallbackColor = Colors.lavender,
}: ProfileCardProps) {
  const stats = [
    type ? { label: 'type', value: type.label, color: type.color, pill: true } : null,
    sharing ? { label: 'sharing', value: sharing.label, color: sharing.color, pill: true } : null,
    age ? { label: 'age', value: age } : null,
    birthday ? { label: 'birthday', value: birthday } : null,
    height ? { label: 'height', value: height } : null,
    weight ? { label: 'weight', value: weight } : null,
  ].filter(Boolean) as { label: string; value: string; color?: string; pill?: boolean }[];

  const textStyle: React.CSSProperties | undefined = textColor ? { color: textColor } : undefined;
  const nameFontClass = nameFont ? `name-font-${nameFont}` : '';

  const { lace: hasLace, pattern: hasPattern } = parseBorderFrame(borderStyle);

  // Measure hero card for SVG overlays (lace / pattern)
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroSize, setHeroSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!heroRef.current) return;
    const updateSize = () => {
      if (heroRef.current) {
        setHeroSize({
          width: heroRef.current.offsetWidth,
          height: heroRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  let heroBgStyle: React.CSSProperties = {};
  if (!cardTransparent) {
    if (cardBgGradient) {
      const [c1, c2] = cardBgGradient.split(',').filter(Boolean);
      if (c1 && c2) {
        heroBgStyle = { background: `linear-gradient(135deg, ${c1}, ${c2})` };
      }
    } else if (cardBgColor) {
      heroBgStyle = { backgroundColor: cardBgColor };
    }
  }

  const initial = name.trim().charAt(0).toUpperCase() || '♡';
  const pairedInitial = (pairedName ?? '').trim().charAt(0).toUpperCase() || '♡';

  return (
    <div className="profile-card-container">
      {/* ── Hero: identity only — everything else lives in its own section below ── */}
      <div className="hero-wrap">
        <div
          ref={heroRef}
          className={[
            'hero-card',
            cardTransparent ? 'hero-transparent' : '',
            hasLace ? 'hero-lace-border' : '',
          ].filter(Boolean).join(' ')}
          style={heroBgStyle}
        >
          {cardBgImage && (
            <>
              <div
                className="hero-bg-image"
                style={{ backgroundImage: `url(${cardBgImage})` }}
              />
              <div className="hero-image-overlay" />
            </>
          )}

          {hasPattern && heroSize.width > 0 && (
            <PatternBackdrop width={heroSize.width} height={heroSize.height} />
          )}

          <div className="hero-content">
            {showPairedIdentity ? (
              <div className="paired-wrap">
                <div className="paired-avatar-outer">
                  <div className="paired-avatar" style={{ backgroundColor: fallbackColor }}>
                    {photoUri ? (
                      <img src={photoUri} alt={name} className="paired-avatar-img" />
                    ) : (
                      <span className="paired-avatar-initial">{initial}</span>
                    )}
                  </div>
                </div>
                <div className="paired-heart-badge">
                  <Heart size={13} color={Colors.sakuraDeep} />
                </div>
                <div className="paired-avatar-outer">
                  <div className="paired-avatar" style={{ backgroundColor: pairedFallbackColor }}>
                    {pairedAvatarUri ? (
                      <img src={pairedAvatarUri} alt={pairedName || ''} className="paired-avatar-img" />
                    ) : (
                      <span className="paired-avatar-initial">{pairedInitial}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="avatar-outer">
                <div className="avatar-wrap">
                  <div className="avatar-circle" style={{ backgroundColor: fallbackColor }}>
                    {photoUri ? (
                      <img src={photoUri} alt={name} className="avatar-img" />
                    ) : (
                      <span className="avatar-initial">{initial}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {showPairedIdentity ? (
              <div className="paired-name-row">
                <div className="paired-name-col">
                  <span className={`paired-name-text ${nameFontClass}`} style={textStyle}>
                    {name || '—'}
                  </span>
                  {pronouns && <span className="paired-pronouns-text" style={textStyle}>{pronouns}</span>}
                </div>
                <Heart size={10} color={Colors.sakuraDeep} />
                <div className="paired-name-col">
                  <span className={`paired-name-text ${nameFontClass}`} style={textStyle}>
                    {pairedName || '—'}
                  </span>
                  {pairedPronouns && (
                    <span className="paired-pronouns-text" style={textStyle}>{pairedPronouns}</span>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="name-row">
                  <div className="name-group">
                    <h1 className={`name-text ${nameFontClass}`} style={textStyle}>
                      {name || '—'}
                    </h1>
                  </div>
                  {username && <span className="username-text" style={textStyle}>@{username}</span>}
                  {subtitle && <span className="subtitle-text" style={textStyle}>{subtitle}</span>}
                </div>
                {pronouns && <span className="pronouns-text" style={textStyle}>{pronouns}</span>}
                <ProfileFlags flags={flags} textColor={textColor} />
                {tagline && <p className="tagline-text" style={textStyle}>{tagline}</p>}
                {(followerCount !== undefined || followingCount !== undefined) && (
                  <div className="social-stats-row">
                    <div className="social-stat">
                      <span className="social-stat-value" style={textStyle}>{followerCount ?? 0}</span>
                      <span className="social-stat-label">followers</span>
                    </div>
                    <div className="social-stat">
                      <span className="social-stat-value" style={textStyle}>{followingCount ?? 0}</span>
                      <span className="social-stat-label">following</span>
                    </div>
                  </div>
                )}
                {followAction && <div className="follow-action-row">{followAction}</div>}
              </>
            )}
          </div>

          {hasLace && heroSize.width > 0 && (
            <LaceFrame width={heroSize.width} height={heroSize.height} />
          )}
        </div>
      </div>

      {/* ── about ── */}
      <div className="profile-section-block">
        <SectionLabel>about</SectionLabel>
        <div className="about-card">
          <div className="about-tape-wrap">
            <WashiTape width={52} height={12} pattern="dot" color={Colors.lavender} rotate={-5} />
          </div>
          <p className={`about-bio-text ${!bio ? 'empty' : ''}`}>
            {bio || 'nothing written yet…'}
          </p>
        </div>
      </div>

      {/* ── details ── */}
      {stats.length > 0 && (
        <div className="profile-section-block">
          <SectionLabel>details</SectionLabel>
          <div className="details-card">
            {stats.map((s) => (
              <div key={s.label} className="detail-item">
                <span className="detail-label">{s.label.toUpperCase()}</span>
                {s.pill ? (
                  <span
                    className="detail-pill"
                    style={{
                      backgroundColor: PILL_SOFT_BY_DEEP[s.color!] ?? Colors.paperDeep,
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </span>
                ) : (
                  <span className="detail-value">{s.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ── theme song ── */}
      {!!song && (
        <div className="profile-section-block">
          <SectionLabel>theme song</SectionLabel>
          {songLink ? (
            <a
              href={normalizeUrl(songLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="song-row-card link"
              title={`Listen to ${song}`}
            >
              <StickerCassette size={30} className="song-cassette" />
              <div className="song-text-col">
                <span className="song-title-text">{song}</span>
                <span className="song-link-hint">tap to listen ↗</span>
              </div>
            </a>
          ) : (
            <div className="song-row-card">
              <StickerCassette size={30} className="song-cassette" />
              <div className="song-text-col">
                <span className="song-title-text">{song}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── gallery ── */}
      {gallery.length > 0 && (
        <div className="profile-section-block">
          <SectionLabel>gallery</SectionLabel>
          <div className="gallery-scroll-strip">
            {gallery.map((photo, i) => (
              <Polaroid
                key={`${photo.uri}-${i}`}
                uri={photo.uri}
                caption={photo.caption}
                size={110}
                rotate={i % 2 === 0 ? -4 : 3}
                tapeColor={POLAROID_TAPES[i % POLAROID_TAPES.length]}
                textColor={textColor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
