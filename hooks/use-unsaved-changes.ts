import { useEffect, useState, useCallback, useRef } from 'react';

export interface UseUnsavedChangesOptions {
  /**
   * beforeunloadイベント時に呼び出されるコールバック
   */
  onBeforeUnload?: (event: BeforeUnloadEvent) => void;
}

export interface UseUnsavedChangesReturn {
  /**
   * 未保存の変更があるかどうか
   */
  hasUnsavedChanges: boolean;
  /**
   * 未保存の変更をクリアする
   */
  clearUnsavedChanges: () => void;
}

/**
 * フォーム編集中の状態を検知し、ページ離脱時に警告を表示するHook
 *
 * @param isDirty - フォームが編集されているかどうか
 * @param options - オプション設定
 * @returns 未保存変更の状態と操作関数
 *
 * Requirements: 3.3
 */
export function useUnsavedChanges(
  isDirty: boolean,
  options?: UseUnsavedChangesOptions
): UseUnsavedChangesReturn {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(isDirty);
  const handlerRef = useRef<((event: BeforeUnloadEvent) => void) | null>(null);
  const { onBeforeUnload } = options || {};

  // isDirtyの変更を追跡
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // clearUnsavedChanges関数
  const clearUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  // beforeunloadイベントハンドラー
  useEffect(() => {
    // 既存のハンドラーを削除
    if (handlerRef.current) {
      window.removeEventListener('beforeunload', handlerRef.current);
      handlerRef.current = null;
    }

    // 未保存変更がある場合のみハンドラーを登録
    if (hasUnsavedChanges) {
      const handler = (event: BeforeUnloadEvent) => {
        // カスタムコールバックを呼び出し
        if (onBeforeUnload) {
          onBeforeUnload(event);
        }

        // ブラウザに警告を表示
        event.preventDefault();
        event.returnValue = true;
      };

      handlerRef.current = handler;
      window.addEventListener('beforeunload', handler);
    }

    // クリーンアップ
    return () => {
      if (handlerRef.current) {
        window.removeEventListener('beforeunload', handlerRef.current);
        handlerRef.current = null;
      }
    };
  }, [hasUnsavedChanges, onBeforeUnload]);

  return {
    hasUnsavedChanges,
    clearUnsavedChanges,
  };
}
