-- 保存済み検索テーブルの作成
-- Requirements: 11.3, 11.4

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  conditions JSONB NOT NULL, -- { keyword, operator, category, dateRange, ratingRange, tags }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_created_at ON saved_searches (created_at);

-- RLSポリシー
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の保存済み検索のみ閲覧可能
CREATE POLICY "Users can view their own saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分の保存済み検索を作成可能
CREATE POLICY "Users can create their own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の保存済み検索を更新可能
CREATE POLICY "Users can update their own saved searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

-- ユーザーは自分の保存済み検索を削除可能
CREATE POLICY "Users can delete their own saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);
