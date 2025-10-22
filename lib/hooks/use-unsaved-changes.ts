import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 未保存変更の警告フック
 * フォーム編集中のページ離脱を警告する
 * 
 * @param isDirty - フォームが編集されているか
 * @param message - 警告メッセージ
 */
export function useUnsavedChanges(
  isDirty: boolean,
  message: string = '変更が保存されていません。このページを離れますか？'
) {
  const router = useRouter();
  const [shouldWarn, setShouldWarn] = useState(false);

  useEffect(() => {
    setShouldWarn(isDirty);
  }, [isDirty]);

  // ブラウザのページ離脱を警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldWarn) {
        e.preventDefault();
        // Chrome では returnValue を設定する必要がある
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldWarn, message]);

  /**
   * 警告を無効化（保存成功時など）
   */
  const disableWarning = useCallback(() => {
    setShouldWarn(false);
  }, []);

  return { disableWarning };
}
