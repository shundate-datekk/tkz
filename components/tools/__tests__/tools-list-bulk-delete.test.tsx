/**
 * Tools List Bulk Delete with Undo Tests
 *
 * Phase 5 タスク11.2 & 12.1: 一括削除とUndo機能の統合テスト
 * - 一括削除ダイアログが正しく表示されるか
 * - 削除成功後にUndoボタン付きToastが表示されるか
 * - Undoボタンクリックで復元されるか
 * - 10秒のタイムアウトが設定されているか
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToolsList } from '../tools-list'
import { toast } from 'sonner'
import { bulkDeleteToolsAction, bulkRestoreToolsAction } from '@/lib/actions/ai-tool.actions'

// Mock Server Actions
vi.mock('@/lib/actions/ai-tool.actions', () => ({
  bulkDeleteToolsAction: vi.fn(),
  bulkRestoreToolsAction: vi.fn(),
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

describe('ToolsList - Bulk Delete with Undo', () => {
  const mockTools = [
    {
      id: 'tool-1',
      tool_name: 'Claude Code',
      category: '開発ツール',
      usage_purpose: 'コード生成',
      user_experience: '非常に便利',
      rating: 5,
      usage_date: '2025-01-20',
      created_at: '2025-01-20T00:00:00Z',
      updated_at: '2025-01-20T00:00:00Z',
      created_by: 'user-1',
      deleted_at: null,
    },
    {
      id: 'tool-2',
      tool_name: 'ChatGPT',
      category: '対話AI',
      usage_purpose: '質問応答',
      user_experience: '使いやすい',
      rating: 4,
      usage_date: '2025-01-19',
      created_at: '2025-01-19T00:00:00Z',
      updated_at: '2025-01-19T00:00:00Z',
      created_by: 'user-1',
      deleted_at: null,
    },
    {
      id: 'tool-3',
      tool_name: 'GitHub Copilot',
      category: '開発ツール',
      usage_purpose: 'コード補完',
      user_experience: '高速',
      rating: 5,
      usage_date: '2025-01-18',
      created_at: '2025-01-18T00:00:00Z',
      updated_at: '2025-01-18T00:00:00Z',
      created_by: 'user-1',
      deleted_at: null,
    },
  ]

  const mockUserMap = new Map([['user-1', 'TKZ']])
  const currentUserId = 'user-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Bulk Delete with Undo Integration', () => {
    it('should show undo button in toast after successful bulk delete', async () => {
      const user = userEvent.setup()

      // Mock successful bulk delete
      vi.mocked(bulkDeleteToolsAction).mockResolvedValue({
        success: true,
        data: { count: 2 },
      })

      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId={currentUserId}
        />
      )

      // 1. Enter selection mode
      const selectButton = screen.getByRole('button', { name: /選択/i })
      await user.click(selectButton)

      // 2. Select two tools
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1]) // First tool checkbox (index 0 is "Select All")
      await user.click(checkboxes[2]) // Second tool checkbox

      // 3. Click bulk delete button
      const deleteButton = screen.getByRole('button', { name: /2件削除/i })
      await user.click(deleteButton)

      // 4. Confirm deletion in dialog
      const confirmButton = screen.getByRole('button', { name: /2件削除する/i })
      await user.click(confirmButton)

      // 5. Verify toast.success was called with undo action
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '2件のツールを削除しました',
          expect.objectContaining({
            description: '30日以内であれば復元できます',
            duration: 10000, // 10 seconds
            action: expect.objectContaining({
              label: '元に戻す',
              onClick: expect.any(Function),
            }),
          })
        )
      })
    })

    it('should call bulkRestoreToolsAction when undo button is clicked', async () => {
      const user = userEvent.setup()

      // Mock successful operations
      vi.mocked(bulkDeleteToolsAction).mockResolvedValue({
        success: true,
        data: { count: 3 },
      })

      vi.mocked(bulkRestoreToolsAction).mockResolvedValue({
        success: true,
        data: { count: 3 },
      })

      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId={currentUserId}
        />
      )

      // Enter selection mode and select all tools
      const selectButton = screen.getByRole('button', { name: /選択/i })
      await user.click(selectButton)

      const selectAllCheckbox = screen.getByRole('checkbox', { name: /すべて選択/i })
      await user.click(selectAllCheckbox)

      // Bulk delete
      const deleteButton = screen.getByRole('button', { name: /3件削除/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /3件削除する/i })
      await user.click(confirmButton)

      // Get the undo onClick handler
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })

      const toastCall = vi.mocked(toast.success).mock.calls[0]
      const toastOptions = toastCall[1]
      const undoHandler = toastOptions?.action?.onClick

      expect(undoHandler).toBeDefined()

      // Simulate clicking undo button
      await undoHandler?.()

      // Verify restore was called with correct tool IDs
      await waitFor(() => {
        expect(bulkRestoreToolsAction).toHaveBeenCalledWith(
          expect.arrayContaining(['tool-1', 'tool-2', 'tool-3'])
        )
      })

      // Verify success toast for restoration
      expect(toast.success).toHaveBeenCalledWith('3件のツールを復元しました')
    })

    it('should show error toast if undo operation fails', async () => {
      const user = userEvent.setup()

      vi.mocked(bulkDeleteToolsAction).mockResolvedValue({
        success: true,
        data: { count: 1 },
      })

      // Mock failed restore
      vi.mocked(bulkRestoreToolsAction).mockResolvedValue({
        success: false,
        error: 'データベースエラー',
      })

      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId={currentUserId}
        />
      )

      // Select and delete one tool
      const selectButton = screen.getByRole('button', { name: /選択/i })
      await user.click(selectButton)

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])

      const deleteButton = screen.getByRole('button', { name: /1件削除/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /1件削除する/i })
      await user.click(confirmButton)

      // Get and execute undo handler
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })

      const toastCall = vi.mocked(toast.success).mock.calls[0]
      const undoHandler = toastCall[1]?.action?.onClick

      await undoHandler?.()

      // Verify error toast was shown
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '削除の取り消しに失敗しました',
          expect.objectContaining({
            description: 'データベースエラー',
          })
        )
      })
    })

    it('should set 10 second duration for undo toast', async () => {
      const user = userEvent.setup()

      vi.mocked(bulkDeleteToolsAction).mockResolvedValue({
        success: true,
        data: { count: 2 },
      })

      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId={currentUserId}
        />
      )

      // Perform bulk delete
      const selectButton = screen.getByRole('button', { name: /選択/i })
      await user.click(selectButton)

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])
      await user.click(checkboxes[2])

      const deleteButton = screen.getByRole('button', { name: /2件削除/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /2件削除する/i })
      await user.click(confirmButton)

      // Verify 10 second duration
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            duration: 10000, // 10 seconds
          })
        )
      })
    })

    it('should preserve tool IDs for undo operation after bulk delete', async () => {
      const user = userEvent.setup()

      vi.mocked(bulkDeleteToolsAction).mockResolvedValue({
        success: true,
        data: { count: 2 },
      })

      vi.mocked(bulkRestoreToolsAction).mockResolvedValue({
        success: true,
        data: { count: 2 },
      })

      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId={currentUserId}
        />
      )

      // Select specific tools
      const selectButton = screen.getByRole('button', { name: /選択/i })
      await user.click(selectButton)

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1]) // tool-1
      await user.click(checkboxes[3]) // tool-3

      const deleteButton = screen.getByRole('button', { name: /2件削除/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /2件削除する/i })
      await user.click(confirmButton)

      // Execute undo
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })

      const undoHandler = vi.mocked(toast.success).mock.calls[0][1]?.action?.onClick
      await undoHandler?.()

      // Verify correct tool IDs were passed to restore
      expect(bulkRestoreToolsAction).toHaveBeenCalledWith(
        expect.arrayContaining(['tool-1', 'tool-3'])
      )
    })
  })

  describe('Error Handling', () => {
    it('should not show undo button if bulk delete fails', async () => {
      const user = userEvent.setup()

      // Mock failed delete
      vi.mocked(bulkDeleteToolsAction).mockResolvedValue({
        success: false,
        error: '権限がありません',
      })

      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId={currentUserId}
        />
      )

      const selectButton = screen.getByRole('button', { name: /選択/i })
      await user.click(selectButton)

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])

      const deleteButton = screen.getByRole('button', { name: /1件削除/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /1件削除する/i })
      await user.click(confirmButton)

      // Verify error toast was shown without undo
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '一括削除に失敗しました',
          expect.objectContaining({
            description: '権限がありません',
          })
        )
      })

      // Verify success toast (with undo) was NOT called
      expect(toast.success).not.toHaveBeenCalled()
    })
  })
})
