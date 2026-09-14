import { Share } from 'react-native';

/** Public web URL for a person's profile — requires a claimed username,
 *  since that's the only public identifier the /:handle route resolves. */
export function personProfileUrl(username: string): string | null {
  const clean = username.trim();
  return clean ? `https://myyume.app/${clean}` : null;
}

/** Public web URL for an F/O's profile — the /fo/:id route needs no owner
 *  username, so this always works once the F/O is public. */
export function foProfileUrl(foId: string): string {
  return `https://myyume.app/fo/${foId}`;
}

/** Opens the native share sheet with a profile link, or reports why it
 *  can't — e.g. no username claimed yet, or the F/O isn't published. */
export async function shareProfileLink(url: string | null, onUnavailable: (reason: string) => void) {
  if (!url) {
    onUnavailable("set a username first so people can find this profile");
    return;
  }
  try {
    await Share.share({ message: url, url });
  } catch {
    // user dismissed the share sheet — not an error worth surfacing
  }
}
