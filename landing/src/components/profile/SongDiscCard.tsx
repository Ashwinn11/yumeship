import type { ProfileSong } from '../../lib/profile';

/**
 * A distinct music card, not a reskinned Polaroid — real "now playing" UI
 * (Spin, Apple Music) puts the disc front and center, not boxed inside a
 * plain bordered card matching the photo strip beside it. The disc fills
 * most of the card and never stops spinning; card background is plain white.
 * The three bouncing bars below the disc are the "now playing" indicator
 * iOS/iPadOS widgets use (Control Center's Now Playing card, Music rows).
 */
export function SongDiscCard({ song, size = 110 }: { song: ProfileSong; size?: number }) {
  const discSize = size * 0.72;
  const content = (
    <>
      <div
        className="song-disc"
        style={{ width: discSize, height: discSize }}
      >
        <div
          className="song-disc-groove"
          style={{ width: discSize * 0.78, height: discSize * 0.78, top: discSize * 0.11, left: discSize * 0.11 }}
        />
        <div
          className="song-disc-groove"
          style={{ width: discSize * 0.58, height: discSize * 0.58, top: discSize * 0.21, left: discSize * 0.21 }}
        />
        <div
          className="song-disc-label"
          style={{ width: discSize * 0.38, height: discSize * 0.38, top: discSize * 0.31, left: discSize * 0.31 }}
        >
          <span className="song-disc-note" style={{ fontSize: discSize * 0.16 }}>♪</span>
        </div>
        <div className="song-disc-hole" style={{ top: discSize / 2 - 2.5, left: discSize / 2 - 2.5 }} />
      </div>

      <div className="song-eq-row">
        <span className="song-eq-bar song-eq-bar-1" />
        <span className="song-eq-bar song-eq-bar-2" />
        <span className="song-eq-bar song-eq-bar-3" />
      </div>
      <span className="song-disc-title">{song.title}</span>
    </>
  );

  return song.link ? (
    <a
      href={song.link}
      target="_blank"
      rel="noopener noreferrer"
      className="song-disc-card"
      style={{ width: size }}
      title={`Listen to ${song.title}`}
    >
      {content}
    </a>
  ) : (
    <div className="song-disc-card" style={{ width: size }}>
      {content}
    </div>
  );
}
