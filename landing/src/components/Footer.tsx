import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>&copy; {new Date().getFullYear()} Yumeship. All rights reserved.</div>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/support">Support</Link>
        </div>
      </div>
    </footer>
  );
};
