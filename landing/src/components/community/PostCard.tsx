import type { WebPost } from '../../lib/profile';
import { Sparkle } from '../deco/Sparkle';
import { Heart } from '../deco/Heart';

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

function CommentBubbleIcon({ size = 13, color = '#8a7383' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M2 3.5C2 2.7 2.7 2 3.5 2h9c.8 0 1.5.7 1.5 1.5v6c0 .8-.7 1.5-1.5 1.5H6l-3 2.5v-2.5h-.5C1.7 11 1 10.3 1 9.5v-6z"
        stroke={color}
        strokeWidth={1.2}
        fill="none"
      />
    </svg>
  );
}

export function PostCard({ post }: { post: WebPost }) {
  const authorName = post.author?.name || 'someone';
  const authorUsername = post.author?.username;
  const authorAvatar = post.author?.avatarUrl;
  const initial = authorName.trim().charAt(0).toUpperCase() || '♡';
  const fo = post.fo;

  return (
    <div className="post-card">
      <div className="post-card-sparkle">
        <Sparkle size={12} color="#8b6fc4" />
      </div>

      {/* Author Header */}
      <div className="post-author-header">
        {fo ? (
          <div className="post-paired-avatars">
            <div className="post-author-avatar-wrap">
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="post-author-avatar-img" />
              ) : (
                <div className="post-author-avatar-fallback">{initial}</div>
              )}
            </div>
            <div className="post-paired-heart-badge">
              <Heart size={9} color="#d77a8d" />
            </div>
            <div className="post-author-avatar-wrap fo">
              {fo.avatarUrl ? (
                <img src={fo.avatarUrl} alt={fo.name} className="post-author-avatar-img" />
              ) : (
                <div className="post-author-avatar-fallback fo">{fo.name.trim().charAt(0).toUpperCase() || '♡'}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="post-author-avatar-wrap solo">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="post-author-avatar-img" />
            ) : (
              <div className="post-author-avatar-fallback">{initial}</div>
            )}
          </div>
        )}

        <div className="post-author-text-col">
          <div className="post-author-top-line">
            <span className="post-author-name">
              {fo ? `${authorName} ♡ ${fo.name}` : authorName}
            </span>
            {authorUsername && <span className="post-author-username">@{authorUsername}</span>}
          </div>
          <span className="post-author-meta">{timeAgo(post.createdAt)}</span>
        </div>
      </div>

      {/* Title */}
      {!!post.title && <h3 className="post-title">{post.title}</h3>}

      {/* Body */}
      {!!post.body && <p className="post-body">{post.body}</p>}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className={`post-media-grid count-${Math.min(post.media.length, 4)}`}>
          {post.media.slice(0, 4).map((m, idx) => (
            <div key={idx} className="post-media-item">
              <img src={m.url} alt="" className="post-media-img" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      {/* Poll */}
      {post.pollOptions && post.pollOptions.length > 0 && (
        <div className="post-poll">
          {post.pollOptions.map((opt, i) => {
            const count = post.pollCounts?.[i] ?? 0;
            return (
              <div key={i} className="post-poll-option">
                <span className="post-poll-label">{opt}</span>
                {count > 0 && <span className="post-poll-count">{count}</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="post-divider" />
      <div className="post-footer">
        <div className="post-action-btn">
          <Heart size={13} color="#d77a8d" outline={post.likeCount === 0} />
          <span className="post-action-count">{post.likeCount}</span>
        </div>
        <div className="post-action-btn">
          <CommentBubbleIcon size={13} color="#8a7383" />
          <span className="post-action-count">{post.commentCount}</span>
        </div>
      </div>
    </div>
  );
}
