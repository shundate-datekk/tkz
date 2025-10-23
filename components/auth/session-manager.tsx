"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionManagement } from '@/hooks/use-session-management';
import { SessionExpiredNotification } from './session-expired-notification';

/**
 * セッション管理コンポーネント
 *
 * アプリケーション全体でセッション期限切れを監視し、
 * 通知を表示する
 *
 * Requirements: 2.2, 2.3
 */
export function SessionManager() {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);
  
  const { isSessionExpired } = useSessionManagement({
    redirectOnExpire: false,
    onSessionExpire: () => {
      setShowNotification(true);
    },
  });

  // セッション期限切れ時に通知を表示
  useEffect(() => {
    if (isSessionExpired) {
      setShowNotification(true);
    }
  }, [isSessionExpired]);

  const handleLogin = () => {
    setShowNotification(false);
    router.push('/login');
  };

  const handleClose = () => {
    setShowNotification(false);
  };

  return (
    <SessionExpiredNotification
      isOpen={showNotification}
      onLogin={handleLogin}
      onClose={handleClose}
    />
  );
}
