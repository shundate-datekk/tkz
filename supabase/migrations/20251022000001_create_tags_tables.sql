-- タグテーブルの作成
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT tags_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 50)
);

-- ツールとタグの中間テーブル
CREATE TABLE IF NOT EXISTS tool_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_id, tag_id)
);

-- インデックス
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tool_tags_tool_id ON tool_tags(tool_id);
CREATE INDEX idx_tool_tags_tag_id ON tool_tags(tag_id);

-- RLS (Row Level Security) ポリシー

-- tagsテーブル: 全ユーザーが参照可能、作成者のみ削除可能
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Users can create tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tags" ON tags
  FOR DELETE USING (auth.uid() = created_by);

-- tool_tagsテーブル: ツールの作成者のみ操作可能
ALTER TABLE tool_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tool tags are viewable by everyone" ON tool_tags
  FOR SELECT USING (true);

CREATE POLICY "Tool owners can add tags" ON tool_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_tools
      WHERE ai_tools.id = tool_tags.tool_id
      AND ai_tools.created_by = auth.uid()
    )
  );

CREATE POLICY "Tool owners can remove tags" ON tool_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM ai_tools
      WHERE ai_tools.id = tool_tags.tool_id
      AND ai_tools.created_by = auth.uid()
    )
  );
