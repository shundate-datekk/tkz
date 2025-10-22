-- Fix schema for NextAuth.js compatibility
-- Created: 2025-10-22
--
-- Problem:
-- - ai_tools.created_by and prompt_history.user_id have FK constraints to users table
-- - NextAuth.js doesn't create records in users table (uses JWT sessions)
-- - RLS policies use auth.uid() which doesn't work with NextAuth.js
--
-- Solution:
-- - Drop FK constraints on created_by and user_id
-- - Disable RLS on ai_tools and prompt_history
-- - Keep data validation at application layer

-- ============================================================================
-- Drop Foreign Key Constraints
-- ============================================================================

-- Drop FK constraint on ai_tools.created_by
ALTER TABLE ai_tools
  DROP CONSTRAINT IF EXISTS ai_tools_created_by_fkey;

-- Drop FK constraint on prompt_history.user_id
ALTER TABLE prompt_history
  DROP CONSTRAINT IF EXISTS prompt_history_user_id_fkey;

-- ============================================================================
-- Fix Column Names for Application Code Compatibility
-- ============================================================================
-- The application code uses different column names than the database schema
-- This ensures consistency between database and application layer

-- Rename prompt_history columns to match application code
DO $$
BEGIN
  -- Only rename if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='prompt_history' AND column_name='input_params') THEN
    ALTER TABLE prompt_history RENAME COLUMN input_params TO input_parameters;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='prompt_history' AND column_name='generated_prompt') THEN
    ALTER TABLE prompt_history RENAME COLUMN generated_prompt TO prompt_text;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='prompt_history' AND column_name='user_id') THEN
    ALTER TABLE prompt_history RENAME COLUMN user_id TO created_by;
  END IF;

  -- Add missing columns for soft delete and update tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='prompt_history' AND column_name='updated_at') THEN
    ALTER TABLE prompt_history ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='prompt_history' AND column_name='deleted_at') THEN
    ALTER TABLE prompt_history ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
  END IF;
END $$;

-- Create trigger for automatic updated_at updates on prompt_history
DROP TRIGGER IF EXISTS update_prompt_history_updated_at ON prompt_history;
CREATE TRIGGER update_prompt_history_updated_at
  BEFORE UPDATE ON prompt_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Disable Row Level Security (RLS)
-- ============================================================================
-- RLS policies use auth.uid() and auth.role() which are Supabase Auth specific
-- NextAuth.js uses JWT sessions, so these functions don't work
-- Access control is now handled at the application layer

ALTER TABLE ai_tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to read ai_tools" ON ai_tools;
DROP POLICY IF EXISTS "Allow authenticated users to insert ai_tools" ON ai_tools;
DROP POLICY IF EXISTS "Allow users to update their own ai_tools" ON ai_tools;
DROP POLICY IF EXISTS "Allow users to delete their own ai_tools" ON ai_tools;

DROP POLICY IF EXISTS "Allow authenticated users to read prompt_history" ON prompt_history;
DROP POLICY IF EXISTS "Allow authenticated users to insert prompt_history" ON prompt_history;
DROP POLICY IF EXISTS "Allow users to delete their own prompt_history" ON prompt_history;

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE ai_tools IS 'AIツール情報を管理するテーブル - RLS無効、アプリケーション層で認可制御';
COMMENT ON TABLE prompt_history IS 'Sora2プロンプト生成履歴を管理するテーブル - RLS無効、アプリケーション層で認可制御';
COMMENT ON COLUMN ai_tools.created_by IS 'Google OAuth user ID (NextAuth.js session.user.id) - FK制約なし';
COMMENT ON COLUMN prompt_history.user_id IS 'Google OAuth user ID (NextAuth.js session.user.id) - FK制約なし';
