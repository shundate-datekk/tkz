-- タグテーブルとツールタグ中間テーブルの作成
-- Requirements: 11.5, 11.6

-- tagsテーブル
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 大文字小文字を区別しない検索用インデックス
CREATE INDEX IF NOT EXISTS idx_tags_name_lower ON tags (LOWER(name));

-- tool_tags 中間テーブル（多対多）
CREATE TABLE IF NOT EXISTS tool_tags (
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tool_id, tag_id)
);

-- パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_tool_tags_tool_id ON tool_tags (tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_tags_tag_id ON tool_tags (tag_id);

-- RLSポリシー
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_tags ENABLE ROW LEVEL SECURITY;

-- タグは全ユーザーが閲覧可能
CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT
  USING (true);

-- 認証ユーザーはタグを作成可能
CREATE POLICY "Authenticated users can create tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- tool_tags: ツール所有者のみが自分のツールにタグを紐付け可能
CREATE POLICY "Tool owners can manage their tool tags"
  ON tool_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ai_tools
      WHERE ai_tools.id = tool_tags.tool_id
      AND ai_tools.user_id = auth.uid()
    )
  );
