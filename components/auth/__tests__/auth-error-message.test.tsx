import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthErrorMessage } from '../auth-error-message';

/**
 * 認証エラーメッセージのテスト
 *
 * Requirements: 2.1
 */

describe('AuthErrorMessage', () => {
  describe('エラーメッセージの表示 (Requirement 2.1)', () => {
    it('should display user-friendly message for OAuthAccountNotLinked error', () => {
      render(<AuthErrorMessage error="OAuthAccountNotLinked" />);

      expect(
        screen.getByText(/このメールアドレスは既に別のアカウントで使用されています/)
      ).toBeInTheDocument();
    });

    it('should display user-friendly message for OAuthSignin error', () => {
      render(<AuthErrorMessage error="OAuthSignin" />);

      expect(
        screen.getByText(/Google認証でエラーが発生しました/)
      ).toBeInTheDocument();
    });

    it('should display user-friendly message for OAuthCallback error', () => {
      render(<AuthErrorMessage error="OAuthCallback" />);

      expect(
        screen.getByText(/認証情報の取得に失敗しました/)
      ).toBeInTheDocument();
    });

    it('should display user-friendly message for AccessDenied error', () => {
      render(<AuthErrorMessage error="AccessDenied" />);

      expect(
        screen.getByText(/ログインがキャンセルされました/)
      ).toBeInTheDocument();
    });

    it('should display user-friendly message for Configuration error', () => {
      render(<AuthErrorMessage error="Configuration" />);

      expect(
        screen.getByText(/認証設定にエラーがあります/)
      ).toBeInTheDocument();
    });

    it('should display user-friendly message for Default error', () => {
      render(<AuthErrorMessage error="Default" />);

      expect(
        screen.getByText(/ログインに失敗しました/)
      ).toBeInTheDocument();
    });

    it('should display generic message for unknown error', () => {
      render(<AuthErrorMessage error="UnknownError" />);

      expect(
        screen.getByText(/予期しないエラーが発生しました/)
      ).toBeInTheDocument();
    });
  });

  describe('エラーなしの場合', () => {
    it('should not display anything when error is null', () => {
      const { container } = render(<AuthErrorMessage error={null} />);

      expect(container.firstChild).toBeNull();
    });

    it('should not display anything when error is undefined', () => {
      const { container } = render(<AuthErrorMessage error={undefined} />);

      expect(container.firstChild).toBeNull();
    });

    it('should not display anything when error is empty string', () => {
      const { container } = render(<AuthErrorMessage error="" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('視覚的スタイル', () => {
    it('should have error styling with red background', () => {
      render(<AuthErrorMessage error="AccessDenied" />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveClass('bg-red-50');
      expect(errorElement).toHaveClass('border-red-500');
    });

    it('should display error icon', () => {
      render(<AuthErrorMessage error="AccessDenied" />);

      const errorElement = screen.getByRole('alert');
      const icon = errorElement.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('should use role="alert" for error messages', () => {
      render(<AuthErrorMessage error="AccessDenied" />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
    });

    it('should have aria-live="assertive"', () => {
      render(<AuthErrorMessage error="AccessDenied" />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('aria-live', 'assertive');
    });
  });
});
