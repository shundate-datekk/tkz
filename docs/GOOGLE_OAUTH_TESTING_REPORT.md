# Google OAuth認証 テストレポート

**作成日**: 2025-10-21
**対象環境**: Vercel本番環境 (https://tkz-five.vercel.app)
**認証方式**: Google OAuth 2.0 (NextAuth.js v5)

---

## 📋 テスト実施サマリー

### ✅ 完了したテスト

| テスト項目 | 結果 | 詳細 |
|----------|------|------|
| デプロイ状態確認 | ✅ 成功 | アプリケーションは https://tkz-five.vercel.app で正常に稼働中 |
| ログインページ表示 | ✅ 成功 | Googleログインボタンのみ表示、username/passwordフィールドなし |
| 認証設定確認 | ✅ 成功 | auth.config.tsでGoogle OAuth Providerが正しく設定されている |
| 環境変数テンプレート | ✅ 更新完了 | .env.exampleにGOOGLE_CLIENT_ID/SECRETを追加 |

### ⏳ 未完了のテスト（手動実施が必要）

| テスト項目 | 実施者 | 優先度 |
|----------|--------|--------|
| Google OAuth認証フローの実際のログインテスト | TKZ / コボちゃん | 🔴 高 |
| セッション管理の動作確認（24時間有効期限） | TKZ / コボちゃん | 🔴 高 |
| ログアウト機能の動作確認 | TKZ / コボちゃん | 🟡 中 |
| データベースRLSポリシーの無効化 | 開発者（SQL実行） | 🔴 高 |
| Vercel環境変数の確認 | TKZ / コボちゃん | 🔴 高 |

---

## 🔍 確認結果の詳細

### 1. デプロイ状態

**URL**: https://tkz-five.vercel.app

**確認内容**:
- ✅ アプリケーションは正常にデプロイされている
- ✅ ホームページが表示される
- ✅ "AI Tools & Sora Prompt Generator" というタイトルが表示される
- ✅ `/login` へのリンクが存在する

### 2. ログインページ

**URL**: https://tkz-five.vercel.app/login

**確認内容**:
- ✅ ページタイトル: "ログイン | AI Tools & Sora Prompt Generator"
- ✅ 説明文: "Googleアカウントでログインしてください"
- ✅ TKZさんとコボちゃんのGoogleアカウントでログインできる旨の記載あり
- ✅ **Googleログインボタンのみ表示** (username/passwordフィールドは存在しない)

**期待される動作**:
- ユーザーがGoogleログインボタンをクリック
- Googleの認証画面にリダイレクト
- ユーザーがGoogleアカウントで認証
- 認証成功後、メイン画面 (`/`) にリダイレクト

### 3. 認証設定ファイル

**ファイル**: `auth.config.ts`

**確認内容**:
```typescript
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
]
```

- ✅ Google OAuth Providerが正しく設定されている
- ✅ セッション戦略: JWT (24時間有効期限)
- ✅ カスタムログインページ: `/login`
- ✅ JWT/Session callbacksが実装されている

---

## ⚠️ 確認が必要な事項

### 1. Vercel環境変数の確認（最重要）

Vercelダッシュボードで以下の環境変数が正しく設定されているか確認してください。

**確認手順**:
1. https://vercel.com にアクセス
2. プロジェクト「tkz」を選択
3. Settings → Environment Variables に移動
4. 以下の変数が存在し、正しい値が設定されているか確認

**必須の環境変数**:

| 変数名 | 説明 | 備考 |
|--------|------|------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Google Cloud Consoleで取得 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Google Cloud Consoleで取得 |
| `NEXTAUTH_SECRET` | NextAuth.jsのシークレットキー | ランダムな文字列（32文字以上推奨） |
| `NEXTAUTH_URL` | アプリケーションのURL | 本番: `https://tkz-five.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL | Supabaseダッシュボードで確認 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー | Supabaseダッシュボードで確認 |
| `OPENAI_API_KEY` | OpenAI APIキー | プロンプト生成機能に必要 |

**確認方法**:
```bash
# ローカルで確認（開発者のみ）
cat .env.local

# Vercelで確認（ブラウザ）
1. Vercel Dashboard → Project Settings → Environment Variables
2. 各変数が「Production」環境に設定されているか確認
```

### 2. Google Cloud Consoleの設定確認

Google OAuth認証が動作するには、Google Cloud Consoleで以下の設定が必要です。

**確認項目**:
1. **OAuth 2.0 クライアントIDの作成**
   - Google Cloud Console → APIs & Services → Credentials
   - OAuth 2.0 Client IDsセクションを確認

2. **承認済みのリダイレクトURI**
   - 以下のURIが登録されているか確認:
     - `https://tkz-five.vercel.app/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (開発環境用)

3. **OAuth同意画面の設定**
   - テストユーザーにTKZとコボちゃんのGoogleアカウントが追加されているか確認
   - アプリケーション名、ロゴ、プライバシーポリシーURLなどが設定されているか確認

---

## 🧪 手動テストの実施手順

### テスト1: Google OAuthログインフロー

**手順**:
1. https://tkz-five.vercel.app/login にアクセス
2. 「Googleでログイン」ボタンをクリック
3. Googleの認証画面にリダイレクトされることを確認
4. TKZまたはコボちゃんのGoogleアカウントでログイン
5. 認証成功後、メイン画面 (`/`) にリダイレクトされることを確認
6. ログイン状態が維持されていることを確認（ナビゲーションにユーザー名が表示される）

**期待結果**:
- ✅ ログインが成功する
- ✅ メイン画面にリダイレクトされる
- ✅ ユーザー名（Googleアカウントの表示名）が表示される
- ✅ AIツール一覧、プロンプト生成などの機能にアクセスできる

**エラーが発生した場合**:
- ❌ `Error: Redirect URI mismatch` → Google Cloud Consoleでリダイレクト先が正しく設定されているか確認
- ❌ `Error: Invalid client` → GOOGLE_CLIENT_IDが正しく設定されているか確認
- ❌ `Error: Access denied` → OAuth同意画面のテストユーザーに追加されているか確認

### テスト2: セッション管理

**手順**:
1. ログイン後、ブラウザを閉じる
2. 再度ブラウザを開き、https://tkz-five.vercel.app にアクセス
3. ログイン状態が維持されていることを確認
4. 24時間後に再度アクセスし、セッションが期限切れになることを確認

**期待結果**:
- ✅ ブラウザを閉じてもログイン状態が維持される（JWTトークンがCookieに保存される）
- ✅ 24時間以内であればログイン状態が継続
- ✅ 24時間経過後はログイン画面にリダイレクトされる

### テスト3: ログアウト機能

**手順**:
1. ログイン後、ナビゲーションメニューから「ログアウト」ボタンをクリック
2. ログイン画面にリダイレクトされることを確認
3. 保護されたルート（`/tools`、`/prompt`など）にアクセスしようとするとログイン画面にリダイレクトされることを確認

**期待結果**:
- ✅ ログアウトボタンをクリックするとログイン画面にリダイレクトされる
- ✅ セッションが完全に終了する
- ✅ 保護されたルートにアクセスできない

### テスト4: 保護されたルートのアクセス制御

**手順**:
1. ログアウト状態で https://tkz-five.vercel.app/tools にアクセス
2. ログイン画面にリダイレクトされることを確認
3. ログイン後、再度 `/tools` にアクセスできることを確認

**期待結果**:
- ✅ 未認証状態では保護されたルートにアクセスできない
- ✅ ログイン画面にリダイレクトされる
- ✅ 認証後は全機能にアクセスできる

---

## 🛠️ データベースクリーンアップ（RLSポリシーの無効化）

### 背景

現在のデータベーススキーマには、Supabase Auth専用の関数（`auth.uid()`、`auth.role()`）を使用したRLSポリシーが設定されています。しかし、NextAuth.jsではこれらの関数が機能しないため、RLSポリシーを無効化する必要があります。

詳細は `docs/DATABASE_CLEANUP_GUIDE.md` を参照してください。

### 実施するSQL（オプションA: 最小限のクリーンアップ）

**Supabase SQL Editorで以下のSQLを実行してください**:

```sql
-- RLSを無効化
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- 確認
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'ai_tools', 'prompt_history', 'sessions');
```

**期待される結果**:
```
 tablename       | rowsecurity
-----------------+-------------
 users           | f
 ai_tools        | f
 prompt_history  | f
 sessions        | f
```

**実施後の注意点**:
- ✅ アプリケーション層でのアクセス制御が機能していることを確認
- ⚠️ RLSが無効化されているため、Supabaseクライアント経由の直接アクセスには注意
- ⚠️ 将来的にNextAuth.js対応のRLSポリシーを実装することを検討

---

## 📝 次のアクションアイテム

### 即座に実施すべきこと（優先度：高）

1. **Vercel環境変数の確認**
   - Vercelダッシュボードで全ての必須環境変数が設定されているか確認
   - 特に `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` が正しいか確認

2. **Google Cloud Consoleの設定確認**
   - リダイレクト先URIが正しく登録されているか確認
   - OAuth同意画面のテストユーザーにTKZとコボちゃんが追加されているか確認

3. **実際のログインテスト**
   - TKZとコボちゃんの両方のGoogleアカウントでログインをテスト
   - 認証フロー全体が正常に動作することを確認

4. **データベースRLSポリシーの無効化**
   - Supabase SQL Editorで上記のSQLを実行
   - RLSが無効化されたことを確認

### 中期的に実施すべきこと（優先度：中）

1. **セキュリティ監査**
   - アプリケーション層でのアクセス制御が適切に実装されているか確認
   - 他ユーザーのデータへの不正アクセスが防止されているか検証

2. **パフォーマンステスト**
   - ページロード時間の測定
   - Lighthouse CIによる品質スコアの確認

3. **エラーハンドリングのテスト**
   - 認証エラー時の適切なフィードバック表示
   - ネットワークエラー時の挙動確認

### 長期的に検討すべきこと（優先度：低）

1. **NextAuth.js対応のRLSポリシーの実装**
   - カスタムJWT検証関数の作成
   - RLSポリシーの再有効化

2. **マルチテナント対応の検討**
   - TKZとコボちゃん以外のユーザーへの拡張を検討する場合

3. **Supabase Authへの移行検討**
   - 将来的にSupabase Authを使用することでRLSポリシーを有効活用

---

## 📊 タスクリストとの対応

このテストは以下のタスクに対応しています:

- **Task 11.4**: データベースクリーンアップとRLSポリシーの更新
- **Task 11.5**: Google OAuth認証の本番環境テスト
- **Task 11.6**: デプロイ準備とVercel設定（環境変数確認）

---

## 🔗 関連ドキュメント

- [DATABASE_CLEANUP_GUIDE.md](./DATABASE_CLEANUP_GUIDE.md) - データベースクリーンアップの詳細手順
- [ログイン機能移行アーカイブ](./archive/login-migration/README.md) - Credentials→OAuth移行の経緯
- [要件定義書](../.kiro/specs/ai-tools-sharing-sora-prompt-generator/requirements.md) - Requirement 5（認証）
- [設計書](../.kiro/specs/ai-tools-sharing-sora-prompt-generator/design.md) - Authentication設計

---

**作成者**: Claude Code
**最終更新**: 2025-10-21
