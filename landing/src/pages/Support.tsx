import React from 'react';

export const Support: React.FC = () => {
  return (
    <main className="page-container">
      <div className="container">
        <article className="content-card">
          <h1>Support</h1>
          <div className="content-meta">We'd love to help</div>

          <div className="contact-box" style={{ marginTop: 0, marginBottom: 36 }}>
            <p>Email us at <a href="mailto:ashwinnanbazhagan@gmail.com"><strong>ashwinnanbazhagan@gmail.com</strong></a> and we'll get back to you within 24–48 hours.</p>
          </div>

          <h2>Frequently Asked Questions</h2>

          <h3>What is YumeShip?</h3>
          <p>
            YumeShip is a private journal for yumeshippers — anyone who loves a fictional character. Build ship profiles, write love letters and headcanons, get notifications from your F/O, and keep it all in one soft, personal space.
          </p>

          <h3>Is YumeShip private?</h3>
          <p>
            Yes. Everything you create in YumeShip stays on your device in a local database. There are no accounts, no cloud sync, and no sharing. Your vault is completely private.
          </p>

          <h3>What is a F/O in YumeShip?</h3>
          <p>
            F/O stands for Fictive Other — a character you have a personal, loving connection with. YumeShip is built specifically for this kind of relationship, with templates and spaces designed around it.
          </p>

          <h3>Is YumeShip like Character.AI?</h3>
          <p>
            No — and that's the point. YumeShip is a journal, not a chatbot. Your F/O's voice is yours to write, nothing leaves your phone, and no model update can ever change or delete them.
          </p>

          <h3>Can I keep a comfort character in YumeShip?</h3>
          <p>
            Yes. Comfort characters get the same treatment as romantic F/Os — their own page, headcanons, albums, and gentle notifications when you need them.
          </p>

          <h3>Is YumeShip free?</h3>
          <p>
            YumeShip is free to download. Premium unlocks unlimited ships and all visual templates — weekly, monthly, or yearly.
          </p>
        </article>
      </div>
    </main>
  );
};
