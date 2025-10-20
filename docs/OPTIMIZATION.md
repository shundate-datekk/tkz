# パフォーマンス最適化ガイド

このドキュメントでは、アプリケーションのパフォーマンス最適化の実装状況と推奨事項をまとめています。

## フロントエンド最適化

### 現在の実装状況

#### ✅ 実装済み

1. **React Server Components**
   - すべてのページはデフォルトでServer Componentsとして実装
   - クライアント側の状態が必要な部分のみ`"use client"`ディレクティブを使用
   - データフェッチングはサーバー側で実行

2. **Next.js 15 App Router**
   - 自動的なコード分割
   - Route Groupsによる論理的なコード整理
   - Middlewareによる認証チェック

3. **TypeScript**
   - 型安全性によるランタイムエラーの削減
   - 開発時のオートコンプリートとエラー検出

4. **Tailwind CSS v4**
   - JIT（Just-In-Time）コンパイルによる最適化されたCSS
   - 未使用のスタイルは本番ビルドから自動削除

### バンドルサイズ分析

現在のバンドルサイズ（本番ビルド）：

```
Route                          Size      First Load JS
/                             1.07 kB    115 kB
/login                        2.54 kB    113 kB
/tools                        2.65 kB    172 kB
/tools/new                    3.11 kB    187 kB
/tools/[id]                   4.53 kB    140 kB
/tools/[id]/edit              5.47 kB    190 kB
/prompt                       4.43 kB    189 kB
/history                      3.97 kB    135 kB
/history/[id]                 3.36 kB    139 kB

Shared JS                                 102 kB
```

#### 🔍 最適化の機会

**重いページ（180 kB以上）:**
- `/tools/new` - 187 kB
- `/tools/[id]/edit` - 190 kB
- `/prompt` - 189 kB

これらのページには複雑なフォームとバリデーションロジックが含まれています。

### 推奨される最適化

#### 1. 動的インポート（Dynamic Imports）

重いコンポーネントを遅延読み込みします：

```typescript
// 例: ツール編集フォーム
import dynamic from 'next/dynamic';

const ToolEditForm = dynamic(() => import('@/components/tools/tool-edit-form'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // クライアントサイドのみで必要な場合
});
```

**対象コンポーネント:**
- プロンプト生成フォーム
- AIツール編集フォーム
- 大きなモーダルダイアログ

#### 2. React.lazy とSuspense

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function MyComponent() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

#### 3. 画像最適化

現在、プロジェクトには画像がほとんどありませんが、将来的に画像を追加する場合：

```typescript
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority={false} // Above-the-fold以外はfalse
  loading="lazy"
/>
```

#### 4. フォントの最適化

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});
```

#### 5. バンドル分析

バンドルサイズを視覚的に確認：

```bash
npm install -D @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // existing config
});
```

実行:
```bash
ANALYZE=true npm run build
```

#### 6. React Hook Formの最適化

既に実装済みですが、さらに最適化：

```typescript
// フィールドの登録を最適化
const { register } = useForm({
  mode: 'onBlur', // onChange より onBlur の方が軽量
  reValidateMode: 'onBlur',
});
```

#### 7. メモ化（Memoization）

頻繁に再レンダリングされるコンポーネント：

```typescript
import { memo } from 'react';

const ToolCard = memo(function ToolCard({ tool }: ToolCardProps) {
  // component logic
});
```

```typescript
import { useMemo, useCallback } from 'react';

const filteredTools = useMemo(() => {
  return tools.filter(tool => tool.category === selectedCategory);
}, [tools, selectedCategory]);

const handleSubmit = useCallback((data) => {
  // submit logic
}, []);
```

## バックエンド最適化

### データベース最適化

#### ✅ 実装済み

1. **インデックス**
   - `ai_tools`: created_by, category, usage_date にインデックス
   - `prompt_history`: created_by, created_at にインデックス
   - 全文検索インデックス

2. **Row Level Security (RLS)**
   - Supabaseのセキュリティポリシー適用

#### 🔍 最適化の機会

1. **クエリの最適化**

```typescript
// N+1問題の回避
// 悪い例
for (const tool of tools) {
  const user = await getUser(tool.created_by);
}

// 良い例
const userIds = tools.map(t => t.created_by);
const users = await getUsers(userIds);
```

2. **キャッシング戦略**

```typescript
// Next.js キャッシュオプション
export const revalidate = 3600; // 1時間ごとに再検証

// 特定のパスのキャッシュ無効化
revalidatePath('/tools');
revalidateTag('tools');
```

3. **データベース接続プーリング**

Supabaseは自動的に接続プーリングを処理しますが、カスタムプールも設定可能：

```typescript
// lib/supabase/client.ts
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'tkz-app',
    },
  },
});
```

### API最適化

#### 1. レスポンス圧縮

Next.jsは自動的にgzip圧縮を適用しますが、Vercelではさらに最適化されます。

#### 2. エラーレスポンスの最適化

```typescript
// 軽量なエラーレスポンス
return {
  success: false,
  error: 'Error message',
  // スタックトレースは本番環境では含めない
};
```

#### 3. ペイロードサイズの削減

```typescript
// 必要なフィールドのみ選択
const tools = await supabase
  .from('ai_tools')
  .select('id, tool_name, category, rating, created_at')
  .order('created_at', { ascending: false });
```

## セキュリティ最適化

### ✅ 実装済み

1. **環境変数の安全な管理**
   - `.env.local` ファイル（gitignore済み）
   - 公開鍵と秘密鍵の分離

2. **認証とセッション管理**
   - NextAuth.js v5
   - HTTPOnlyクッキー
   - 24時間セッション有効期限

3. **入力バリデーション**
   - Zod スキーマバリデーション
   - Server Actions での検証

4. **XSS対策**
   - Reactの自動エスケープ
   - DOMPurify（必要に応じて）

5. **CSRF対策**
   - NextAuth.js の組み込みCSRF保護

### 推奨される追加対策

#### 1. Content Security Policy (CSP)

```typescript
// middleware.ts または next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;
```

#### 2. セキュリティヘッダー

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

#### 3. レート制限

OpenAI APIへのレート制限は実装推奨：

```typescript
// lib/utils/rate-limit.ts
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: 'minute',
});

export async function checkRateLimit() {
  const remainingRequests = await limiter.removeTokens(1);
  if (remainingRequests < 0) {
    throw new Error('Rate limit exceeded');
  }
}
```

## モニタリングとロギング

### ✅ 実装済み

1. **構造化ロギング**
   - JSON形式のログ
   - ログレベル（debug, info, warn, error）
   - コンテキスト情報の記録

2. **パフォーマンス測定**
   - `measurePerformance` ユーティリティ

### 推奨される追加機能

#### 1. ヘルスチェックエンドポイント

既に実装済み: `/api/health`

#### 2. エラートラッキング

Sentryなどのエラートラッキングサービスの統合：

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

#### 3. パフォーマンスモニタリング

Web Vitalsの測定：

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## デプロイ最適化

### Vercelでの推奨設定

1. **環境変数の設定**
   - すべての必要な環境変数をVercelダッシュボードで設定

2. **ビルド設定**
   ```json
   {
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "installCommand": "npm install"
   }
   ```

3. **関数の地域設定**
   ```javascript
   // next.config.js
   module.exports = {
     experimental: {
       serverActions: {
         bodySizeLimit: '2mb',
       },
     },
   };
   ```

4. **エッジランタイム**（オプション）
   ```typescript
   export const runtime = 'edge';
   ```

## パフォーマンス目標

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5秒
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### カスタム指標

- **ページ初期ロード時間**: < 3秒
- **API応答時間**: < 500ms
- **データベースクエリ時間**: < 200ms

## 測定ツール

1. **Lighthouse**
   ```bash
   npx lighthouse http://localhost:3000 --view
   ```

2. **Next.js Built-in Analytics**
   開発モードで自動的に有効

3. **React DevTools Profiler**
   コンポーネントのレンダリングパフォーマンスを測定

4. **Chrome DevTools**
   - Network タブ: リソース読み込み時間
   - Performance タブ: ランタイムパフォーマンス
   - Coverage タブ: 未使用コードの検出

## チェックリスト

### リリース前の最終確認

- [ ] ビルドエラーがない
- [ ] すべてのテストがパス
- [ ] Lighthouseスコア（Performance: 90+, Accessibility: 90+, Best Practices: 90+, SEO: 90+）
- [ ] 本番環境変数が設定済み
- [ ] エラーロギングが設定済み
- [ ] バックアップ戦略が確立
- [ ] ロールバック手順が文書化

## 継続的な最適化

1. **定期的なバンドル分析**（月次）
2. **パフォーマンス指標のモニタリング**（継続的）
3. **依存関係の更新**（週次）
4. **セキュリティパッチの適用**（即座）
5. **ユーザーフィードバックの収集と分析**（継続的）
