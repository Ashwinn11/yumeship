import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <main className="page-container">
      <div className="container">
        <article className="content-card">
          <h1>Privacy Policy</h1>
          <div className="content-meta">Last updated: May 27, 2025</div>

          <h2>1. Your data stays on your device</h2>
          <p>
            Everything you create in YumeShip — ships, headcanons, letters, scenes — is stored locally on your device in an on-device database. We cannot see it, access it, or back it up. Deleting the App removes all of it permanently.
          </p>

          <h2>2. What we don't collect</h2>
          <p>
            We do not collect your name, email, or any creative content. We do not use advertising SDKs or sell data to third parties. There is no account system.
          </p>

          <h2>3. Subscriptions</h2>
          <p>
            When you subscribe, our payment processor (RevenueCat) receives a pseudonymous ID and your purchase receipt to verify your subscription status. No personal details are shared with us. RevenueCat's privacy policy:{' '}
            <a href="https://www.revenuecat.com/privacy" target="_blank" rel="noopener noreferrer">
              revenuecat.com/privacy
            </a>.
          </p>

          <h2>4. Notifications</h2>
          <p>
            If you allow notifications, scheduled reminders are handled entirely on-device through iOS. Nothing is sent to our servers.
          </p>

          <h2>5. Deleting your data</h2>
          <p>
            Go to Settings &rarr; Delete all data to wipe everything from your device. Since we hold no data on our end, there is nothing further to request from us.
          </p>

          <h2>6. Contact</h2>
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
