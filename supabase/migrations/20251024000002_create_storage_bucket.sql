-- Supabase Storage バケット作成
-- バックアップファイルを保存するためのストレージバケット
-- Requirements: 10.7

-- user-backups バケットを作成（プライベート）
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-backups', 'user-backups', false)
ON CONFLICT (id) DO NOTHING;

-- RLS ポリシー: ユーザーは自分のフォルダにのみアクセス可能
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-backups'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read from their own folder"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-backups'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete from their own folder"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-backups'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

COMMENT ON POLICY "Users can upload to their own folder" ON storage.objects IS 'ユーザーは自分のフォルダにのみバックアップをアップロード可能';
COMMENT ON POLICY "Users can read from their own folder" ON storage.objects IS 'ユーザーは自分のフォルダのバックアップのみ読み取り可能';
COMMENT ON POLICY "Users can delete from their own folder" ON storage.objects IS 'ユーザーは自分のフォルダのバックアップのみ削除可能';
