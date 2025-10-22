# データベーススキーマクリーンアップガイド

**作成日**: 2025-10-21
**対象**: Supabaseデータベース（PostgreSQL）
**理由**: Credentials認証からGoogle OAuth認証への移行により、一部のスキーマが不要または機能不全になっています

---

## 📋 概要

Google OAuth認証への移行により、以下の問題があります：

1. **usersテーブルのpassword_hashカラム**: 使用されていない
2. **RLSポリシー**: Supabase Auth前提のポリシー（`auth.uid()`, `auth.role()`）がNextAuth.jsでは機能しない
3. **sessionsテーブル**: NextAuth.jsがJWT戦略を使用している場合、不要な可能性

---

## 🔍 確認すべき項目

### 1. usersテーブルの状態確認

**SQL**:
```sql
-- usersテーブルの構造を確認
\d users

-- 現在のデータを確認
SELECT id, username, display_name,
       CASE WHEN password_hash IS NOT NULL THEN '(設定あり)' ELSE '(NULL)' END as password_status,
       created_at
FROM users;
```

**期待される結果**:
- password_hashカラムが存在する
- 実際のデータでは、このカラムは使用されていない（またはレガシーデータのみ）

---

### 2. Row Level Security (RLS) ポリシーの確認

**SQL**:
```sql
-- すべてのRLSポリシーを確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('users', 'ai_tools', 'prompt_history', 'sessions');
```

**問題のあるポリシー例**:
- `USING (auth.role() = 'authenticated')` - NextAuth.jsでは機能しない
- `USING (auth.uid() = user_id)` - NextAuth.jsでは機能しない

**現在の状態**: これらのポリシーはSupabase Auth専用の関数を使用しており、NextAuth.jsでは動作しません。

---

### 3. セッションテーブルの使用状況確認

**SQL**:
```sql
-- sessionsテーブルのレコード数を確認
SELECT COUNT(*) as session_count FROM sessions;

-- 最近のセッションがあるか確認
SELECT * FROM sessions ORDER BY created_at DESC LIMIT 5;
```

**判断基準**:
- レコード数が0または古いデータのみ → NextAuth.jsはJWT戦略を使用している（テーブル不要）
- 最近のレコードがある → NextAuth.jsはデータベースセッション戦略を使用している（テーブル必要）

---

## 🛠️ クリーンアップオプション

### オプションA: 最小限のクリーンアップ（推奨）

**実施内容**:
1. usersテーブルのpassword_hashカラムはそのまま保持（将来の参照用）
2. RLSポリシーを一時的に無効化（アプリケーション層でアクセス制御）
3. マイグレーションファイルに注記を追加（済み）

**実施手順**:
```sql
-- 1. RLSを無効化（一時的）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- 注意: アプリケーション層でアクセス制御を確実に実装してください
```

**メリット**:
- ✅ 最も安全（データ損失リスクなし）
- ✅ 簡単にロールバック可能
- ✅ 将来的な拡張に柔軟

**デメリット**:
- ⚠️ 不要なカラムが残る
- ⚠️ アプリケーション層でのアクセス制御が必須

---

### オプションB: 中程度のクリーンアップ

**実施内容**:
1. password_hashカラムをNULLABLEに変更（将来削除しやすく）
2. 古いRLSポリシーを削除し、新しいポリシーを作成
3. 使用されていないsessionsテーブルを削除（JWTの場合）

**実施手順**:
```sql
-- 1. password_hashカラムをNULLABLE化
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. 古いRLSポリシーを削除
DROP POLICY IF EXISTS "Allow authenticated users to read all users" ON users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON users;
-- ... 他のポリシーも同様に削除

-- 3. RLSを無効化（または新しいポリシーを作成）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;

-- 4. sessionsテーブルの削除（JWTの場合のみ）
-- 注意: NextAuth.jsの設定を確認してから実行
-- DROP TABLE IF EXISTS sessions;
```

**メリット**:
- ✅ スキーマがよりクリーン
- ✅ 将来のカラム削除が容易

**デメリット**:
- ⚠️ スキーマ変更が必要
- ⚠️ マイグレーション管理が複雑

---

### オプションC: 完全クリーンアップ（非推奨）

**実施内容**:
1. password_hashカラムを完全削除
2. すべてのRLSポリシーを削除
3. sessionsテーブルを削除

**注意**: この方法は推奨しません。データ損失やマイグレーション管理の複雑化のリスクがあります。

---

## ✅ 推奨アクション

**今すぐ実施**:
1. **オプションA（最小限のクリーンアップ）を実施**
2. RLSを一時的に無効化
3. アプリケーション層でのアクセス制御を確認

**実施するSQL**:
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

---

## 🔮 将来の対応

### 短期（1ヶ月以内）:
- アプリケーション層でのアクセス制御を徹底的にテスト
- セキュリティ監査を実施

### 中期（3ヶ月以内）:
- NextAuth.jsに適合したRLSポリシーの設計・実装を検討
- usersテーブルのスキーマ最適化（password_hashカラムの削除）

### 長期（6ヶ月以降）:
- Supabase Authへの移行検討
- マルチテナント対応の検討

---

## 📝 チェックリスト

実施前に確認:
- [ ] Supabaseデータベースのバックアップを取得
- [ ] RLSを無効化するSQLを実行
- [ ] アプリケーション層でのアクセス制御を確認
- [ ] 本番環境で動作確認
- [ ] セキュリティ監査を実施

実施後に確認:
- [ ] ログイン機能が正常に動作する
- [ ] AIツール登録・編集・削除が正常に動作する
- [ ] プロンプト生成・履歴機能が正常に動作する
- [ ] 他ユーザーのデータへの不正アクセスが防止されている

---

## 🔗 関連ドキュメント

- [ログイン機能移行アーカイブ](./archive/login-migration/README.md)
- [初期スキーママイグレーション](../supabase/migrations/20250120000001_initial_schema.sql)
- [仕様書（認証部分）](../.kiro/specs/ai-tools-sharing-sora-prompt-generator/requirements.md)

---

**作成者**: Claude Code
**最終更新**: 2025-10-21
