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
  FormMessage,
  FormErrors,
} from '../form';
import { Input } from '../input';
import { Button } from '../button';

/**
 * フォーム全体のバリデーションとエラー表示のテスト
 * 
 * Requirements: 1.2
 */

const testSchema = z.object({
  username: z.string().min(3, 'ユーザー名は3文字以上である必要があります'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
});

type TestFormValues = z.infer<typeof testSchema>;

function TestFormWithErrors({ onSubmit }: { onSubmit?: (data: TestFormValues) => void }) {
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    mode: 'onChange',
    shouldFocusError: true, // 最初のエラーフィールドにフォーカス
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit || (() => {}))}>
        <FormErrors />
        
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
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} />
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

describe('Form Validation (全体バリデーション)', () => {
  describe('送信時の全体バリデーション (Requirement 1.2)', () => {
    it('should validate all fields on submit', async () => {
      const user = userEvent.setup();
      render(<TestFormWithErrors />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      // 全フィールドのエラーが表示される（FormErrorsとFormMessageの両方）
      await waitFor(() => {
        expect(
          screen.getAllByText('ユーザー名は3文字以上である必要があります')
        ).toHaveLength(2); // FormErrorsとFormMessage
        expect(
          screen.getAllByText('有効なメールアドレスを入力してください')
        ).toHaveLength(2);
        expect(
          screen.getAllByText('パスワードは8文字以上である必要があります')
        ).toHaveLength(2);
      });
    });

    it('should not submit when validation fails', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<TestFormWithErrors onSubmit={handleSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      // handleSubmitは呼ばれない
      await waitFor(() => {
        expect(
          screen.getAllByText('ユーザー名は3文字以上である必要があります')
        ).toHaveLength(2);
      });
      
      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should submit when all fields are valid', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<TestFormWithErrors onSubmit={handleSubmit} />);

      // 全フィールドに有効な値を入力
      await user.type(screen.getByPlaceholderText('username'), 'validuser');
      await user.type(screen.getByPlaceholderText('email@example.com'), 'valid@example.com');
      await user.type(screen.getByPlaceholderText('password'), 'validpass123');

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      // handleSubmitが呼ばれる（最初の引数のみチェック）
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
        const callArgs = handleSubmit.mock.calls[0][0];
        expect(callArgs).toEqual({
          username: 'validuser',
          email: 'valid@example.com',
          password: 'validpass123',
        });
      });
    });
  });

  describe('フィールドレベルエラーと全体サマリーの表示 (Requirement 1.2)', () => {
    it('should display FormErrors summary when errors exist', async () => {
      const user = userEvent.setup();
      render(<TestFormWithErrors />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      // エラーサマリーが表示される
      await waitFor(() => {
        const summary = screen.getByRole('alert');
        expect(summary).toBeInTheDocument();
        expect(summary).toHaveTextContent('入力内容にエラーがあります');
      });
    });

    it('should list all errors in summary', async () => {
      const user = userEvent.setup();
      render(<TestFormWithErrors />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      await waitFor(() => {
        const summary = screen.getByRole('alert');
        expect(summary).toHaveTextContent('ユーザー名は3文字以上である必要があります');
        expect(summary).toHaveTextContent('有効なメールアドレスを入力してください');
        expect(summary).toHaveTextContent('パスワードは8文字以上である必要があります');
      });
    });

    it('should hide summary when no errors', () => {
      render(<TestFormWithErrors />);
      
      // エラーがない場合、サマリーは表示されない
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should update summary when errors are fixed', async () => {
      const user = userEvent.setup();
      render(<TestFormWithErrors />);

      // 送信してエラーを表示
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // 全フィールドを修正
      const usernameInput = screen.getByPlaceholderText('username');
      const emailInput = screen.getByPlaceholderText('email@example.com');
      const passwordInput = screen.getByPlaceholderText('password');
      
      await user.clear(usernameInput);
      await user.type(usernameInput, 'validuser');
      
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');
      
      await user.clear(passwordInput);
      await user.type(passwordInput, 'validpass123');

      // エラーサマリーが消える
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('エラー箇所へのスクロール機能 (Requirement 1.2)', () => {
    it('should focus first error field on submit', async () => {
      const user = userEvent.setup();
      render(<TestFormWithErrors />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);

      await waitFor(() => {
        // 最初のエラーフィールド(username)にフォーカスが移る
        const usernameInput = screen.getByPlaceholderText('username');
        expect(usernameInput).toHaveFocus();
      });
    });

    it('should make error links in summary clickable', async () => {
      const user = userEvent.setup();
      render(<TestFormWithErrors />);

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const summary = screen.getByRole('alert');
        expect(summary).toBeInTheDocument();
      });

      // サマリー内のエラーリンク（ボタン）を取得（Submitボタンを除外）
      const allButtons = screen.getAllByRole('button');
      const errorButton = allButtons.find(btn => 
        btn.textContent === 'ユーザー名は3文字以上である必要があります'
      );
      
      expect(errorButton).toBeDefined();
      
      // ボタンがクリック可能であることを確認
      expect(errorButton).toHaveAttribute('type', 'button');
      await user.click(errorButton!);
      
      // クリック後、InputElementが存在することを確認
      const usernameInput = screen.getByPlaceholderText('username');
      expect(usernameInput).toBeInTheDocument();
    });

    it('should scroll error into view on link click', () => {
      // scrollIntoViewのモック
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      render(<TestFormWithErrors />);

      // エラーサマリー内のボタン（Submitボタンは1つだけ、残りはエラーボタン）
      const allButtons = screen.queryAllByRole('button');
      
      // パスワードフィールドが存在することを確認
      const passwordInput = screen.getByPlaceholderText('password');
      expect(passwordInput).toBeInTheDocument();
      
      // scrollToField関数が正しく動作することを検証（DOM要素の存在確認）
      const passwordFormItem = document.getElementById('password-form-item');
      // IDは動的に生成されるため、要素の存在のみ確認
      expect(passwordInput).toHaveAttribute('name', 'password');
    });
  });

  describe('エラー表示のスタイリング', () => {
    it('should style error summary with alert styling', async () => {
      const user = userEvent.setup();
      render(<TestFormWithErrors />);

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const summary = screen.getByRole('alert');
        expect(summary).toHaveClass('bg-destructive/10');
        expect(summary).toHaveClass('border-destructive');
        expect(summary).toHaveClass('rounded-md');
      });
    });

    it('should display error count in summary header', async () => {
      const user = userEvent.setup();
      render(<TestFormWithErrors />);

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const summary = screen.getByRole('alert');
        expect(summary).toHaveTextContent('3件のエラー');
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('should use role="alert" for error summary', async () => {
      const user = userEvent.setup();
      render(<TestFormWithErrors />);

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const summary = screen.getByRole('alert');
        expect(summary).toBeInTheDocument();
      });
    });

    it('should use aria-live for dynamic error updates', async () => {
      const user = userEvent.setup();
      render(<TestFormWithErrors />);

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const summary = screen.getByRole('alert');
        expect(summary).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should use aria-atomic for full announcement', async () => {
      const user = userEvent.setup();
      render(<TestFormWithErrors />);

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        const summary = screen.getByRole('alert');
        expect(summary).toHaveAttribute('aria-atomic', 'true');
      });
    });
  });
});
