import React from 'react';

export const Terms: React.FC = () => {
  return (
    <main className="page-container">
      <div className="container">
        <article className="content-card">
          <h1>Terms of Service</h1>
          <div className="content-meta">Last updated: May 27, 2025</div>

          <h2>Licensed Application EULA</h2>
          <p>
            YumeShip is licensed to you under Apple's standard End User License Agreement (EULA). The EULA applies to your use of this App and is available at:
          </p>
          <p>
            <a
              href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
            </a>
          </p>

          <h2>Subscriptions</h2>
          <p>
            YumeShip Premium is an auto-renewable subscription sold through Apple's App Store. Payment is charged to your Apple ID at confirmation of purchase. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel anytime in your Apple ID Account Settings.
          </p>

          <h2>Your Content</h2>
          <p>
            Everything you create in YumeShip — ships, letters, headcanons — stays on your device. We have no access to it. It belongs entirely to you.
          </p>

          <h2>Contact</h2>
          <div className="contact-box">
            <p>Questions? Reach us at:</p>
            <p>
              <a href="mailto:ashwinnanbazhagan@gmail.com">
                <strong>ashwinnanbazhagan@gmail.com</strong>
              </a>
            </p>
          </div>
        </article>
      </div>
    </main>
  );
};
