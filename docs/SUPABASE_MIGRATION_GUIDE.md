# Supabaseマイグレーション実行ガイド

## 🚨 重要：これらのマイグレーションを実行しないと以下の機能が動作しません

- ❌ AIツールの作成（外部キー制約エラー）
- ❌ プロンプト履歴の保存（外部キー制約エラー）
- ❌ いいね機能（テーブル未作成）
- ❌ タグ機能（テーブル未作成）

## 📋 実行するマイグレーション（順番に）

### 1️⃣ タグ機能テーブル作成
**ファイル**: `supabase/migrations/20251022000001_create_tags_tables.sql`

### 2️⃣ いいね機能テーブル作成
**ファイル**: `supabase/migrations/20251022000002_create_likes_table.sql`

### 3️⃣ NextAuth互換性修正（最重要）
**ファイル**: `supabase/migrations/20251022000003_fix_nextauth_compatibility.sql`

---

## 🔧 実行手順

### ステップ1: Supabaseダッシュボードにアクセス

1. ブラウザで [https://supabase.com/dashboard](https://supabase.com/dashboard) を開く
2. プロジェクトを選択（tkz）

### ステップ2: SQL Editorを開く

1. 左サイドバーから **SQL Editor** をクリック
2. **New query** ボタンをクリック

### ステップ3: マイグレーション1を実行

1. 以下のコマンドを実行してファイル内容をコピー：
   ```bash
   cat supabase/migrations/20251022000001_create_tags_tables.sql
   ```

2. コピーした内容をSQL Editorにペースト

3. **Run** ボタンをクリック

4. ✅ 成功メッセージを確認：
   ```
   Success. No rows returned
   ```

### ステップ4: マイグレーション2を実行

1. **New query** で新しいクエリを作成

2. 以下のコマンドを実行してファイル内容をコピー：
   ```bash
   cat supabase/migrations/20251022000002_create_likes_table.sql
   ```

3. コピーした内容をSQL Editorにペースト

4. **Run** ボタンをクリック

5. ✅ 成功メッセージを確認

### ステップ5: マイグレーション3を実行（最重要）

1. **New query** で新しいクエリを作成

2. 以下のコマンドを実行してファイル内容をコピー：
   ```bash
   cat supabase/migrations/20251022000003_fix_nextauth_compatibility.sql
   ```

3. コピーした内容をSQL Editorにペースト

4. **Run** ボタンをクリック

5. ✅ 成功メッセージを確認

---

## ✅ 動作確認

マイグレーション実行後、以下をテストしてください：

### 1. AIツール作成
1. https://tkz-five.vercel.app/tools/new にアクセス
2. フォームに入力して送信
3. ✅ 「ツールを登録しました！」と表示される
4. ✅ ツール一覧に表示される

### 2. プロンプト生成と履歴保存
1. https://tkz-five.vercel.app/prompt にアクセス
2. フォームに入力して「プロンプトを生成」
3. ✅ モーダルが開いて生成結果が表示される
4. 「履歴に保存」ボタンをクリック
5. ✅ 「プロンプトを履歴に保存しました！」と表示される
6. https://tkz-five.vercel.app/history にアクセス
7. ✅ 保存したプロンプトが表示される

### 3. いいね機能
1. ツール詳細ページでハートアイコンをクリック
2. ✅ いいね数が増える

### 4. タグ機能
1. ツール作成・編集時にタグを追加
2. ✅ タグが保存される

---

## 🔍 トラブルシューティング

### エラー: "relation already exists"
**原因**: テーブルが既に存在している
**対処**: このエラーは無視して問題ありません（マイグレーションはスキップされます）

### エラー: "syntax error"
**原因**: SQLの一部がコピーされていない
**対処**: ファイル全体を再度コピーしてペーストしてください

### エラー: "permission denied"
**原因**: データベースの権限不足
**対処**: Supabaseプロジェクトのオーナー権限で実行してください

---

## 📊 マイグレーション実行状況の確認

SQL Editorで以下を実行して、テーブルが正しく作成されているか確認：

```sql
-- テーブル一覧を確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 期待される結果:
-- - ai_tools
-- - likes
-- - prompt_history
-- - tags
-- - tool_tags
-- - users
```

---

## 🎉 完了！

すべてのマイグレーションが成功すれば、アプリケーションのすべての機能が正常に動作します。

問題が発生した場合は、エラーメッセージをお知らせください。
