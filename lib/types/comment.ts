/**
 * コメント関連の型定義
 * Requirements: 12.1, 12.2
 */

/**
 * コメントの基本型
 */
export interface Comment {
  id: string;
  tool_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name?: string; // JOIN時に取得
}

/**
 * コメント作成用の入力型
 */
export interface CreateCommentInput {
  toolId: string;
  content: string;
}

/**
 * コメント更新用の入力型
 */
export interface UpdateCommentInput {
  commentId: string;
  content: string;
}

/**
 * コメント削除用の入力型
 */
export interface DeleteCommentInput {
  commentId: string;
}

/**
 * コメント一覧取得の結果型
 */
export interface CommentWithUser extends Comment {
  user_name: string;
}
