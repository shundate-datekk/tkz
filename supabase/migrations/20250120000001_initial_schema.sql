-- Initial database schema for AI Tools & Sora Prompt Generator
-- Created: 2025-01-20
-- Last Updated: 2025-10-21
--
-- NOTE: 現在の認証方式について
-- =====================================================================
-- このプロジェクトは当初Credentials認証（ユーザー名/パスワード）を
-- 使用する設計でしたが、ログイン問題の解決のため、
-- Google OAuth認証（NextAuth.js v5）に移行しました。
--
-- 重要な影響:
-- 1. usersテーブルのpassword_hashカラムは使用されていません
-- 2. RLSポリシーのauth.uid()とauth.role()はSupabase Auth専用の関数であり、
--    NextAuth.jsでは機能しません
-- 3. 現在のアクセス制御はアプリケーション層で実装されています
--
-- 今後の対応:
-- - RLSポリシーをNextAuth.jsに適合するように書き換えるか、
-- - RLSを無効化してアプリケーション層での制御に完全移行することを検討
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX idx_users_username ON users(username);

-- ============================================================================
-- AI Tools Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  usage_purpose TEXT NOT NULL,
  user_experience TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  usage_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_ai_tools_category ON ai_tools(category);
CREATE INDEX idx_ai_tools_rating ON ai_tools(rating);
CREATE INDEX idx_ai_tools_usage_date ON ai_tools(usage_date DESC);
CREATE INDEX idx_ai_tools_created_by ON ai_tools(created_by);
CREATE INDEX idx_ai_tools_deleted_at ON ai_tools(deleted_at) WHERE deleted_at IS NULL;

-- Create full-text search index
CREATE INDEX idx_ai_tools_search ON ai_tools
USING GIN (to_tsvector('japanese', tool_name || ' ' || usage_purpose || ' ' || user_experience));

-- ============================================================================
-- Prompt History Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS prompt_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  input_params JSONB NOT NULL,
  generated_prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_prompt_history_user_id ON prompt_history(user_id);
CREATE INDEX idx_prompt_history_created_at ON prompt_history(created_at DESC);

-- Create full-text search index for generated prompts
CREATE INDEX idx_prompt_history_search ON prompt_history
USING GIN (to_tsvector('japanese', generated_prompt));

-- Create GIN index for JSONB input_params
CREATE INDEX idx_prompt_history_input_params ON prompt_history USING GIN (input_params);

-- ============================================================================
-- Sessions Table (for NextAuth.js)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for session management
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- Trigger Functions for updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_tools_updated_at
  BEFORE UPDATE ON ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow all authenticated users to read all users
CREATE POLICY "Allow authenticated users to read all users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to update only their own data
CREATE POLICY "Allow users to update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- AI Tools table policies
-- Allow all authenticated users to read non-deleted tools
CREATE POLICY "Allow authenticated users to read ai_tools"
  ON ai_tools FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Allow authenticated users to insert tools
CREATE POLICY "Allow authenticated users to insert ai_tools"
  ON ai_tools FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Allow users to update their own tools
CREATE POLICY "Allow users to update their own ai_tools"
  ON ai_tools FOR UPDATE
  USING (auth.uid() = created_by);

-- Allow users to delete (soft delete) their own tools
CREATE POLICY "Allow users to delete their own ai_tools"
  ON ai_tools FOR UPDATE
  USING (auth.uid() = created_by);

-- Prompt History table policies
-- Allow authenticated users to read all prompt history
CREATE POLICY "Allow authenticated users to read prompt_history"
  ON prompt_history FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own prompt history
CREATE POLICY "Allow authenticated users to insert prompt_history"
  ON prompt_history FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Allow users to delete their own prompt history
CREATE POLICY "Allow users to delete their own prompt_history"
  ON prompt_history FOR DELETE
  USING (auth.uid() = user_id);

-- Sessions table policies
-- Allow authenticated users to manage their own sessions
CREATE POLICY "Allow users to read their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE users IS 'ユーザー情報を管理するテーブル';
COMMENT ON TABLE ai_tools IS 'AIツール情報を管理するテーブル';
COMMENT ON TABLE prompt_history IS 'Sora2プロンプト生成履歴を管理するテーブル';
COMMENT ON TABLE sessions IS 'NextAuth.jsセッション情報を管理するテーブル';

COMMENT ON COLUMN ai_tools.rating IS '評価（1-5の整数）';
COMMENT ON COLUMN ai_tools.deleted_at IS '論理削除フラグ（NULLの場合は有効）';
COMMENT ON COLUMN prompt_history.input_params IS 'プロンプト生成時の入力パラメータ（JSON形式）';
