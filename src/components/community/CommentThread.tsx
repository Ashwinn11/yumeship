import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { CommunityComment } from '@/store/community';

import { MentionText } from './MentionText';
import { PostAuthorHeader } from './PostAuthorHeader';

const MAX_VISUAL_DEPTH = 2;

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
  /** viewer's id — only their own comments offer a delete; everyone else's offer a report */
  viewerId?: string;
  onDelete: (commentId: string) => void;
  onReport: (commentId: string) => void;
};

// One self-contained card per comment — same shell PostCard uses (avatar(s),
// name and F/O tag all inside the bordered card, body and actions below) so
// a comment and a post-in-a-list read as the same kind of thing.
function CommentNode({ comment, byParent, depth, parentAuthorName, onReply, viewerId, onDelete, onReport }: NodeProps) {
  const children = byParent.get(comment.id) ?? [];
  const cappedDepth = Math.min(depth, MAX_VISUAL_DEPTH);
  const flattened = depth > MAX_VISUAL_DEPTH;

  return (
    <View style={[styles.node, { marginLeft: cappedDepth * 18 }]}>
      <View style={styles.bubble}>
        {flattened && !!parentAuthorName && <Text style={styles.replyingTo}>↳ replying to {parentAuthorName}</Text>}
        <PostAuthorHeader author={comment.author} fo={comment.fo} createdAt={comment.createdAt} />
        <MentionText body={comment.body} mentions={comment.mentions} style={styles.body} />
        <View style={styles.actions}>
          <Pressable onPress={() => onReply(comment.id, comment.author.name)} hitSlop={6}>
            <Text style={styles.replyAction}>reply</Text>
          </Pressable>
          {viewerId === comment.author.id ? (
            <Pressable onPress={() => onDelete(comment.id)} hitSlop={6}>
              <Text style={[styles.replyAction, styles.deleteAction]}>delete</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => onReport(comment.id)} hitSlop={6}>
              <Text style={styles.replyAction}>report</Text>
            </Pressable>
          )}
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
          viewerId={viewerId}
          onDelete={onDelete}
          onReport={onReport}
        />
      ))}
    </View>
  );
}

type Props = {
  comments: CommunityComment[];
  onReply: (parentId: string, authorName: string) => void;
  viewerId?: string;
  onDelete: (commentId: string) => void;
  onReport: (commentId: string) => void;
};

export function CommentThread({ comments, onReply, viewerId, onDelete, onReport }: Props) {
  const byParent = buildTree(comments);
  const roots = byParent.get('root') ?? [];

  if (roots.length === 0) {
    return <Text style={styles.empty}>no comments yet — be the first ♡</Text>;
  }

  return (
    <View style={styles.container}>
      {roots.map((c) => (
        <CommentNode key={c.id} comment={c} byParent={byParent} depth={0} onReply={onReply} viewerId={viewerId} onDelete={onDelete} onReport={onReport} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  node: { gap: 10 },
  bubble: {
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r3,
    padding: Spacing.s3,
    gap: 6,
    ...Shadow.s1,
  },
  replyingTo: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.sakuraDeep },
  body: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink2, lineHeight: sf(18) },
  actions: { flexDirection: 'row', gap: 14 },
  replyAction: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink3 },
  deleteAction: { color: Colors.ember },
  empty: {
    fontFamily: FontFamily.script, fontSize: sf(15), color: Colors.ink3, textAlign: 'center', paddingVertical: Spacing.s4,
  },
});
