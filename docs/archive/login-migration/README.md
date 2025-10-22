# ログイン機能移行のアーカイブ

**作成日**: 2025-10-21
**アーカイブ日**: 2025-10-21

## 📋 概要

このディレクトリには、Credentials認証（ユーザー名/パスワード）からGoogle OAuth認証への移行過程で作成されたドキュメントがアーカイブされています。

## 🔄 移行の経緯

### 初期実装
- **認証方式**: NextAuth.js v5 + Credentials Provider
- **データベース**: Supabase PostgreSQL
- **ユーザー管理**: usersテーブルにパスワードハッシュ（bcrypt）を保存

### 発生した問題
Vercelデプロイ後、ログイン機能が動作しない問題が発生し、約5時間にわたる調査と修正を実施。

### 解決済み問題
1. ✅ Vercel IAD1リージョンのインフラ障害
2. ✅ Supabaseクライアントの初期化タイミング
3. ✅ NextAuth.js v5のServer Action使用方法
4. ✅ Supabase Anon Keyの改行問題
5. ✅ Row Level Security (RLS) ポリシーの設定

### 最終的な障壁
- **問題**: パスワードハッシュがSupabase保存時に63文字（本来60文字）になる異常
- **影響**: bcrypt.compare()が失敗し、ログイン不可
- **試行した対策**: SQL UPDATE、手動編集、複数回の再生成 → すべて失敗

### 解決策
**Google OAuth認証への移行**（2025-10-21実施）
- 実装時間: 約30分
- セキュリティ向上、ユーザー体験改善、保守性向上を実現
- パスワードハッシュ問題を完全回避

## 📂 アーカイブファイル

### 1. LOGIN_ISSUE_ANALYSIS.md（265行）
- RLS（Row Level Security）ポリシー問題の詳細分析
- anon roleとauthenticated roleの動作説明
- セキュリティ考察

### 2. LOGIN_ISSUE_RESOLUTION_LOG.md（379行）
- 実施した修正と調査のタイムライン
- 各修正内容の詳細ログ
- 次の調査ステップ提案

### 3. LOGIN_ISSUE_FINAL_REPORT.md（244行）
- 解決済み問題の一覧
- 未解決問題（パスワードハッシュ）の詳細
- Google OAuth移行の提案と実装手順

## 💡 技術的な学び

### 1. NextAuth.js v5（ベータ版）の使用リスク
- ベータ版は本番環境で予期しない問題が発生する可能性
- 安定版または実績のある認証サービスの使用を推奨

### 2. bcryptハッシュの保存
- **必ず`TEXT`または`VARCHAR(60)`以上で保存**
- `CHAR(63)`などの固定長カラムは避ける
- 余分な文字（改行、スペース）混入のリスク

### 3. Supabase RLSとNextAuth.jsの互換性
- Supabase Auth前提のRLSポリシーはNextAuth.jsと非互換
- anon roleでのアクセスを考慮したポリシー設計が必要

### 4. 環境変数の扱い
- JWTトークン、APIキーは**必ず1行で設定**
- Vercel設定時の改行混入に注意

### 5. 問題解決のアプローチ
- 複雑な問題に対して、代替手段への切り替え判断も重要
- 時間効率と確実性のバランスを考慮

## 🎯 今後の参考ポイント

### いつこのアーカイブを参照すべきか

1. **NextAuth.js + Supabaseの組み合わせを検討する場合**
   - RLSポリシーの設計に注意
   - Credentials認証の落とし穴を理解

2. **ログイン機能が動作しない問題に遭遇した場合**
   - 環境変数、RLS、パスワードハッシュのチェックリストとして活用
   - デバッグログの追加方法を参考に

3. **認証方式の移行を検討する場合**
   - 移行判断の基準として参考
   - 実装時間と確実性のトレードオフ評価

4. **新規プロジェクトでの認証設計**
   - 避けるべきパターンを学ぶ
   - 初期段階での認証プロバイダー選定の重要性

## 📊 統計情報

- **調査・修正時間**: 約5時間
- **デプロイ試行回数**: 15回以上
- **解決した問題**: 5件
- **最終的な障壁**: 1件（パスワードハッシュ保存問題）
- **移行実装時間**: 約30分

## 🔗 関連リンク

- [NextAuth.js v5 Documentation](https://next-auth.js.org/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [bcrypt - npm](https://www.npmjs.com/package/bcryptjs)

## 📝 メタデータ

- **プロジェクト**: AIツール情報共有とSora2プロンプト自動生成アプリ
- **対象ユーザー**: TKZ、コボちゃん
- **技術スタック**: Next.js 15, NextAuth.js v5, Supabase, Vercel
- **問題発生日**: 2025-10-21
- **解決日**: 2025-10-21
- **アーカイブ理由**: Google OAuth認証への移行により、Credentials認証が不要に

---

**注意**: このアーカイブは学習・参考目的で保持しています。現在のプロジェクトではGoogle OAuth認証を使用しており、これらのドキュメントで扱われているCredentials認証は使用していません。
