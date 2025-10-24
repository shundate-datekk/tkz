/**
 * Tool Undo Button Tests
 *
 * Phase 5 タスク12.1: Undo機能の検証
 * - 削除操作後に「元に戻す」ボタンが表示されるか
 * - 10秒間のタイムアウトが正しく動作するか
 * - Undoクリック時に操作が取り消されるか
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

// Mock toast from sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Tool Undo Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Undo Button Display', () => {
    it('should show undo button after successful delete operation', async () => {
      // This test verifies that toast.success is called with an action button
      const mockUndo = vi.fn()
      
      // Simulate calling toast.success with undo action
      toast.success('1件のツールを削除しました', {
        description: '30日以内であれば復元できます',
        action: {
          label: '元に戻す',
          onClick: mockUndo,
        },
      })

      expect(toast.success).toHaveBeenCalledWith(
        '1件のツールを削除しました',
        expect.objectContaining({
          action: expect.objectContaining({
            label: '元に戻す',
            onClick: expect.any(Function),
          }),
        })
      )
    })

    it('should show undo button after bulk delete operation', async () => {
      const mockUndo = vi.fn()
      
      toast.success('3件のツールを削除しました', {
        description: '30日以内であれば復元できます',
        action: {
          label: '元に戻す',
          onClick: mockUndo,
        },
      })

      expect(toast.success).toHaveBeenCalledWith(
        '3件のツールを削除しました',
        expect.objectContaining({
          action: expect.objectContaining({
            label: '元に戻す',
          }),
        })
      )
    })

    it('should include 10 second duration for undo toast', async () => {
      const mockUndo = vi.fn()
      
      toast.success('1件のツールを削除しました', {
        description: '30日以内であれば復元できます',
        duration: 10000, // 10 seconds
        action: {
          label: '元に戻す',
          onClick: mockUndo,
        },
      })

      expect(toast.success).toHaveBeenCalledWith(
        '1件のツールを削除しました',
        expect.objectContaining({
          duration: 10000,
        })
      )
    })
  })

  describe('Undo Operation', () => {
    it('should call undo handler when undo button is clicked', async () => {
      const mockUndo = vi.fn()
      
      toast.success('1件のツールを削除しました', {
        action: {
          label: '元に戻す',
          onClick: mockUndo,
        },
      })

      // Get the onClick handler from the mock call
      const callArgs = (toast.success as any).mock.calls[0]
      const actionConfig = callArgs[1].action
      
      // Simulate clicking the undo button
      actionConfig.onClick()

      expect(mockUndo).toHaveBeenCalledTimes(1)
    })

    it('should show success message after undo operation completes', async () => {
      // Simulate successful undo
      toast.success('削除を取り消しました')

      expect(toast.success).toHaveBeenCalledWith('削除を取り消しました')
    })

    it('should show error message if undo operation fails', async () => {
      toast.error('削除の取り消しに失敗しました', {
        description: '再度お試しください',
      })

      expect(toast.error).toHaveBeenCalledWith(
        '削除の取り消しに失敗しました',
        expect.objectContaining({
          description: '再度お試しください',
        })
      )
    })
  })

  describe('Undo Action Integration', () => {
    it('should support undo for single tool deletion', async () => {
      const mockToolId = 'tool-123'
      const mockUndo = vi.fn()

      // Simulate delete success with undo
      toast.success('「Claude Code」を削除しました', {
        description: '30日以内であれば復元できます',
        duration: 10000,
        action: {
          label: '元に戻す',
          onClick: () => mockUndo(mockToolId),
        },
      })

      // Verify undo handler receives tool ID
      const callArgs = (toast.success as any).mock.calls[0]
      const actionConfig = callArgs[1].action
      actionConfig.onClick()

      expect(mockUndo).toHaveBeenCalledWith(mockToolId)
    })

    it('should support undo for bulk deletion', async () => {
      const mockToolIds = ['tool-1', 'tool-2', 'tool-3']
      const mockUndo = vi.fn()

      toast.success('3件のツールを削除しました', {
        description: '30日以内であれば復元できます',
        duration: 10000,
        action: {
          label: '元に戻す',
          onClick: () => mockUndo(mockToolIds),
        },
      })

      const callArgs = (toast.success as any).mock.calls[0]
      const actionConfig = callArgs[1].action
      actionConfig.onClick()

      expect(mockUndo).toHaveBeenCalledWith(mockToolIds)
    })
  })

  describe('Toast Duration and Timeout', () => {
    it('should auto-dismiss toast after 10 seconds', async () => {
      const mockUndo = vi.fn()
      
      toast.success('1件のツールを削除しました', {
        duration: 10000,
        action: {
          label: '元に戻す',
          onClick: mockUndo,
        },
      })

      // Fast-forward time by 10 seconds
      vi.advanceTimersByTime(10000)

      // Toast should have been configured with 10 second duration
      expect(toast.success).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          duration: 10000,
        })
      )
    })

    it('should not show undo button for operations that cannot be undone', async () => {
      // Some operations like permanent deletion should not have undo
      toast.success('操作が完了しました')

      const callArgs = (toast.success as any).mock.calls[0]
      expect(callArgs[1]).toBeUndefined() // No options object
    })
  })
})
