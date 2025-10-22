import { useEffect } from 'react';
import { useDebounce } from './use-debounce';

/**
 * フォーム自動保存フック
 * localStorageに入力内容を自動保存し、ページ再読み込み時に復元
 * 
 * @param key - localStorageのキー
 * @param value - 保存する値
 * @param delay - デバウンス遅延時間（ミリ秒）
 */
export function useAutoSave<T>(
  key: string,
  value: T,
  delay: number = 500
) {
  const debouncedValue = useDebounce(value, delay);

  // デバウンスされた値をlocalStorageに保存
  useEffect(() => {
    if (debouncedValue !== null && debouncedValue !== undefined) {
      try {
        localStorage.setItem(key, JSON.stringify(debouncedValue));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  }, [key, debouncedValue]);

  /**
   * localStorageから値を復元
   */
  const restore = (): T | null => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to restore from localStorage:', error);
      return null;
    }
  };

  /**
   * localStorageから値を削除（送信成功時など）
   */
  const clear = () => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  };

  return { restore, clear };
}
