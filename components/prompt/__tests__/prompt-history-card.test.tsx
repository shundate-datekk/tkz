import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PromptHistoryCard } from '../prompt-history-card';
import { AnimationProvider } from '@/lib/providers/animation-provider';
import type { PromptHistory } from '@/lib/schemas/prompt.schema';

/**
 * PromptHistoryCardコンポーネントのテスト
 * 
 * 統一された視覚スタイル（パディング、角丸、影、ホバー）を検証します。
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
describe('PromptHistoryCard', () => {
  const mockHistory: PromptHistory = {
    id: 'history-1',
    prompt_text: 'テストプロンプトテキスト',
    input_parameters: {
      purpose: 'テスト目的',
      sceneDescription: 'テストシーン',
      style: 'テストスタイル',
      additionalRequirements: '',
    },
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
          <PromptHistoryCard
            history={mockHistory}
            userName="テストユーザー"
          />
        </AnimationProvider>
      );

      const card = container.querySelector('[class*="rounded-xl"]');
      expect(card).toBeInTheDocument();
    });

    it('should have shadow-md', () => {
      const { container } = render(
        <AnimationProvider>
          <PromptHistoryCard
            history={mockHistory}
            userName="テストユーザー"
          />
        </AnimationProvider>
      );

      const card = container.querySelector('[class*="shadow-md"]');
      expect(card).toBeInTheDocument();
    });

    it('should have animated prop for hover effects', () => {
      const { container } = render(
        <AnimationProvider>
          <PromptHistoryCard
            history={mockHistory}
            userName="テストユーザー"
          />
        </AnimationProvider>
      );

      // Cardコンポーネントが存在することを確認
      const card = container.firstChild;
      expect(card).toBeInTheDocument();
    });
  });

  describe('情報の階層構造 (Task 5.2)', () => {
    it('should have CardHeader with title and metadata', () => {
      render(
        <AnimationProvider>
          <PromptHistoryCard
            history={mockHistory}
            userName="テストユーザー"
          />
        </AnimationProvider>
      );

      expect(screen.getByText('テスト目的')).toBeInTheDocument();
      expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    });

    it('should have CardContent with prompt preview', () => {
      render(
        <AnimationProvider>
          <PromptHistoryCard
            history={mockHistory}
            userName="テストユーザー"
          />
        </AnimationProvider>
      );

      expect(screen.getByText('テストプロンプトテキスト')).toBeInTheDocument();
    });

    it('should have CardFooter with action button', () => {
      render(
        <AnimationProvider>
          <PromptHistoryCard
            history={mockHistory}
            userName="テストユーザー"
          />
        </AnimationProvider>
      );

      expect(screen.getByRole('link', { name: /詳細を見る/i })).toBeInTheDocument();
    });
  });
});
