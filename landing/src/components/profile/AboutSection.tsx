import React, { useEffect, useRef, useState } from 'react';

import { BeadedFrame } from '../deco/BeadedFrame';
import { BracketFrame } from '../deco/BracketFrame';
import { DoubleLineFrame } from '../deco/DoubleLineFrame';
import { FlourishCorners } from '../deco/FlourishCorners';
import { HeartRippleBackdrop } from '../deco/HeartRippleBackdrop';
import { HeartsBackdrop } from '../deco/HeartsBackdrop';
import { LaceFrame } from '../deco/LaceFrame';
import { LatticeFrame } from '../deco/LatticeFrame';
import { MixedBackdrop } from '../deco/MixedBackdrop';
import { PatternBackdrop } from '../deco/PatternBackdrop';
import { SakuraDriftBackdrop } from '../deco/SakuraDriftBackdrop';
import { ScatterBackdrop } from '../deco/ScatterBackdrop';
import { StarsBackdrop } from '../deco/StarsBackdrop';
import { StitchFrame } from '../deco/StitchFrame';
import { WashBackdrop } from '../deco/WashBackdrop';
import { parseBorderFrame } from './cardTheme';
import { SectionLabel } from './SectionLabel';

type Props = {
  about?: string;
  /** same presentation customization as the hero (ProfileCard) — the about
   *  card takes on whatever background/border/text styling the profile has,
   *  instead of always rendering plain. */
  cardBgColor?: string;
  cardBgImage?: string;
  cardBgGradient?: string;
  cardTransparent?: boolean;
  textColor?: string;
  borderStyle?: string;
};

/** The longer writeup, as its own block below the profile hero — separate
 *  from the short tagline that lives on the hero itself, same as a bio vs.
 *  an about page. Renders nothing when there's no about text set. */
export function AboutSection({
  about,
  cardBgColor,
  cardBgImage,
  cardBgGradient,
  cardTransparent,
  textColor,
  borderStyle = '',
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!cardRef.current) return;
    const update = () => {
      if (cardRef.current) {
        setCardSize({ width: cardRef.current.offsetWidth, height: cardRef.current.offsetHeight });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  if (!about) return null;

  const textStyle: React.CSSProperties | undefined = textColor ? { color: textColor } : undefined;
  const frames = parseBorderFrame(borderStyle);

  let bgStyle: React.CSSProperties = {};
  if (!cardTransparent) {
    if (cardBgGradient) {
      const [c1, c2] = cardBgGradient.split(',').filter(Boolean);
      if (c1 && c2) bgStyle = { background: `linear-gradient(135deg, ${c1}, ${c2})` };
    } else if (cardBgColor) {
      bgStyle = { backgroundColor: cardBgColor };
    }
  }

  return (
    <div
      ref={cardRef}
      className={[
        'profile-section-block',
        'about-card',
        cardTransparent ? 'about-card-transparent' : '',
        (frames.lace || frames.lattice) ? 'about-card-lace-border' : '',
      ].filter(Boolean).join(' ')}
      style={bgStyle}
    >
      {cardBgImage && (
        <>
          <div className="about-card-bg-image" style={{ backgroundImage: `url(${cardBgImage})` }} />
          <div className="about-card-image-overlay" />
        </>
      )}

      {cardSize.width > 0 && (
        <>
          {frames.pattern && <PatternBackdrop width={cardSize.width} height={cardSize.height} />}
          {frames.scatter && <ScatterBackdrop width={cardSize.width} height={cardSize.height} />}
          {frames.wash && <WashBackdrop width={cardSize.width} height={cardSize.height} />}
          {frames.heartRipple && <HeartRippleBackdrop width={cardSize.width} height={cardSize.height} />}
          {frames.sakuraDrift && <SakuraDriftBackdrop width={cardSize.width} height={cardSize.height} />}
          {frames.hearts && <HeartsBackdrop width={cardSize.width} height={cardSize.height} />}
          {frames.stars && <StarsBackdrop width={cardSize.width} height={cardSize.height} />}
          {frames.mixed && <MixedBackdrop width={cardSize.width} height={cardSize.height} />}
        </>
      )}

      <div className="about-card-content">
        <SectionLabel>about</SectionLabel>
        <p className="about-text" style={textStyle}>{about}</p>
      </div>

      {cardSize.width > 0 && (
        <>
          {frames.lace && <LaceFrame width={cardSize.width} height={cardSize.height} />}
          {frames.lattice && <LatticeFrame width={cardSize.width} height={cardSize.height} />}
          {frames.stitch && <StitchFrame width={cardSize.width} height={cardSize.height} />}
          {frames.flourish && <FlourishCorners width={cardSize.width} height={cardSize.height} />}
          {frames.bracket && <BracketFrame width={cardSize.width} height={cardSize.height} />}
          {frames.beaded && <BeadedFrame width={cardSize.width} height={cardSize.height} />}
          {frames.double && <DoubleLineFrame width={cardSize.width} height={cardSize.height} />}
        </>
      )}
    </div>
  );
}
