# デプロイチェックリスト

このチェックリストに従って、順番にデプロイを進めてください。

## Phase 1: アカウント準備（10分）

### ☐ 1.1 Supabaseアカウント作成
1. https://supabase.com にアクセス
2. "Start your project" をクリック
3. GitHubアカウントでサインアップ（推奨）
4. 組織名を入力（例: your-name-org）

### ☐ 1.2 Vercelアカウント作成
1. https://vercel.com にアクセス
2. "Sign Up" をクリック
3. GitHubアカウントでサインアップ（推奨）

### ☐ 1.3 OpenAI APIキー取得
1. https://platform.openai.com にアクセス
2. アカウント作成（クレジットカード登録が必要）
3. API Keys → "Create new secret key"
4. キーをコピーして安全に保管

**予算設定**: OpenAIダッシュボード → Billing → Usage limits
- 推奨: $5-10/月の上限設定

---

## Phase 2: Supabaseデータベースセットアップ（20分）

### ☐ 2.1 新規プロジェクト作成
1. Supabaseダッシュボードで "New Project"
2. プロジェクト情報を入力：
   - Name: `tkz-prod` または任意の名前
   - Database Password: **強力なパスワードを生成して保存**
   - Region: `Northeast Asia (Tokyo)` （日本の場合）
3. "Create new project" をクリック（2-3分かかります）

### ☐ 2.2 接続情報を取得
プロジェクトが作成されたら：
1. Settings → API をクリック
2. 以下の値をコピー：
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJhbGc...
   service_role: eyJhbGc... (Show をクリックして表示)
   ```
3. これらを `.env.local` に一時保存

### ☐ 2.3 データベーススキーマの作成
1. SQL Editor タブを開く
2. "New query" をクリック
3. `supabase/migrations/20250120000001_initial_schema.sql` の内容をコピー＆ペースト
4. "Run" をクリック
5. 成功メッセージを確認

### ☐ 2.4 初期ユーザーの作成
1. SQL Editorで新しいクエリを作成
2. 以下のSQLを実行（パスワードはbcryptでハッシュ化済み）：

```sql
-- デフォルトパスワード: password123
INSERT INTO users (username, display_name, password_hash)
VALUES
  ('tkz', 'TKZ', '$2a$10$YourHashedPasswordHere'),
  ('kobo', 'コボちゃん', '$2a$10$YourHashedPasswordHere');
```

**重要**: ローカルで `npm run db:seed` を実行してハッシュを生成するか、
bcryptオンラインツールを使用してください。

### ☐ 2.5 Row Level Securityの設定
1. SQL Editorで新しいクエリを作成
2. 以下のSQLを実行：

```sql
-- RLSを有効化
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが全データを閲覧可能
CREATE POLICY "Allow read access for all" ON ai_tools
  FOR SELECT USING (true);

CREATE POLICY "Allow read access for all" ON prompt_history
  FOR SELECT USING (true);

-- 認証済みユーザーが作成可能
CREATE POLICY "Allow insert for authenticated" ON ai_tools
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow insert for authenticated" ON prompt_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 作成者のみが編集・削除可能
CREATE POLICY "Allow update for creators" ON ai_tools
  FOR UPDATE USING (created_by::text = auth.uid()::text);

CREATE POLICY "Allow delete for creators" ON ai_tools
  FOR DELETE USING (created_by::text = auth.uid()::text);

CREATE POLICY "Allow delete for creators" ON prompt_history
  FOR DELETE USING (created_by::text = auth.uid()::text);
```

---

## Phase 3: GitHubリポジトリの準備（10分）

### ☐ 3.1 GitHubリポジトリ作成
1. https://github.com/new にアクセス
2. リポジトリ名: `tkz` または任意の名前
3. Private または Public を選択
4. "Create repository" をクリック

### ☐ 3.2 コードをプッシュ
ローカルで以下を実行：

```bash
# Gitの初期化（まだの場合）
git init

# すべてのファイルを追加
git add .

# 初回コミット
git commit -m "Initial commit: AIツール共有&Sora2プロンプト生成アプリ"

# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/tkz.git

# メインブランチにプッシュ
git branch -M main
git push -u origin main
```

### ☐ 3.3 .env.localが除外されていることを確認
```bash
# .gitignoreに含まれていることを確認
cat .gitignore | grep .env.local
```

---

## Phase 4: Vercelデプロイ（15分）

### ☐ 4.1 Vercelプロジェクトをインポート
1. https://vercel.com/new にアクセス
2. "Import Git Repository" を選択
3. GitHubリポジトリ `tkz` を選択
4. "Import" をクリック

### ☐ 4.2 プロジェクト設定
- Framework Preset: **Next.js** （自動検出）
- Root Directory: `./` （変更不要）
- Build Command: `npm run build` （自動設定）
- Output Directory: `.next` （自動設定）

### ☐ 4.3 環境変数の設定
"Environment Variables" セクションで以下を追加：

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabaseから取得 | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseから取得 | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseから取得 | Production, Preview, Development |
| `NEXTAUTH_SECRET` | 生成する（下記参照） | Production, Preview, Development |
| `NEXTAUTH_URL` | 空欄（Vercelが自動設定） | - |
| `OPENAI_API_KEY` | OpenAIから取得 | Production, Preview, Development |

**NEXTAUTH_SECRETの生成方法**:
```bash
openssl rand -base64 32
```

または https://generate-secret.vercel.app/ を使用

### ☐ 4.4 デプロイ実行
1. "Deploy" ボタンをクリック
2. ビルドログを確認（2-3分）
3. 成功したら "Visit" をクリック

---

## Phase 5: デプロイ後の確認（10分）

### ☐ 5.1 ヘルスチェック
1. `https://your-project.vercel.app/api/health` にアクセス
2. 以下のJSONレスポンスを確認：
```json
{
  "status": "ok",
  "environment": {
    "supabase": "configured",
    "openai": "configured",
    "nextauth": "configured"
  },
  "database": {
    "connected": true
  }
}
```

### ☐ 5.2 ログインテスト
1. `https://your-project.vercel.app/login` にアクセス
2. 初期ユーザーでログイン：
   - Username: `tkz`
   - Password: `password123`
3. ログイン成功を確認

### ☐ 5.3 機能テスト
- [ ] AIツール一覧が表示される
- [ ] 新規ツールを登録できる
- [ ] プロンプト生成が動作する
- [ ] 履歴が保存される

### ☐ 5.4 パフォーマンステスト
```bash
# Lighthouseでテスト
npx lighthouse https://your-project.vercel.app --view
```

目標スコア: Performance 90+, Accessibility 90+

---

## Phase 6: セキュリティ設定（10分）

### ☐ 6.1 本番パスワードの変更
1. Supabase SQL Editorで新しいパスワードハッシュを生成
2. usersテーブルを更新：
```sql
UPDATE users
SET password_hash = '$2a$10$NewHashedPassword'
WHERE username = 'tkz';
```

### ☐ 6.2 OpenAI使用量制限の設定
1. OpenAIダッシュボード → Settings → Billing
2. "Usage limits" で月額上限を設定（推奨: $10）

### ☐ 6.3 Supabaseセキュリティ確認
1. Settings → Auth → Site URL を本番URLに設定
2. Redirect URLs に本番URLを追加

---

## Phase 7: モニタリング設定（オプション）

### ☐ 7.1 Vercel Analytics有効化
1. Vercelダッシュボード → プロジェクト → Analytics
2. "Enable Analytics" をクリック（無料）

### ☐ 7.2 エラーモニタリング
1. Vercelダッシュボード → Logs
2. エラーログを確認

### ☐ 7.3 Supabase モニタリング
1. Supabaseダッシュボード → Database → Performance
2. クエリパフォーマンスを確認

---

## トラブルシューティング

### ビルドエラー
- **環境変数の確認**: すべての必要な変数が設定されているか
- **ログの確認**: Vercelビルドログで詳細を確認
- **再デプロイ**: Deployments → "Redeploy" を試す

### データベース接続エラー
- **URLの確認**: Supabase URLが正しいか
- **キーの確認**: anon keyとservice role keyが正しいか
- **RLS設定**: Row Level Securityが正しく設定されているか

### 認証エラー
- **NEXTAUTH_SECRET**: 32文字以上のランダム文字列か
- **NEXTAUTH_URL**: 本番URLが正しいか（Vercelが自動設定）

### OpenAI APIエラー
- **APIキー**: 正しくコピーされているか
- **クレジット**: OpenAIアカウントに残高があるか
- **レート制限**: 短時間に多数のリクエストを送っていないか

---

## 完了チェックリスト

- [ ] すべてのPhaseが完了
- [ ] ヘルスチェックがパス
- [ ] ログインが成功
- [ ] 全機能が動作
- [ ] パフォーマンススコア90+
- [ ] セキュリティ設定完了
- [ ] モニタリング設定完了

## 次のステップ

デプロイが完了したら：
1. ユーザーにURLを共有
2. フィードバックを収集
3. 必要に応じて機能追加
4. 定期的なメンテナンス

---

## サポート

問題が発生した場合：
1. このチェックリストのトラブルシューティングを確認
2. `docs/DEPLOYMENT.md` の詳細ガイドを参照
3. Vercel/Supabase/OpenAIの公式ドキュメントを確認

デプロイが成功したら、本番URLをメモしておきましょう！
