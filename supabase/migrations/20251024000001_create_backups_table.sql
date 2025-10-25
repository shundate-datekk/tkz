-- backups テーブル作成
-- Requirements: 10.6, 10.7, 10.8

CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL, -- Supabase Storage URL
  file_size BIGINT NOT NULL, -- bytes
  tool_count INTEGER NOT NULL,
  prompt_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_backups_user_id ON backups (user_id);
CREATE INDEX idx_backups_created_at ON backups (created_at);

-- Row Level Security (RLS) 有効化
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のバックアップのみ閲覧可能
CREATE POLICY "Users can view their own backups"
  ON backups FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分のバックアップを作成可能
CREATE POLICY "Users can create their own backups"
  ON backups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のバックアップを削除可能
CREATE POLICY "Users can delete their own backups"
  ON backups FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE backups IS 'データバックアップのメタデータを保存するテーブル';
COMMENT ON COLUMN backups.storage_url IS 'Supabase Storageのファイル URL';
COMMENT ON COLUMN backups.file_size IS 'バックアップファイルのサイズ（バイト）';
COMMENT ON COLUMN backups.tool_count IS 'バックアップに含まれるツールの数';
COMMENT ON COLUMN backups.prompt_count IS 'バックアップに含まれるプロンプト履歴の数';
