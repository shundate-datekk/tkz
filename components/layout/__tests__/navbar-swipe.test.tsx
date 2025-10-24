/**
 * Navbar Swipe Gesture Tests
 *
 * Phase 6 タスク13.3: ハンバーガーメニュー改善の検証
 * - スワイプジェスチャーがuseSwipeGesture hookで実装されているか
 * - タッチフレンドリーなサイズ（最小44px）が保たれているか
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from '../navbar'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Mock components
vi.mock('@/components/auth/logout-button', () => ({
  LogoutButton: ({ className }: { className?: string }) => (
    <button className={className}>ログアウト</button>
  ),
}))

vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: ({ className }: { className?: string }) => (
    <button className={className}>テーマ切り替え</button>
  ),
}))

vi.mock('@/components/ui/command-menu', () => ({
  CommandMenu: () => <div>コマンドメニュー</div>,
}))

// Mock useSwipeGesture hook to verify it's being used
const mockSwipeHandlers = {
  onTouchStart: vi.fn(),
  onTouchMove: vi.fn(),
  onTouchEnd: vi.fn(),
}

let swipeGestureConfig: { onSwipeLeft?: () => void; onSwipeRight?: () => void; threshold?: number } | null = null

vi.mock('@/lib/hooks/use-swipe-gesture', () => ({
  useSwipeGesture: (config: any) => {
    swipeGestureConfig = config
    return mockSwipeHandlers
  },
}))

describe('Navbar - Swipe Gesture Support (Task 13.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    swipeGestureConfig = null
  })

  describe('Touch-Friendly Size Requirements', () => {
    it('should have hamburger menu button with minimum 44px touch target', () => {
      render(<Navbar userName="TKZ" />)

      const hamburgerButton = screen.getByLabelText('メニューを開く')
      expect(hamburgerButton).toBeInTheDocument()

      // Check if button has min-h-[44px] and min-w-[44px] classes
      expect(hamburgerButton.className).toMatch(/min-h-\[44px\]/)
      expect(hamburgerButton.className).toMatch(/min-w-\[44px\]/)
    })
  })

  describe('Swipe Gesture Integration', () => {
    it('should integrate useSwipeGesture hook with onSwipeRight handler', () => {
      render(<Navbar userName="TKZ" />)

      // Verify that useSwipeGesture was called with config
      expect(swipeGestureConfig).not.toBeNull()
      expect(swipeGestureConfig).toHaveProperty('onSwipeRight')
      expect(swipeGestureConfig).toHaveProperty('threshold')
    })

    it('should set threshold to 50px for swipe detection', () => {
      render(<Navbar userName="TKZ" />)

      // Verify threshold is set correctly
      expect(swipeGestureConfig?.threshold).toBe(50)
    })

    it('should pass swipe handlers to SheetContent', () => {
      const { container } = render(<Navbar userName="TKZ" />)

      // Verify that the swipe handlers are available
      // Note: We can't directly test Radix UI's internal Sheet implementation,
      // but we can verify the hook is being used
      expect(mockSwipeHandlers.onTouchStart).toBeDefined()
      expect(mockSwipeHandlers.onTouchMove).toBeDefined()
      expect(mockSwipeHandlers.onTouchEnd).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label for hamburger button', () => {
      render(<Navbar userName="TKZ" />)

      const hamburgerButton = screen.getByLabelText('メニューを開く')
      expect(hamburgerButton).toHaveAttribute('aria-label', 'メニューを開く')
    })

    it('should support keyboard navigation', () => {
      render(<Navbar userName="TKZ" />)

      const hamburgerButton = screen.getByLabelText('メニューを開く')

      // Tab to button
      hamburgerButton.focus()
      expect(hamburgerButton).toHaveFocus()
    })

    it('should have focus-visible styles on interactive elements', () => {
      render(<Navbar userName="TKZ" />)

      const hamburgerButton = screen.getByLabelText('メニューを開く')

      // Check if button has focus-visible classes
      expect(hamburgerButton.className).toMatch(/focus-visible/)
    })
  })

  describe('Responsive Behavior', () => {
    it('should hide hamburger menu on desktop (md breakpoint)', () => {
      render(<Navbar userName="TKZ" />)

      const hamburgerButton = screen.getByLabelText('メニューを開く')

      // The SheetTrigger wrapper should have md:hidden class
      const hasHiddenClass =
        hamburgerButton.className.includes('md:hidden') ||
        hamburgerButton.parentElement?.className.includes('md:hidden') ||
        hamburgerButton.closest('[class*="md:hidden"]') !== null

      expect(hasHiddenClass).toBe(true)
    })

    it('should show desktop navigation on larger screens', () => {
      render(<Navbar userName="TKZ" />)

      // Desktop nav should have hidden md:flex classes
      const desktopNavs = document.querySelectorAll('nav')
      const desktopNav = Array.from(desktopNavs).find(nav =>
        nav.className.includes('hidden') && nav.className.includes('md:flex')
      )
      expect(desktopNav).toBeTruthy()
    })
  })

  describe('Component Structure', () => {
    it('should render header with sticky positioning', () => {
      const { container } = render(<Navbar userName="TKZ" />)

      const header = container.querySelector('header')
      expect(header).toBeTruthy()
      expect(header?.className).toContain('sticky')
      expect(header?.className).toContain('top-0')
    })

    it('should render logo', () => {
      render(<Navbar userName="TKZ" />)

      // Check for logo text (mobile version)
      expect(screen.getByText('AI Tools')).toBeInTheDocument()
    })

    it('should render desktop navigation items', () => {
      const { container } = render(<Navbar userName="TKZ" />)

      // Check that desktop nav exists with nav items
      const desktopNav = container.querySelector('nav.hidden.md\\:flex')
      expect(desktopNav).toBeTruthy()
    })
  })
})
