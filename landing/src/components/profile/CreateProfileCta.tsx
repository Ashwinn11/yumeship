import { Sparkle } from '../deco/Sparkle';
import { Heart } from '../deco/Heart';
import { WashiTape } from '../deco/WashiTape';
import { Colors } from '../../constants/theme';

export function CreateProfileCta() {
  return (
    <section className="profile-engage-card" aria-label="Join YumeShip">
      <div className="engage-tape-wrap">
        <WashiTape width={54} height={12} pattern="heart" color={Colors.sakura} rotate={-3} />
      </div>

      <div className="engage-title-row">
        <Sparkle size={13} color={Colors.sakuraDeep} />
        <h3 className="engage-title">create your own profile</h3>
        <Heart size={11} color={Colors.lavenderDeep} />
      </div>

      <p className="engage-tagline">
        a quiet sanctuary for the ones you love from afar
      </p>

      <p className="engage-sub">
        claim your handle, write love letters, build ship headcanons, and keep your f/os close ♡
      </p>

      <div className="engage-buttons-row">
        <a
          href="https://apps.apple.com/app/yumeship-anime-kpop-canon/id6773642234"
          target="_blank"
          rel="noopener noreferrer"
          className="store-badge-btn"
          aria-label="Download on the App Store"
        >
          <img src="/assets/app-store-badge.svg" alt="App Store" className="store-badge-img" />
        </a>
        <a
          href="https://play.google.com/store/apps/details?id=com.yumeship.app"
          target="_blank"
          rel="noopener noreferrer"
          className="store-badge-btn"
          aria-label="Get it on Google Play"
        >
          <img src="/assets/google-play-badge.svg" alt="Google Play" className="store-badge-img" />
        </a>
      </div>

      <a href="yumeship://" className="engage-open-link">
        already have the app? open yumeship ↗
      </a>
    </section>
  );
}
