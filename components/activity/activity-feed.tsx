/**
 * 活動フィードコンポーネント
 * Requirements: 12.5
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Heart, MessageSquare, Plus, Edit, Activity } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ActivityFeedItem, ActivityType } from '@/lib/types/activity';

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
  isLoading?: boolean;
}

/**
 * 活動タイプに応じたアイコンを返す
 */
function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'tool_created':
      return <Plus className="h-5 w-5 text-primary" />;
    case 'tool_updated':
      return <Edit className="h-5 w-5 text-blue-500" />;
    case 'like':
      return <Heart className="h-5 w-5 text-red-500" />;
    case 'comment':
      return <MessageSquare className="h-5 w-5 text-green-500" />;
  }
}

/**
 * 活動タイプに応じた色を返す
 */
function getActivityColor(type: ActivityType): string {
  switch (type) {
    case 'tool_created':
      return 'bg-primary/10 text-primary';
    case 'tool_updated':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'like':
      return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
    case 'comment':
      return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
  }
}

export function ActivityFeed({ activities, isLoading = false }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            活動フィード
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <ActivityFeedSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            活動フィード
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              まだ活動がありません。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          活動フィード
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const createdDate = new Date(activity.createdAt);
            const relativeTime = formatDistanceToNow(createdDate, {
              addSuffix: true,
              locale: ja,
            });

            return (
              <Link
                key={activity.id}
                href={`/tools/${activity.resourceId}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-start gap-3">
                  {/* アイコン */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {relativeTime}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 活動フィードスケルトン
 */
function ActivityFeedSkeleton() {
  return (
    <div
      className="flex items-start gap-3 rounded-lg border p-4"
      data-testid="activity-feed-skeleton"
    >
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}
