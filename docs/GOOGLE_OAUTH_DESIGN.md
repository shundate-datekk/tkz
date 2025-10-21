# Google OAuth認証 設計ドキュメント

**作成日**: 2025-10-21 15:00 JST
**対象**: AI Tools & Sora Prompt Generator (TKZ)
**技術スタック**: Next.js 15, NextAuth.js v5 (Auth.js), Google OAuth 2.0

---

## 📋 アーキテクチャ概要

### 認証フロー

```
┌─────────────┐
│   ユーザー   │
└──────┬──────┘
       │ 1. /login にアクセス
       ▼
┌─────────────────────────┐
│  LoginForm Component    │
│  (Google ログインボタン) │
└──────┬──────────────────┘
       │ 2. signIn("google") 呼び出し
       ▼
┌─────────────────────────┐
│   NextAuth.js v5        │
│   (/api/auth/*)         │
└──────┬──────────────────┘
       │ 3. Google OAuth 2.0 にリダイレクト
       ▼
┌─────────────────────────┐
│  Google 認証画面        │
│  (アカウント選択)        │
└──────┬──────────────────┘
       │ 4. 認証成功 → コールバック
       ▼
┌─────────────────────────┐
│ /api/auth/callback/google│
│   (NextAuth.js処理)      │
└──────┬──────────────────┘
       │ 5. JWTトークン生成
       ▼
┌─────────────────────────┐
│   ダッシュボード (/)     │
│   (認証済み)            │
└─────────────────────────┘
```

---

## 🔧 実装詳細

### 1. NextAuth.js v5 設定 (`auth.config.ts`)

```typescript
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24時間
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
};
```

**ポイント:**
- `prompt: "consent"`: 毎回同意画面を表示（テスト中は有用）
- `access_type: "offline"`: リフレッシュトークンを取得
- `strategy: "jwt"`: データベース不要のJWT認証
- `maxAge`: セッション有効期限（24時間）

---

### 2. Auth インスタンス (`auth.ts`)

```typescript
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
```

**ポイント:**
- `handlers`: GET/POST APIルートハンドラー
- `auth`: サーバーサイドでセッション取得
- `signIn/signOut`: サーバーアクション

---

### 3. API Route Handler (`app/api/auth/[...nextauth]/route.ts`)

```typescript
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

**ポイント:**
- Next.js 15 App Routerでは必須
- `/api/auth/signin`, `/api/auth/callback/google` などを自動処理

---

### 4. Session Provider (重要！)

**Next.js 15 + NextAuth.js v5では、SessionProviderが必須**

#### `app/providers.tsx` (新規作成)

```typescript
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

#### `app/layout.tsx` (修正)

```typescript
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**重要:** SessionProviderがないと、`signIn()`や`useSession()`が動作しません。

---

### 5. Login Form Component (`components/auth/login-form.tsx`)

```typescript
"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <Button onClick={handleGoogleSignIn}>
      Googleでログイン
    </Button>
  );
}
```

**ポイント:**
- `"use client"`: クライアントコンポーネント必須
- `signIn("google")`: Google Providerを指定
- `callbackUrl`: 認証成功後のリダイレクト先

---

### 6. ミドルウェア (`middleware.ts`)

```typescript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/tools") ||
    req.nextUrl.pathname.startsWith("/prompt") ||
    req.nextUrl.pathname.startsWith("/history");

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**ポイント:**
- `req.auth`: 認証状態を確認
- 未認証の場合、保護されたルートから`/login`にリダイレクト

---

## 🔐 環境変数

### ローカル (`.env.local`)

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xj0LFY8kRR5b2qGxpfLdyFae+0uoHNb8stS+hFYn4C0=

# Google OAuth Configuration
GOOGLE_CLIENT_ID=XXXXXXXXXX.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-XXXXXXXXXX
```

### Vercel本番環境

同じ環境変数を設定:
- `NEXTAUTH_URL`: `https://tkz-five.vercel.app`
- `NEXTAUTH_SECRET`: （同じ値）
- `GOOGLE_CLIENT_ID`: （同じ値）
- `GOOGLE_CLIENT_SECRET`: （同じ値）

**重要:** すべての環境（Production, Preview, Development）に設定

---

## 🌐 Google Cloud Console設定

### 1. OAuth 2.0クライアントID

**承認済みのリダイレクトURI:**
```
http://localhost:3000/api/auth/callback/google
https://tkz-five.vercel.app/api/auth/callback/google
```

### 2. OAuth同意画面

- **User Type**: 外部
- **アプリ名**: AI Tools & Sora Prompt Generator
- **テストユーザー**: TKZさんとコボちゃんのGmailを追加

---

## 🐛 よくあるエラーと解決方法

### エラー1: "SessionProvider is not defined"

**原因:** SessionProviderがapp/layout.tsxに設定されていない

**解決:**
```typescript
// app/providers.tsx
"use client";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

### エラー2: "redirect_uri_mismatch"

**原因:** Google Cloud ConsoleのリダイレクトURIが正しく設定されていない

**解決:**
Google Cloud Console → 認証情報 → OAuth 2.0クライアントID → 承認済みのリダイレクトURI
```
https://tkz-five.vercel.app/api/auth/callback/google
```
を追加

---

### エラー3: "access_denied"

**原因:** OAuth同意画面のテストユーザーに追加されていない

**解決:**
Google Cloud Console → OAuth同意画面 → テストユーザー → TKZさんとコボちゃんのGmailを追加

---

### エラー4: "signIn is not a function"

**原因:** `next-auth`からインポートしている（正しくは`next-auth/react`）

**解決:**
```typescript
// ❌ 間違い
import { signIn } from "next-auth";

// ✅ 正しい
import { signIn } from "next-auth/react";
```

---

### エラー5: 環境変数が読み込まれない

**原因:** Vercelでの環境変数設定漏れ

**解決:**
1. Vercel Dashboard → Settings → Environment Variables
2. 以下を追加:
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
3. すべての環境（Production, Preview, Development）にチェック
4. 再デプロイ

---

## ✅ チェックリスト

### 実装完了確認

- [ ] `auth.config.ts`にGoogle Providerを設定
- [ ] `auth.ts`でNextAuthインスタンスを作成
- [ ] `app/api/auth/[...nextauth]/route.ts`でハンドラーをエクスポート
- [ ] `app/providers.tsx`でSessionProviderを作成
- [ ] `app/layout.tsx`でSessionProviderをラップ
- [ ] `components/auth/login-form.tsx`でGoogleログインボタンを実装
- [ ] `middleware.ts`で認証状態をチェック

### Google Cloud Console設定

- [ ] OAuth 2.0クライアントIDを作成
- [ ] リダイレクトURIを設定
- [ ] OAuth同意画面を設定
- [ ] テストユーザーを追加

### 環境変数設定

- [ ] `.env.local`に環境変数を設定
- [ ] VercelのProduction環境に環境変数を設定
- [ ] VercelのPreview環境に環境変数を設定
- [ ] VercelのDevelopment環境に環境変数を設定

### テスト

- [ ] ローカルでGoogleログインが動作
- [ ] 本番環境でGoogleログインが動作
- [ ] ログイン後、ダッシュボードにリダイレクト
- [ ] 保護されたルートへのアクセス制御が動作
- [ ] ログアウトが動作

---

## 📚 参考資料

- [NextAuth.js v5 公式ドキュメント](https://authjs.dev/getting-started/installation?framework=next.js)
- [Google OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Next.js 15 Authentication](https://nextjs.org/docs/app/building-your-application/authentication)

---

**最終更新**: 2025-10-21 15:00 JST
**作成者**: Claude Code

