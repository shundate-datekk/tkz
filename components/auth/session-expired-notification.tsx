import * as React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SessionExpiredNotificationProps {
  /**
   * 通知を表示するかどうか
   */
  isOpen: boolean;
  /**
   * 通知を閉じる際に呼び出されるコールバック
   */
  onClose: () => void;
  /**
   * ログインページへ遷移する際に呼び出されるコールバック
   */
  onLogin: () => void;
}

/**
 * セッション期限切れ通知コンポーネント
 *
 * セッションが期限切れになった際にユーザーに通知し、
 * ログインページへの遷移を促す
 *
 * Requirements: 2.2
 */
export function SessionExpiredNotification({
  isOpen,
  onClose,
  onLogin,
}: SessionExpiredNotificationProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'fixed top-4 right-4 z-50',
        'max-w-md w-full',
        'rounded-lg border p-4 shadow-lg',
        'flex items-start gap-3',
        'bg-yellow-50 border-yellow-500 text-yellow-900',
        'animate-in slide-in-from-top-2 fade-in duration-300'
      )}
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-yellow-600" />

      <div className="flex-1">
        <h3 className="text-sm font-semibold mb-1">
          セッションの有効期限が切れました
        </h3>
        <p className="text-sm mb-3">
          もう一度ログインしてください。ログイン後、元のページに戻ります。
        </p>

        <div className="flex gap-2">
          <Button
            onClick={onLogin}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            ログインページへ
          </Button>
          <Button onClick={onClose} size="sm" variant="outline">
            閉じる
          </Button>
        </div>
      </div>

      <button
        onClick={onClose}
        className="flex-shrink-0 text-yellow-600 hover:text-yellow-800"
        aria-label="閉じる"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
