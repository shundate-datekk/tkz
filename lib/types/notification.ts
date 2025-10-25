/**
 * 通知システムの型定義
 * Requirements: 12.6, 12.7, 12.8
 */

export type NotificationType =
  | 'tool_created' // ツール登録
  | 'comment' // コメント投稿
  | 'like'; // いいね

export interface Notification {
  id: string;
  userId: string; // 通知を受け取るユーザー
  actorId: string; // アクションを起こしたユーザー
  actorName: string; // アクターの表示名
  type: NotificationType;
  resourceType: 'tool' | 'comment';
  resourceId: string;
  resourceName: string; // ツール名など
  message: string; // 通知メッセージ
  isRead: boolean;
  createdAt: string; // ISO 8601形式
}

export interface NotificationSettings {
  userId: string;
  enableToolCreated: boolean;
  enableComment: boolean;
  enableLike: boolean;
}
