import React from 'react';

export const Terms: React.FC = () => {
  return (
    <main className="page-container">
      <div className="container">
        <article className="content-card">
          <h1>Terms of Service</h1>
          <div className="content-meta">Last updated: September 14, 2026</div>

          <h2>1. Licensed Application EULA</h2>
          <p>
            YumeShip is licensed to you under Apple's standard End User License Agreement (EULA).
            The EULA applies to your use of this App and is available at:
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

          <h2>2. Your account</h2>
          <p>
            Some parts of YumeShip — posting, groups, public profiles — require a community
            account. You're responsible for the activity on your account and for keeping your
            login secure. You must be at least 17 to create one, consistent with the app's age
            rating.
          </p>

          <h2>3. Community conduct</h2>
          <p>You agree not to use the community feature to:</p>
          <ul>
            <li>Harass, threaten, or target another person or their F/O in bad faith</li>
            <li>Post sexual content involving minors, or content that sexualizes real minors in any way</li>
            <li>Post hate speech, or content that promotes violence against a person or group</li>
            <li>Impersonate another person, or misrepresent your affiliation with anyone</li>
            <li>Post spam, scams, or content unrelated to the community's purpose</li>
            <li>Repeatedly interact with someone who has asked not to be interacted with (a stated DNI) in a targeted or harassing way</li>
            <li>Share another person's private information without consent</li>
          </ul>
          <p>
            We may remove content, suspend, or terminate accounts that violate these rules, with or
            without notice, at our discretion.
          </p>

          <h2>4. Reporting and enforcement</h2>
          <p>
            You can report posts, comments, messages, and profiles you believe violate these terms.
            We review reports and may remove content, warn a user, or suspend or terminate an
            account as a result. You can also block another user to stop seeing their content and
            prevent them from seeing yours.
          </p>

          <h2>5. Your content</h2>
          <p>
            You own what you create — your private journal entries, and anything you post to the
            community (posts, comments, profile content, photos). By posting to the community
            feature, you give other users of the app permission to view that content as intended by
            the feature it's posted in (for example, a public profile or a public post), and you
            give us the license needed to store, display, and transmit it as part of operating the
            app. This license ends when you delete the content or your account, except where a copy
            is reasonably retained for a short period for backups, legal, or safety reasons.
          </p>
          <p>
            Your private, on-device journal — ships, letters, headcanons not posted to the community
            — stays entirely on your device and is never covered by that license, because we never
            receive it.
          </p>

          <h2>6. Subscriptions</h2>
          <p>
            YumeShip Premium is an auto-renewable subscription sold through Apple's App Store.
            Payment is charged to your Apple ID at confirmation of purchase. Subscriptions renew
            automatically unless cancelled at least 24 hours before the end of the current period.
            Manage or cancel anytime in your Apple ID Account Settings.
          </p>

          <h2>7. Termination</h2>
          <p>
            You can delete your account at any time from within the app. We may suspend or
            terminate your access to the community feature if you violate these terms. Your
            private, on-device journal is unaffected by any action we take on your community
            account, since we never have access to it.
          </p>

          <h2>8. Changes to these terms</h2>
          <p>
            If we make a material change to these terms, we'll update the date above and, where
            required, notify you in the app.
          </p>

          <h2>9. Contact</h2>
          <div className="contact-box">
            <p>Questions? Reach us at:</p>
            <p>
              <a href="mailto:support@myyume.app">
                <strong>support@myyume.app</strong>
              </a>
            </p>
          </div>
        </article>
      </div>
    </main>
  );
};
