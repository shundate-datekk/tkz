# ドキュメント一覧

このディレクトリには、AIツール情報共有とSora2プロンプト自動生成アプリに関するドキュメントが含まれています。

---

## 🔐 Google OAuth認証への移行

### メインガイド

1. **[GOOGLE_OAUTH_MIGRATION_GUIDE.md](./GOOGLE_OAUTH_MIGRATION_GUIDE.md)** ⭐ **推奨**
   - Google Cloud ConsoleでのOAuth 2.0設定からVercelへのデプロイまでの完全ガイド
   - **最初に読むべきドキュメント**
   - 所要時間: 約20分

2. **[VERCEL_ENV_VARS_QUICK_SETUP.md](./VERCEL_ENV_VARS_QUICK_SETUP.md)** ⚡ **クイックスタート**
   - Vercel環境変数の5分設定ガイド
   - Google Cloud Console設定済みの方向け
   - 所要時間: 約5分

3. **[LOCAL_DEV_GOOGLE_OAUTH_SETUP.md](./LOCAL_DEV_GOOGLE_OAUTH_SETUP.md)**
   - ローカル開発環境（localhost:3000）でのGoogle OAuth設定
   - 開発者向け
   - 所要時間: 約5分

### テストとクリーンアップ

4. **[GOOGLE_OAUTH_TESTING_REPORT.md](./GOOGLE_OAUTH_TESTING_REPORT.md)**
   - Google OAuth認証の包括的なテストレポート
   - 確認済み項目と未完了項目のリスト
   - トラブルシューティングガイド

5. **[DATABASE_CLEANUP_GUIDE.md](./DATABASE_CLEANUP_GUIDE.md)**
   - データベーススキーマのクリーンアップガイド
   - RLSポリシーの無効化手順
   - **Google OAuth移行後に実施推奨**

---

## 📂 アーカイブ

### ログイン機能の移行履歴

- **[archive/login-migration/README.md](./archive/login-migration/README.md)**
  - Credentials認証からGoogle OAuth認証への移行の経緯
  - 5時間の試行錯誤の記録と学び

- **[archive/login-migration/LOGIN_ISSUE_ANALYSIS.md](./archive/login-migration/LOGIN_ISSUE_ANALYSIS.md)**
  - RLS問題の詳細分析

- **[archive/login-migration/LOGIN_ISSUE_RESOLUTION_LOG.md](./archive/login-migration/LOGIN_ISSUE_RESOLUTION_LOG.md)**
  - 解決試行の詳細ログ

- **[archive/login-migration/LOGIN_ISSUE_FINAL_REPORT.md](./archive/login-migration/LOGIN_ISSUE_FINAL_REPORT.md)**
  - 最終レポートとOAuth移行の推奨理由

---

## 🚀 Google OAuth移行の手順（推奨フロー）

### ステップ1: Google Cloud Console設定
📖 [GOOGLE_OAUTH_MIGRATION_GUIDE.md](./GOOGLE_OAUTH_MIGRATION_GUIDE.md) のステップ1を参照

1. Google Cloud Consoleでプロジェクトを作成
2. OAuth同意画面を設定
3. テストユーザーにTKZとコボちゃんを追加
4. OAuth 2.0クライアントIDを作成
5. リダイレクト先URIを設定:
   - `https://tkz-five.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`

### ステップ2: Vercel環境変数設定
📖 [VERCEL_ENV_VARS_QUICK_SETUP.md](./VERCEL_ENV_VARS_QUICK_SETUP.md) を参照

1. Vercelダッシュボードを開く
2. 以下の環境変数を追加:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`（`openssl rand -base64 32`で生成）
3. Vercelで再デプロイ

### ステップ3: 動作確認
📖 [GOOGLE_OAUTH_TESTING_REPORT.md](./GOOGLE_OAUTH_TESTING_REPORT.md) を参照

1. https://tkz-five.vercel.app/login にアクセス
2. Googleログインボタンをクリック
3. TKZまたはコボちゃんのGoogleアカウントでログイン
4. メイン画面にリダイレクトされることを確認

### ステップ4: データベースクリーンアップ
📖 [DATABASE_CLEANUP_GUIDE.md](./DATABASE_CLEANUP_GUIDE.md) を参照

1. Supabase SQL Editorを開く
2. RLSポリシーを無効化するSQLを実行
3. アプリケーション層でのアクセス制御を確認

### ステップ5: ローカル開発環境設定（オプション）
📖 [LOCAL_DEV_GOOGLE_OAUTH_SETUP.md](./LOCAL_DEV_GOOGLE_OAUTH_SETUP.md) を参照

1. `.env.local`にGoogle OAuth環境変数を追加
2. `npm run dev`で開発サーバーを起動
3. `http://localhost:3000/login`でテスト

---

## 📊 現在の状態

| 項目 | 状態 |
|------|------|
| コードベース | ✅ Google OAuth実装済み |
| 設計ドキュメント | ✅ 更新済み（requirements.md、design.md） |
| タスクリスト | ✅ 更新済み（tasks.md） |
| Google Cloud Console設定 | ⏳ **未完了** |
| Vercel環境変数 | ⏳ **未完了** |
| 本番環境テスト | ⏳ 未完了（環境変数設定後に実施可能） |
| データベースRLS無効化 | ⏳ 未完了 |

---

## ❓ よくある質問（FAQ）

### Q1: Google Cloud Consoleの設定がわからない
**A**: [GOOGLE_OAUTH_MIGRATION_GUIDE.md](./GOOGLE_OAUTH_MIGRATION_GUIDE.md) のステップ1に画面キャプチャ付きで詳しく説明しています。

### Q2: Vercelの環境変数設定だけ知りたい
**A**: [VERCEL_ENV_VARS_QUICK_SETUP.md](./VERCEL_ENV_VARS_QUICK_SETUP.md) をご覧ください。5分で設定できます。

### Q3: ログインエラーが発生した
**A**: [GOOGLE_OAUTH_TESTING_REPORT.md](./GOOGLE_OAUTH_TESTING_REPORT.md) の「トラブルシューティング」セクションを参照してください。

### Q4: なぜCredentials認証から移行したのか？
**A**: [archive/login-migration/README.md](./archive/login-migration/README.md) に詳しい経緯が記載されています。主な理由はパスワードハッシュ長の問題とセキュリティ・UX向上です。

### Q5: データベースのRLSポリシーは削除すべき？
**A**: 削除ではなく**無効化**を推奨します。詳細は [DATABASE_CLEANUP_GUIDE.md](./DATABASE_CLEANUP_GUIDE.md) のオプションAを参照してください。

---

## 🔗 関連リソース

### プロジェクトドキュメント
- [仕様書（requirements.md）](../.kiro/specs/ai-tools-sharing-sora-prompt-generator/requirements.md)
- [設計書（design.md）](../.kiro/specs/ai-tools-sharing-sora-prompt-generator/design.md)
- [タスクリスト（tasks.md）](../.kiro/specs/ai-tools-sharing-sora-prompt-generator/tasks.md)

### 外部リソース
- [NextAuth.js v5 公式ドキュメント](https://authjs.dev/)
- [Google OAuth 2.0 設定ガイド](https://developers.google.com/identity/protocols/oauth2)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**最終更新**: 2025-10-21
**メンテナンス**: Claude Code
