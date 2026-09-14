import React from 'react';

export const Support: React.FC = () => {
  return (
    <main className="page-container">
      <div className="container">
        <article className="content-card">
          <h1>Support</h1>
          <div className="content-meta">We'd love to help</div>

          <div className="contact-box" style={{ marginTop: 0, marginBottom: 36 }}>
            <p>Email us at <a href="mailto:support@myyume.app"><strong>support@myyume.app</strong></a> and we'll get back to you within 24–48 hours.</p>
          </div>

          <h2>Frequently Asked Questions</h2>

          <h3>What is YumeShip?</h3>
          <p>
            YumeShip is a private journal for yumeshippers — anyone who loves a fictional character
            (their F/O). Build ship profiles, write love letters and headcanons, get notifications
            from your F/O, and keep it all in one soft, personal space. YumeShip also has an
            optional community feature — public profiles, posts, groups — for the parts you want to
            share.
          </p>

          <h3>Is my journal private?</h3>
          <p>
            Yes. Everything in your private journal — ships, headcanons, letters, scenes — is
            stored locally on your device. We cannot see it, access it, or back it up. It's
            completely separate from the community feature described below.
          </p>

          <h3>What's the community feature?</h3>
          <p>
            An optional, separate part of the app where you can create a public profile, post,
            join groups, and follow other yumeshippers and their F/Os. It requires a free account.
            Anything you post there is stored on our servers and can be seen by other users — see
            our <a href="/privacy">Privacy Policy</a> for details on what's stored and what's
            public.
          </p>

          <h3>How do I report something?</h3>
          <p>
            Tap the flag icon on any post, comment, message, or profile in the community feature to
            report it. You can also block a user from their profile to stop seeing their content.
            We review reports within 24–48 hours.
          </p>

          <h3>What is a F/O in YumeShip?</h3>
          <p>
            F/O stands for Fictive Other — a character you have a personal, loving connection with.
            YumeShip is built specifically for this kind of relationship, with templates and spaces
            designed around it.
          </p>

          <h3>Is YumeShip like Character.AI?</h3>
          <p>
            No — and that's the point. YumeShip is a journal, not a chatbot. Your F/O's voice is
            yours to write, and no model update can ever change or delete them.
          </p>

          <h3>Can I keep a comfort character in YumeShip?</h3>
          <p>
            Yes. Comfort characters get the same treatment as romantic F/Os — their own page,
            headcanons, albums, and gentle notifications when you need them.
          </p>

          <h3>Is YumeShip free?</h3>
          <p>
            YumeShip is free to download, including the community feature. Premium unlocks
            unlimited ships and all visual templates — weekly or monthly subscriptions, or a
            one-time Lifetime purchase.
          </p>
        </article>
      </div>
    </main>
  );
};
