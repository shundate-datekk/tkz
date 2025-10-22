import { useEffect, useState } from 'react';

/**
 * デバウンスフック
 * 入力値の変更を遅延させて、頻繁な更新を防ぐ
 * 
 * @param value - デバウンス対象の値
 * @param delay - 遅延時間（ミリ秒）
 * @returns デバウンスされた値
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 指定時間後に値を更新
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // クリーンアップ：次の効果実行前にタイマーをクリア
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
