import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSaveForm } from '../use-auto-save-form';

/**
 * フォーム自動保存機能のテスト
 *
 * Requirements: 1.6
 */

describe('useAutoSaveForm', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe('自動保存機能 (Requirement 1.6)', () => {
    it('should save form data to localStorage after 500ms debounce', async () => {
      const { result } = renderHook(() =>
        useAutoSaveForm('test-form', { name: '', email: '' })
      );

      // 初期状態では何も保存されていない
      expect(localStorage.getItem('form-autosave-test-form')).toBeNull();

      // フォームデータを更新
      act(() => {
        result.current.updateFormData({ name: 'John', email: 'john@example.com' });
      });

      // デバウンス前は保存されていない
      expect(localStorage.getItem('form-autosave-test-form')).toBeNull();

      // 500ms経過後に保存される
      act(() => {
        vi.advanceTimersByTime(500);
      });

      const saved = localStorage.getItem('form-autosave-test-form');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual({
        name: 'John',
        email: 'john@example.com',
      });
    });

    it('should debounce multiple updates within 500ms', async () => {
      const { result } = renderHook(() =>
        useAutoSaveForm('test-form', { name: '' })
      );

      // 複数回の更新
      act(() => {
        result.current.updateFormData({ name: 'J' });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      act(() => {
        result.current.updateFormData({ name: 'Jo' });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      act(() => {
        result.current.updateFormData({ name: 'John' });
      });

      // まだ保存されていない
      expect(localStorage.getItem('form-autosave-test-form')).toBeNull();

      // 最後の更新から500ms経過
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // 最後の値のみが保存される
      const saved = localStorage.getItem('form-autosave-test-form');
      expect(JSON.parse(saved!)).toEqual({ name: 'John' });
    });

    it('should restore saved data on mount', () => {
      // 事前にデータを保存
      localStorage.setItem(
        'form-autosave-test-form',
        JSON.stringify({ name: 'Saved Name', email: 'saved@example.com' })
      );

      const { result } = renderHook(() =>
        useAutoSaveForm('test-form', { name: '', email: '' })
      );

      // 保存されたデータが復元される
      expect(result.current.formData).toEqual({
        name: 'Saved Name',
        email: 'saved@example.com',
      });
    });

    it('should use initial data if no saved data exists', () => {
      const initialData = { name: 'Initial', email: 'initial@example.com' };

      const { result } = renderHook(() =>
        useAutoSaveForm('test-form', initialData)
      );

      expect(result.current.formData).toEqual(initialData);
    });

    it('should clear saved data when clearSavedData is called', () => {
      // 確実にクリーンな状態から開始
      localStorage.clear();

      // データを保存
      localStorage.setItem(
        'form-autosave-test-form',
        JSON.stringify({ name: 'John' })
      );

      const { result } = renderHook(() =>
        useAutoSaveForm('test-form', { name: '' })
      );

      // タイマーをadvanceしてuseEffectを完了させる
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(localStorage.getItem('form-autosave-test-form')).toBeTruthy();
      expect(result.current.hasSavedData).toBe(true);

      // フォームを初期値にリセットしてからクリア
      act(() => {
        result.current.updateFormData({ name: '' });
      });

      // デバウンスを待つ
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // クリア実行
      act(() => {
        result.current.clearSavedData();
      });

      // タイマーをadvanceして pending effectsを処理
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(localStorage.getItem('form-autosave-test-form')).toBeNull();
      expect(result.current.hasSavedData).toBe(false);
    });

    it('should return hasSavedData flag correctly', () => {
      // データなし
      const { result: result1 } = renderHook(() =>
        useAutoSaveForm('test-form-1', { name: '' })
      );
      expect(result1.current.hasSavedData).toBe(false);

      // データあり
      localStorage.setItem(
        'form-autosave-test-form-2',
        JSON.stringify({ name: 'John' })
      );

      const { result: result2 } = renderHook(() =>
        useAutoSaveForm('test-form-2', { name: '' })
      );
      expect(result2.current.hasSavedData).toBe(true);
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // localStorageのsetItemを失敗させる
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() =>
        useAutoSaveForm('test-form', { name: '' })
      );

      act(() => {
        result.current.updateFormData({ name: 'John' });
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // エラーが発生してもクラッシュしない
      expect(result.current.formData).toEqual({ name: 'John' });
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      setItemSpy.mockRestore();
    });

    it('should handle corrupted localStorage data', () => {
      // 不正なJSONデータを保存
      localStorage.setItem('form-autosave-test-form', 'invalid json{{{');

      const initialData = { name: 'Initial' };
      const { result } = renderHook(() =>
        useAutoSaveForm('test-form', initialData)
      );

      // 初期データにフォールバック
      expect(result.current.formData).toEqual(initialData);
      expect(result.current.hasSavedData).toBe(false);
    });
  });

  describe('TypeScript型安全性', () => {
    it('should maintain type safety with generic form data', () => {
      interface TestForm {
        name: string;
        age: number;
        active: boolean;
      }

      const initialData: TestForm = {
        name: '',
        age: 0,
        active: false,
      };

      const { result } = renderHook(() =>
        useAutoSaveForm<TestForm>('test-form', initialData)
      );

      act(() => {
        result.current.updateFormData({
          name: 'John',
          age: 30,
          active: true,
        });
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.formData).toEqual({
        name: 'John',
        age: 30,
        active: true,
      });
    });
  });
});
