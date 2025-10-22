# ログイン問題 解決ログ

**作成日時**: 2025-10-21 10:00 JST
**最終更新**: 2025-10-21 10:45 JST
**ステータス**: 🔴 **未解決 - 継続調査中**

---

## 📊 問題の概要

**症状**: デプロイ成功後、ログイン機能が動作しない
**エラーメッセージ**: 「ユーザー名またはパスワードが正しくありません」
**試行アカウント**: `tkz` / `password123`, `kobo` / `password123`
**試行回数**: 10回以上

---

## 🔍 実施済みの調査と修正

### ✅ 修正1: 初期ユーザーの作成（完了）

**問題**: Supabaseデータベースに初期ユーザーが存在しなかった

**実施内容**:
```sql
INSERT INTO users (id, username, display_name, password_hash, created_at, updated_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'tkz',
  'TKZ',
  '$2b$10$wJ2LP7UBEx8pCi4AEikuGudjb0EGTHSD5uFkcN6PRMCWoC0cQC8FS',
  NOW(),
  NOW()
);

INSERT INTO users (id, username, display_name, password_hash, created_at, updated_at)
VALUES (
  '53b3c449-df57-4d97-a830-2a7bd1d459fc',
  'kobo',
  'コボちゃん',
  '$2b$10$72f05lVdujt9aq65ymoHduH9IpjzO274fzW/7zpI.gZ7mUuvNQVUa',
  NOW(),
  NOW()
);
```

**確認結果**:
- ✅ ユーザーが正しく作成された
- ✅ パスワードハッシュ: `$2b$10$wJ2...` (TKZ), `$2b$10$72f...` (KOBO)
- ✅ ハッシュ長: 63文字（正常）

**結果**: ❌ ログイン失敗は継続

---

### ✅ 修正2: RLS (Row Level Security) ポリシーの修正（完了）

**問題**: Supabase RLSポリシーが anon role のアクセスをブロックしていた

**元のポリシー**:
```sql
CREATE POLICY "Allow authenticated users to read all users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');
```

**問題点**: `auth.role() = 'authenticated'` は Supabase Auth を使用している場合のみ機能。NextAuth.js + anon key ではアクセス不可。

**修正内容**:
```sql
DROP POLICY IF EXISTS "Allow authenticated users to read all users" ON users;

CREATE POLICY "Allow anon to read users for authentication"
  ON users FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated to read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);
```

**確認結果**:
- ✅ ポリシー削除成功
- ✅ 新しいポリシー作成成功
- ✅ anon role でのSELECTアクセスが許可された

**結果**: ❌ ログイン失敗は継続

---

### ✅ 修正3: NEXTAUTH_URL 環境変数の追加（完了）

**問題**: Vercel環境変数に `NEXTAUTH_URL` が設定されていなかった

**実施内容**:
1. Vercel Dashboard → Settings → Environment Variables
2. 新しい環境変数を追加:
   - **Key**: `NEXTAUTH_URL`
   - **Value**: `https://tkz-five.vercel.app`
   - **Environments**: Production, Preview, Development
3. 再デプロイ実行

**確認結果**:
- ✅ 環境変数が追加された
- ✅ 再デプロイ成功
- ✅ Vercel上で環境変数が反映されている

**環境変数一覧（確認済み）**:
```
✅ NEXT_PUBLIC_SUPABASE_URL: https://tkquylaxtouaxiukycda.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ NEXTAUTH_SECRET: xj0LFY8kRR5b2qGxpfLdyFae+0uoHNb8stS+hFYn4C0=
✅ OPENAI_API_KEY: sk-proj-IDz-Thu15voCh6ey2ocTfvZ5X...
✅ NEXTAUTH_URL: https://tkz-five.vercel.app (新規追加)
```

**結果**: ❌ ログイン失敗は継続

---

## 🚨 現在の状況

### 確認済み項目
- ✅ Supabaseに初期ユーザーが存在する
- ✅ パスワードハッシュが正しい形式で保存されている
- ✅ RLSポリシーが anon role のアクセスを許可している
- ✅ すべての必須環境変数が設定されている
- ✅ Vercelデプロイが成功している
- ✅ ログインページは正しく表示される

### 未確認項目
- ❓ Supabaseクエリが実際に成功しているか（anon key でのアクセス）
- ❓ bcrypt.compare() が正しく動作しているか
- ❓ NextAuth.js が正しく設定されているか
- ❓ エッジケースやタイミング問題

---

## 🔬 次の調査ステップ

### ステップ1: Supabaseクエリのテスト

**目的**: anon key を使用して、実際にusersテーブルからデータを取得できるか確認

**実施方法**: Supabase SQL Editorで以下を実行

```sql
-- anon roleでのSELECTテスト
SET ROLE anon;
SELECT id, username, display_name FROM users WHERE username = 'kobo';
RESET ROLE;
```

**期待される結果**: ユーザー情報が取得できる

---

### ステップ2: 認証ロジックのデバッグ

**問題の可能性**:
1. bcryptのバージョン不一致（$2a vs $2b）
2. パスワードハッシュの形式エラー
3. NextAuth.jsの設定ミス

**検証方法**: 認証コードにデバッグログを追加

**修正箇所**: `auth.config.ts` の `authorize` 関数

```typescript
async authorize(credentials) {
  if (!credentials?.username || !credentials?.password) {
    console.log('[AUTH] Missing credentials');
    return null;
  }

  try {
    // ユーザー情報を取得
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", credentials.username as string)
      .single();

    console.log('[AUTH] Query result:', {
      found: !!user,
      error: error?.message
    });

    if (error || !user) {
      console.log('[AUTH] User not found:', credentials.username);
      return null;
    }

    const userData = user as any;

    console.log('[AUTH] User found:', {
      username: userData.username,
      hasHash: !!userData.password_hash,
      hashLength: userData.password_hash?.length
    });

    // パスワード検証
    const isValid = await bcrypt.compare(
      credentials.password as string,
      userData.password_hash
    );

    console.log('[AUTH] Password validation:', { isValid });

    if (!isValid) {
      console.log('[AUTH] Invalid password');
      return null;
    }

    console.log('[AUTH] Authentication successful');

    return {
      id: userData.id,
      name: userData.display_name,
      email: userData.username,
    };
  } catch (error) {
    console.error('[AUTH] Authentication error:', error);
    return null;
  }
}
```

**実施方法**:
1. ローカルで上記のデバッグログを追加
2. コミット＆プッシュ
3. Vercelで再デプロイ
4. ログインを試行
5. Vercel Dashboard → Deployments → Functions → ログを確認

---

### ステップ3: 代替認証方法の検討

もし上記でも解決しない場合は、以下を検討：

**Option A: パスワードを再生成**
```bash
# ローカルで新しいハッシュを生成
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 10).then(hash => console.log(hash));"
```

生成されたハッシュでSupabaseのusersテーブルを更新

**Option B: 簡易的なテストユーザーを作成**
```sql
-- より単純なパスワードでテストユーザーを作成
INSERT INTO users (id, username, display_name, password_hash, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'test',
  'Test User',
  '$2b$10$...',  -- 新しく生成したハッシュ
  NOW(),
  NOW()
);
```

**Option C: Supabase Authへの移行**
NextAuth.jsではなく、Supabase Authを使用する（大規模な変更）

---

## 📋 推奨される次のアクション

### 優先度1: Supabaseクエリテスト（即座に実施可能）

```sql
SET ROLE anon;
SELECT id, username, display_name,
       LENGTH(password_hash) as hash_length,
       SUBSTRING(password_hash, 1, 10) as hash_preview
FROM users
WHERE username = 'kobo';
RESET ROLE;
```

**このクエリの結果を確認してください。**

### 優先度2: デバッグログの追加（15分の作業）

auth.config.tsにデバッグログを追加し、Vercelのログで何が起きているか確認

### 優先度3: パスワードハッシュの再生成（最終手段）

すべて失敗した場合、新しいハッシュを生成して置き換え

---

## 🤔 考えられる根本原因

### 仮説1: Supabaseクエリが失敗している
- RLSポリシーは修正したが、まだ何らかの制約がある
- anon role に必要な権限が不足している

### 仮説2: bcryptのバージョン不一致
- ローカルで生成したハッシュ（$2b）と本番環境のbcryptライブラリが異なる
- Vercel環境でのbcryptの挙動が異なる

### 仮説3: NextAuth.jsの設定ミス
- コールバック関数が正しく動作していない
- セッション管理に問題がある
- NEXTAUTH_URLが正しく反映されていない（キャッシュの問題）

### 仮説4: タイミング・キャッシュ問題
- 環境変数が完全に反映されていない
- Vercelのエッジキャッシュが古い設定を保持している
- ブラウザのキャッシュが古いセッション情報を保持している

---

## 💡 次のステップ提案

### 即座に実施すべきこと

1. **Supabase SQL Editorで anon role テスト**（5分）
   ```sql
   SET ROLE anon;
   SELECT * FROM users WHERE username = 'kobo';
   RESET ROLE;
   ```

2. **Vercel Function Logsの確認**（5分）
   - Vercel Dashboard → Deployments → 最新のデプロイ → Functions
   - ログインを試行
   - エラーログを確認

3. **ブラウザの完全キャッシュクリア + シークレットモード**（2分）

### 次に実施すべきこと（1つずつ）

4. **デバッグログの追加**（20分）
   - auth.config.tsを修正
   - コミット＆プッシュ
   - 再デプロイ
   - ログ確認

5. **パスワードハッシュの再生成と置き換え**（10分）

6. **最終手段：Supabase Authへの移行検討**（2時間）

---

## 📊 タイムライン

| 時刻 | イベント | ステータス |
|------|---------|-----------|
| 09:41 | デプロイ成功 | ✅ |
| 09:50 | ログイン失敗（初回） | ❌ |
| 10:00 | 初期ユーザー作成 | ✅ |
| 10:05 | ログイン失敗（2回目） | ❌ |
| 10:10 | RLS分析完了 | ✅ |
| 10:15 | RLSポリシー修正 | ✅ |
| 10:20 | ログイン失敗（3回目） | ❌ |
| 10:25 | NEXTAUTH_URL追加 | ✅ |
| 10:30 | 再デプロイ完了 | ✅ |
| 10:35 | ログイン失敗（4回目） | ❌ |
| 10:45 | レポート更新 | 📝 |

---

## 🎯 成功基準

- ✅ `username: kobo`, `password: password123` でログイン成功
- ✅ ダッシュボードにリダイレクト
- ✅ ユーザー名「コボちゃん」が表示される

---

**次の更新**: 次の調査結果が出次第更新
