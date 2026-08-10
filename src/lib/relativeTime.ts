/**
 * Relative timestamps for community content.
 *
 * Lived as a copy in both PostAuthorHeader and CommentThread, and the two had
 * drifted: posts fell back to a calendar date after a week while comments kept
 * counting, so a three-month-old comment read "92d" next to a post showing a
 * date. One definition so they cannot disagree again.
 */
export function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  // past a week the exact count stops meaning anything — show the date
  return new Date(iso).toLocaleDateString();
}
