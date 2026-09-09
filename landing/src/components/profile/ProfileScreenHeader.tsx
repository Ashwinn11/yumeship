import { Mark } from '../ui/Mark';

type Props = {
  onBack?: () => void;
  backLabel?: string;
  title: string;
  right?: React.ReactNode;
};

export function ProfileScreenHeader({ onBack, backLabel = '‹', title, right }: Props) {
  return (
    <header className="profile-screen-header">
      {onBack ? (
        <button onClick={onBack} className="header-round-btn" aria-label="Back">
          <span className="header-btn-symbol">{backLabel}</span>
        </button>
      ) : (
        <a href="/" className="header-round-btn" aria-label="Home">
          <span className="header-btn-symbol">{backLabel}</span>
        </a>
      )}
      <div className="header-center">
        <Mark size={22} />
        <span className="header-title">{title}</span>
      </div>
      {right ?? <div style={{ width: 32 }} />}
    </header>
  );
}
