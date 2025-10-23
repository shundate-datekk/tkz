import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../form';
import { Input } from '../input';
import { Button } from '../button';
import { Spinner } from '../spinner';
import { FormOverlay } from '../form-overlay';

/**
 * フォーム送信時のローディング状態のテスト
 * 
 * Requirements: 1.3
 */

const testSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
});

type TestFormValues = z.infer<typeof testSchema>;

function TestFormWithLoading({ onSubmit, isLoading = false }: { 
  onSubmit?: (data: TestFormValues) => Promise<void>, 
  isLoading?: boolean 
}) {
  const [loading, setLoading] = React.useState(isLoading);
  
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleSubmit = async (data: TestFormValues) => {
    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        aria-busy={loading}
        style={{ position: 'relative' }}
      >
        <FormOverlay isLoading={loading} />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading && <Spinner className="mr-2" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}

describe('Form Loading State (ローディング状態)', () => {
  describe('送信ボタンにSpinnerを表示 (Requirement 1.3)', () => {
    it('should show spinner when form is submitting', async () => {
      const user = userEvent.setup();
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>(resolve => {
        resolveSubmit = resolve;
      });
      const handleSubmit = vi.fn().mockReturnValue(submitPromise);

      render(<TestFormWithLoading onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // Spinnerが表示される（複数あるので、少なくとも1つ存在することを確認）
      await waitFor(() => {
        const spinners = screen.getAllByTestId('spinner');
        expect(spinners.length).toBeGreaterThan(0);
      }, { timeout: 1000 });

      // Promiseを解決してクリーンアップ
      resolveSubmit!();
    });

    it('should hide spinner after submission completes', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockResolvedValue(undefined);
      
      render(<TestFormWithLoading onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // 送信完了後、Spinnerが消える
      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });
    });
  });

  describe('送信ボタンを無効化して二重送信を防止 (Requirement 1.3)', () => {
    it('should disable button during submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<TestFormWithLoading onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // ボタンが無効化される
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should prevent double submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<TestFormWithLoading onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      
      // 連続クリック
      await user.click(submitButton);
      await user.click(submitButton).catch(() => {}); // 無効化されているので失敗する

      // handleSubmitは1回だけ呼ばれる
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledTimes(1);
      });
    });

    it('should re-enable button after submission completes', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockResolvedValue(undefined);
      
      render(<TestFormWithLoading onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // 送信完了後、ボタンが再有効化される
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('フォーム全体にローディングオーバーレイを追加 (Requirement 1.3)', () => {
    it('should show overlay during submission', async () => {
      const user = userEvent.setup();
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>(resolve => {
        resolveSubmit = resolve;
      });
      const handleSubmit = vi.fn().mockReturnValue(submitPromise);

      render(<TestFormWithLoading onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // ローディングオーバーレイが表示される
      await waitFor(() => {
        const overlay = screen.getByTestId('form-overlay');
        expect(overlay).toBeInTheDocument();
        // オーバーレイ内にもSpinnerが含まれる
        const spinners = screen.getAllByTestId('spinner');
        expect(spinners.length).toBe(2); // ボタン内とオーバーレイ内
      }, { timeout: 1000 });

      // Promiseを解決してクリーンアップ
      resolveSubmit!();
    });

    it('should hide overlay after submission completes', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockResolvedValue(undefined);
      
      render(<TestFormWithLoading onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // 送信完了後、オーバーレイが消える
      await waitFor(() => {
        expect(screen.queryByTestId('form-overlay')).not.toBeInTheDocument();
      });
    });

    it('should prevent interaction with form during submission', async () => {
      const user = userEvent.setup();
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>(resolve => {
        resolveSubmit = resolve;
      });
      const handleSubmit = vi.fn().mockReturnValue(submitPromise);

      render(<TestFormWithLoading onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // オーバーレイが表示されている間、入力フィールドにアクセスできない
      await waitFor(() => {
        const overlay = screen.getByTestId('form-overlay');
        expect(overlay).toBeInTheDocument();
        // オーバーレイがabsoluteクラスを持つことを確認（フォームをブロックする）
        expect(overlay).toHaveClass('absolute');
      }, { timeout: 1000 });

      // Promiseを解決してクリーンアップ
      resolveSubmit!();
    });
  });

  describe('Spinnerコンポーネントのスタイリング', () => {
    it('should render spinner with animation', () => {
      render(<Spinner />);
      
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toBeInTheDocument();
      
      // SVGがanimate-spinクラスを持つことを確認
      const svg = spinner.querySelector('svg');
      expect(svg).toHaveClass('animate-spin');
    });

    it('should accept custom className', () => {
      render(<Spinner className="custom-class" />);
      
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('custom-class');
    });

    it('should use circular SVG icon', () => {
      render(<Spinner />);
      
      const spinner = screen.getByTestId('spinner');
      const svg = spinner.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('FormOverlayコンポーネント', () => {
    it('should not render when isLoading is false', () => {
      render(<FormOverlay isLoading={false} />);
      
      expect(screen.queryByTestId('form-overlay')).not.toBeInTheDocument();
    });

    it('should render when isLoading is true', () => {
      render(<FormOverlay isLoading={true} />);
      
      expect(screen.getByTestId('form-overlay')).toBeInTheDocument();
    });

    it('should have semi-transparent background', () => {
      render(<FormOverlay isLoading={true} />);
      
      const overlay = screen.getByTestId('form-overlay');
      expect(overlay).toHaveClass('bg-black/20');
    });

    it('should display centered spinner', () => {
      render(<FormOverlay isLoading={true} />);
      
      const overlay = screen.getByTestId('form-overlay');
      const spinner = screen.getByTestId('spinner');
      
      expect(overlay).toContainElement(spinner);
      expect(overlay).toHaveClass('items-center');
      expect(overlay).toHaveClass('justify-center');
    });
  });

  describe('アクセシビリティ', () => {
    it('should have aria-busy on form during submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<TestFormWithLoading onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      const form = submitButton.closest('form');
      
      await user.click(submitButton);

      // フォームにaria-busy="true"が設定される
      await waitFor(() => {
        expect(form).toHaveAttribute('aria-busy', 'true');
      });
    });

    it('should remove aria-busy after submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockResolvedValue(undefined);
      
      render(<TestFormWithLoading onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      const form = submitButton.closest('form');
      
      await user.click(submitButton);

      // 送信完了後、aria-busyが削除される
      await waitFor(() => {
        expect(form).not.toHaveAttribute('aria-busy', 'true');
      });
    });

    it('should have role="status" on overlay', () => {
      render(<FormOverlay isLoading={true} />);
      
      const overlay = screen.getByTestId('form-overlay');
      expect(overlay).toHaveAttribute('role', 'status');
    });

    it('should have aria-label on spinner', () => {
      render(<Spinner />);
      
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });
  });
});
