import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNavigation } from '../bottom-navigation';

// Mock usePathname from next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('BottomNavigation', () => {
  it('主要4機能のナビゲーションアイテムを表示する', () => {
    render(<BottomNavigation />);
    
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('ツール')).toBeInTheDocument();
    expect(screen.getByText('プロンプト')).toBeInTheDocument();
    expect(screen.getByText('履歴')).toBeInTheDocument();
  });

  it('各アイテムにアイコンが表示される', () => {
    render(<BottomNavigation />);
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    
    // アイコンがSVGとして存在することを確認
    links.forEach(link => {
      const svg = link.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  it('現在のページがハイライト表示される', () => {
    render(<BottomNavigation />);
    
    const homeLink = screen.getByRole('link', { name: /ホーム/i });
    expect(homeLink).toHaveClass('text-primary');
  });

  it('タッチフレンドリーなサイズ（最小44px）を持つ', () => {
    render(<BottomNavigation />);
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      // Check for min-h-[44px] and min-w-[44px] classes
      expect(link).toHaveClass('min-h-[44px]');
      expect(link).toHaveClass('min-w-[44px]');
    });
  });

  it('モバイル表示時のみ表示される（md以下）', () => {
    const { container } = render(<BottomNavigation />);
    
    const nav = container.firstChild as HTMLElement;
    expect(nav).toHaveClass('md:hidden');
  });

  it('固定位置（bottom-0）に配置される', () => {
    const { container } = render(<BottomNavigation />);
    
    const nav = container.firstChild as HTMLElement;
    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('bottom-0');
  });
});
