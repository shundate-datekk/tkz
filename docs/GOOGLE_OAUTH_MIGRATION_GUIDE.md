# Google OAuth認証 移行完全ガイド

**作成日**: 2025-10-21
**対象**: Vercel本番環境への Google OAuth 認証設定
**目的**: Credentials認証からGoogle OAuth認証への完全移行

---

## 📋 移行手順の概要

1. **Google Cloud Console でOAuth 2.0クライアントIDを作成**
2. **Vercel環境変数を更新**
3. **Vercelで再デプロイ**
4. **動作確認テスト**

---

## ステップ1: Google Cloud Console での設定

### 1.1 Google Cloud Consoleにアクセス

1. https://console.cloud.google.com/ にアクセス
2. Googleアカウント（TKZまたはコボちゃん）でログイン

### 1.2 プロジェクトの作成または選択

**新規プロジェクトを作成する場合**:
1. 上部のプロジェクト選択ドロップダウンをクリック
2. 「新しいプロジェクト」をクリック
3. プロジェクト名: `tkz-ai-tools-app` （任意）
4. 「作成」をクリック

**既存プロジェクトを選択する場合**:
1. 上部のプロジェクト選択ドロップダウンから該当プロジェクトを選択

### 1.3 OAuth同意画面の設定

1. 左側のメニューから **「APIとサービス」** → **「OAuth同意画面」** を選択
2. User Type: **「外部」** を選択（テストユーザーを指定するため）
3. 「作成」をクリック

**アプリ情報の入力**:
- **アプリ名**: `AI Tools & Sora Prompt Generator`
- **ユーザーサポートメール**: あなたのメールアドレス
- **アプリのロゴ**: （オプション）
- **承認済みドメイン**: （オプション）
- **デベロッパーの連絡先情報**: あなたのメールアドレス

「保存して次へ」をクリック

**スコープの設定**:
- デフォルトのまま「保存して次へ」をクリック
  （Google認証に必要な基本スコープ: `email`, `profile`, `openid` は自動的に含まれます）

**テストユーザーの追加**:
1. 「+ ADD USERS」をクリック
2. TKZのGoogleアカウントのメールアドレスを入力
3. 「追加」をクリック
4. もう一度「+ ADD USERS」をクリック
5. コボちゃんのGoogleアカウントのメールアドレスを入力
6. 「追加」をクリック

「保存して次へ」をクリック

**概要画面**:
- 設定内容を確認
- 「ダッシュボードに戻る」をクリック

### 1.4 OAuth 2.0 クライアントIDの作成

1. 左側のメニューから **「APIとサービス」** → **「認証情報」** を選択
2. 上部の **「+ 認証情報を作成」** をクリック
3. **「OAuth クライアントID」** を選択

**OAuth クライアントIDの設定**:
- **アプリケーションの種類**: `ウェブ アプリケーション`
- **名前**: `tkz-ai-tools-web-app` （任意）

**承認済みのJavaScript生成元**:
- `https://tkz-five.vercel.app`
- `http://localhost:3000` （ローカル開発用）

**承認済みのリダイレクトURI**:
- `https://tkz-five.vercel.app/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google` （ローカル開発用）

⚠️ **重要**: リダイレクトURIは完全一致である必要があります。末尾のスラッシュの有無も厳密にチェックされます。

「作成」をクリック

### 1.5 クライアントIDとシークレットをコピー

作成が完了すると、ダイアログが表示されます：
- **クライアントID**: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
- **クライアントシークレット**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

⚠️ **これらの値をメモしてください！** 後でVercelの環境変数に設定します。

「OK」をクリック

---

## ステップ2: Vercel環境変数の更新

### 2.1 Vercelダッシュボードにアクセス

1. https://vercel.com にアクセス
2. ログイン
3. プロジェクト **「tkz」** を選択
4. **「Settings」** タブをクリック
5. 左側メニューから **「Environment Variables」** を選択

### 2.2 Google OAuth認証用の環境変数を追加

**追加する環境変数（3つ）**:

#### 環境変数1: GOOGLE_CLIENT_ID

- **Key (Name)**: `GOOGLE_CLIENT_ID`
- **Value**: Google Cloud ConsoleでコピーしたクライアントID
  - 例: `123456789-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development （すべてチェック）
- 「Save」をクリック

#### 環境変数2: GOOGLE_CLIENT_SECRET

- **Key (Name)**: `GOOGLE_CLIENT_SECRET`
- **Value**: Google Cloud Consoleでコピーしたクライアントシークレット
  - 例: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development （すべてチェック）
- 「Save」をクリック

#### 環境変数3: NEXTAUTH_SECRET（新規作成が必要な場合）

**NEXTAUTH_SECRETの生成方法**:

**方法1: ターミナルで生成（推奨）**
```bash
openssl rand -base64 32
```

**方法2: オンラインジェネレーター**
- https://generate-secret.vercel.app/32 にアクセスしてコピー

- **Key (Name)**: `NEXTAUTH_SECRET`
- **Value**: 生成されたランダムな文字列（32文字以上）
  - 例: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development （すべてチェック）
- 「Save」をクリック

### 2.3 NEXTAUTH_URLを確認・更新

**既存のNEXTAUTH_URLを確認**:
- **Key (Name)**: `NEXTAUTH_URL`
- **Value (Production)**: `https://tkz-five.vercel.app`

⚠️ もし存在しない場合は追加してください：
- **Key (Name)**: `NEXTAUTH_URL`
- **Value**: `https://tkz-five.vercel.app`
- **Environment**: ✅ Production のみチェック
- 「Save」をクリック

### 2.4 その他の既存環境変数を確認

以下の環境変数が正しく設定されているか確認してください：

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー | ✅ |
| `OPENAI_API_KEY` | OpenAI APIキー | ✅ |

### 2.5 不要な環境変数の削除（オプション）

Credentials認証で使用していた以下の環境変数は不要になりました（削除しても問題ありません）：
- `NEXTAUTH_CREDENTIALS_USERNAME` （存在する場合）
- `NEXTAUTH_CREDENTIALS_PASSWORD` （存在する場合）

⚠️ **注意**: 削除は任意です。残っていても動作に影響はありません。

---

## ステップ3: Vercelで再デプロイ

環境変数を更新しても、**すぐには反映されません**。再デプロイが必要です。

### 方法1: Vercelダッシュボードから再デプロイ（推奨）

1. Vercelダッシュボードでプロジェクト「tkz」を開く
2. **「Deployments」** タブをクリック
3. 最新のデプロイメント（一番上）の右側にある **「…」** メニューをクリック
4. **「Redeploy」** を選択
5. 「Use existing Build Cache?」→ **「Redeploy」** をクリック

### 方法2: Gitから再デプロイ

```bash
# ローカルで変更をコミット＆プッシュ
git add .
git commit -m "docs: Google OAuth migration guide"
git push origin main
```

Vercelが自動的に再デプロイを開始します。

### 再デプロイの確認

1. Vercelダッシュボードの「Deployments」タブを開く
2. 最新のデプロイメントが **「Building」** → **「Ready」** になるのを待つ（通常1-3分）
3. ステータスが **「Ready」** になったら完了

---

## ステップ4: 動作確認テスト

### 4.1 ログインページにアクセス

1. https://tkz-five.vercel.app/login を開く
2. 「Googleでログイン」ボタンが表示されることを確認

### 4.2 Google認証フローのテスト

1. 「Googleでログイン」ボタンをクリック
2. Googleの認証画面にリダイレクトされることを確認

**期待される画面**:
```
AI Tools & Sora Prompt Generator が Google アカウントへのアクセスを
リクエストしています

メールアドレスの表示
基本的なプロフィール情報の表示

[許可] [キャンセル]
```

3. **TKZまたはコボちゃんのGoogleアカウント** を選択
4. 「許可」をクリック
5. メイン画面（https://tkz-five.vercel.app）にリダイレクトされることを確認
6. ログイン状態が維持されていることを確認

### 4.3 ログアウトテスト

1. ナビゲーションメニューから「ログアウト」をクリック
2. ログイン画面にリダイレクトされることを確認

### 4.4 保護されたルートのテスト

1. ログアウト状態で https://tkz-five.vercel.app/tools にアクセス
2. ログイン画面にリダイレクトされることを確認

---

## ❌ トラブルシューティング

### エラー1: "Redirect URI mismatch"

**エラーメッセージ**:
```
Error 400: redirect_uri_mismatch
The redirect URI in the request, https://tkz-five.vercel.app/api/auth/callback/google, does not match the ones authorized for the OAuth client.
```

**原因**: Google Cloud Consoleでリダイレクト先URIが正しく登録されていない

**解決方法**:
1. Google Cloud Console → APIs & Services → Credentials を開く
2. 作成したOAuth 2.0クライアントIDをクリック
3. 「承認済みのリダイレクトURI」に以下を追加:
   - `https://tkz-five.vercel.app/api/auth/callback/google`
4. 「保存」をクリック
5. 再度ログインを試行

### エラー2: "Invalid client"

**エラーメッセージ**:
```
Error: invalid_client
```

**原因**: VercelのGOOGLE_CLIENT_IDまたはGOOGLE_CLIENT_SECRETが間違っている

**解決方法**:
1. Google Cloud Console → APIs & Services → Credentials を開く
2. OAuth 2.0クライアントIDの値を再確認
3. Vercelの環境変数を正しい値に更新
4. Vercelで再デプロイ

### エラー3: "Access denied"

**エラーメッセージ**:
```
Access denied: [your-email] is not authorized to access this app
```

**原因**: OAuth同意画面のテストユーザーに追加されていない

**解決方法**:
1. Google Cloud Console → APIs & Services → OAuth同意画面 を開く
2. 「テストユーザー」セクションで「+ ADD USERS」をクリック
3. TKZとコボちゃんのGoogleアカウントを追加
4. 「保存」をクリック
5. 再度ログインを試行

### エラー4: "NEXTAUTH_SECRET not set"

**エラーメッセージ**:
```
Error: Please define NEXTAUTH_SECRET environment variable
```

**原因**: VercelにNEXTAUTH_SECRETが設定されていない

**解決方法**:
1. `openssl rand -base64 32` でシークレットを生成
2. Vercel環境変数に`NEXTAUTH_SECRET`を追加
3. Vercelで再デプロイ

### エラー5: ログイン後、無限ループになる

**症状**: ログイン後、ログイン画面とリダイレクトを繰り返す

**原因**: NextAuth.jsのセッション処理に問題がある可能性

**解決方法**:
1. ブラウザのCookieをクリア
2. シークレットモード（プライベートブラウジング）で再度テスト
3. Vercelのログ（Deployments → Function Logs）を確認

---

## 📝 環境変数一覧（最終確認用）

デプロイ前に、以下の環境変数がVercelに設定されているか確認してください：

| 変数名 | 設定値の例 | 環境 | 必須 |
|--------|-----------|------|------|
| `GOOGLE_CLIENT_ID` | `123456789-xxx.apps.googleusercontent.com` | Production, Preview, Development | ✅ |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Production, Preview, Development | ✅ |
| `NEXTAUTH_SECRET` | `ランダムな32文字以上の文字列` | Production, Preview, Development | ✅ |
| `NEXTAUTH_URL` | `https://tkz-five.vercel.app` | Production | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` | Production, Preview, Development | ✅ |
| `OPENAI_API_KEY` | `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Production, Preview, Development | ✅ |

---

## 📋 チェックリスト

移行作業前に、このチェックリストを使用してください：

### Google Cloud Console設定
- [ ] Google Cloud Consoleでプロジェクトを作成または選択
- [ ] OAuth同意画面を設定
- [ ] テストユーザーにTKZとコボちゃんを追加
- [ ] OAuth 2.0クライアントIDを作成
- [ ] 承認済みのリダイレクトURIに `https://tkz-five.vercel.app/api/auth/callback/google` を追加
- [ ] クライアントIDとシークレットをメモ

### Vercel環境変数設定
- [ ] `GOOGLE_CLIENT_ID` を追加
- [ ] `GOOGLE_CLIENT_SECRET` を追加
- [ ] `NEXTAUTH_SECRET` を追加（または確認）
- [ ] `NEXTAUTH_URL` を確認（Production: `https://tkz-five.vercel.app`）
- [ ] その他の環境変数（Supabase、OpenAI）を確認

### デプロイと動作確認
- [ ] Vercelで再デプロイを実行
- [ ] デプロイが正常に完了（Status: Ready）
- [ ] ログインページにGoogleログインボタンが表示される
- [ ] TKZのGoogleアカウントでログインできる
- [ ] コボちゃんのGoogleアカウントでログインできる
- [ ] ログアウトが正常に動作する
- [ ] 保護されたルートへのアクセス制御が機能する

---

## 🔗 関連ドキュメント

- [Google OAuth Testing Report](./GOOGLE_OAUTH_TESTING_REPORT.md) - テスト手順と結果
- [Database Cleanup Guide](./DATABASE_CLEANUP_GUIDE.md) - データベースRLS無効化
- [Login Migration Archive](./archive/login-migration/README.md) - 移行の経緯

---

**作成者**: Claude Code
**最終更新**: 2025-10-21
