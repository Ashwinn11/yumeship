import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <img src="/assets/icon.png" alt="Yumeship Icon" className="brand-icon" />
          <span>Yumeship</span>
        </Link>
        <div className="nav-links">
          <Link to="/privacy" className={location.pathname === '/privacy' ? 'active' : ''}>
            Privacy
          </Link>
          <Link to="/terms" className={location.pathname === '/terms' ? 'active' : ''}>
            Terms
          </Link>
          <Link to="/support" className={location.pathname === '/support' ? 'active' : ''}>
            Support
          </Link>
          <a
            href="https://apps.apple.com/app/yumeship-anime-kpop-canon/id6773642234"
            className="nav-download"
            target="_blank"
            rel="noopener noreferrer"
          >
            App Store
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.yumeship.app"
            className="nav-download"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Play
          </a>
        </div>
      </div>
    </nav>
  );
};
