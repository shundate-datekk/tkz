# AI Tools & Sora Prompt Generator

AIツール情報共有とSora2プロンプト自動生成アプリ

## 機能

### 1. AIツール情報管理
- ツールの登録、編集、削除
- カテゴリ別分類（テキスト生成、画像生成、動画生成、音声生成、コード生成、その他）
- 1-5段階の評価システム
- 使用目的と使用感の記録
- 作成者別の表示

### 2. 高度な検索・フィルタリング
- リアルタイム検索（ツール名、使用目的、使用感）
- カテゴリフィルタ
- ソート機能（使用日、評価、登録日）
- デバウンス処理による最適化
- 検索結果のカウント表示

### 3. Sora2プロンプト生成
- GPT-4を使用した英語プロンプトの自動生成
- 入力パラメータ：
  - 目的（必須）
  - シーン説明（必須）
  - スタイル（リアリスティック、アニメ、シネマティックなど）
  - 長さ（3秒、5秒、10秒、20秒、30秒、60秒）
  - その他の要望
- プロンプトのコピー、再生成、保存機能
- ローディング状態の表示

### 4. プロンプト履歴管理
- 生成したプロンプトの自動保存
- 履歴一覧の表示（カード形式）
- 履歴の詳細表示
- 履歴からのコピー機能
- 履歴の削除
- キーワード検索

### 5. レスポンシブデザイン
- PC・タブレット・スマートフォン対応
- モバイル用ハンバーガーメニュー
- タッチ操作の最適化
- レスポンシブグリッドレイアウト

### 6. ユーザー認証とアクセス制御
- NextAuth.js v5によるセキュアな認証
- セッション管理（24時間有効）
- 保護されたルート
- 作成者権限チェック（編集・削除）

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React 19, TypeScript
- **スタイリング**: Tailwind CSS v4, shadcn/ui
- **バックエンド**: Next.js Server Actions, API Routes
- **データベース**: PostgreSQL (Supabase)
- **認証**: NextAuth.js v5
- **AI**: OpenAI GPT-4 API
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトの設定ページから以下の情報を取得:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon/Public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. 環境変数の設定

`.env.local`ファイルを編集して、以下の値を設定してください:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

**NEXTAUTH_SECRETの生成方法:**

```bash
openssl rand -base64 32
```

### 4. ヘルスチェックの確認

開発サーバーを起動して、接続をテストします:

```bash
npm run dev
```

ブラウザで以下のURLにアクセス:
- アプリ: http://localhost:3000
- ヘルスチェック: http://localhost:3000/api/health

ヘルスチェックで環境変数とデータベース接続の状態を確認できます。

### 5. データベースのセットアップ

#### 5.1 マイグレーションの実行

Supabaseダッシュボードの「SQL Editor」で、以下のマイグレーションファイルを順番に実行してください:

1. `supabase/migrations/20250120000001_initial_schema.sql` - データベーススキーマの作成
2. `supabase/migrations/20250120000002_seed_users.sql` - 初期ユーザーの作成（テンプレート）

または、Supabase CLIを使用する場合:

```bash
# Supabase CLIのインストール（まだの場合）
npm install -g supabase

# Supabaseプロジェクトにリンク
supabase link --project-ref your-project-ref

# マイグレーションの実行
supabase db push
```

#### 5.2 初期ユーザーの作成

マイグレーション実行後、以下のコマンドで初期ユーザー（TKZ、コボちゃん）を作成します:

```bash
npm run db:seed
```

デフォルトのログイン情報:
- **TKZ**: username: `tkz`, password: `password123`
- **コボちゃん**: username: `kobo`, password: `password123`

⚠️ **重要**: 本番環境では必ずパスワードを変更してください！

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リント
npm run lint

# コードフォーマット
npm run format

# データベースシード（初期ユーザー作成）
npm run db:seed

# テスト
npm test                 # ユニット・統合テスト
npm run test:ui          # テストUIモード
npm run test:coverage    # カバレッジレポート
npm run test:e2e         # E2Eテスト（Playwright）
npm run test:e2e:ui      # E2Eテスト UIモード
npm run test:e2e:headed  # E2Eテスト ブラウザ表示
npm run test:e2e:debug   # E2Eテスト デバッグモード
```

## テスト

このプロジェクトには包括的なテストスイートが含まれています。

### テスト構成

- **ユニットテスト**: 30テスト - スキーマ、ユーティリティ、Result型のテスト
- **統合テスト**: 92テスト - サービス層、アクション、検索・フィルタリングのテスト
- **E2Eテスト**: 100+テスト - ナビゲーション、AIツール管理、プロンプト生成、履歴管理、レスポンシブUIのテスト

### テストの実行

#### ユニット・統合テスト

```bash
# すべてのテストを実行
npm test

# UIモードでテストを実行（推奨）
npm run test:ui

# カバレッジレポートを生成
npm run test:coverage
```

#### E2Eテスト

初回のみ、Playwrightブラウザをインストール：
```bash
npx playwright install
```

E2Eテストを実行：
```bash
# すべてのE2Eテストを実行
npm run test:e2e

# UIモードで実行（デバッグに便利）
npm run test:e2e:ui

# ブラウザを表示して実行
npm run test:e2e:headed

# デバッグモードで実行
npm run test:e2e:debug
```

詳細は `e2e/README.md` を参照してください。

## パフォーマンスと最適化

### 現在のバンドルサイズ

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
```

### 最適化手法

- ✅ React Server Components による初期ロード高速化
- ✅ 自動コード分割
- ✅ Tailwind CSS JITコンパイル
- ✅ データベースインデックスの最適化
- ✅ デバウンス処理による検索最適化
- ✅ セキュリティヘッダーの設定

詳細は `docs/OPTIMIZATION.md` を参照してください。

## デプロイ

### Vercelへのデプロイ

1. **Vercelアカウントの作成**: https://vercel.com
2. **プロジェクトのインポート**: GitHubリポジトリを連携
3. **環境変数の設定**: すべての必要な環境変数を追加
4. **デプロイ**: 自動的にデプロイが開始されます

詳細なデプロイ手順は `docs/DEPLOYMENT.md` を参照してください。

### 本番環境の環境変数

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.vercel.app
OPENAI_API_KEY=your-openai-api-key
```

## セキュリティ

- ✅ NextAuth.js v5による認証
- ✅ Row Level Security (RLS)によるデータアクセス制御
- ✅ 環境変数による秘密情報の管理
- ✅ CSRF保護
- ✅ XSS対策
- ✅ セキュリティヘッダーの設定
- ✅ パスワードのbcryptハッシュ化
- ✅ 入力バリデーション（Zod）

## ドキュメント

- `docs/DEPLOYMENT.md` - 詳細なデプロイガイド
- `docs/OPTIMIZATION.md` - パフォーマンス最適化ガイド
- `e2e/README.md` - E2Eテストガイド

## プロジェクト構造

```
tkz/
├── app/                         # Next.js App Router
│   ├── api/                     # APIルート
│   │   ├── auth/                # NextAuth.js認証API
│   │   └── health/              # ヘルスチェックAPI
│   ├── history/                 # プロンプト履歴
│   │   ├── [id]/                # 履歴詳細ページ
│   │   └── page.tsx             # 履歴一覧ページ
│   ├── login/                   # ログインページ
│   ├── prompt/                  # プロンプト生成ページ
│   ├── tools/                   # AIツール管理
│   │   ├── [id]/                # ツール詳細・編集ページ
│   │   ├── new/                 # 新規登録ページ
│   │   └── page.tsx             # ツール一覧ページ
│   ├── layout.tsx               # ルートレイアウト
│   ├── page.tsx                 # ホームページ
│   └── globals.css              # グローバルスタイル
├── components/                  # Reactコンポーネント
│   ├── auth/                    # 認証関連コンポーネント
│   ├── layout/                  # レイアウトコンポーネント
│   │   └── navbar.tsx           # グローバルナビゲーション
│   ├── prompt/                  # プロンプト関連コンポーネント
│   │   ├── prompt-generator.tsx # プロンプト生成UI
│   │   ├── prompt-form.tsx      # プロンプト入力フォーム
│   │   └── prompt-history-*.tsx # 履歴関連コンポーネント
│   ├── tools/                   # ツール関連コンポーネント
│   │   ├── tools-list.tsx       # ツール一覧
│   │   ├── tool-card.tsx        # ツールカード
│   │   └── tool-*-form.tsx      # ツールフォーム
│   ├── ui/                      # shadcn/uiコンポーネント
│   └── error-boundary.tsx       # エラー境界
├── lib/                         # 共通ライブラリ
│   ├── actions/                 # Server Actions
│   │   ├── ai-tool.actions.ts   # AIツール操作
│   │   └── prompt.actions.ts    # プロンプト操作
│   ├── auth/                    # 認証ヘルパー
│   │   └── helpers.ts           # 認証ユーティリティ
│   ├── clients/                 # 外部APIクライアント
│   │   └── openai-client.ts     # OpenAI GPT-4クライアント
│   ├── hooks/                   # カスタムフック
│   │   └── use-debounce.ts      # デバウンスフック
│   ├── repositories/            # データアクセス層
│   │   ├── ai-tool-repository.ts
│   │   ├── prompt-history-repository.ts
│   │   └── user-repository.ts
│   ├── schemas/                 # Zodスキーマ
│   │   ├── ai-tool.schema.ts
│   │   └── prompt.schema.ts
│   ├── services/                # ビジネスロジック
│   │   ├── ai-tool.service.ts
│   │   ├── prompt-generation.service.ts
│   │   └── prompt-history.service.ts
│   ├── supabase/                # Supabase設定
│   │   ├── client.ts            # Supabaseクライアント
│   │   └── types.ts             # データベース型定義
│   ├── types/                   # TypeScript型定義
│   │   └── result.ts            # Result型パターン
│   ├── utils/                   # ユーティリティ
│   │   ├── logger.ts            # 構造化ログ
│   │   └── cn.ts                # クラス名マージ
│   └── env.ts                   # 環境変数ユーティリティ
├── scripts/                     # ユーティリティスクリプト
│   └── seed-users.ts            # 初期ユーザー作成
├── supabase/                    # Supabaseマイグレーション
│   └── migrations/              # SQLマイグレーションファイル
├── .env.local                   # 環境変数（Git管理外）
├── .env.example                 # 環境変数テンプレート
└── env.d.ts                     # 環境変数型定義
```

## ライセンス

ISC
