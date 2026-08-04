import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { CommunityComment } from '@/store/community';

const MAX_VISUAL_DEPTH = 2;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function buildTree(comments: CommunityComment[]): Map<string, CommunityComment[]> {
  const byParent = new Map<string, CommunityComment[]>();
  for (const c of comments) {
    const key = c.parentCommentId ?? 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }
  return byParent;
}

type NodeProps = {
  comment: CommunityComment;
  byParent: Map<string, CommunityComment[]>;
  depth: number;
  parentAuthorName?: string;
  onReply: (parentId: string, authorName: string) => void;
};

function CommentNode({ comment, byParent, depth, parentAuthorName, onReply }: NodeProps) {
  const children = byParent.get(comment.id) ?? [];
  const cappedDepth = Math.min(depth, MAX_VISUAL_DEPTH);
  const flattened = depth > MAX_VISUAL_DEPTH;

  return (
    <View style={[styles.node, { marginLeft: cappedDepth * 18 }]}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: Colors.sakura }]}>
          {comment.author.avatarUrl ? (
            <Image
              source={{ uri: comment.author.avatarUrl }}
              style={styles.avatarImg}
              contentFit="cover"
              recyclingKey={comment.author.avatarUrl}
              {...AVATAR_IMAGE}
            />
          ) : (
            <Text style={styles.avatarInitial}>{comment.author.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
          )}
        </View>
        <View style={styles.bubble}>
          {flattened && !!parentAuthorName && <Text style={styles.replyingTo}>↳ replying to {parentAuthorName}</Text>}
          <View style={styles.bubbleHeader}>
            <Text style={styles.name} numberOfLines={1}>{comment.author.name || 'someone'}</Text>
            {!!comment.author.username && <Text style={styles.username}>@{comment.author.username}</Text>}
            <Text style={styles.time}>{timeAgo(comment.createdAt)}</Text>
          </View>
          <Text style={styles.body}>{comment.body}</Text>
          <Pressable onPress={() => onReply(comment.id, comment.author.name)} hitSlop={6}>
            <Text style={styles.replyAction}>reply</Text>
          </Pressable>
        </View>
      </View>
      {children.map((child) => (
        <CommentNode
          key={child.id}
          comment={child}
          byParent={byParent}
          depth={depth + 1}
          parentAuthorName={comment.author.name}
          onReply={onReply}
        />
      ))}
    </View>
  );
}

type Props = {
  comments: CommunityComment[];
  onReply: (parentId: string, authorName: string) => void;
};

export function CommentThread({ comments, onReply }: Props) {
  const byParent = buildTree(comments);
  const roots = byParent.get('root') ?? [];

  if (roots.length === 0) {
    return <Text style={styles.empty}>no comments yet — be the first ♡</Text>;
  }

  return (
    <View style={styles.container}>
      {roots.map((c) => (
        <CommentNode key={c.id} comment={c} byParent={byParent} depth={0} onReply={onReply} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  node: { gap: 10 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  avatar: {
    width: 30, height: 30, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  avatarImg: { width: 30, height: 30, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(13), color: '#fff' },
  bubble: {
    flex: 1,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r3,
    padding: Spacing.s3,
    ...Shadow.s1,
  },
  bubbleHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
  name: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: Colors.ink, flexShrink: 1 },
  username: { fontFamily: FontFamily.uiMedium, fontSize: sf(10.5), color: Colors.sakuraDeep },
  time: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink3, marginLeft: 'auto' },
  replyingTo: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.sakuraDeep, marginBottom: 2 },
  body: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink2, lineHeight: sf(18), marginTop: 2 },
  replyAction: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink3, marginTop: 4 },
  empty: {
    fontFamily: FontFamily.script, fontSize: sf(15), color: Colors.ink3, textAlign: 'center', paddingVertical: Spacing.s4,
  },
});
