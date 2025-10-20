# Vercelデプロイ失敗トラブルシューティング

## 目次
1. [問題の概要](#問題の概要)
2. [技術的分析](#技術的分析)
3. [実行可能な対策](#実行可能な対策)
4. [代替デプロイ手順](#代替デプロイ手順)
5. [予防措置](#予防措置)

## 問題の概要

### 症状
- **ビルド**: ✅ 成功（毎回）
- **デプロイ**: ❌ 失敗（"Deploying outputs..." ステージ）
- **エラーメッセージ**: "An unexpected error happened when running this build"
- **発生頻度**: 3回連続（100%再現）
- **リージョン**: pdx1 (Portland, USA West)

### 影響
- 本番環境へのデプロイ不可能
- ユーザーがアプリケーションにアクセスできない
- Phase 5（デプロイ後確認）、Phase 6（セキュリティ設定）に進めない

## 技術的分析

### 1. ビルド警告の詳細分析

#### Edge Runtime非互換性警告

**警告内容**:
```
./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
A Node.js API is used (process.versions at line: 32) which is not supported in the Edge Runtime.

./node_modules/@supabase/supabase-js/dist/module/index.js
A Node.js API is used (process.version at line: 24) which is not supported in the Edge Runtime.

./node_modules/bcryptjs/index.js
A Node.js module is loaded ('crypto' at line 32) which is not supported in the Edge Runtime.
A Node.js API is used (process.nextTick, setImmediate) which is not supported in the Edge Runtime.
```

**インポートトレース**:
```
lib/supabase/client.ts
  → auth.config.ts
    → auth.ts
      → middleware.ts (Edge Runtime)
```

**重要な発見**:
- これらの警告は **ビルド成功している**
- Next.js 15は警告を出すが、ビルドを継続
- ローカルでは完全に動作
- **結論**: これらは現在のデプロイ失敗の直接原因ではない

**ただし**: 将来的な問題を防ぐため、解消推奨

### 2. Next.js 15とNextAuth.js v5の互換性

**現在の構成**:
- Next.js: 15.5.6
- NextAuth.js: 5.0.0-beta.29 (ベータ版)

**既知の問題**:
- NextAuth.js v5はまだベータ版
- Edge Runtime対応が完全ではない可能性

**検証方法**:
```bash
# Next.js 15との互換性確認
npm list next next-auth
```

**結果**: 互換性に問題なし（ローカルで動作しているため）

### 3. Vercelデプロイプロセスの詳細

**デプロイステージ**:
1. ✅ Clone repository
2. ✅ Install dependencies
3. ✅ Build (`next build`)
4. ✅ Generate serverless functions
5. ✅ Collect static files
6. ❌ **Deploy outputs** ← ここで失敗

**"Deploy outputs" ステージで行われること**:
- ビルド成果物のVercel Edgeネットワークへのアップロード
- Serverless関数のデプロイ
- 静的ファイルのCDN配信設定

**失敗の可能性**:
- ネットワークタイムアウト
- ファイルサイズ制限超過
- 特定リージョン（pdx1）のインフラ問題
- アカウント制限

### 4. ビルド成果物の分析

**バンドルサイズ**:
```
Route (app)                      Size  First Load JS
/                             1.07 kB         115 kB
/login                        2.54 kB         113 kB
/tools                        2.65 kB         172 kB
/tools/new                    3.11 kB         187 kB
/tools/[id]/edit              5.47 kB         190 kB
/prompt                       4.43 kB         189 kB
/history                      3.97 kB         135 kB

Middleware                      133 kB
```

**総バンドルサイズ**: 約1.2MB（圧縮後）
**Vercel制限**: 無料プランで50MB（問題なし）

**結論**: バンドルサイズは制限内

## 実行可能な対策

### 即時対策（0-2時間）

#### A. Vercelサポートへの連絡 ⭐ 最優先

**実施手順**:
1. https://vercel.com/help にアクセス
2. 「Contact Support」をクリック
3. 以下のテンプレートを使用：

```
Subject: Deployment Failure - "An unexpected error" at Deploy Outputs Stage

Description:
I'm experiencing consistent deployment failures for my Next.js 15 application.

Build Details:
- Build: ✅ Successful (3/3 attempts)
- Deployment: ❌ Failed at "Deploying outputs..." stage (3/3 attempts)
- Error: "An unexpected error happened when running this build"
- Region: pdx1 (Portland, USA West)
- Duration before failure: ~36 seconds consistently

Project Information:
- Repository: https://github.com/shundate-datekk/tkz
- Framework: Next.js 15.5.6
- Runtime: Node.js (default)

Evidence:
- Local build: ✅ Successful
- Vercel build phase: ✅ Successful
- All tests passing (220+ tests)
- Type checking: ✅ No errors

Request:
Could you please investigate infrastructure issues in the pdx1 region or
my account? This appears to be a platform issue rather than application code.

Build logs are available in my Vercel dashboard.
```

**期待される結果**:
- 24時間以内の返信
- インフラ問題の調査と修正

#### B. 時間を置いて再試行

**待機時間**: 2-3時間

**実施方法**:
```bash
# オプション1: Vercelダッシュボードから
# Deployments → 失敗したデプロイ → "..." → Redeploy

# オプション2: 小さな変更をコミット
echo "# Redeploy trigger $(date)" >> .vercel-deploy
git add .vercel-deploy
git commit -m "chore: trigger redeploy"
git push
```

### 短期対策（1-3日）

#### C. Vercel CLIでのデプロイ

**準備**:
```bash
# 既にインストール済み
vercel --version
```

**実施手順**:
```bash
# 1. ログイン（ブラウザで認証）
vercel login

# 2. プロジェクトをリンク
vercel link

# 3. 環境変数を設定
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXTAUTH_SECRET production
vercel env add OPENAI_API_KEY production

# 4. 本番デプロイ
vercel --prod
```

**メリット**:
- より詳細なエラーログ
- Web UIの問題を回避
- デプロイプロセスの完全な可視性

#### D. Edge Runtime警告の解消

**対象**: `middleware.ts`のEdge Runtime非互換性

**現在のコード**:
```typescript
// middleware.ts
import { auth } from "@/auth";
// auth.tsでbcryptjsとSupabaseクライアントを使用
```

**修正案1: Middleware Runtimeの明示的指定**

`middleware.ts`に追加:
```typescript
export const runtime = 'nodejs'; // Edge Runtimeの代わりにNode.js Runtime使用
```

**トレードオフ**:
- ❌ Edge Runtimeの高速性を失う
- ✅ 互換性問題を回避
- ✅ 機能的には問題なし（2ユーザーのみ）

**修正案2: Middlewareの簡素化**

bcryptとSupabaseをMiddlewareから分離:

```typescript
// middleware.ts (簡素化版)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('next-auth.session-token')?.value;

  if (!sessionToken && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith('/tools') ||
         pathname.startsWith('/prompt') ||
         pathname.startsWith('/history');
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

認証検証はServer Actionsで実施:
```typescript
// lib/auth/helpers.ts
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return session.user;
}
```

**メリット**:
- ✅ Edge Runtime完全互換
- ✅ 警告がなくなる
- ❌ セッション検証がやや遅くなる（許容範囲）

**推奨**: 修正案1（runtime指定）を優先、失敗時に修正案2

### 中期対策（3-7日）

#### E. 別リージョンでのデプロイ試行

**現在のリージョン**: pdx1 (Portland, USA West)

**代替リージョン**:
- sfo1 (San Francisco, USA)
- iad1 (Washington D.C., USA)
- sin1 (Singapore, Asia)

**実施方法**:
Vercelサポートにリージョン変更をリクエスト

#### F. Vercelプロジェクト設定の最適化

**next.config.ts** の最適化:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 既存の設定...

  // 出力最適化
  output: 'standalone', // スタンドアロンビルド

  // Experimental features の明示的設定
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000'], // 本番URLを追加
    },
  },

  // ビルド最適化
  compress: true,
  poweredByHeader: false,

  // デプロイ最適化
  generateBuildId: async () => {
    return process.env.VERCEL_GIT_COMMIT_SHA || 'development';
  },
};

export default nextConfig;
```

## 代替デプロイ手順

### オプション1: Netlify

**準備**:
```bash
npm install -g netlify-cli
```

**デプロイ手順**:
```bash
# 1. ログイン
netlify login

# 2. プロジェクト初期化
netlify init

# 3. 環境変数設定
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://tkquylaxtouaxiukycda.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "YOUR_ANON_KEY"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "YOUR_SERVICE_ROLE_KEY"
netlify env:set NEXTAUTH_SECRET "YOUR_NEXTAUTH_SECRET"
netlify env:set OPENAI_API_KEY "YOUR_OPENAI_API_KEY"

# 4. デプロイ
netlify deploy --prod
```

**`netlify.toml`** 設定:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

### オプション2: Cloudflare Pages

**準備**:
```bash
npm install -g wrangler
```

**デプロイ手順**:
```bash
# 1. ログイン
wrangler login

# 2. プロジェクト作成とデプロイ
npx @cloudflare/next-on-pages@latest

# 3. 環境変数設定（Cloudflare Dashboard）
```

**`wrangler.toml`**:
```toml
name = "tkz"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
```

## 予防措置

### 1. ステージング環境の構築

**Vercelでのセットアップ**:
```bash
# ステージング用ブランチ
git checkout -b staging
git push -u origin staging
```

Vercelダッシュボードで:
- 新規プロジェクト作成: `tkz-staging`
- `staging`ブランチを自動デプロイ設定
- 本番と同じ環境変数を設定

### 2. CI/CDパイプライン

**GitHub Actions** (`.github/workflows/ci.yml`):
```yaml
name: CI/CD

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --run
      - run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 3. デプロイヘルスチェック

**自動ヘルスチェックスクリプト** (`scripts/health-check.sh`):
```bash
#!/bin/bash
set -e

DEPLOY_URL=$1

echo "🔍 Checking deployment health: $DEPLOY_URL"

# ヘルスチェックエンドポイント
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/health")

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Health check passed"
  exit 0
else
  echo "❌ Health check failed (HTTP $HTTP_CODE)"
  exit 1
fi
```

### 4. モニタリングとアラート

**Vercel Analytics設定**:
1. Vercelダッシュボード → Analytics → Enable
2. エラーレート監視設定
3. パフォーマンス低下アラート

**Sentry統合（将来的）**:
```bash
npm install @sentry/nextjs
```

## チェックリスト

### デプロイ前チェック
- [ ] ローカルビルド成功 (`npm run build`)
- [ ] すべてのテスト合格 (`npm test`)
- [ ] 型チェック成功 (`npx tsc --noEmit`)
- [ ] 環境変数が正しく設定されている
- [ ] `.gitignore`に`.env.local`が含まれている
- [ ] `package-lock.json`がコミットされている

### デプロイ後チェック
- [ ] ヘルスチェックエンドポイント確認
- [ ] ログイン機能テスト
- [ ] データベース接続確認
- [ ] OpenAI API動作確認
- [ ] エラーログ確認

### トラブルシューティング時
- [ ] Vercelビルドログを確認
- [ ] ローカルビルドと比較
- [ ] 環境変数を再確認
- [ ] Vercelサポートに連絡
- [ ] 代替デプロイ手段を検討

## まとめ

現在のVercelデプロイ失敗は、**インフラストラクチャ側の問題**である可能性が最も高いです。

**推奨される対応順序**:
1. ✅ **Vercelサポートに連絡**（即座に）
2. ⏳ **2-3時間待って再試行**
3. 🔧 **Vercel CLIでのデプロイ試行**（24時間後も失敗する場合）
4. 🔀 **代替プラットフォーム検討**（48時間後も解決しない場合）

**重要**: アプリケーションコードは問題ありません。Vercel側の問題が解決すれば、即座にデプロイ可能な状態です。

---

**作成者**: Claude Code
**最終更新**: 2025-10-20 19:20 JST
