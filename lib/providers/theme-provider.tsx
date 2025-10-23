'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * テーマの種類
 * - light: ライトモード
 * - dark: ダークモード
 * - system: システム設定に従う
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * テーマコンテキストの型定義
 */
interface ThemeContextType {
  /** 現在のテーマ設定 */
  theme: Theme;
  /** 実際に適用されているテーマ（systemの場合はlight/darkに解決される） */
  resolvedTheme: 'light' | 'dark';
  /** テーマを変更する関数 */
  setTheme: (theme: Theme) => void;
}

/**
 * テーマコンテキスト
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * テーマ管理Provider
 *
 * ライト/ダークモードの切り替え、システム設定連動、
 * localStorage永続化、スムーズなトランジション効果を提供します。
 *
 * Requirements: 9.1, 9.2, 9.3
 */
export function ThemeProvider({
  children,
  defaultTheme = 'light',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  /**
   * システムのカラースキーム設定を取得
   */
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  /**
   * テーマを解決（systemの場合は実際のテーマに変換）
   */
  const resolveTheme = useCallback((theme: Theme): 'light' | 'dark' => {
    return theme === 'system' ? getSystemTheme() : theme;
  }, []);

  /**
   * 初期化: localStorageからテーマを読み込む
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme | null;

    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
      setResolvedTheme(resolveTheme(savedTheme));
    } else {
      // 保存されたテーマがない場合はdefaultThemeを使用
      if (savedTheme) {
        localStorage.removeItem('app-theme');
      }
      setThemeState(defaultTheme);
      setResolvedTheme(resolveTheme(defaultTheme));
    }
  }, [resolveTheme, defaultTheme]);

  /**
   * システムのカラースキーム変更を監視
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  /**
   * テーマが変更されたらDOMに反映
   */
  useEffect(() => {
    const root = document.documentElement;

    // トランジション効果を追加（500ms）
    root.style.transition = 'background-color 500ms, color 500ms';

    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // トランジション後にtransitionプロパティを削除（パフォーマンス最適化）
    const timer = setTimeout(() => {
      root.style.transition = '';
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [resolvedTheme]);

  /**
   * テーマを変更する
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setResolvedTheme(resolveTheme(newTheme));
    localStorage.setItem('app-theme', newTheme);
  };

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * テーマコンテキストを使用するためのカスタムフック
 *
 * @throws ThemeProviderの外で使用した場合はエラーをスロー
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
