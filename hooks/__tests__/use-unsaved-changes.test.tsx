import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnsavedChanges } from '../use-unsaved-changes';

/**
 * 未保存変更の警告機能のテスト
 *
 * Requirements: 3.3
 */

describe('useUnsavedChanges', () => {
  beforeEach(() => {
    // beforeunloadイベントリスナーをクリア
    window.onbeforeunload = null;
  });

  afterEach(() => {
    // クリーンアップ
    window.onbeforeunload = null;
  });

  describe('未保存変更の検知 (Requirement 3.3)', () => {
    it('should initialize with no unsaved changes', () => {
      const { result } = renderHook(() => useUnsavedChanges(false));

      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should detect unsaved changes when isDirty is true', () => {
      const { result } = renderHook(() => useUnsavedChanges(true));

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should update hasUnsavedChanges when isDirty changes', () => {
      const { result, rerender } = renderHook(
        ({ isDirty }) => useUnsavedChanges(isDirty),
        { initialProps: { isDirty: false } }
      );

      expect(result.current.hasUnsavedChanges).toBe(false);

      // isDirtyをtrueに変更
      rerender({ isDirty: true });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  describe('ページ離脱時の警告 (Requirement 3.3)', () => {
    it('should register beforeunload listener when hasUnsavedChanges is true', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() => useUnsavedChanges(true));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should not register beforeunload listener when hasUnsavedChanges is false', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() => useUnsavedChanges(false));

      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should show warning message when user tries to leave with unsaved changes', () => {
      renderHook(() => useUnsavedChanges(true));

      // beforeunloadイベントをシミュレート
      const event = new Event('beforeunload') as BeforeUnloadEvent;
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(event.returnValue).toBe(true);

      preventDefaultSpy.mockRestore();
    });

    it('should not show warning when hasUnsavedChanges is false', () => {
      renderHook(() => useUnsavedChanges(false));

      const event = new Event('beforeunload') as BeforeUnloadEvent;
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();

      preventDefaultSpy.mockRestore();
    });

    it('should remove beforeunload listener when component unmounts', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useUnsavedChanges(true));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('should update listener when hasUnsavedChanges changes', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { rerender } = renderHook(
        ({ isDirty }) => useUnsavedChanges(isDirty),
        { initialProps: { isDirty: true } }
      );

      // 最初の登録
      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      // isDirtyをfalseに変更
      rerender({ isDirty: false });

      // リスナーが削除される
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);

      // isDirtyをtrueに戻す
      rerender({ isDirty: true });

      // リスナーが再登録される
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('clearUnsavedChanges 機能', () => {
    it('should provide clearUnsavedChanges function', () => {
      const { result } = renderHook(() => useUnsavedChanges(true));

      expect(result.current.clearUnsavedChanges).toBeDefined();
      expect(typeof result.current.clearUnsavedChanges).toBe('function');
    });

    it('should clear unsaved changes when clearUnsavedChanges is called', () => {
      const { result } = renderHook(() => useUnsavedChanges(true));

      expect(result.current.hasUnsavedChanges).toBe(true);

      act(() => {
        result.current.clearUnsavedChanges();
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should remove beforeunload listener when clearUnsavedChanges is called', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { result } = renderHook(() => useUnsavedChanges(true));

      act(() => {
        result.current.clearUnsavedChanges();
      });

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('React Router統合（オプション）', () => {
    it('should work with custom navigation blocker callback', () => {
      const onBeforeUnload = vi.fn();

      renderHook(() =>
        useUnsavedChanges(true, { onBeforeUnload })
      );

      const event = new Event('beforeunload') as BeforeUnloadEvent;
      window.dispatchEvent(event);

      expect(onBeforeUnload).toHaveBeenCalledWith(event);
    });
  });
});
