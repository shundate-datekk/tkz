import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './use-debounce';

const STORAGE_PREFIX = 'form-autosave-';
const DEBOUNCE_DELAY = 500; // 500ms

interface UseAutoSaveFormReturn<T> {
  formData: T;
  updateFormData: (data: T) => void;
  clearSavedData: () => void;
  hasSavedData: boolean;
}

/**
 * フォームデータの自動保存を行うHook
 *
 * @param formId - フォームの一意なID（localStorageのキーに使用）
 * @param initialData - フォームの初期データ
 * @returns フォームデータと操作関数
 *
 * Requirements: 1.6
 */
/**
 * localStorageから保存データを取得し、破損データを削除する
 */
function loadSavedData<T>(storageKey: string): { data: T | null; hasData: boolean } {
  try {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as T;
        return { data: parsed, hasData: true };
      } catch (parseError) {
        console.error('Failed to parse saved form data:', parseError);
        // 破損データの場合はlocalStorageから削除
        try {
          localStorage.removeItem(storageKey);
        } catch {
          // 削除失敗は無視
        }
      }
    }
  } catch (error) {
    console.error('Failed to access localStorage:', error);
  }
  return { data: null, hasData: false };
}

export function useAutoSaveForm<T extends Record<string, any>>(
  formId: string,
  initialData: T
): UseAutoSaveFormReturn<T> {
  const storageKey = `${STORAGE_PREFIX}${formId}`;

  // 保存されたデータを一度だけ読み取る
  const { data: savedData, hasData } = loadSavedData<T>(storageKey);

  // 保存されたデータを復元、なければ初期データを使用
  const [formData, setFormData] = useState<T>(savedData ?? initialData);
  const [hasSavedData, setHasSavedData] = useState<boolean>(hasData);

  // デバウンスされたフォームデータ
  const debouncedFormData = useDebounce(formData, DEBOUNCE_DELAY);

  // デバウンス後にlocalStorageに保存
  useEffect(() => {
    // 初期データと同じ場合は保存しない（初回レンダリング時のスキップ）
    if (JSON.stringify(debouncedFormData) === JSON.stringify(initialData)) {
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(debouncedFormData));
      setHasSavedData(true);
    } catch (error) {
      console.error('Failed to save form data to localStorage:', error);
    }
  }, [debouncedFormData, storageKey, initialData]);

  // フォームデータを更新
  const updateFormData = useCallback((data: T) => {
    setFormData(data);
  }, []);

  // 保存データをクリア
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasSavedData(false);
    } catch (error) {
      console.error('Failed to clear saved form data:', error);
    }
  }, [storageKey]);

  return {
    formData,
    updateFormData,
    clearSavedData,
    hasSavedData,
  };
}
