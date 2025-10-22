# Google OAuth設定 作業進捗メモ

**作業開始日**: 2025-10-21
**最終更新**: 2025-10-21
**ステータス**: ⏸️ 一時中断中（テストユーザー追加の手前）

---

## ✅ 完了した作業

### 1. Google Cloud Consoleでプロジェクト作成 ✅
- プロジェクトが正常に作成されました

### 2. OAuth同意画面の設定 ✅
- User Type: **外部** を選択
- アプリ名: `AI Tools & Sora Prompt Generator`
- ユーザーサポートメール: 設定済み
- デベロッパーの連絡先情報: 設定済み
- 公開ステータス: **テスト中**

---

## ⏸️ 中断中の作業

### 3. テストユーザーの追加

**現在の状況**:
- TKZのGoogleアカウントを確認中
- テストユーザーの追加画面まで到達済み

**次に実施すること**:
1. TKZのGoogleアカウントのメールアドレスを確認
2. コボちゃんのGoogleアカウントのメールアドレスを確認
3. Google Cloud Console → OAuth同意画面 → テストユーザー → **「+ ADD USERS」** をクリック
4. TKZのメールアドレスを入力 → Enter
5. コボちゃんのメールアドレスを入力 → Enter
6. **「追加」** または **「保存」** をクリック

---

## 📋 再開時の手順（チェックリスト）

作業を再開する際は、以下の手順で続きから開始できます：

### ステップ1: Google Cloud Consoleに戻る
- [ ] https://console.cloud.google.com/ にアクセス
- [ ] 作成したプロジェクトが選択されていることを確認（画面上部のプロジェクト名）

### ステップ2: OAuth同意画面を開く
- [ ] 左側メニュー（☰）→ **「APIとサービス」** → **「OAuth同意画面」** をクリック

### ステップ3: テストユーザーを追加
- [ ] 画面を下にスクロールして **「テストユーザー」** セクションを探す
- [ ] **「+ ADD USERS」** ボタンをクリック
- [ ] **TKZのGoogleアカウント**のメールアドレスを入力 → Enter
- [ ] **コボちゃんのGoogleアカウント**のメールアドレスを入力 → Enter
- [ ] **「追加」** または **「保存」** をクリック
- [ ] テストユーザーが2人表示されることを確認

### ステップ4: OAuth 2.0クライアントIDを作成
- [ ] 左側メニュー → **「APIとサービス」** → **「認証情報」** をクリック
- [ ] 上部の **「+ 認証情報を作成」** をクリック
- [ ] **「OAuth クライアント ID」** を選択
- [ ] アプリケーションの種類: **「ウェブ アプリケーション」** を選択
- [ ] 名前: `tkz-ai-tools-web-app` （任意）
- [ ] 承認済みのJavaScript生成元:
  - `https://tkz-five.vercel.app`
  - `http://localhost:3000`
- [ ] 承認済みのリダイレクトURI:
  - `https://tkz-five.vercel.app/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`
- [ ] **「作成」** をクリック
- [ ] **クライアントID** と **クライアントシークレット** をメモ（コピー）

### ステップ5: Vercel環境変数を設定
- [ ] https://vercel.com にアクセス
- [ ] プロジェクト「tkz」→ Settings → Environment Variables
- [ ] 以下の環境変数を追加:
  - `GOOGLE_CLIENT_ID`: （Google Cloud Consoleでコピーした値）
  - `GOOGLE_CLIENT_SECRET`: （Google Cloud Consoleでコピーした値）
  - `NEXTAUTH_SECRET`: （`openssl rand -base64 32`で生成）
- [ ] 各環境変数でEnvironment: Production, Preview, Development すべてにチェック

### ステップ6: Vercelで再デプロイ
- [ ] Vercel → Deployments → 最新デプロイの「…」メニュー → **「Redeploy」**
- [ ] Status: **Ready** になるまで待つ

### ステップ7: 動作確認
- [ ] https://tkz-five.vercel.app/login にアクセス
- [ ] 「Googleでログイン」ボタンをクリック
- [ ] Googleアカウントでログイン成功を確認

---

## 📚 参考ドキュメント

再開時に参照できるガイド：

1. **完全ガイド**: `docs/GOOGLE_OAUTH_MIGRATION_GUIDE.md`
   - 全ステップの詳細説明

2. **クイックガイド**: `docs/VERCEL_ENV_VARS_QUICK_SETUP.md`
   - Vercel環境変数の5分設定

3. **ドキュメント一覧**: `docs/README.md`
   - 全ドキュメントのインデックス

---

## 🔑 重要な情報（メモ欄）

### Googleアカウント情報

**TKZのGoogleアカウント**:
- メールアドレス: _____________________（確認後に記入）

**コボちゃんのGoogleアカウント**:
- メールアドレス: _____________________（確認後に記入）

### Google Cloud Console情報

- プロジェクト名: _____________________
- プロジェクトID: _____________________

### 作成予定のOAuth認証情報

- クライアントID: （作成後に記入）
- クライアントシークレット: （作成後に記入）

⚠️ **セキュリティ注意**: このファイルは`.gitignore`に追加することを推奨（機密情報を記録する場合）

---

## 📞 作業再開時の連絡

作業を再開する際は、Claudeに以下のように伝えてください：

```
Google OAuth設定の作業を再開します。
docs/GOOGLE_OAUTH_SETUP_PROGRESS.md を確認して、
続きからガイドしてください。
```

または

```
テストユーザーの追加から再開します
```

---

**作成者**: Claude Code
**最終更新**: 2025-10-21
