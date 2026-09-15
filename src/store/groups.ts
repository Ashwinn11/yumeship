import { useCallback, useEffect, useRef, useState } from 'react';

import { compressImage } from '@/lib/mediaOptimizer';
import { uploadToBucket } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

import {
  cols,
  logSyncFailure,
  mentionSelect,
  PROFILE_SUMMARY_FIELDS,
  rowToMentions,
  rowToProfile,
  uniqueTopic,
  type CommunityMention,
  type LocalPickedMedia,
  type PostMedia,
} from './community';

export type CommunityGroup = {
  id: string;
  name: string;
  fandom: string;
  description: string;
  avatarUrl: string;
  creatorId: string;
  memberCount: number;
  createdAt: string;
  isMember: boolean;
  isOwner: boolean;
  isMuted: boolean;
  isPinned: boolean;
  /** unread messages since this member's last_read_at — only ever populated
   *  by fetchMyGroups (a "your groups" list); 0 everywhere else, since
   *  discovery results aren't a conversation the viewer is in yet */
  unreadCount: number;
};

export type GroupMember = {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
  role: 'owner' | 'member';
  joinedAt: string;
};

export type GroupMessageSender = { id: string; username: string; name: string; avatarUrl: string };

export type GroupMessage = {
  id: string;
  groupId: string;
  sender: GroupMessageSender;
  body: string;
  media: PostMedia[];
  mentions: CommunityMention[];
  /** id of the message this replies to, if any — the chat screen resolves
   *  the quoted preview from its own already-loaded messages, the same way
   *  CommentThread resolves a reply's parent from the comment tree already in
   *  memory rather than a nested SQL join. Falls back to a generic "original
   *  message" placeholder if that message has since scrolled out of the
   *  loaded window. */
  replyToId: string | null;
  createdAt: string;
};

export type GroupPageOpts = { before?: string; limit?: number };

const GROUP_SELECT = cols('id, name, fandom, description, avatar_url, creator_id, member_count, created_at');
const GROUP_MESSAGE_SELECT = cols(`
  id, group_id, sender_id, body, media, reply_to_id, created_at,
  sender:profiles!group_messages_sender_id_fkey(${PROFILE_SUMMARY_FIELDS}),
  ${mentionSelect('mentions_group_message_id_fkey')}
`);

type Membership = { muted: boolean; pinned: boolean };

function rowToGroup(
  row: Record<string, any>,
  myMembership: Map<string, Membership>,
  currentUserId: string | undefined,
  unreadCounts?: Map<string, number>,
): CommunityGroup {
  const membership = myMembership.get(row.id);
  return {
    id: row.id,
    name: row.name,
    fandom: row.fandom ?? '',
    description: row.description ?? '',
    avatarUrl: row.avatar_url ?? '',
    creatorId: row.creator_id,
    memberCount: row.member_count ?? 0,
    createdAt: row.created_at,
    isMember: myMembership.has(row.id),
    isOwner: !!currentUserId && row.creator_id === currentUserId,
    isMuted: membership?.muted ?? false,
    isPinned: membership?.pinned ?? false,
    unreadCount: unreadCounts?.get(row.id) ?? 0,
  };
}

function rowToGroupMessage(row: Record<string, any>): GroupMessage {
  const sender = rowToProfile(row.sender);
  return {
    id: row.id,
    groupId: row.group_id,
    sender: { id: sender.id, username: sender.username, name: sender.name, avatarUrl: sender.avatarUrl },
    body: row.body,
    media: (row.media ?? []) as PostMedia[],
    mentions: rowToMentions(row.mentions),
    replyToId: row.reply_to_id ?? null,
    createdAt: row.created_at,
  };
}

/** groupId -> membership flags, for every group in `groupIds` the user
 *  actually belongs to (absence from the map means not a member). */
async function fetchMyMembership(groupIds: string[], userId: string | undefined): Promise<Map<string, Membership>> {
  if (!userId || groupIds.length === 0) return new Map();
  const { data } = await supabase.from('group_members').select('group_id, muted, pinned').eq('user_id', userId).in('group_id', groupIds);
  return new Map((data ?? []).map((r: any) => [r.group_id as string, { muted: !!r.muted, pinned: !!r.pinned }]));
}

/** Unread count per group, for the signed-in user's own memberships —
 *  see the group_unread_counts() SQL function for why this is a single RPC
 *  rather than a query per group. */
export async function fetchGroupUnreadCounts(): Promise<Map<string, number>> {
  const { data, error } = await supabase.rpc('group_unread_counts');
  if (error || !data) return new Map();
  return new Map(data.map((r: any) => [r.group_id as string, Number(r.unread_count)]));
}

/** Called when the chat screen opens (and again as new messages arrive
 *  while it's open) — resets this member's unread count to 0. */
export async function markGroupRead(groupId: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  const { error } = await supabase
    .from('group_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('group_id', groupId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function setGroupPinned(groupId: string, pinned: boolean): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  const { error } = await supabase.from('group_members').update({ pinned }).eq('group_id', groupId).eq('user_id', userId);
  if (error) throw error;
}

async function currentUserId(): Promise<string | undefined> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id;
}

/**
 * Discovery list, most-populated first. Like fetchActivityPool in
 * community.ts, member-count ordering doesn't map cleanly to a `before`
 * cursor, and discovery doesn't need deep pagination — just a capped top
 * slice, same reasoning that file already applies.
 */
export async function fetchGroups(limit = 50): Promise<CommunityGroup[]> {
  const { data, error } = await supabase
    .from('groups')
    .select(GROUP_SELECT)
    .order('member_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  const userId = await currentUserId();
  const myMembership = await fetchMyMembership(data.map((r: any) => r.id), userId);
  return data.map((r: any) => rowToGroup(r, myMembership, userId));
}

/** Search by group name or fandom — same "top slice, no pagination" scope
 *  as fetchGroups above. Strips characters that have meaning in a PostgREST
 *  `.or()` filter string (`,()%`) so a search term can't malform the query. */
export async function searchGroups(query: string, limit = 30): Promise<CommunityGroup[]> {
  const clean = query.trim().replace(/[,()%]/g, '');
  if (!clean) return [];
  const { data, error } = await supabase
    .from('groups')
    .select(GROUP_SELECT)
    .or(`name.ilike.%${clean}%,fandom.ilike.%${clean}%`)
    .order('member_count', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  const userId = await currentUserId();
  const myMembership = await fetchMyMembership(data.map((r: any) => r.id), userId);
  return data.map((r: any) => rowToGroup(r, myMembership, userId));
}

/** Groups the signed-in user belongs to — pinned first, then most recently
 *  joined. Carries each group's unread count (see fetchGroupUnreadCounts). */
export async function fetchMyGroups(): Promise<CommunityGroup[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const [{ data, error }, unreadCounts] = await Promise.all([
    supabase
      .from('group_members')
      .select(`joined_at, muted, pinned, group:groups!group_members_group_id_fkey(${GROUP_SELECT})`)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false }),
    fetchGroupUnreadCounts(),
  ]);
  if (error || !data) return [];
  const rows = data.filter((r: any) => r.group);
  const myMembership = new Map<string, Membership>(
    rows.map((r: any) => [r.group.id, { muted: !!r.muted, pinned: !!r.pinned }]),
  );
  return rows
    .map((r: any) => rowToGroup(r.group, myMembership, userId, unreadCounts))
    .sort((a: CommunityGroup, b: CommunityGroup) => Number(b.isPinned) - Number(a.isPinned));
}

export async function fetchGroup(id: string): Promise<CommunityGroup | null> {
  const { data, error } = await supabase.from('groups').select(GROUP_SELECT).eq('id', id).maybeSingle();
  if (error || !data) return null;
  const row = data as Record<string, any>;
  const userId = await currentUserId();
  const myMembership = await fetchMyMembership([row.id], userId);
  return rowToGroup(row, myMembership, userId);
}

export async function fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select(`role, joined_at, profile:profiles!group_members_user_id_fkey(${PROFILE_SUMMARY_FIELDS})`)
    .eq('group_id', groupId)
    .order('role', { ascending: true }) // 'member' < 'owner' alphabetically — reversed below
    .order('joined_at', { ascending: true });
  if (error || !data) return [];
  const members = data
    .filter((r: any) => r.profile)
    .map((r: any) => {
      const p = rowToProfile(r.profile);
      return { id: p.id, username: p.username, name: p.name, avatarUrl: p.avatarUrl, role: r.role, joinedAt: r.joined_at } as GroupMember;
    });
  // owner pinned to the top rather than relying on the alphabetical sort above
  return members.sort((a, b) => (a.role === b.role ? 0 : a.role === 'owner' ? -1 : 1));
}

export type CreateGroupInput = { name: string; fandom?: string; description?: string; avatarUri?: string };

/** Creates the group, then joins the creator as its owner — two plain
 *  inserts in sequence, not a trigger, matching how every other paired write
 *  in this schema (e.g. a post plus its poll options) is just done directly
 *  by the client rather than as an implicit side effect. */
export async function createGroup(input: CreateGroupInput): Promise<CommunityGroup> {
  const userId = await currentUserId();
  if (!userId) throw new Error('not signed in');

  let avatarUrl = '';
  if (input.avatarUri) {
    try {
      const compressed = await compressImage(input.avatarUri, 'avatar');
      avatarUrl = await uploadToBucket(
        'avatars',
        `${userId}/groups/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
        compressed,
        'image/jpeg',
      );
    } catch (e) {
      // the group still gets created without one — same "don't block the
      // rest of the save over a photo" convention pushOwnProfile uses
      logSyncFailure('group avatar upload')(e);
    }
  }

  const { data, error } = await supabase
    .from('groups')
    .insert({
      name: input.name.trim(),
      fandom: (input.fandom ?? '').trim(),
      description: (input.description ?? '').trim(),
      avatar_url: avatarUrl,
      creator_id: userId,
    })
    .select(GROUP_SELECT)
    .single();
  if (error) throw error;
  const row = data as Record<string, any>;

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: row.id, user_id: userId, role: 'owner' });
  if (memberError) throw memberError;

  return rowToGroup(row, new Map([[row.id, { muted: false, pinned: false }]]), userId);
}

export type UpdateGroupInput = { name?: string; fandom?: string; description?: string; avatarUri?: string };

/** Owner only (enforced by RLS) — name/fandom/description/avatar. */
export async function updateGroup(groupId: string, input: UpdateGroupInput): Promise<void> {
  const patch: Record<string, any> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.fandom !== undefined) patch.fandom = input.fandom.trim();
  if (input.description !== undefined) patch.description = input.description.trim();

  if (input.avatarUri) {
    const userId = await currentUserId();
    if (!userId) throw new Error('not signed in');
    const compressed = await compressImage(input.avatarUri, 'avatar');
    patch.avatar_url = await uploadToBucket(
      'avatars',
      `${userId}/groups/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
      compressed,
      'image/jpeg',
    );
  }

  if (Object.keys(patch).length === 0) return;
  const { error } = await supabase.from('groups').update(patch).eq('id', groupId);
  if (error) throw error;
}

export async function joinGroup(groupId: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error('not signed in');
  const { error } = await supabase.from('group_members').insert({ group_id: groupId, user_id: userId });
  if (error) throw error;
}

/** Leave — for a member. The creator leaving their own group isn't blocked
 *  at the RLS level (same self-service delete policy as anyone else) but the
 *  UI never offers it: the group detail screen shows "delete group" to the
 *  owner and "exit group" to everyone else instead of both. */
export async function leaveGroup(groupId: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  const { error } = await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
  if (error) throw error;
}

/** Owner only (enforced by RLS) — cascades to every membership row and
 *  every message in the group. */
export async function deleteGroup(groupId: string): Promise<void> {
  const { error } = await supabase.from('groups').delete().eq('id', groupId);
  if (error) throw error;
}

export async function setGroupMuted(groupId: string, muted: boolean): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  const { error } = await supabase.from('group_members').update({ muted }).eq('group_id', groupId).eq('user_id', userId);
  if (error) throw error;
}

export async function fetchGroupMessages(groupId: string, opts: GroupPageOpts = {}): Promise<GroupMessage[]> {
  const limit = opts.limit ?? 40;
  let query = supabase
    .from('group_messages')
    .select(GROUP_MESSAGE_SELECT)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (opts.before) query = query.lt('created_at', opts.before);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(rowToGroupMessage);
}

async function fetchGroupMessageById(id: string): Promise<GroupMessage | null> {
  const { data, error } = await supabase.from('group_messages').select(GROUP_MESSAGE_SELECT).eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToGroupMessage(data);
}

export type SendGroupMessageInput = {
  body: string;
  /** message being quoted/replied to, if any */
  replyToId?: string;
  /** at most one — group_messages.media is DB-capped to length <= 1, same
   *  single-attachment convention as iMessage/WhatsApp rather than a
   *  post-style multi-photo carousel, which a chat bubble has no room for */
  image?: LocalPickedMedia;
};

export async function sendGroupMessage(groupId: string, input: SendGroupMessageInput): Promise<GroupMessage> {
  const userId = await currentUserId();
  if (!userId) throw new Error('not signed in');

  let media: PostMedia[] = [];
  if (input.image) {
    try {
      const compressed = await compressImage(input.image.uri, 'post');
      const url = await uploadToBucket(
        'post-media',
        `${userId}/group-chat/${groupId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
        compressed,
        'image/jpeg',
      );
      media = [{ type: input.image.type, url, width: input.image.width, height: input.image.height }];
    } catch (e) {
      // the message still sends as text-only rather than failing outright —
      // same "don't block the rest of the save over a photo" convention as
      // createGroup's avatar upload above
      logSyncFailure('group message image upload')(e);
    }
  }

  const { data, error } = await supabase
    .from('group_messages')
    .insert({
      group_id: groupId,
      sender_id: userId,
      body: input.body.trim(),
      reply_to_id: input.replyToId ?? null,
      media,
    })
    .select(GROUP_MESSAGE_SELECT)
    .single();
  if (error) throw error;
  return rowToGroupMessage(data);
}

/** New messages, live — the postgres_changes payload only ever carries the
 *  raw new row, not the joined sender/mentions, so this re-fetches the full
 *  row by id the same way subscribeNotifications/subscribeActivityDetail do. */
export function subscribeGroupMessages(groupId: string, onInsert: (m: GroupMessage) => void): () => void {
  const channel = supabase
    .channel(uniqueTopic(`group-messages-${groupId}`))
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
      async (payload) => {
        const row = payload.new as { id: string };
        const full = await fetchGroupMessageById(row.id);
        if (full) onInsert(full);
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/** A group's chat: initial page (oldest-first for display), realtime-appended,
 *  scroll-up pagination. */
export function useGroupChat(groupId: string | undefined) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const hasMore = useRef(true);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const load = useCallback(async () => {
    if (!groupId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    const page = await fetchGroupMessages(groupId, { limit: 40 });
    hasMore.current = page.length >= 40;
    setMessages([...page].reverse());
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    setLoading(true);
    hasMore.current = true;
    load();
  }, [load]);

  useEffect(() => {
    if (!groupId) return;
    return subscribeGroupMessages(groupId, (m) => {
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      // the screen is open and the message just arrived — count it read
      // immediately rather than letting it sit in the unread badge
      markGroupRead(groupId).catch(() => {});
    });
  }, [groupId]);

  // marks read once the initial page has loaded, covering messages that
  // arrived while the chat was closed
  useEffect(() => {
    if (groupId && !loading) markGroupRead(groupId).catch(() => {});
  }, [groupId, loading]);

  const loadingMore = useRef(false);
  const loadMore = useCallback(async () => {
    if (!groupId || loadingMore.current || !hasMore.current) return;
    const current = messagesRef.current;
    if (current.length === 0) return;
    loadingMore.current = true;
    try {
      const limit = 40;
      const more = await fetchGroupMessages(groupId, { before: current[0].createdAt, limit });
      if (more.length < limit) hasMore.current = false;
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...more.reverse().filter((m) => !seen.has(m.id)), ...prev];
      });
    } finally {
      loadingMore.current = false;
    }
  }, [groupId]);

  // no optimistic local append on send — the realtime subscription above
  // delivers this same insert back within milliseconds and de-dupes by id,
  // so appending it here too would just be bookkeeping for the same result
  const send = useCallback(
    async (input: SendGroupMessageInput) => {
      if (!groupId || (!input.body.trim() && !input.image)) return;
      await sendGroupMessage(groupId, input);
    },
    [groupId],
  );

  return { messages, loading, loadMore, send };
}
