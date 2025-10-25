-- 通知テーブルの作成
-- Requirements: 12.6, 12.7, 12.8

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'tool_created')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('tool', 'prompt')),
  resource_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id_is_read
  ON notifications (recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id_created_at
  ON notifications (recipient_id, created_at DESC);

-- RLSポリシー
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分宛の通知のみ閲覧可能
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = recipient_id);

-- システムが通知を作成可能（actorのみが自分を送信者として通知作成可能）
CREATE POLICY "Users can create notifications as actor"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- ユーザーは自分宛の通知を更新可能（既読マークのみ）
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

-- ユーザーは自分宛の通知を削除可能
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = recipient_id);

-- 30日後に未読通知を自動削除する（バックグラウンドジョブで実行想定）
-- ※ pg_cronまたはSupabase Edge Functionsで定期実行
COMMENT ON TABLE notifications IS 'Notifications table. Unread notifications older than 30 days should be deleted by a scheduled job.';
