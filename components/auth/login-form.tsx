"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "@/lib/auth/actions";

/**
 * Submit button component
 * useFormStatusを使ってフォームの送信状態を取得
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "ログイン中..." : "ログイン"}
    </Button>
  );
}

export function LoginForm() {
  // useFormState: Next.js 15 + React 19の推奨方法
  // formのaction属性に直接Server Actionを設定し、状態を管理
  const [state, formAction] = useFormState(login, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ログイン</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">ユーザー名</Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              placeholder="tkz または kobo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="パスワードを入力"
            />
          </div>

          {state?.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <SubmitButton />

          <div className="mt-4 text-sm text-muted-foreground">
            <p className="text-center">デフォルトのログイン情報:</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• TKZ: username: tkz / password: password123</li>
              <li>• コボちゃん: username: kobo / password: password123</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
