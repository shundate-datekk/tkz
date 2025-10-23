import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToolDeleteButton } from '../tool-delete-button';
import { deleteToolAction } from '@/lib/actions/ai-tool.actions';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/actions/ai-tool.actions', () => ({
  deleteToolAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

/**
 * 削除確認ダイアログのテスト
 *
 * Requirements: 3.1
 */

describe('ToolDeleteButton', () => {
  const mockToolId = 'test-tool-id';
  const mockToolName = 'ChatGPT';
  const mockCategory = 'AI対話';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('削除ボタンの表示 (Requirement 3.1)', () => {
    it('should display delete button with icon and text', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      expect(button).toBeInTheDocument();
      
      // Icon should be present
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should use destructive variant by default', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      expect(button).toBeInTheDocument();
    });

    it('should be disabled when isPending is true', async () => {
      const mockDelete = deleteToolAction as any;
      mockDelete.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      // Click confirm button
      const confirmButton = screen.getByRole('button', { name: /削除する/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('確認ダイアログの表示 (Requirement 3.1)', () => {
    it('should not show dialog initially', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('should show confirmation dialog when delete button is clicked', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('should display dialog title', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      expect(screen.getByText('ツールの削除')).toBeInTheDocument();
    });

    it('should display confirmation question', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      expect(
        screen.getByText('このツールを削除してもよろしいですか？')
      ).toBeInTheDocument();
    });

    it('should display warning about reversibility within 30 days', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      expect(
        screen.getByText(/削除後10秒間、または30日以内であれば復元できます/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/30日を過ぎると自動的に完全削除されます/)
      ).toBeInTheDocument();
    });
  });

  describe('削除対象のプレビュー表示 (Requirement 3.1)', () => {
    it('should display tool name in preview', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      expect(screen.getByText('ツール名:')).toBeInTheDocument();
      expect(screen.getByText(mockToolName)).toBeInTheDocument();
    });

    it('should display category in preview when provided', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      expect(screen.getByText('カテゴリー:')).toBeInTheDocument();
      expect(screen.getByText(mockCategory)).toBeInTheDocument();
    });

    it('should not display category section when category is not provided', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      expect(screen.queryByText('カテゴリー:')).not.toBeInTheDocument();
    });

    it('should display preview in a visually distinct box', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      // The preview should be in a styled container
      const toolNameElement = screen.getByText(mockToolName);
      const previewBox = toolNameElement.closest('div.rounded-lg');
      expect(previewBox).toBeInTheDocument();
    });
  });

  describe('キャンセル動作', () => {
    it('should close dialog when cancel button is clicked', async () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      // Open dialog
      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should not call deleteToolAction when cancel is clicked', async () => {
      const mockDelete = deleteToolAction as any;

      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      // Open dialog
      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockDelete).not.toHaveBeenCalled();
      });
    });
  });

  describe('削除実行 (Requirement 3.1)', () => {
    it('should call deleteToolAction with correct toolId when confirmed', async () => {
      const mockDelete = deleteToolAction as any;
      mockDelete.mockResolvedValue({ success: true });

      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      // Open dialog
      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      // Click confirm
      const confirmButton = screen.getByRole('button', { name: /削除する/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith(mockToolId);
      });
    });

    it('should show success toast with tool name when deletion succeeds', async () => {
      const mockDelete = deleteToolAction as any;
      mockDelete.mockResolvedValue({ success: true });

      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      // Open dialog and confirm
      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      const confirmButton = screen.getByRole('button', { name: /削除する/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'ツールを削除しました',
          expect.objectContaining({
            description: `「${mockToolName}」を削除しました`,
            duration: 10000,
          })
        );
      });
    });

    it('should show error toast when deletion fails', async () => {
      const mockDelete = deleteToolAction as any;
      const errorMessage = '権限がありません';
      mockDelete.mockResolvedValue({ success: false, error: errorMessage });

      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      // Open dialog and confirm
      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      const confirmButton = screen.getByRole('button', { name: /削除する/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '削除に失敗しました',
          expect.objectContaining({
            description: errorMessage,
          })
        );
      });
    });

    it('should show loading state during deletion', async () => {
      const mockDelete = deleteToolAction as any;
      let resolveDelete: any;
      mockDelete.mockImplementation(
        () => new Promise((resolve) => (resolveDelete = resolve))
      );

      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      // Open dialog and confirm
      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      const confirmButton = screen.getByRole('button', { name: /削除する/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('削除中...')).toBeInTheDocument();
      });

      // Resolve the promise
      resolveDelete({ success: true });
    });
  });

  describe('Undo機能付きToast通知', () => {
    it('should include undo action in success toast', async () => {
      const mockDelete = deleteToolAction as any;
      mockDelete.mockResolvedValue({ success: true });

      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      // Open dialog and confirm
      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      const confirmButton = screen.getByRole('button', { name: /削除する/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            action: expect.objectContaining({
              label: '元に戻す',
              onClick: expect.any(Function),
            }),
          })
        );
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('should use alertdialog role for confirmation dialog', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(
        <ToolDeleteButton
          toolId={mockToolId}
          toolName={mockToolName}
          category={mockCategory}
        />
      );

      const button = screen.getByRole('button', { name: /削除/i });
      fireEvent.click(button);

      expect(screen.getByRole('button', { name: /キャンセル/i })).toHaveAccessibleName();
      expect(screen.getByRole('button', { name: /削除する/i })).toHaveAccessibleName();
    });
  });
});
