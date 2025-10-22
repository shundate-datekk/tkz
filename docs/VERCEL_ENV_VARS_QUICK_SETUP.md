# Vercel環境変数 クイック設定ガイド

**目的**: Google OAuth認証に必要な環境変数を素早く設定する

---

## 🚀 5分で完了する設定手順

### 前提条件

Google Cloud ConsoleでOAuth 2.0クライアントIDを作成済みであること。
まだの場合は [GOOGLE_OAUTH_MIGRATION_GUIDE.md](./GOOGLE_OAUTH_MIGRATION_GUIDE.md) を参照してください。

---

## ステップ1: 必要な値を準備

以下の値を手元に用意してください：

| 項目 | 取得元 | 値の例 |
|------|--------|--------|
| **Google Client ID** | Google Cloud Console → APIs & Services → Credentials | `123456789-xxx.apps.googleusercontent.com` |
| **Google Client Secret** | Google Cloud Console → APIs & Services → Credentials | `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| **NextAuth Secret** | `openssl rand -base64 32` で生成 | `xxxxxxxxxxxxxxxxxxxxxxxxxxx=` |

### NextAuth Secretの生成方法

**ターミナルで実行**:
```bash
openssl rand -base64 32
```

または、以下のサイトで生成:
- https://generate-secret.vercel.app/32

---

## ステップ2: Vercelに環境変数を設定

### 2.1 Vercelダッシュボードを開く

1. https://vercel.com にアクセス
2. プロジェクト「tkz」を選択
3. **Settings** → **Environment Variables**

### 2.2 環境変数を追加

以下の3つの環境変数を追加します。**コピペ推奨**。

---

#### 環境変数1: GOOGLE_CLIENT_ID

```
Key: GOOGLE_CLIENT_ID
Value: [Google Cloud ConsoleでコピーしたクライアントID]
Environment: ✅ Production ✅ Preview ✅ Development
```

**[Save]** をクリック

---

#### 環境変数2: GOOGLE_CLIENT_SECRET

```
Key: GOOGLE_CLIENT_SECRET
Value: [Google Cloud Consoleでコピーしたクライアントシークレット]
Environment: ✅ Production ✅ Preview ✅ Development
```

**[Save]** をクリック

---

#### 環境変数3: NEXTAUTH_SECRET

```
Key: NEXTAUTH_SECRET
Value: [openssl rand -base64 32で生成した文字列]
Environment: ✅ Production ✅ Preview ✅ Development
```

**[Save]** をクリック

---

#### 環境変数4: NEXTAUTH_URL（確認）

既存の `NEXTAUTH_URL` を確認してください。

```
Key: NEXTAUTH_URL
Value: https://tkz-five.vercel.app
Environment: ✅ Production のみ
```

⚠️ 存在しない場合は追加してください。

---

## ステップ3: 再デプロイ

### Vercelダッシュボードから再デプロイ

1. **Deployments** タブを開く
2. 最新のデプロイメント（一番上）の **[…]** メニューをクリック
3. **[Redeploy]** を選択
4. **[Redeploy]** をクリック（Build Cacheは使用してもしなくてもOK）

### デプロイ完了を待つ

- Status: **Building** → **Ready** になるまで待つ（1-3分）

---

## ステップ4: 動作確認

### 4.1 ログインページを開く

https://tkz-five.vercel.app/login

### 4.2 ログインテスト

1. 「Googleでログイン」ボタンをクリック
2. Googleアカウントでログイン
3. メイン画面にリダイレクトされることを確認

✅ **成功！**

---

## 🔧 設定後の環境変数一覧

最終的に以下の環境変数が設定されているはずです：

| 変数名 | Production | Preview | Development |
|--------|------------|---------|-------------|
| `GOOGLE_CLIENT_ID` | ✅ | ✅ | ✅ |
| `GOOGLE_CLIENT_SECRET` | ✅ | ✅ | ✅ |
| `NEXTAUTH_SECRET` | ✅ | ✅ | ✅ |
| `NEXTAUTH_URL` | ✅ (https://tkz-five.vercel.app) | - | - |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `OPENAI_API_KEY` | ✅ | ✅ | ✅ |

---

## ❌ エラーが発生した場合

### "Redirect URI mismatch"

→ Google Cloud Consoleでリダイレクト先URIを確認
- `https://tkz-five.vercel.app/api/auth/callback/google` が登録されているか

### "Invalid client"

→ GOOGLE_CLIENT_IDとGOOGLE_CLIENT_SECRETを再確認
- コピー時に余分なスペースが入っていないか
- 正しい値がVercelに設定されているか

### "Access denied"

→ OAuth同意画面のテストユーザーを確認
- TKZとコボちゃんのGoogleアカウントが追加されているか

---

## 📝 次のステップ

環境変数の設定が完了したら：

1. ✅ [DATABASE_CLEANUP_GUIDE.md](./DATABASE_CLEANUP_GUIDE.md) でRLSポリシーを無効化
2. ✅ 全機能が正常に動作することを確認
3. ✅ Task 11.5（Google OAuth認証テスト）を完了としてマーク

---

**作成者**: Claude Code
**最終更新**: 2025-10-21
