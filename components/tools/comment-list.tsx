/**
 * コメント一覧コンポーネント
 * Requirements: 12.1, 12.2
 */

'use client';

import { useState, useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FormFeedback } from '@/components/ui/form-feedback';
import { Skeleton } from '@/components/ui/skeleton';
import {
  deleteCommentAction,
  updateCommentAction,
} from '@/lib/actions/comment.actions';
import type { CommentWithUser } from '@/lib/types/comment';

interface CommentListProps {
  comments: CommentWithUser[];
  currentUserId: string;
  isLoading?: boolean;
  onCommentDeleted?: () => void;
  onCommentUpdated?: () => void;
}

const MAX_COMMENT_LENGTH = 1000;

export function CommentList({
  comments,
  currentUserId,
  isLoading = false,
  onCommentDeleted,
  onCommentUpdated,
}: CommentListProps) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <CommentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          まだコメントがありません。最初のコメントを投稿してみましょう！
        </p>
      </div>
    );
  }

  const handleEditStart = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditContent(content);
    setError(null);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditContent('');
    setError(null);
  };

  const handleEditSave = async (commentId: string) => {
    if (!editContent.trim() || editContent.length > MAX_COMMENT_LENGTH) {
      setError('コメントは1文字以上、1000文字以内で入力してください');
      return;
    }

    startTransition(async () => {
      const result = await updateCommentAction({
        commentId,
        content: editContent.trim(),
      });

      if (result.success) {
        setEditingCommentId(null);
        setEditContent('');
        setError(null);
        onCommentUpdated?.();
      } else {
        setError(result.error.message);
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteCommentId) return;

    startTransition(async () => {
      const result = await deleteCommentAction(deleteCommentId);

      if (result.success) {
        setDeleteCommentId(null);
        onCommentDeleted?.();
      } else {
        setError(result.error.message);
      }
    });
  };

  // 新しい順にソート（created_atの降順）
  const sortedComments = [...comments].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedComments.map((comment) => {
        const isOwner = comment.user_id === currentUserId;
        const isEditing = editingCommentId === comment.id;
        const createdDate = new Date(comment.created_at);
        const relativeTime = formatDistanceToNow(createdDate, {
          addSuffix: true,
          locale: ja,
        });

        return (
          <article key={comment.id}>
            <Card className="p-4">
              <div className="space-y-2">
              {/* ヘッダー */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{comment.user_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {relativeTime}
                    </span>
                  </div>
                </div>
                {isOwner && !isEditing && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleEditStart(comment.id, comment.content)
                      }
                      aria-label={`コメントを編集: ${comment.content.slice(0, 20)}`}
                      disabled={isPending}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteCommentId(comment.id)}
                      aria-label={`コメントを削除: ${comment.content.slice(0, 20)}`}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>

              {/* コンテンツ */}
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    maxLength={MAX_COMMENT_LENGTH}
                    rows={4}
                    disabled={isPending}
                    aria-invalid={!!error}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {editContent.length} / {MAX_COMMENT_LENGTH}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditCancel}
                        disabled={isPending}
                      >
                        キャンセル
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditSave(comment.id)}
                        disabled={
                          isPending ||
                          !editContent.trim() ||
                          editContent.length > MAX_COMMENT_LENGTH
                        }
                      >
                        {isPending ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            保存中...
                          </>
                        ) : (
                          '保存'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm">
                  {comment.content}
                </p>
              )}

              {/* エラー表示 */}
              {error && isEditing && (
                <FormFeedback type="error" message={error} />
              )}
            </div>
          </Card>
          </article>
        );
      })}

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        open={!!deleteCommentId}
        onOpenChange={(open) => !open && setDeleteCommentId(null)}
        title="コメントを削除"
        description="このコメントを削除しますか？この操作は取り消せません。"
        confirmText="削除"
        cancelText="キャンセル"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

/**
 * コメントスケルトン
 */
function CommentSkeleton() {
  return (
    <Card className="p-4" data-testid="comment-skeleton">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    </Card>
  );
}
