# デプロイメントガイド

このドキュメントでは、本番環境へのデプロイ手順を説明します。

## 前提条件

### 必要なアカウント

1. **Vercel アカウント**
   - https://vercel.com でサインアップ
   - GitHubアカウントと連携推奨

2. **Supabase プロジェクト**
   - 本番環境用のSupabaseプロジェクト
   - データベースとテーブルのセットアップ完了

3. **OpenAI API キー**
   - https://platform.openai.com でAPIキーを取得
   - GPT-4へのアクセス権限

### 必要な環境変数

以下の環境変数を準備してください：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth.js
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl
NEXTAUTH_URL=https://your-domain.vercel.app

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
```

## Vercelへのデプロイ

### 方法1: Vercel CLI（推奨）

1. **Vercel CLIのインストール**
   ```bash
   npm install -g vercel
   ```

2. **ログイン**
   ```bash
   vercel login
   ```

3. **プロジェクトのリンク**
   ```bash
   vercel link
   ```

4. **環境変数の設定**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add OPENAI_API_KEY
   ```

5. **デプロイ**
   ```bash
   # プレビューデプロイ
   vercel

   # 本番デプロイ
   vercel --prod
   ```

### 方法2: Vercel Dashboard

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard

2. **新規プロジェクトを作成**
   - "Add New..." → "Project" をクリック
   - GitHubリポジトリをインポート

3. **ビルド設定**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next` (自動)
   - Install Command: `npm install`

4. **環境変数の設定**
   - "Environment Variables" セクションで上記の環境変数をすべて追加
   - Production, Preview, Development のスコープを選択

5. **デプロイ**
   - "Deploy" ボタンをクリック

### 方法3: GitHub統合（自動デプロイ）

1. **GitHubリポジトリの作成**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/tkz.git
   git push -u origin main
   ```

2. **Vercelとリポジトリを連携**
   - Vercelダッシュボードで "Import Project"
   - GitHubリポジトリを選択
   - 環境変数を設定
   - デプロイ

3. **自動デプロイの設定**
   - `main` ブランチへのプッシュで本番デプロイ
   - その他のブランチへのプッシュでプレビューデプロイ
   - プルリクエストごとに自動プレビュー

## データベースのセットアップ

### 本番環境のSupabase設定

1. **新規プロジェクトの作成**
   - https://app.supabase.com
   - "New Project" をクリック
   - プロジェクト名、データベースパスワードを設定
   - リージョンを選択（日本の場合: Northeast Asia (Tokyo)）

2. **データベーススキーマの適用**

   Supabase SQL Editorで以下のSQLを実行：

   ```sql
   -- usersテーブル
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     username TEXT UNIQUE NOT NULL,
     display_name TEXT NOT NULL,
     password_hash TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   -- ai_toolsテーブル
   CREATE TABLE ai_tools (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     tool_name TEXT NOT NULL,
     category TEXT NOT NULL,
     usage_purpose TEXT NOT NULL,
     user_experience TEXT NOT NULL,
     rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
     usage_date DATE NOT NULL,
     created_by UUID NOT NULL REFERENCES users(id),
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   -- prompt_historyテーブル
   CREATE TABLE prompt_history (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     prompt_text TEXT NOT NULL,
     input_parameters JSONB NOT NULL,
     created_by UUID NOT NULL REFERENCES users(id),
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   -- インデックス
   CREATE INDEX idx_ai_tools_created_by ON ai_tools(created_by);
   CREATE INDEX idx_ai_tools_category ON ai_tools(category);
   CREATE INDEX idx_ai_tools_usage_date ON ai_tools(usage_date);
   CREATE INDEX idx_prompt_history_created_by ON prompt_history(created_by);
   CREATE INDEX idx_prompt_history_created_at ON prompt_history(created_at);

   -- 全文検索インデックス
   CREATE INDEX idx_ai_tools_search ON ai_tools USING gin(to_tsvector('english', tool_name || ' ' || usage_purpose || ' ' || user_experience));
   CREATE INDEX idx_prompt_history_search ON prompt_history USING gin(to_tsvector('english', prompt_text));
   ```

3. **Row Level Securityの設定**

   ```sql
   -- RLSを有効化
   ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
   ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;

   -- 全ユーザーが全データを閲覧可能
   CREATE POLICY "Allow read access for all authenticated users" ON ai_tools
     FOR SELECT USING (auth.role() = 'authenticated');

   CREATE POLICY "Allow read access for all authenticated users" ON prompt_history
     FOR SELECT USING (auth.role() = 'authenticated');

   -- 作成者のみが編集・削除可能
   CREATE POLICY "Allow insert for authenticated users" ON ai_tools
     FOR INSERT WITH CHECK (auth.uid() = created_by);

   CREATE POLICY "Allow update for creators" ON ai_tools
     FOR UPDATE USING (auth.uid() = created_by);

   CREATE POLICY "Allow delete for creators" ON ai_tools
     FOR DELETE USING (auth.uid() = created_by);

   -- 同様にprompt_historyにも適用
   CREATE POLICY "Allow insert for authenticated users" ON prompt_history
     FOR INSERT WITH CHECK (auth.uid() = created_by);

   CREATE POLICY "Allow delete for creators" ON prompt_history
     FOR DELETE USING (auth.uid() = created_by);
   ```

4. **初期ユーザーの作成**

   ```bash
   npm run db:seed
   ```

   または、SQLで直接：

   ```sql
   INSERT INTO users (username, display_name, password_hash)
   VALUES
     ('tkz', 'TKZ', '$2a$10$...'), -- bcryptハッシュ
     ('kobo', 'コボちゃん', '$2a$10$...');
   ```

## セキュリティチェックリスト

デプロイ前に以下を確認してください：

- [ ] すべての環境変数が設定済み
- [ ] `.env.local` がgitignoreに含まれている
- [ ] API キーが安全に保管されている
- [ ] NEXTAUTH_SECRET が強力（32文字以上のランダム文字列）
- [ ] 本番環境のSupabaseでRLSが有効
- [ ] Supabase Service Role Keyが適切に保護されている
- [ ] セキュリティヘッダーが設定済み（next.config.ts）
- [ ] HTTPS が有効（Vercelは自動）

### NEXTAUTH_SECRET の生成

```bash
openssl rand -base64 32
```

## デプロイ後の確認

### 1. 機能テスト

- [ ] ログインページにアクセス可能
- [ ] ログインが正常に動作
- [ ] AIツール一覧の表示
- [ ] 新規ツールの登録
- [ ] ツールの編集・削除
- [ ] プロンプト生成機能
- [ ] プロンプト履歴の表示

### 2. パフォーマンステスト

```bash
# Lighthouseでテスト
npx lighthouse https://your-domain.vercel.app --view
```

目標スコア：
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### 3. エラーモニタリング

Vercelダッシュボードでエラーログを確認：
- https://vercel.com/your-username/your-project/logs

## カスタムドメインの設定（オプション）

1. **ドメインの追加**
   - Vercelダッシュボード → プロジェクト → Settings → Domains
   - ドメイン名を入力

2. **DNSレコードの設定**
   - ドメインレジストラ（例: お名前.com、Google Domains）でDNS設定
   - Aレコードまたは CNAMEレコードを追加

3. **SSL証明書**
   - Vercelが自動的にLet's Encryptで証明書を発行

4. **NEXTAUTH_URLの更新**
   ```bash
   vercel env add NEXTAUTH_URL production
   # 値: https://your-custom-domain.com
   ```

## CI/CDパイプライン

### GitHub Actionsの設定（オプション）

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm test -- --run

      - name: Build
        run: npm run build
```

## トラブルシューティング

### ビルドエラー

**エラー**: `Module not found`
- **解決**: `package.json` の依存関係を確認
- すべての依存関係が `dependencies` にあることを確認
- `npm install` を再実行

**エラー**: `Environment variable not defined`
- **解決**: Vercelダッシュボードで環境変数を確認
- すべての必要な環境変数が設定されているか確認

### 認証エラー

**エラー**: `[next-auth][error][JWT_SESSION_ERROR]`
- **解決**: `NEXTAUTH_SECRET` が設定されているか確認
- `NEXTAUTH_URL` が正しいドメインを指しているか確認

### データベース接続エラー

**エラー**: `Failed to connect to Supabase`
- **解決**: Supabase URLとキーが正しいか確認
- Supabaseプロジェクトが起動しているか確認
- ネットワークファイアウォール設定を確認

### OpenAI APIエラー

**エラー**: `Invalid API key`
- **解決**: `OPENAI_API_KEY` が正しいか確認
- APIキーに十分なクレジットがあるか確認

**エラー**: `Rate limit exceeded`
- **解決**: OpenAIのレート制限を確認
- 使用量を監視し、必要に応じてプランをアップグレード

## ロールバック手順

デプロイに問題がある場合、前のバージョンにロールバック：

### Vercel Dashboard

1. Deployments タブに移動
2. 以前の正常なデプロイを選択
3. "Promote to Production" をクリック

### Vercel CLI

```bash
vercel rollback
```

## 本番環境の監視

### Vercelの組み込み機能

- **Analytics**: アクセス解析
- **Speed Insights**: パフォーマンス監視
- **Logs**: リアルタイムログ

### 追加の監視ツール（推奨）

1. **Sentry** - エラートラッキング
2. **LogRocket** - セッションリプレイ
3. **Uptime Robot** - サイト稼働監視

## バックアップ戦略

### データベースバックアップ

Supabaseは自動バックアップを提供：
- ポイントインタイムリカバリー（PITR）
- 日次スナップショット

手動バックアップ：
```bash
# pg_dumpを使用
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

### コードバックアップ

- GitHubにすべてのコードをプッシュ
- タグを使用してバージョン管理

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## メンテナンスとアップデート

### 定期的なタスク

- **週次**: 依存関係の更新確認
- **月次**: セキュリティパッチの適用
- **四半期**: パフォーマンスレビューと最適化

### 依存関係の更新

```bash
# 更新可能なパッケージを確認
npm outdated

# パッチバージョンの更新
npm update

# メジャー/マイナーバージョンの更新
npm install next@latest react@latest
```

## サポートとリソース

- **Vercel ドキュメント**: https://vercel.com/docs
- **Next.js ドキュメント**: https://nextjs.org/docs
- **Supabase ドキュメント**: https://supabase.com/docs
- **OpenAI ドキュメント**: https://platform.openai.com/docs

## まとめ

このガイドに従って、安全かつ効率的に本番環境へデプロイできます。問題が発生した場合は、トラブルシューティングセクションを参照するか、各サービスの公式サポートに問い合わせてください。
