import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Navbar } from '../navbar';
import { usePathname } from 'next/navigation';

// Next.js navigation hooks のモック
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

// auth/logout-button のモック
vi.mock('@/components/auth/logout-button', () => ({
  LogoutButton: ({ className }: { className?: string }) => (
    <button className={className} data-testid="logout-button">ログアウト</button>
  ),
}));

// ui/theme-toggle のモック
vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: ({ className }: { className?: string }) => (
    <button className={className} data-testid="theme-toggle">テーマ切替</button>
  ),
}));

// ui/command-menu のモック
vi.mock('@/components/ui/command-menu', () => ({
  CommandMenu: () => <div data-testid="command-menu">コマンドメニュー</div>,
}));

/**
 * Navbarコンポーネントのテスト
 * 
 * モバイル最適化（ハンバーガーメニュー、タッチターゲット）と
 * アクセシビリティ（aria-label、focus-visible、Escキー）を検証します。
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.7, 6.2, 6.3, 6.4, 7.5
 */
describe('Navbar', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/');
  });

  describe('モバイル最適化 (Task 4.1)', () => {
    it('should show responsive logo text', () => {
      render(<Navbar />);

      // デスクトップ: 完全版ロゴ
      expect(screen.getByText('AI Tools & Sora Prompt Generator')).toBeInTheDocument();
      
      // モバイル: 短縮版ロゴ
      expect(screen.getByText('AI Tools')).toBeInTheDocument();
    });

    it('should show hamburger menu on mobile', () => {
      render(<Navbar />);

      const hamburgerButton = screen.getByRole('button', { name: /メニューを開く/i });
      expect(hamburgerButton).toBeInTheDocument();
      expect(hamburgerButton).toHaveClass('md:hidden');
    });

    it('should have minimum 44px touch target for hamburger button', () => {
      render(<Navbar />);

      const hamburgerButton = screen.getByRole('button', { name: /メニューを開く/i });
      expect(hamburgerButton).toHaveClass('min-h-[44px]');
      expect(hamburgerButton).toHaveClass('min-w-[44px]');
    });

    it('should hide desktop navigation on mobile', () => {
      render(<Navbar />);

      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');
    });

    it('should open mobile menu with 350px width', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const hamburgerButton = screen.getByRole('button', { name: /メニューを開く/i });
      await user.click(hamburgerButton);

      // SheetContentが表示される
      const sheetContent = screen.getByRole('dialog');
      expect(sheetContent).toHaveClass('w-[350px]');
    });

    it('should have minimum 44px touch targets in mobile menu', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const hamburgerButton = screen.getByRole('button', { name: /メニューを開く/i });
      await user.click(hamburgerButton);

      // モバイルメニュー内のリンク
      const homeLink = screen.getByRole('link', { name: /ホーム/i });
      expect(homeLink).toHaveClass('min-h-[44px]');

      const toolsLink = screen.getByRole('link', { name: /AIツール/i });
      expect(toolsLink).toHaveClass('min-h-[44px]');
    });
  });

  describe('アクセシビリティ向上 (Task 4.2)', () => {
    it('should have aria-label on hamburger menu button', () => {
      render(<Navbar />);

      const hamburgerButton = screen.getByRole('button', { name: /メニューを開く/i });
      expect(hamburgerButton).toHaveAttribute('aria-label', 'メニューを開く');
    });

    it('should have focus-visible styles on desktop links', () => {
      render(<Navbar />);

      // デスクトップナビゲーション内のリンクを取得
      const desktopNav = screen.getByRole('navigation');
      const links = within(desktopNav).getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveClass('focus-visible:outline-none');
        expect(link).toHaveClass('focus-visible:ring-2');
      });
    });

    it('should have focus-visible styles on mobile links', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const hamburgerButton = screen.getByRole('button', { name: /メニューを開く/i });
      await user.click(hamburgerButton);

      const mobileLinks = screen.getAllByRole('link');
      // モバイルメニュー内のリンク（ロゴリンクを除く）
      const menuLinks = mobileLinks.filter(link => 
        link.textContent?.includes('ホーム') ||
        link.textContent?.includes('AIツール') ||
        link.textContent?.includes('プロンプト生成') ||
        link.textContent?.includes('履歴')
      );

      menuLinks.forEach((link) => {
        expect(link).toHaveClass('focus-visible:outline-none');
        expect(link).toHaveClass('focus-visible:ring-2');
      });
    });

    it('should close mobile menu with Esc key', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // メニューを開く
      const hamburgerButton = screen.getByRole('button', { name: /メニューを開く/i });
      await user.click(hamburgerButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Escキーで閉じる
      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close mobile menu when clicking a nav link', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // メニューを開く
      const hamburgerButton = screen.getByRole('button', { name: /メニューを開く/i });
      await user.click(hamburgerButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // リンクをクリック
      const toolsLink = screen.getByRole('link', { name: /AIツール/i });
      await user.click(toolsLink);

      // メニューが閉じる（少し待つ必要がある）
      await vi.waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('ナビゲーションアクティブ状態', () => {
    it('should highlight active page in desktop navigation', () => {
      vi.mocked(usePathname).mockReturnValue('/tools');
      render(<Navbar />);

      const desktopNav = screen.getByRole('navigation');
      const toolsLink = within(desktopNav).getByRole('link', { name: /AIツール/i });
      
      expect(toolsLink).toHaveClass('text-primary');
    });

    it('should highlight active page in mobile navigation', async () => {
      const user = userEvent.setup();
      vi.mocked(usePathname).mockReturnValue('/prompt');
      render(<Navbar />);

      const hamburgerButton = screen.getByRole('button', { name: /メニューを開く/i });
      await user.click(hamburgerButton);

      const promptLink = screen.getByRole('link', { name: /プロンプト生成/i });
      expect(promptLink).toHaveClass('bg-accent');
      expect(promptLink).toHaveClass('text-accent-foreground');
    });
  });

  describe('ユーザー情報表示', () => {
    it('should display user name on desktop', () => {
      render(<Navbar userName="テストユーザー" />);

      expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    });

    it('should display user name in mobile menu', async () => {
      const user = userEvent.setup();
      render(<Navbar userName="テストユーザー" />);

      const hamburgerButton = screen.getByRole('button', { name: /メニューを開く/i });
      await user.click(hamburgerButton);

      // モバイルメニュー内のユーザー名
      expect(screen.getAllByText('テストユーザー')).toHaveLength(2); // デスクトップ + モバイル
    });

    it('should show logout button on desktop and mobile', async () => {
      const user = userEvent.setup();
      render(<Navbar userName="テストユーザー" />);

      // デスクトップのLogoutButtonは常に表示
      expect(screen.getAllByTestId('logout-button')).toHaveLength(1);

      // モバイルメニューを開く
      const hamburgerButton = screen.getByRole('button', { name: /メニューを開く/i });
      await user.click(hamburgerButton);

      // モバイルメニュー内のLogoutButtonも表示される
      expect(screen.getAllByTestId('logout-button')).toHaveLength(2); // デスクトップ + モバイル
    });
  });
});
