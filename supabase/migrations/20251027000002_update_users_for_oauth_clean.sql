-- Update users table for OAuth compatibility

ALTER TABLE users
  ALTER COLUMN username DROP NOT NULL,
  ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS image TEXT,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(50),
  ADD COLUMN IF NOT EXISTS provider_account_id VARCHAR(255);

DROP INDEX IF EXISTS idx_users_email;
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;

DROP INDEX IF EXISTS idx_users_provider_account;
CREATE UNIQUE INDEX idx_users_provider_account
  ON users(provider, provider_account_id)
  WHERE provider IS NOT NULL AND provider_account_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_email_lookup ON users(email) WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider) WHERE provider IS NOT NULL;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
DROP INDEX IF EXISTS idx_users_username;
CREATE UNIQUE INDEX idx_users_username_unique ON users(username) WHERE username IS NOT NULL;

COMMENT ON TABLE users IS 'ユーザー情報を管理するテーブル（Credentials認証とOAuth認証の両方に対応）';
COMMENT ON COLUMN users.email IS 'ユーザーのメールアドレス（OAuth認証で使用）';
COMMENT ON COLUMN users.provider IS '認証プロバイダー (google, credentials など)';
COMMENT ON COLUMN users.provider_account_id IS 'プロバイダー側のアカウントID（Google account IDなど）';
COMMENT ON COLUMN users.username IS 'ユーザー名（Credentials認証で使用、OAuthではNULL）';
COMMENT ON COLUMN users.password_hash IS 'パスワードハッシュ（Credentials認証で使用、OAuthではNULL）';
