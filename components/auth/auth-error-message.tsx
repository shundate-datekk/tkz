import * as React from 'react';
import { XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AuthErrorMessageProps {
  error?: string | null;
}

/**
 * NextAuth.jsのエラーコード
 */
type AuthErrorCode =
  | 'OAuthAccountNotLinked'
  | 'OAuthSignin'
  | 'OAuthCallback'
  | 'AccessDenied'
  | 'Configuration'
  | 'Default';

/**
 * エラーコードとメッセージのマッピング
 */
const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  OAuthAccountNotLinked:
    'このメールアドレスは既に別のアカウントで使用されています。別の方法でログインしてください。',
  OAuthSignin: 'Google認証でエラーが発生しました。もう一度お試しください。',
  OAuthCallback: '認証情報の取得に失敗しました。もう一度お試しください。',
  AccessDenied:
    'ログインがキャンセルされました。Googleアカウントへのアクセスを許可してください。',
  Configuration: '認証設定にエラーがあります。管理者に連絡してください。',
  Default: 'ログインに失敗しました。もう一度お試しください。',
};

/**
 * NextAuth.jsのエラーコードをユーザーフレンドリーなメッセージに変換
 */
const getErrorMessage = (error: string): string => {
  if (error in ERROR_MESSAGES) {
    return ERROR_MESSAGES[error as AuthErrorCode];
  }
  return '予期しないエラーが発生しました。もう一度お試しください。';
};

/**
 * 認証エラーメッセージコンポーネント
 *
 * NextAuth.jsのエラーを検出し、ユーザーフレンドリーなメッセージを表示する
 *
 * Requirements: 2.1
 */
export function AuthErrorMessage({ error }: AuthErrorMessageProps) {
  if (!error) {
    return null;
  }

  const errorMessage = getErrorMessage(error);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'mb-4 rounded-md border p-4',
        'flex items-start gap-3',
        'bg-red-50 border-red-500 text-red-900',
        'animate-in slide-in-from-top-2 fade-in duration-300'
      )}
    >
      <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600" />

      <div className="flex-1">
        <p className="text-sm font-medium">{errorMessage}</p>
      </div>
    </div>
  );
}
