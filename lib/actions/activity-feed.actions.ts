/**
 * 活動フィードServer Actions
 * Requirements: 12.5
 */

'use server';

import { activityFeedRepository } from '@/lib/repositories/activity-feed-repository';
import type { Result, AppError } from '@/lib/types/result';
import type { ActivityFeedItem } from '@/lib/types/activity';

/**
 * 活動フィードを取得する
 * @param limit 取得件数（デフォルト: 20）
 * @returns 活動フィードアイテムの配列
 */
export async function getActivityFeedAction(
  limit: number = 20
): Promise<Result<ActivityFeedItem[], AppError>> {
  return await activityFeedRepository.getRecentActivities(limit);
}
