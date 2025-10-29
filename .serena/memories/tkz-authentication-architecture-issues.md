# TKZ プロジェクト - 認証アーキテクチャの問題と解決策

## プロジェクト概要
- **プロジェクト名**: TKZ - AIツール情報共有 & Sora2プロンプト生成アプリ
- **技術スタック**: Next.js 15, React 19, TypeScript, Supabase, NextAuth.js v5
- **認証方式**: Google OAuth (NextAuth.js v5)

## 発見された問題

### 問題1: RLS (Row Level Security) とNextAuth.jsの非互換性 ✅
**エラーコード**: 42501  
**エラーメッセージ**: `new row violates row-level security policy for table "ai_tools"`

**原因**:
- SupabaseのRLSポリシーが `auth.uid()` と `auth.role()` を使用
- これらはSupabase Auth専用の関数
- NextAuth.jsではこれらの関数が `NULL` を返す

**解決策**: ✅ 完了（実行待ち）
- マイグレーションファイル作成済み: `supabase/migrations/20251027000001_disable_rls_for_nextauth.sql`
- RLSを無効化してアプリケーション層でアクセス制御
- Supabaseダッシュボードでの手動実行が必要

### 問題2: 外部キー制約違反 ⚠️ 現在対応中
**エラーコード**: 23503  
**エラーメッセージ**: `insert or update on table "ai_tools" violates foreign key constraint "ai_tools_created_by_fkey"`  
**エラー詳細**: `Key (created_by)=(f0da1b2a-c5fe-4419-9e37-15b01422bbad) is not present in table "users"`

**原因**:
1. Google OAuthでログイン → NextAuth.jsがセッション作成
2. セッションにGoogle account IDを保存（例: f0da1b2a-c5fe-4419-9e37-15b01422bbad）
3. `getCurrentUserId()` がこのGoogle account IDを返す
4. AIツール作成時、`ai_tools.created_by` にこのIDを設定
5. **しかし** `users` テーブルにこのIDのレコードが存在しない
6. 外部キー制約 `ai_tools_created_by_fkey` により INSERT が失敗

**データフローの断絶**:
```
Google OAuth → NextAuth.js セッション作成 → session.user.id
                      ❌ (users テーブルへの保存なし)
                                ↓
                      ai_tools.created_by = session.user.id
                                ↓
                      外部キー制約エラー (users.id が存在しない)
```

## アーキテクチャの不整合

### 設計時 vs 実装時のギャップ

**設計時の想定**:
- Credentials認証（username/password）
- `users` テーブルで直接ユーザー管理
- RLSでアクセス制御

**実装時の変更**:
- Google OAuth認証に変更（NextAuth.js v5）
- RLSが機能しない
- `users` テーブルへのユーザー作成処理なし

### 現在のスキーマの問題

**users テーブル** (`supabase/migrations/20250120000001_initial_schema.sql`):
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,      -- ❌ Google OAuthでは不要、NOT NULL制約
  display_name VARCHAR(100) NOT NULL,         -- ✅ 使用可能
  password_hash VARCHAR(255) NOT NULL,        -- ❌ Google OAuthでは不要、NOT NULL制約
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**問題点**:
- `username` と `password_hash` が NOT NULL
- Google OAuthユーザーはこれらの値を持たない
- OAuth provider情報（email, provider）を保存するカラムがない

## 解決策

### ステップ1: users テーブルのスキーマ変更 🔧

**新しいマイグレーション**: `20251027000002_update_users_for_oauth.sql`

```sql
-- 1. password_hash と username を NULLABLE に変更
ALTER TABLE users 
  ALTER COLUMN username DROP NOT NULL,
  ALTER COLUMN password_hash DROP NOT NULL;

-- 2. OAuth用のカラムを追加
ALTER TABLE users
  ADD COLUMN email VARCHAR(255),
  ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN image TEXT,
  ADD COLUMN provider VARCHAR(50),           -- 'google', 'credentials' など
  ADD COLUMN provider_account_id VARCHAR(255); -- Google account ID など

-- 3. email カラムにユニーク制約（NULLを許可）
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;

-- 4. provider + provider_account_id の複合ユニーク制約
CREATE UNIQUE INDEX idx_users_provider_account 
  ON users(provider, provider_account_id) 
  WHERE provider IS NOT NULL AND provider_account_id IS NOT NULL;
```

### ステップ2: NextAuth.js コールバック修正 🔧

**auth.config.ts** に `signIn` コールバックを追加:

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    if (account?.provider === 'google') {
      // Supabase users テーブルにユーザーを作成/更新
      const supabase = await createClient();
      
      await supabase
        .from('users')
        .upsert({
          id: user.id,  // NextAuth.jsが生成したID
          email: user.email,
          display_name: user.name || 'Anonymous',
          email_verified: profile?.email_verified || false,
          image: user.image,
          provider: 'google',
          provider_account_id: account.providerAccountId,
          username: null,
          password_hash: null,
        }, {
          onConflict: 'id'
        });
    }
    return true;
  },
  // ... 既存の jwt, session コールバック
}
```

### ステップ3: 既存データの移行（必要に応じて）

もし既にテストユーザーが `users` テーブルに存在する場合は、マイグレーション時に対応:
```sql
UPDATE users 
SET 
  username = NULL,
  password_hash = NULL 
WHERE provider = 'google';
```

## セキュリティ考慮事項

### アプリケーション層でのアクセス制御（RLS無効化後）

**Service層** (`lib/services/ai-tool.service.ts`):
- ✅ `created_by === userId` の権限チェック実装済み
- ✅ 削除・更新は作成者のみ許可

**Server Actions** (`lib/actions/*.actions.ts`):
- ✅ `getCurrentUserId()` で認証チェック
- ✅ 未認証はログインページにリダイレクト

**Repository層** (`lib/repositories/*.ts`):
- ✅ `deleted_at IS NULL` フィルタで論理削除データを除外

## 実装優先順位

1. **最優先**: Supabaseダッシュボードで RLS無効化マイグレーション実行
2. **高**: users テーブルスキーマ変更マイグレーション作成・実行
3. **高**: NextAuth.js signIn コールバック実装
4. **中**: テストして動作確認
5. **低**: ドキュメント更新

## 参考ファイル

- `auth.config.ts` - NextAuth.js設定
- `lib/auth/helpers.ts` - 認証ヘルパー関数
- `supabase/migrations/20250120000001_initial_schema.sql` - 初期スキーマ
- `lib/services/ai-tool.service.ts` - アクセス制御実装

## ログからの重要情報

**ユーザーID**: `f0da1b2a-c5fe-4419-9e37-15b01422bbad`  
**エラー発生箇所**: `ai_tools` テーブルへのINSERT  
**直接の原因**: `users` テーブルにこのIDが存在しない

## 次のアクション

1. RLSマイグレーションをSupabaseダッシュボードで実行
2. usersテーブルスキーマ変更マイグレーション作成
3. NextAuth.js signInコールバック実装
4. デプロイしてテスト
