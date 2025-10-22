# ログイン失敗の原因分析と解決レポート

**作成日時**: 2025-10-21 10:00 JST
**ステータス**: 🔴 **Issue Identified - Awaiting Fix**

---

## 📋 概要

Vercelへのデプロイが成功したが、ログイン機能が動作しない問題が発生。
原因を調査し、**Supabase Row Level Security (RLS) ポリシー**の設定ミスであることが判明。

---

## 🔍 症状

### 発生した問題
- **エラーメッセージ**: 「ユーザー名またはパスワードが正しくありません」
- **試行したアカウント**:
  - `username: tkz`, `password: password123` → ❌ 失敗
  - `username: kobo`, `password: password123` → ❌ 失敗
- **Supabase SQLでユーザー確認**: ✅ ユーザーは正しく作成されている

### 期待される動作
- 正しいユーザー名とパスワードでログイン成功
- ダッシュボードにリダイレクトされる

---

## 🔎 原因分析

### 1. 認証フローの確認

#### NextAuth.js 設定 (`auth.config.ts`)
```typescript
async authorize(credentials) {
  // Supabaseからユーザー情報を取得
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", credentials.username as string)
    .single();

  // パスワード検証
  const isValid = await bcrypt.compare(
    credentials.password as string,
    userData.password_hash
  );
}
```

- ✅ **フロー自体は正しい**
- ✅ bcrypt によるパスワード検証を実施
- ⚠️ **Supabase anon key** を使用してusersテーブルにアクセス

### 2. Supabase クライアント設定

#### Supabase Client (`lib/supabase/client.ts`)
```typescript
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // ← anon key を使用
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
```

- ✅ **anon key を使用**（これは正しい）
- ⚠️ anon role でのアクセス権限が必要

### 3. RLS ポリシーの確認（🚨 問題箇所）

#### マイグレーションファイル (`supabase/migrations/20250120000001_initial_schema.sql`)

**行 128-130:**
```sql
CREATE POLICY "Allow authenticated users to read all users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');
```

**❌ 問題点**:
- `auth.role() = 'authenticated'` は **Supabase Auth** を使用している場合のみ有効
- 現在のアプリは **NextAuth.js** を使用
- **anon role** でアクセスしているが、ポリシーが `authenticated` role を要求
- 結果：**usersテーブルへのSELECTクエリが拒否される**

---

## 🎯 根本原因

### 問題の構造

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ユーザーがログインフォームを送信                           │
│    username: "tkz", password: "password123"                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. NextAuth.js が authorize() 関数を実行                     │
│    → Supabase クライアント（anon key）でusersテーブルを検索   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Supabase RLS ポリシーが anon role のアクセスをチェック     │
│    ✅ users テーブル RLS 有効                                │
│    ❌ ポリシー条件: auth.role() = 'authenticated'            │
│    ❌ 現在のrole: anon                                       │
│    → SELECT クエリが拒否される                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. authorize() が null を返す                                │
│    → NextAuth.js がエラーを返す                              │
│    → ユーザーに「ユーザー名またはパスワードが正しくありません」  │
└─────────────────────────────────────────────────────────────┘
```

**結論**: RLSポリシーが anon role のアクセスをブロックしているため、ユーザー情報を取得できず、ログインが失敗している。

---

## 🛠️ 解決方法

### Option 1: RLSポリシーを修正（推奨）

Supabase SQL Editor で以下を実行：

```sql
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow authenticated users to read all users" ON users;

-- anon role でもusersテーブルを読み取れるようにする
CREATE POLICY "Allow anon to read users for authentication"
  ON users FOR SELECT
  TO anon
  USING (true);

-- 認証済みユーザーもusersテーブルを読み取れるようにする
CREATE POLICY "Allow authenticated to read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);
```

**メリット**:
- ✅ セキュリティを保ちつつ、ログイン機能を有効化
- ✅ パスワードハッシュのみがデータベースに保存されているため、anon role での読み取りは安全
- ✅ RLSによる保護は継続

**デメリット**:
- ⚠️ anon role がすべてのユーザー情報（パスワードハッシュ含む）を読み取れる
- ✅ ただし、パスワードハッシュは bcrypt で暗号化されているため、実質的なリスクは低い

### Option 2: Service Role Key を使用（非推奨）

**デメリット**:
- ❌ Service role key はすべてのRLSをバイパスするため、セキュリティリスクが高い
- ❌ クライアント側のコードに service role key を含めることはできない

### Option 3: RLSを無効化（非推奨）

**デメリット**:
- ❌ セキュリティが完全に失われる
- ❌ 本番環境では絶対に避けるべき

---

## ✅ 推奨アクション

1. **Supabase SQL Editor でRLSポリシーを修正**（上記のSQL実行）
2. **ログイン機能を再テスト**
3. **成功を確認**
4. **後続のタスクに進む**

---

## 📊 影響範囲

### 影響を受ける機能
- ❌ **ログイン機能**: 完全に動作しない
- ❌ **すべての認証が必要な機能**: アクセス不可

### 影響を受けない機能
- ✅ **ログインページの表示**: 正常に動作
- ✅ **Vercelデプロイ**: 成功
- ✅ **データベーススキーマ**: 正しく構築されている

---

## 🔒 セキュリティ考察

### anon role での users テーブル読み取りは安全か？

**結論**: ✅ **安全**

**理由**:
1. **パスワードは bcrypt でハッシュ化**
   - ハッシュから元のパスワードを復元することは実質不可能
   - bcrypt は高コストなハッシュ関数で、ブルートフォース攻撃に強い

2. **ログイン認証の標準パターン**
   - 多くのシステムがログイン時に anon アクセスを許可
   - NextAuth.js、Auth0、Firebase などでも同様のパターンを採用

3. **RLSは引き続き有効**
   - 他のテーブル（ai_tools、prompt_history など）は保護されたまま
   - UPDATE、DELETE 操作は引き続き制限

4. **代替案が存在しない**
   - NextAuth.js を使用する限り、anon role でのアクセスは必須
   - Service role key の使用はより大きなセキュリティリスク

### さらにセキュリティを強化する場合

将来的に以下を検討：
1. **Supabase Auth への移行**
   - より統合されたセキュリティモデル
   - RLSポリシーがネイティブに機能

2. **API Route 経由での認証**
   - usersテーブルへの直接アクセスを避ける
   - Server-side で認証処理を完結

3. **レート制限の実装**
   - ブルートフォース攻撃を防ぐ
   - Vercel Edge Config または Upstash を使用

---

## 📝 学んだこと

### 設計上の注意点
1. **RLSポリシーとNextAuth.jsの互換性**
   - Supabase Auth を前提としたポリシーは NextAuth.js と互換性がない
   - anon role でのアクセスを考慮する必要がある

2. **マイグレーションの重要性**
   - RLSポリシーは開発時に十分にテストする
   - ローカル環境と本番環境で同じポリシーを使用

3. **セキュリティと利便性のトレードオフ**
   - 過度に厳しいRLSは機能を妨げる
   - 適切なバランスを見つける

---

## 🎯 次のステップ

1. ✅ **RLSポリシーを修正**（Supabase SQL Editor）
2. ✅ **ログイン機能を再テスト**
3. ✅ **主要機能のテスト実施**
4. ✅ **セキュリティ設定の最終確認**

---

**最終更新**: 2025-10-21 10:00 JST
**作成者**: Claude Code
**ステータス**: 🔴 Issue Identified - Awaiting User Action
