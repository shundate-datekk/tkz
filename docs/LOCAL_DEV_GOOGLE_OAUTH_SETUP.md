# ローカル開発環境 Google OAuth設定ガイド

**目的**: ローカル開発環境（localhost:3000）でもGoogle OAuth認証を動作させる

---

## 📋 設定手順

### ステップ1: Google Cloud Consoleでリダイレクト先を追加

1. https://console.cloud.google.com/ にアクセス
2. **APIs & Services** → **Credentials** を開く
3. 作成済みのOAuth 2.0クライアントIDをクリック
4. **承認済みのJavaScript生成元** に以下を追加:
   - `http://localhost:3000`
5. **承認済みのリダイレクトURI** に以下を追加:
   - `http://localhost:3000/api/auth/callback/google`
6. 「保存」をクリック

---

## ステップ2: .env.localファイルを更新

### 2.1 .env.localファイルを開く

プロジェクトルート（`/Users/xtxn72/Code/interesting/tkz/`）にある `.env.local` ファイルを開きます。

### 2.2 環境変数を追加・更新

以下の環境変数が設定されているか確認し、不足していれば追加してください：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth Configuration (for NextAuth.js)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

### 2.3 各環境変数の設定

#### GOOGLE_CLIENT_ID
- **値**: Google Cloud ConsoleでコピーしたクライアントID
- **例**: `123456789-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`

#### GOOGLE_CLIENT_SECRET
- **値**: Google Cloud Consoleでコピーしたクライアントシークレット
- **例**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### NEXTAUTH_SECRET
- **値**: ランダムな32文字以上の文字列
- **生成方法**: `openssl rand -base64 32`

#### NEXTAUTH_URL
- **値**: `http://localhost:3000`（ローカル開発環境）

⚠️ **注意**: Vercel（本番環境）では `https://tkz-five.vercel.app` ですが、ローカルでは `http://localhost:3000` です。

---

## ステップ3: 開発サーバーを起動

### 3.1 開発サーバーの起動

```bash
npm run dev
```

### 3.2 ブラウザでアクセス

http://localhost:3000/login を開きます。

---

## ステップ4: 動作確認

### 4.1 ログインテスト

1. 「Googleでログイン」ボタンをクリック
2. Googleの認証画面にリダイレクトされる
3. TKZまたはコボちゃんのGoogleアカウントでログイン
4. `http://localhost:3000` にリダイレクトされる
5. ログイン状態が維持されていることを確認

✅ **成功！**

---

## 🔧 環境変数の完全な例

`.env.local` ファイルの完全な例：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=

# Google OAuth Configuration (for NextAuth.js)
GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ❌ トラブルシューティング

### エラー: "Redirect URI mismatch" (ローカル)

**原因**: `http://localhost:3000/api/auth/callback/google` がGoogle Cloud Consoleに登録されていない

**解決方法**:
1. Google Cloud Console → APIs & Services → Credentials
2. OAuth 2.0クライアントIDをクリック
3. 「承認済みのリダイレクトURI」に `http://localhost:3000/api/auth/callback/google` を追加
4. 「保存」をクリック

### エラー: "NEXTAUTH_URL not set"

**原因**: `.env.local` に `NEXTAUTH_URL` が設定されていない

**解決方法**:
1. `.env.local` を開く
2. `NEXTAUTH_URL=http://localhost:3000` を追加
3. 開発サーバーを再起動（`npm run dev`）

### エラー: "GOOGLE_CLIENT_ID is not defined"

**原因**: `.env.local` に `GOOGLE_CLIENT_ID` が設定されていない

**解決方法**:
1. `.env.local` を開く
2. `GOOGLE_CLIENT_ID=[Google Cloud Consoleの値]` を追加
3. 開発サーバーを再起動（`npm run dev`）

---

## 📝 ローカルとVercelの環境変数の違い

| 環境変数 | ローカル (.env.local) | Vercel (Production) |
|----------|----------------------|---------------------|
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://tkz-five.vercel.app` |
| `GOOGLE_CLIENT_ID` | 同じ値 | 同じ値 |
| `GOOGLE_CLIENT_SECRET` | 同じ値 | 同じ値 |
| `NEXTAUTH_SECRET` | 同じ値 | 同じ値 |

⚠️ **重要**: `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` は、ローカルとVercelで **同じ値** を使用します。Google Cloud Consoleで1つのOAuth 2.0クライアントIDを作成し、複数のリダイレクト先（localhost と vercel.app）を登録することで対応します。

---

## 🔗 関連ドキュメント

- [GOOGLE_OAUTH_MIGRATION_GUIDE.md](./GOOGLE_OAUTH_MIGRATION_GUIDE.md) - 本番環境の完全な設定ガイド
- [VERCEL_ENV_VARS_QUICK_SETUP.md](./VERCEL_ENV_VARS_QUICK_SETUP.md) - Vercel環境変数のクイック設定

---

**作成者**: Claude Code
**最終更新**: 2025-10-21
