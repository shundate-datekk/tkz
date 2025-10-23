import * as React from 'react';
import { describe, it, expect } from 'vitest';
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
  FormDescription,
  FormMessage,
} from '../form';
import { Input } from '../input';

/**
 * FormFieldコンポーネントのテスト
 * 
 * Requirements: 1.1
 */

const testSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  username: z.string().min(3, 'ユーザー名は3文字以上である必要があります'),
  age: z.number().min(18, '18歳以上である必要があります').optional(),
});

type TestFormValues = z.infer<typeof testSchema>;

function TestForm() {
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      username: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormDescription>メールアドレスを入力してください</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

describe('FormField Component', () => {
  describe('onChange時の即時バリデーション (Requirement 1.1)', () => {
    it('should show error message on invalid email', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // blur to trigger validation

      await waitFor(() => {
        expect(
          screen.getByText('有効なメールアドレスを入力してください')
        ).toBeInTheDocument();
      });
    });

    it('should show error on username too short', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const usernameInput = screen.getByPlaceholderText('username');
      await user.type(usernameInput, 'ab');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('ユーザー名は3文字以上である必要があります')
        ).toBeInTheDocument();
      });
    });

    it('should clear error when input becomes valid', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      
      // 無効な入力
      await user.type(emailInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('有効なメールアドレスを入力してください')
        ).toBeInTheDocument();
      });

      // 有効な入力に修正
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');

      await waitFor(() => {
        expect(
          screen.queryByText('有効なメールアドレスを入力してください')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('フィールド下に具体的なエラーメッセージを表示 (Requirement 1.1)', () => {
    it('should display error message below field', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      await user.type(emailInput, 'bad');
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(
          '有効なメールアドレスを入力してください'
        );
        expect(errorMessage).toBeInTheDocument();
        
        // エラーメッセージがフィールドの後にDOMツリー上で配置されていることを確認
        const formItem = emailInput.closest('[role="group"]');
        expect(formItem).toContainElement(errorMessage);
      });
    });

    it('should display description when no error', () => {
      render(<TestForm />);
      expect(
        screen.getByText('メールアドレスを入力してください')
      ).toBeInTheDocument();
    });
  });

  describe('エラー状態のフィールドに赤枠を追加 (Requirement 1.1)', () => {
    it('should add error styling to input on validation error', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      await user.type(emailInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        // FormItemがエラー状態であることを確認
        const formItem = emailInput.closest('[role="group"]');
        expect(formItem).toHaveAttribute('data-invalid', 'true');
      });
    });

    it('should remove error styling when input is valid', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      
      // 無効な入力
      await user.type(emailInput, 'bad');
      await user.tab();

      await waitFor(() => {
        const formItem = emailInput.closest('[role="group"]');
        expect(formItem).toHaveAttribute('data-invalid', 'true');
      });

      // 有効な入力に修正
      await user.clear(emailInput);
      await user.type(emailInput, 'good@example.com');

      await waitFor(() => {
        const formItem = emailInput.closest('[role="group"]');
        expect(formItem).not.toHaveAttribute('data-invalid', 'true');
      });
    });
  });

  describe('基本機能', () => {
    it('should render form labels', () => {
      render(<TestForm />);
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('should render form inputs', () => {
      render(<TestForm />);
      expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('username')).toBeInTheDocument();
    });

    it('should allow typing in inputs', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const emailInput = screen.getByPlaceholderText(
        'email@example.com'
      ) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });
  });

  describe('アクセシビリティ', () => {
    it('should associate labels with inputs', () => {
      render(<TestForm />);
      
      const emailLabel = screen.getByText('Email');
      const emailInput = screen.getByPlaceholderText('email@example.com');
      
      expect(emailLabel).toHaveAttribute('for');
      const labelFor = emailLabel.getAttribute('for');
      expect(emailInput).toHaveAttribute('id', labelFor);
    });

    it('should mark form items with role="group"', () => {
      render(<TestForm />);
      
      const emailInput = screen.getByPlaceholderText('email@example.com');
      const formItem = emailInput.closest('[role="group"]');
      
      expect(formItem).toBeInTheDocument();
    });

    it('should use aria-invalid on error', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      await user.type(emailInput, 'bad');
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should use aria-describedby for error messages', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      await user.type(emailInput, 'bad');
      await user.tab();

      await waitFor(() => {
        const describedBy = emailInput.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        
        const errorMessage = screen.getByText(
          '有効なメールアドレスを入力してください'
        );
        const messageId = errorMessage.getAttribute('id');
        
        // describedByにmessageIdが含まれていることを確認
        expect(describedBy).toContain(messageId!);
      });
    });
  });
});
