-- お気に入りプロンプト機能用のテーブル作成
-- Requirement 13.7-13.8: お気に入りプロンプト管理機能

CREATE TABLE IF NOT EXISTS favorite_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_history_id UUID NOT NULL REFERENCES prompt_history(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, prompt_history_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_favorite_prompts_user_id ON favorite_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_prompts_prompt_history_id ON favorite_prompts(prompt_history_id);
CREATE INDEX IF NOT EXISTS idx_favorite_prompts_created_at ON favorite_prompts(created_at DESC);

-- RLS（Row Level Security）ポリシー設定
ALTER TABLE favorite_prompts ENABLE ROW LEVEL SECURITY;

-- 自分のお気に入りのみ閲覧可能
CREATE POLICY "Users can view own favorite prompts"
  ON favorite_prompts
  FOR SELECT
  USING (auth.uid() = user_id);

-- 自分のお気に入りのみ追加可能
CREATE POLICY "Users can add own favorite prompts"
  ON favorite_prompts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分のお気に入りのみ削除可能
CREATE POLICY "Users can delete own favorite prompts"
  ON favorite_prompts
  FOR DELETE
  USING (auth.uid() = user_id);

-- コメント追加
COMMENT ON TABLE favorite_prompts IS 'ユーザーがお気に入りに追加したプロンプト履歴';
COMMENT ON COLUMN favorite_prompts.id IS 'お気に入りID';
COMMENT ON COLUMN favorite_prompts.user_id IS 'ユーザーID（auth.users参照）';
COMMENT ON COLUMN favorite_prompts.prompt_history_id IS 'プロンプト履歴ID（prompt_history参照）';
COMMENT ON COLUMN favorite_prompts.created_at IS '追加日時';
