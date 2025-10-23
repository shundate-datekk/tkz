"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AuthErrorMessage } from "./auth-error-message";
import { useSessionManagement } from "@/hooks/use-session-management";

const REMEMBER_ME_KEY = 'rememberMe';

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const { getReturnUrl, clearReturnUrl } = useSessionManagement();
  
  const [rememberMe, setRememberMe] = useState(false);

  // localStorageから「ログイン状態を保持」の設定を復元
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_ME_KEY);
    if (saved === 'true') {
      setRememberMe(true);
    }
  }, []);

  // 「ログイン状態を保持」の変更をlocalStorageに保存
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    if (checked) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  };

  const handleGoogleSignIn = () => {
    // 保存されたreturnUrlを取得
    const returnUrl = getReturnUrl();
    
    // ログイン後のリダイレクト先を設定
    signIn("google", { callbackUrl: returnUrl });
    
    // returnUrlをクリア
    clearReturnUrl();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ログイン</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AuthErrorMessage error={error} />

        <p className="text-sm text-muted-foreground text-center">
          Googleアカウントでログインしてください
        </p>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={handleRememberMeChange}
          />
          <Label
            htmlFor="remember-me"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            ログイン状態を保持
          </Label>
        </div>

        <p className="text-xs text-muted-foreground">
          チェックを入れると、30日間ログイン状態が保持されます。
        </p>

        <Button
          onClick={handleGoogleSignIn}
          className="w-full"
          variant="outline"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Googleでログイン
        </Button>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>初回ログイン時にGoogleアカウントの認証が必要です</p>
          <p className="mt-1">TKZさんとコボちゃんのGoogleアカウントでログインできます</p>
        </div>
      </CardContent>
    </Card>
  );
}
