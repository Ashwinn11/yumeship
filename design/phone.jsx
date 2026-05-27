/* phone.jsx — soft iPhone wrapper styled for the cozy app */

function Phone({ children, theme = 'sakura', style = {}, statusDark = false }) {
  return (
    <div className={`phone theme-${theme}`} style={style}>
      <div className="phone-notch"/>
      <div className="phone-status" style={{ color: statusDark ? '#fff' : 'var(--ink)' }}>
        <span>9:41</span>
        <span className="phone-status-icons">
          <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
            <rect x="0" y="6" width="2.4" height="4" rx="0.5"/>
            <rect x="3.8" y="4" width="2.4" height="6" rx="0.5"/>
            <rect x="7.6" y="2" width="2.4" height="8" rx="0.5"/>
            <rect x="11.4" y="0" width="2.4" height="10" rx="0.5"/>
          </svg>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
            <path d="M7 2.6c1.9 0 3.6.7 4.9 1.9l0.9-.9C11.3 2.2 9.2 1.3 7 1.3S2.7 2.2 1.2 3.6l0.9 0.9C3.4 3.3 5.1 2.6 7 2.6Z"/>
            <path d="M7 5.4c1.1 0 2.1.4 2.8 1.1l0.9-.9C9.6 4.7 8.4 4.1 7 4.1s-2.6 0.6-3.7 1.5l0.9 0.9C5 5.8 5.9 5.4 7 5.4Z"/>
            <circle cx="7" cy="8.6" r="1.2"/>
          </svg>
          <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
            <rect x="0.5" y="0.5" width="19" height="10" rx="2.5" stroke="currentColor" strokeOpacity="0.4"/>
            <rect x="2" y="2" width="15" height="7" rx="1" fill="currentColor"/>
            <path d="M20.5 4v3c0.6-0.2 1-0.7 1-1.5s-0.4-1.3-1-1.5Z" fill="currentColor" fillOpacity="0.4"/>
          </svg>
        </span>
      </div>
      <div className="phone-content">{children}</div>
    </div>
  );
}

Object.assign(window, { Phone });
