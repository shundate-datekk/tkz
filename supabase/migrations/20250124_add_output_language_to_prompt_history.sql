-- Add output_language column to prompt_history table
-- Migration: 20250124_add_output_language_to_prompt_history

-- Phase 1: Add column with default value
ALTER TABLE prompt_history
ADD COLUMN output_language VARCHAR(5) DEFAULT 'ja';

-- Phase 2: Update existing records to Japanese (default)
UPDATE prompt_history
SET output_language = 'ja'
WHERE output_language IS NULL;

-- Phase 3: Add NOT NULL constraint
ALTER TABLE prompt_history
ALTER COLUMN output_language SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN prompt_history.output_language IS 'プロンプトの出力言語 (ja: 日本語, en: 英語)';
