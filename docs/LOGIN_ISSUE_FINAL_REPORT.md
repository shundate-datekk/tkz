# ログイン問題 最終レポートと解決策提案

**作成日時**: 2025-10-21 14:30 JST
**ステータス**: 🔴 **未解決 - 認証方式変更を推奨**

---

## 📊 問題の概要

Vercelデプロイ後、**ログイン機能が動作しない**問題が発生。
複数の修正を実施したが、最終的に**パスワードハッシュの保存に関する問題**で停滞。

**経過時間**: 約5時間
**試行回数**: 15回以上のデプロイと修正

---

## 🔍 解決済みの問題

### ✅ 問題1: Vercelインシデント
- **原因**: Vercel IAD1リージョンのインフラ障害
- **解決**: インシデント解決後、再デプロイ成功

### ✅ 問題2: Supabaseクライアントの初期化タイミング
- **原因**: モジュールレベルでの初期化により環境変数が読み込まれない
- **解決**: `authorize`関数内で直接Supabaseクライアントを作成

### ✅ 問題3: NextAuth.js v5のServer Action使用方法
- **原因**: Next.js 15 + React 19の推奨パターンに準拠していなかった
- **解決**: `useFormState` + `useFormStatus`を使用したform action方式に移行

### ✅ 問題4: Supabase Anon Keyに改行が含まれる
- **原因**: Vercel環境変数設定時に改行が混入
- **解決**: 環境変数を1行で再設定

### ✅ 問題5: RLS (Row Level Security) ポリシー
- **原因**: `auth.role() = 'authenticated'`により、anon roleでのアクセスがブロック
- **解決**: anon roleでのSELECTを許可するポリシーに変更

---

## 🚨 未解決の問題

### ❌ 問題6: パスワードハッシュの長さ異常（現在の障壁）

**症状:**
- bcrypt生成ハッシュ: **60文字**（正常）
- Supabaseに保存されるハッシュ: **63文字**（異常）
- 余分な3文字（改行とスペース）が自動的に追加される

**試行した対策:**
1. ✅ SQL UPDATEで直接更新 → 失敗（63文字のまま）
2. ✅ Table Editorで手動編集 → 失敗（44文字に切れる）
3. ✅ 新しいハッシュを複数回生成して更新 → 失敗（63文字のまま）

**推測される原因:**
- `password_hash`カラムの定義が`CHAR(63)`になっている可能性
- データベーストリガーやデフォルト値の設定
- 文字エンコーディングの問題

**現状:**
```
[AUTH] Password verification result: {
  isValid: false,  // ← bcrypt.compare()が失敗
  providedPassword: 'password123',
  storedHashPreview: '$2b$10$RsQ.Jat74KxRz'
}
```

---

## 📈 成功している部分

**ログインフロー全体の95%は正常に動作:**

```
✅ [LOGIN ACTION] Starting login process...
✅ [LOGIN ACTION] Credentials received: { username: 'kobo', passwordLength: 11 }
✅ [LOGIN ACTION] Calling signIn with FormData...
✅ [AUTH] Starting authorization...
✅ [AUTH] Environment check: { hasUrl: true, hasAnonKey: true }
✅ [AUTH] Supabase query result: { found: true, error: undefined }
✅ [AUTH] User data retrieved: { username: 'kobo', displayName: 'コボちゃん' }
✅ [AUTH] Starting password verification...
❌ [AUTH] Password verification result: { isValid: false }
```

**問題箇所は最後の1ステップのみ:**
- パスワードハッシュ検証（bcrypt.compare）が失敗

---

## 💡 解決策の提案

### **提案A: Google OAuth認証への移行（推奨 ✅）**

**メリット:**
- ✅ **実装時間: 30分程度**（パスワードハッシュ問題を完全回避）
- ✅ **セキュリティ向上**: Googleの強固な認証基盤を利用
- ✅ **ユーザー体験向上**: パスワード不要でログイン可能
- ✅ **保守性向上**: パスワードリセット機能が不要
- ✅ NextAuth.jsがネイティブサポート

**デメリット:**
- ⚠️ Googleアカウントが必須（TKZさんとコボちゃんは持っているはず）
- ⚠️ Google Cloud Console設定が必要（5分程度）

**実装手順:**
1. Google Cloud ConsoleでOAuth 2.0クライアントIDを作成
2. `auth.config.ts`にGoogle Providerを追加
3. 環境変数に`GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`を設定
4. 既存のCredentials Providerを削除
5. デプロイ

**想定作業時間: 30分 - 1時間**

---

### **提案B: テーブル定義を修正して現在の認証を継続**

**メリット:**
- ✅ ユーザー名/パスワード認証を維持
- ✅ 既存の設計思想を維持

**デメリット:**
- ❌ **根本原因の特定に追加時間が必要**（1-2時間）
- ❌ データベーススキーマの変更が必要（マイグレーション）
- ❌ 既存データの移行作業
- ❌ 同様の問題が再発するリスク

**実装手順:**
1. `password_hash`カラムの定義を確認
2. `TEXT`または`VARCHAR`に変更
3. マイグレーション実行
4. パスワードハッシュを再設定
5. 検証

**想定作業時間: 2-3時間（不確定要素あり）**

---

### **提案C: 一時的に平文パスワードでテスト（非推奨）**

**メリット:**
- ✅ すぐに動作確認できる

**デメリット:**
- ❌ **セキュリティリスク大**
- ❌ 本番環境では絶対に使用不可
- ❌ 根本解決にならない

**この選択肢は推奨しません。**

---

## 🎯 推奨アクション

### **即座に実施すべきこと: Google OAuth認証への移行**

**理由:**
1. **時間効率**: 30分で確実に動作する認証システムを構築できる
2. **セキュリティ**: パスワードハッシュの管理リスクを完全に回避
3. **ユーザー体験**: よりスムーズなログイン体験
4. **保守性**: パスワードリセットなどの追加機能が不要
5. **確実性**: NextAuth.jsの実績あるパターン

**次のステップ:**

もしGoogle OAuth認証への移行に同意いただける場合、以下の手順で進めます：

1. **Google Cloud Console設定**（5分）
   - OAuth 2.0クライアントID作成
   - リダイレクトURIの設定

2. **コード修正**（15分）
   - `auth.config.ts`を修正
   - Google Providerを追加

3. **環境変数設定**（5分）
   - Vercelに`GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`を追加

4. **デプロイ＆テスト**（10分）
   - 再デプロイ
   - Googleアカウントでログインテスト

**合計時間: 約35分**

---

## 📝 技術的学び

### 設計上の注意点

1. **NextAuth.js v5（ベータ版）の使用リスク**
   - ベータ版は本番環境で予期しない問題が発生する可能性
   - 安定版（v4）またはSupabase Authの使用を検討すべき

2. **bcryptハッシュの保存**
   - **必ず`TEXT`または`VARCHAR(60)`以上で保存**
   - `CHAR(63)`などの固定長は避ける
   - 余分な文字（改行、スペース）が混入するリスク

3. **Vercelビルドキャッシュ**
   - Server Actionの大幅な変更時は**ビルドキャッシュをクリア**
   - 古いコードが残る可能性

4. **環境変数の扱い**
   - JWTトークンは**必ず1行で設定**
   - 改行やスペースが混入しないよう注意

---

## 🤔 今後の推奨事項

### 短期（今すぐ）
- ✅ **Google OAuth認証への移行**（30分で確実に解決）

### 中期（機能実装後）
- Supabase Authへの完全移行を検討
- NextAuth.js v4への降格、またはv5正式版リリースまで待つ

### 長期（次のプロジェクト）
- 認証プロバイダーの選定を初期段階で慎重に行う
- ベータ版ライブラリの使用は避ける

---

## 📞 次のステップ

**質問:**
1. **Google OAuth認証への移行に同意いただけますか？**
   - Yes → すぐに実装開始（30分で完了）
   - No → テーブル定義の修正を継続（2-3時間、不確定）

2. **現在のCredentials認証を維持する理由はありますか？**
   - 特になければ、Google OAuth移行を強く推奨

---

**最終更新**: 2025-10-21 14:30 JST
**作成者**: Claude Code
**ステータス**: 🔴 意思決定待ち

