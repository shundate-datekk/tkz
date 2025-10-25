/**
 * 活動フィード関連の型定義
 * Requirements: 12.5
 */

/**
 * 活動の種類
 */
export type ActivityType =
  | 'tool_created' // ツール登録
  | 'tool_updated' // ツール編集
  | 'like' // いいね
  | 'comment'; // コメント

/**
 * 活動フィードアイテム
 */
export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  actorId: string;
  actorName: string;
  resourceType: 'tool';
  resourceId: string;
  resourceName: string;
  message: string; // 表示用メッセージ（例：「TKZさんが新しいツール「ChatGPT」を登録しました」）
  createdAt: string; // ISO 8601形式
}
