-- Disable RLS for NextAuth.js compatibility
-- Created: 2025-10-27
--
-- 背景:
-- このプロジェクトはNextAuth.js v5（Google OAuth）を使用しています。
-- 既存のRLSポリシーはSupabase Auth用の関数（auth.uid(), auth.role()）を
-- 使用しており、NextAuth.jsでは機能しません。
--
-- アクセス制御はアプリケーション層（Service層、Repository層）で
-- 既に実装されているため、RLSを無効化します。
--
-- セキュリティ:
-- - Service層: 権限チェック（created_by === userId）
-- - Server Actions: getCurrentUserId()で認証済みユーザーのみアクセス可能
-- - Repository層: deleted_atフィルタで論理削除済みデータを除外
--
-- ============================================================================

-- Disable RLS on all main tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies
-- Users table policies
DROP POLICY IF EXISTS "Allow authenticated users to read all users" ON users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON users;

-- AI Tools table policies
DROP POLICY IF EXISTS "Allow authenticated users to read ai_tools" ON ai_tools;
DROP POLICY IF EXISTS "Allow authenticated users to insert ai_tools" ON ai_tools;
DROP POLICY IF EXISTS "Allow users to update their own ai_tools" ON ai_tools;
DROP POLICY IF EXISTS "Allow users to delete their own ai_tools" ON ai_tools;

-- Prompt History table policies
DROP POLICY IF EXISTS "Allow authenticated users to read prompt_history" ON prompt_history;
DROP POLICY IF EXISTS "Allow authenticated users to insert prompt_history" ON prompt_history;
DROP POLICY IF EXISTS "Allow users to delete their own prompt_history" ON prompt_history;

-- Sessions table policies
DROP POLICY IF EXISTS "Allow users to read their own sessions" ON sessions;
DROP POLICY IF EXISTS "Allow users to insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Allow users to update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Allow users to delete their own sessions" ON sessions;

-- Add comment for future reference
COMMENT ON TABLE ai_tools IS 'AIツール情報を管理するテーブル（アクセス制御はアプリケーション層で実装）';
COMMENT ON TABLE prompt_history IS 'Sora2プロンプト生成履歴を管理するテーブル（アクセス制御はアプリケーション層で実装）';
