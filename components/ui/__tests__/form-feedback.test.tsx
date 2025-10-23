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
import { FormFeedback } from '../form-feedback';

/**
 * フォーム送信後のフィードバック表示のテスト
 *
 * Requirements: 1.4, 1.5
 */

const testSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
});

type TestFormValues = z.infer<typeof testSchema>;

function TestFormWithFeedback({
  onSubmit,
}: {
  onSubmit?: (data: TestFormValues) => Promise<void>,
}) {
  const [feedback, setFeedback] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleSubmit = async (data: TestFormValues) => {
    setFeedback(null);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }

      setFeedback({
        type: 'success',
        message: 'データを保存しました',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'エラーが発生しました',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormFeedback
          type={feedback?.type}
          message={feedback?.message}
          onDismiss={() => setFeedback(null)}
        />

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

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

describe('Form Feedback (フォーム送信フィードバック)', () => {
  describe('成功メッセージの表示 (Requirement 1.4)', () => {
    it('should show success message after successful submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockResolvedValue(undefined);

      render(<TestFormWithFeedback onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      // 成功メッセージが表示される
      await waitFor(() => {
        expect(screen.getByText('データを保存しました')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show success message with green background', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockResolvedValue(undefined);

      render(<TestFormWithFeedback onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const feedbackElement = screen.getByRole('status');
        expect(feedbackElement).toHaveClass('bg-green-50');
        expect(feedbackElement).toHaveClass('border-green-500');
      }, { timeout: 3000 });
    });

    it('should display checkmark icon in success message', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockResolvedValue(undefined);

      render(<TestFormWithFeedback onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const feedbackElement = screen.getByRole('status');
        const icon = feedbackElement.querySelector('svg');
        expect(icon).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('エラーメッセージの表示 (Requirement 1.5)', () => {
    it('should show error message after failed submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockRejectedValue(new Error('サーバーエラーが発生しました'));

      render(<TestFormWithFeedback onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText('サーバーエラーが発生しました')).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);

    it('should show error message with red background', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockRejectedValue(new Error('サーバーエラーが発生しました'));

      render(<TestFormWithFeedback onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const feedbackElement = screen.getByRole('alert');
        expect(feedbackElement).toHaveClass('bg-red-50');
        expect(feedbackElement).toHaveClass('border-red-500');
      }, { timeout: 10000 });
    }, 15000);

    it('should display error icon in error message', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockRejectedValue(new Error('サーバーエラーが発生しました'));

      render(<TestFormWithFeedback onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const feedbackElement = screen.getByRole('alert');
        const icon = feedbackElement.querySelector('svg');
        expect(icon).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);
  });

  describe('アクセシビリティ', () => {
    it('should use role="status" for success messages', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockResolvedValue(undefined);

      render(<TestFormWithFeedback onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const feedbackElement = screen.getByRole('status');
        expect(feedbackElement).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should use role="alert" for error messages', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockRejectedValue(new Error('サーバーエラーが発生しました'));

      render(<TestFormWithFeedback onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const feedbackElement = screen.getByRole('alert');
        expect(feedbackElement).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);

    it('should have aria-live="polite" for status messages', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockResolvedValue(undefined);

      render(<TestFormWithFeedback onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const feedbackElement = screen.getByRole('status');
        expect(feedbackElement).toHaveAttribute('aria-live', 'polite');
      }, { timeout: 3000 });
    });

    it('should have aria-live="assertive" for error messages', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockRejectedValue(new Error('サーバーエラーが発生しました'));

      render(<TestFormWithFeedback onSubmit={handleSubmit} />);

      const nameInput = screen.getByPlaceholderText('Enter name');
      await user.type(nameInput, 'John');

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const feedbackElement = screen.getByRole('alert');
        expect(feedbackElement).toHaveAttribute('aria-live', 'assertive');
      }, { timeout: 10000 });
    }, 15000);
  });
});
