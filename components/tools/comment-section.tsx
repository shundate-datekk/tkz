/**
 * コメントセクションコンポーネント（クライアントコンポーネント）
 * Requirements: 12.1, 12.2
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommentForm } from './comment-form';
import { CommentList } from './comment-list';
import type { CommentWithUser } from '@/lib/types/comment';

interface CommentSectionProps {
  toolId: string;
  initialComments: CommentWithUser[];
  currentUserId: string;
}

export function CommentSection({
  toolId,
  initialComments,
  currentUserId,
}: CommentSectionProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCommentPosted = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCommentDeleted = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCommentUpdated = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>コメント ({initialComments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* コメント投稿フォーム */}
        <CommentForm toolId={toolId} onCommentPosted={handleCommentPosted} />

        {/* コメント一覧 */}
        <div>
          <h3 className="mb-4 text-sm font-semibold">
            すべてのコメント ({initialComments.length})
          </h3>
          <CommentList
            comments={initialComments}
            currentUserId={currentUserId}
            isLoading={isRefreshing}
            onCommentDeleted={handleCommentDeleted}
            onCommentUpdated={handleCommentUpdated}
          />
        </div>
      </CardContent>
    </Card>
  );
}
