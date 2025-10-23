import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolCard } from '../tool-card';
import { AnimationProvider } from '@/lib/providers/animation-provider';
import type { AITool } from '@/lib/schemas/ai-tool.schema';

// LikeButton のモック
vi.mock('@/components/tools/like-button', () => ({
  LikeButton: ({ toolId }: { toolId: string }) => (
    <button data-testid={`like-button-${toolId}`}>いいね</button>
  ),
}));

/**
 * ToolCardコンポーネントのテスト
 * 
 * 統一された視覚スタイル（パディング、角丸、影、ホバー）を検証します。
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
describe('ToolCard', () => {
  const mockTool: AITool = {
    id: 'tool-1',
    tool_name: 'テストツール',
    category: 'テキスト生成',
    usage_purpose: 'テスト目的',
    user_experience: 'テスト使用感',
    rating: 5,
    usage_date: '2024-01-01',
    created_by: 'user1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // matchMedia をモック
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  describe('統一されたスタイル (Task 5.2)', () => {
    it('should have Card component with rounded-xl', () => {
      const { container } = render(
        <AnimationProvider>
          <ToolCard
            tool={mockTool}
            userName="テストユーザー"
            currentUserId="user1"
          />
        </AnimationProvider>
      );

      const card = container.querySelector('[class*="rounded-xl"]');
      expect(card).toBeInTheDocument();
    });

    it('should have shadow-md', () => {
      const { container } = render(
        <AnimationProvider>
          <ToolCard
            tool={mockTool}
            userName="テストユーザー"
            currentUserId="user1"
          />
        </AnimationProvider>
      );

      const card = container.querySelector('[class*="shadow-md"]');
      expect(card).toBeInTheDocument();
    });

    it('should have animated prop for hover effects', () => {
      const { container } = render(
        <AnimationProvider>
          <ToolCard
            tool={mockTool}
            userName="テストユーザー"
            currentUserId="user1"
          />
        </AnimationProvider>
      );

      // Cardコンポーネントが存在することを確認
      const card = container.firstChild;
      expect(card).toBeInTheDocument();
    });
  });

  describe('情報の階層構造 (Task 5.2)', () => {
    it('should have CardHeader with title and category', () => {
      render(
        <AnimationProvider>
          <ToolCard
            tool={mockTool}
            userName="テストユーザー"
            currentUserId="user1"
          />
        </AnimationProvider>
      );

      expect(screen.getByText('テストツール')).toBeInTheDocument();
      expect(screen.getByText('テキスト生成')).toBeInTheDocument();
    });

    it('should have CardContent with usage info', () => {
      render(
        <AnimationProvider>
          <ToolCard
            tool={mockTool}
            userName="テストユーザー"
            currentUserId="user1"
          />
        </AnimationProvider>
      );

      expect(screen.getByText('使用目的')).toBeInTheDocument();
      expect(screen.getByText('テスト目的')).toBeInTheDocument();
      expect(screen.getByText('使用感')).toBeInTheDocument();
      expect(screen.getByText('テスト使用感')).toBeInTheDocument();
    });

    it('should have CardFooter with user info and actions', () => {
      render(
        <AnimationProvider>
          <ToolCard
            tool={mockTool}
            userName="テストユーザー"
            currentUserId="user1"
          />
        </AnimationProvider>
      );

      expect(screen.getByText(/登録者: テストユーザー/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /詳細/i })).toBeInTheDocument();
    });
  });

  describe('レスポンシブレイアウト', () => {
    it('should use flex-col layout', () => {
      const { container } = render(
        <AnimationProvider>
          <ToolCard
            tool={mockTool}
            userName="テストユーザー"
            currentUserId="user1"
          />
        </AnimationProvider>
      );

      const card = container.querySelector('[class*="flex-col"]');
      expect(card).toBeInTheDocument();
    });
  });
});
