/**
 * Result型パターン
 * エラーハンドリングを型安全に行うためのユーティリティ型
 */

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * 成功結果を作成
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * エラー結果を作成
 */
export function failure<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * アプリケーションエラー型
 */
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

/**
 * アプリケーションエラーを作成
 */
export function createAppError(
  code: string,
  message: string,
  details?: any
): AppError {
  return { code, message, details };
}

/**
 * バリデーションエラー
 */
export function validationError(
  message: string,
  details?: any
): AppError {
  return createAppError("VALIDATION_ERROR", message, details);
}

/**
 * 認証エラー
 */
export function authError(message: string = "認証が必要です"): AppError {
  return createAppError("AUTH_ERROR", message);
}

/**
 * 認可エラー
 */
export function forbiddenError(
  message: string = "この操作を実行する権限がありません"
): AppError {
  return createAppError("FORBIDDEN", message);
}

/**
 * 見つからないエラー
 */
export function notFoundError(
  resource: string = "リソース"
): AppError {
  return createAppError("NOT_FOUND", `${resource}が見つかりません`);
}

/**
 * サーバーエラー
 */
export function serverError(
  message: string = "サーバーエラーが発生しました"
): AppError {
  return createAppError("SERVER_ERROR", message);
}

/**
 * OpenAI APIエラー
 */
export function openaiError(
  message: string = "AI処理中にエラーが発生しました",
  details?: any
): AppError {
  return createAppError("OPENAI_ERROR", message, details);
}

/**
 * レート制限エラー
 */
export function rateLimitError(
  message: string = "リクエスト制限に達しました。しばらく待ってから再度お試しください"
): AppError {
  return createAppError("RATE_LIMIT_ERROR", message);
}
