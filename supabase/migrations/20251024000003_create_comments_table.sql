-- コメントテーブルの作成
-- Requirements: 12.1, 12.2

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_comments_tool_id ON comments (tool_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments (created_at DESC);

-- RLSポリシー
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがコメントを閲覧可能（削除されていないツールのみ）
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_tools
      WHERE ai_tools.id = comments.tool_id
      AND ai_tools.deleted_at IS NULL
    )
  );

-- ユーザーは自分のコメントを投稿可能
CREATE POLICY "Users can create their own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のコメントを更新可能
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- ユーザーは自分のコメントを削除可能
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- 更新時刻を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
