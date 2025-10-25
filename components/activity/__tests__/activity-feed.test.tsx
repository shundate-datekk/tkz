/**
 * ActivityFeed コンポーネントのテスト
 * Requirements: 12.5
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityFeed } from '../activity-feed';
import type { ActivityFeedItem } from '@/lib/types/activity';

describe('ActivityFeed', () => {
  const mockActivities: ActivityFeedItem[] = [
    {
      id: 'tool_created_1',
      type: 'tool_created',
      actorId: 'user1',
      actorName: 'TKZ',
      resourceType: 'tool',
      resourceId: 'tool1',
      resourceName: 'ChatGPT',
      message: 'TKZさんが新しいツール「ChatGPT」を登録しました',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5分前
    },
    {
      id: 'like_tool1_user2',
      type: 'like',
      actorId: 'user2',
      actorName: 'コボちゃん',
      resourceType: 'tool',
      resourceId: 'tool1',
      resourceName: 'ChatGPT',
      message: 'コボちゃんさんがツール「ChatGPT」にいいねしました',
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10分前
    },
    {
      id: 'comment_1',
      type: 'comment',
      actorId: 'user1',
      actorName: 'TKZ',
      resourceType: 'tool',
      resourceId: 'tool1',
      resourceName: 'ChatGPT',
      message: 'TKZさんがツール「ChatGPT」にコメントしました',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15分前
    },
    {
      id: 'tool_updated_tool1',
      type: 'tool_updated',
      actorId: 'user1',
      actorName: 'TKZ',
      resourceType: 'tool',
      resourceId: 'tool1',
      resourceName: 'ChatGPT',
      message: 'TKZさんがツール「ChatGPT」を編集しました',
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20分前
    },
  ];

  describe('活動フィードの表示', () => {
    it('活動フィードのタイトルが表示されるべき', () => {
      render(<ActivityFeed activities={mockActivities} />);

      expect(screen.getByText('活動フィード')).toBeInTheDocument();
    });

    it('活動アイテムが正しく表示されるべき', () => {
      render(<ActivityFeed activities={mockActivities} />);

      expect(
        screen.getByText('TKZさんが新しいツール「ChatGPT」を登録しました')
      ).toBeInTheDocument();
      expect(
        screen.getByText('コボちゃんさんがツール「ChatGPT」にいいねしました')
      ).toBeInTheDocument();
      expect(
        screen.getByText('TKZさんがツール「ChatGPT」にコメントしました')
      ).toBeInTheDocument();
      expect(
        screen.getByText('TKZさんがツール「ChatGPT」を編集しました')
      ).toBeInTheDocument();
    });

    it('相対時間が表示されるべき', () => {
      render(<ActivityFeed activities={mockActivities} />);

      // date-fnsのja localeで「〜分前」「〜時間前」などが表示される
      const timeElements = screen.getAllByText(/前$/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  describe('空の状態', () => {
    it('活動がない場合は空の状態を表示するべき', () => {
      render(<ActivityFeed activities={[]} />);

      expect(screen.getByText('活動フィード')).toBeInTheDocument();
      expect(
        screen.getByText('まだ活動がありません。')
      ).toBeInTheDocument();
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中はスケルトンを表示するべき', () => {
      render(<ActivityFeed activities={[]} isLoading={true} />);

      const skeletons = screen.getAllByTestId('activity-feed-skeleton');
      expect(skeletons).toHaveLength(5);
    });

    it('ローディング中もタイトルは表示されるべき', () => {
      render(<ActivityFeed activities={[]} isLoading={true} />);

      expect(screen.getByText('活動フィード')).toBeInTheDocument();
    });
  });

  describe('活動アイテム数', () => {
    it('すべての活動アイテムが表示されるべき', () => {
      render(<ActivityFeed activities={mockActivities} />);

      // 各活動アイテムが表示されていることを確認
      expect(screen.getAllByText(/さんが/)).toHaveLength(mockActivities.length);
    });
  });

  describe('活動タイプ別のアイコン表示', () => {
    it('tool_created タイプは Plus アイコンを表示するべき', () => {
      const activities: ActivityFeedItem[] = [
        {
          id: 'tool_created_1',
          type: 'tool_created',
          actorId: 'user1',
          actorName: 'TKZ',
          resourceType: 'tool',
          resourceId: 'tool1',
          resourceName: 'ChatGPT',
          message: 'TKZさんが新しいツール「ChatGPT」を登録しました',
          createdAt: new Date().toISOString(),
        },
      ];

      const { container } = render(<ActivityFeed activities={activities} />);

      // Plusアイコンのクラスを持つ要素が存在することを確認
      const iconElement = container.querySelector('.text-primary');
      expect(iconElement).toBeInTheDocument();
    });

    it('like タイプは Heart アイコンを表示するべき', () => {
      const activities: ActivityFeedItem[] = [
        {
          id: 'like_1',
          type: 'like',
          actorId: 'user1',
          actorName: 'TKZ',
          resourceType: 'tool',
          resourceId: 'tool1',
          resourceName: 'ChatGPT',
          message: 'TKZさんがツール「ChatGPT」にいいねしました',
          createdAt: new Date().toISOString(),
        },
      ];

      const { container } = render(<ActivityFeed activities={activities} />);

      // Heartアイコンの色クラスを持つ要素が存在することを確認
      const iconElement = container.querySelector('.text-red-500');
      expect(iconElement).toBeInTheDocument();
    });

    it('comment タイプは MessageSquare アイコンを表示するべき', () => {
      const activities: ActivityFeedItem[] = [
        {
          id: 'comment_1',
          type: 'comment',
          actorId: 'user1',
          actorName: 'TKZ',
          resourceType: 'tool',
          resourceId: 'tool1',
          resourceName: 'ChatGPT',
          message: 'TKZさんがツール「ChatGPT」にコメントしました',
          createdAt: new Date().toISOString(),
        },
      ];

      const { container } = render(<ActivityFeed activities={activities} />);

      // MessageSquareアイコンの色クラスを持つ要素が存在することを確認
      const iconElement = container.querySelector('.text-green-500');
      expect(iconElement).toBeInTheDocument();
    });

    it('tool_updated タイプは Edit アイコンを表示するべき', () => {
      const activities: ActivityFeedItem[] = [
        {
          id: 'tool_updated_1',
          type: 'tool_updated',
          actorId: 'user1',
          actorName: 'TKZ',
          resourceType: 'tool',
          resourceId: 'tool1',
          resourceName: 'ChatGPT',
          message: 'TKZさんがツール「ChatGPT」を編集しました',
          createdAt: new Date().toISOString(),
        },
      ];

      const { container } = render(<ActivityFeed activities={activities} />);

      // Editアイコンの色クラスを持つ要素が存在することを確認
      const iconElement = container.querySelector('.text-blue-500');
      expect(iconElement).toBeInTheDocument();
    });
  });
});
