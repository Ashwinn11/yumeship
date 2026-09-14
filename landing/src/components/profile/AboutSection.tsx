import { SectionLabel } from './SectionLabel';

/** The longer writeup, as its own block below the profile hero — separate
 *  from the short tagline that lives on the hero itself, same as a bio vs.
 *  an about page. Renders nothing when there's no about text set. */
export function AboutSection({ about }: { about?: string }) {
  if (!about) return null;

  return (
    <div className="profile-section-block">
      <SectionLabel>about</SectionLabel>
      <p className="about-text">{about}</p>
    </div>
  );
}
