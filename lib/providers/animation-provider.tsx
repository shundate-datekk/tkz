'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Transition } from 'motion/react';

/**
 * アニメーションコンテキストの型定義
 */
interface AnimationContextType {
  /** モーションを減らすべきかどうか（prefers-reduced-motion） */
  shouldReduceMotion: boolean;
  /** トランジション設定（reduced-motionに対応） */
  transitionConfig: Transition;
}

/**
 * アニメーションコンテキスト
 */
const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

/**
 * アニメーション管理Provider
 *
 * prefers-reduced-motion対応、アニメーション設定の提供を行います。
 * アクセシビリティを考慮し、モーションに敏感なユーザーには
 * アニメーションを無効化します。
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */
export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  /**
   * システムのモーション設定を取得
   */
  const getReducedMotionPreference = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * 初期化: reduced-motion設定を取得
   */
  useEffect(() => {
    setShouldReduceMotion(getReducedMotionPreference());
  }, []);

  /**
   * システムのモーション設定変更を監視
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => {
      setShouldReduceMotion(getReducedMotionPreference());
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  /**
   * トランジション設定
   * reduced-motionが有効な場合は即座に変化（duration: 0）
   */
  const transitionConfig: Transition = {
    duration: shouldReduceMotion ? 0 : 0.3,
    ease: 'easeInOut',
  };

  const value: AnimationContextType = {
    shouldReduceMotion,
    transitionConfig,
  };

  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
}

/**
 * アニメーションコンテキストを使用するためのカスタムフック
 *
 * @throws AnimationProviderの外で使用した場合はエラーをスロー
 */
export function useAnimation(): AnimationContextType {
  const context = useContext(AnimationContext);

  if (context === undefined) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }

  return context;
}
