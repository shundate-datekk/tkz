import { toast as sonnerToast } from "sonner"

/**
 * Toast通知の統一ラッパー関数
 * sonnerライブラリをベースに、アプリケーション全体で一貫したスタイルと動作を提供
 */

interface ToastOptions {
  /** トーストメッセージの説明文 */
  description?: string
  /** 表示時間（ミリ秒） */
  duration?: number
  /** アクション（ボタン等） */
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * 成功メッセージを表示
 * @param message メインメッセージ
 * @param options オプション設定
 */
export function success(message: string, options?: ToastOptions) {
  return sonnerToast.success(message, {
    description: options?.description,
    duration: options?.duration ?? 3000, // デフォルト3秒
    action: options?.action,
    classNames: {
      toast: "border-primary/20 bg-background",
      title: "text-primary font-semibold",
      description: "text-muted-foreground",
      actionButton: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
  })
}

/**
 * エラーメッセージを表示
 * @param message メインメッセージ
 * @param options オプション設定
 */
export function error(message: string, options?: ToastOptions) {
  return sonnerToast.error(message, {
    description: options?.description,
    duration: options?.duration ?? 5000, // デフォルト5秒
    action: options?.action,
    classNames: {
      toast: "border-destructive/20 bg-background",
      title: "text-destructive font-semibold",
      description: "text-muted-foreground",
      actionButton: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    },
  })
}

/**
 * 警告メッセージを表示
 * @param message メインメッセージ
 * @param options オプション設定
 */
export function warning(message: string, options?: ToastOptions) {
  return sonnerToast.warning(message, {
    description: options?.description,
    duration: options?.duration ?? 4000, // デフォルト4秒
    action: options?.action,
    classNames: {
      toast: "border-yellow-500/20 bg-background",
      title: "text-yellow-600 dark:text-yellow-500 font-semibold",
      description: "text-muted-foreground",
      actionButton: "bg-yellow-500 text-white hover:bg-yellow-600",
    },
  })
}

/**
 * 情報メッセージを表示
 * @param message メインメッセージ
 * @param options オプション設定
 */
export function info(message: string, options?: ToastOptions) {
  return sonnerToast.info(message, {
    description: options?.description,
    duration: options?.duration ?? 3000, // デフォルト3秒
    action: options?.action,
    classNames: {
      toast: "border-blue-500/20 bg-background",
      title: "text-blue-600 dark:text-blue-500 font-semibold",
      description: "text-muted-foreground",
      actionButton: "bg-blue-500 text-white hover:bg-blue-600",
    },
  })
}

/**
 * プロミスに基づくローディング→成功/失敗のトースト表示
 * @param promise 実行するPromise
 * @param options メッセージ設定
 */
export function promise<T>(
  promise: Promise<T>,
  options: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: unknown) => string)
  }
) {
  return sonnerToast.promise(promise, {
    loading: options.loading,
    success: options.success,
    error: options.error,
    classNames: {
      toast: "bg-background",
      title: "font-semibold",
      description: "text-muted-foreground",
    },
  })
}

/**
 * カスタムトーストを表示
 * @param message メインメッセージ
 * @param options オプション設定
 */
export function custom(message: string, options?: ToastOptions) {
  return sonnerToast(message, {
    description: options?.description,
    duration: options?.duration ?? 3000,
    action: options?.action,
  })
}

// デフォルトエクスポート
export const toast = {
  success,
  error,
  warning,
  info,
  promise,
  custom,
  // sonnerの他の便利なメソッドも公開
  dismiss: sonnerToast.dismiss,
  loading: (message: string) => sonnerToast.loading(message),
}
