import React from 'react';
import { Sparkle } from '../components/Sparkle';

export const Home: React.FC = () => {
  return (
    <main className="hero">
      <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="hero-card">
          <div className="washi-tape-top" />

          <img
            src="/assets/icon.png"
            alt="YumeShip App Icon"
            className="hero-app-icon"
          />

          <div className="hero-title-row">
            <Sparkle size={18} color="#d77a8d" />
            <h1 className="wordmark">
              Yume<span>Ship</span>
            </h1>
            <Sparkle size={18} color="#f0d189" />
          </div>

          <p className="hero-tagline">
            your quiet place for the ones you love from afar
          </p>

          <p className="hero-subheadline">
            Write love letters &middot; Build headcanons &middot; Keep them close, privately on your device
          </p>

          <div className="hero-features">
            <span className="feature-pill">
              <span>🌸</span> Private & On-Device
            </span>
            <span className="feature-pill">
              <span>💌</span> Letters & Scenarios
            </span>
            <span className="feature-pill">
              <span>📖</span> Ship Profiles & Headcanons
            </span>
            <span className="feature-pill">
              <span>✨</span> Gentle F/O Reminders
            </span>
          </div>

          <div className="hero-actions">
            <a
              href="https://apps.apple.com/app/yumeship-anime-kpop-canon/id6773642234"
              className="store-badge-link"
              aria-label="Download YumeShip on the App Store"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/assets/app-store-badge.svg"
                alt="Download on the App Store"
                className="store-badge"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.yumeship.app"
              className="store-badge-link"
              aria-label="Get YumeShip on Google Play"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/assets/google-play-badge.svg"
                alt="Get it on Google Play"
                className="store-badge"
              />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};
