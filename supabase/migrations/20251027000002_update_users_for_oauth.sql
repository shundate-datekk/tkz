-- Update users table for OAuth compatibility
-- Created: 2025-10-27
--
-- 背景:
-- Google OAuth (NextAuth.js v5) への移行に伴い、users テーブルのスキーマを更新
--
-- 主な変更:
-- 1. username と password_hash を NULLABLE に変更（OAuth認証では不要）
-- 2. OAuth用のカラムを追加（email, provider, provider_account_id など）
-- 3. 適切なユニーク制約を追加
--
-- ============================================================================

-- 1. NOT NULL制約を削除（OAuth認証ではusername/password不要）
ALTER TABLE users
  ALTER COLUMN username DROP NOT NULL,
  ALTER COLUMN password_hash DROP NOT NULL;

-- 2. OAuth用のカラムを追加
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS image TEXT,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(50),           -- 'google', 'credentials' など
  ADD COLUMN IF NOT EXISTS provider_account_id VARCHAR(255); -- Google account ID など

-- 3. email カラムにユニーク制約（NULLを許可）
-- 既存のインデックスがある場合は削除してから作成
DROP INDEX IF EXISTS idx_users_email;
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;

-- 4. provider + provider_account_id の複合ユニーク制約
-- 同じプロバイダーアカウントで複数のユーザーを作成できないようにする
DROP INDEX IF EXISTS idx_users_provider_account;
CREATE UNIQUE INDEX idx_users_provider_account
  ON users(provider, provider_account_id)
  WHERE provider IS NOT NULL AND provider_account_id IS NOT NULL;

-- 5. email カラムにインデックス（検索高速化）
CREATE INDEX IF NOT EXISTS idx_users_email_lookup ON users(email) WHERE email IS NOT NULL;

-- 6. provider カラムにインデックス
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider) WHERE provider IS NOT NULL;

-- 7. 既存のusername UNIQUEインデックスを部分インデックスに変更
-- （username がNULLの場合は制約をスキップ）
DROP INDEX IF EXISTS users_username_key;
DROP INDEX IF EXISTS idx_users_username;
CREATE UNIQUE INDEX idx_users_username_unique ON users(username) WHERE username IS NOT NULL;

-- 8. テーブルのコメントを更新
COMMENT ON TABLE users IS 'ユーザー情報を管理するテーブル（Credentials認証とOAuth認証の両方に対応）';
COMMENT ON COLUMN users.email IS 'ユーザーのメールアドレス（OAuth認証で使用）';
COMMENT ON COLUMN users.provider IS '認証プロバイダー (google, credentials など)';
COMMENT ON COLUMN users.provider_account_id IS 'プロバイダー側のアカウントID（Google account IDなど）';
COMMENT ON COLUMN users.username IS 'ユーザー名（Credentials認証で使用、OAuthではNULL）';
COMMENT ON COLUMN users.password_hash IS 'パスワードハッシュ（Credentials認証で使用、OAuthではNULL）';
