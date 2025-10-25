/**
 * コメント投稿フォームコンポーネント
 * Requirements: 12.1, 12.2
 */

'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FormFeedback } from '@/components/ui/form-feedback';
import { createCommentAction } from '@/lib/actions/comment.actions';

interface CommentFormProps {
  toolId: string;
  onCommentPosted?: () => void;
}

const MAX_COMMENT_LENGTH = 1000;
const MIN_COMMENT_LENGTH = 1;

export function CommentForm({ toolId, onCommentPosted }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const charCount = content.length;
  const isValid = charCount >= MIN_COMMENT_LENGTH && charCount <= MAX_COMMENT_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValid) {
      setError('コメントは1文字以上、1000文字以内で入力してください');
      return;
    }

    startTransition(async () => {
      const result = await createCommentAction({
        toolId,
        content: content.trim(),
      });

      if (result.success) {
        setContent('');
        setError(null);
        onCommentPosted?.();
      } else {
        setError(result.error.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="comment-content" className="text-sm font-semibold">
          コメントを投稿
        </label>
        <TextareaWithCounter
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="コメントを入力してください（1〜1000文字）"
          maxLength={MAX_COMMENT_LENGTH}
          rows={4}
          disabled={isPending}
          aria-label="コメント入力"
          aria-invalid={!!error}
          aria-describedby={error ? 'comment-error' : undefined}
          className={error ? 'border-destructive' : ''}
          showCounter={true}
        />
      </div>

      {error && (
        <FormFeedback
          id="comment-error"
          type="error"
          message={error}
        />
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isValid || isPending}
          className="relative"
        >
          {isPending && (
            <span className="mr-2">
              <LoadingSpinner size="sm" data-testid="loading-spinner" />
            </span>
          )}
          {isPending ? '投稿中...' : '投稿'}
        </Button>
      </div>
    </form>
  );
}
