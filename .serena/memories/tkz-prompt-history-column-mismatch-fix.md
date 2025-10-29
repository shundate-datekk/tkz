# TKZ プロジェクト - プロンプト履歴保存機能の修正

## 問題の概要

プロンプト履歴の保存機能が動作しない問題を発見・解決しました。

## 根本原因: データベースとTypeScriptの型定義の不一致

### データベーススキーマ (`prompt_history` テーブル)
```sql
CREATE TABLE prompt_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),     -- ← user_id
  input_params JSONB NOT NULL,                    -- ← input_params
  generated_prompt TEXT NOT NULL,                  -- ← generated_prompt
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  output_language VARCHAR(5) NOT NULL DEFAULT 'ja'
);
```

### TypeScript型定義 (修正前)
```typescript
// ❌ データベースと不一致
export interface PromptHistory {
  id: string;
  prompt_text: string;           // ← 間違い
  input_parameters: Record<string, any>;  // ← 間違い
  created_by: string;             // ← 間違い
  created_at: string;
  output_language: string;
}
```

### カラム名の対応表

| データベース (実際) | TypeScript (修正前) | 正しい名前 |
|-------------------|-------------------|-----------|
| `generated_prompt` | `prompt_text` | `generated_prompt` |
| `input_params` | `input_parameters` | `input_params` |
| `user_id` | `created_by` | `user_id` |

## 影響範囲と修正内容

### 1. スキーマ定義 (`lib/schemas/prompt.schema.ts`)

**修正内容**:
```typescript
// 修正後
export const promptHistorySchema = z.object({
  generated_prompt: z.string().min(1, "プロンプトテキストは必須です"),
  input_params: z.record(z.string(), z.any()),
  user_id: z.string().uuid("無効なユーザーIDです"),
  output_language: z.enum(["ja", "en"]).optional().default("ja"),
});

export interface PromptHistory {
  id: string;
  generated_prompt: string;  // ← 修正
  input_params: Record<string, any>;  // ← 修正
  user_id: string;  // ← 修正
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  output_language: string;
}
```

### 2. リポジトリ層 (`lib/repositories/prompt-history-repository.ts`)

**修正内容**:
```typescript
// 修正前
.insert([{
  prompt_text: input.prompt_text,
  input_parameters: input.input_parameters,
  created_by: input.created_by,
  output_language: input.output_language || "ja",
}])

// 修正後
.insert([{
  generated_prompt: input.generated_prompt,
  input_params: input.input_params,
  user_id: input.user_id,
  output_language: input.output_language || "ja",
}])
```

また、デバッグログを追加：
- `[DEBUG] Creating prompt history with user_id`
- 詳細なエラーログ（エラーコード、メッセージ、詳細）

### 3. Server Actions (`lib/actions/prompt.actions.ts`)

**修正内容**:
```typescript
// savePromptHistoryAction の呼び出し
const result = await promptHistoryService.savePromptHistory({
  generated_prompt: promptText,  // ← 修正
  input_params: inputParameters as any,  // ← 修正
  user_id: userId,  // ← 修正
  output_language: outputLanguage || inputParameters.outputLanguage || "ja",
});
```

デバッグログ追加：
- `[savePromptHistoryAction] Starting prompt history save`
- `[savePromptHistoryAction] Got userId`
- `[savePromptHistoryAction] Service result`

### 4. UIコンポーネント

#### `app/history/[id]/page.tsx`
```typescript
// 修正前 → 修正後
history.created_by → history.user_id
history.prompt_text → history.generated_prompt
history.input_parameters → history.input_params
```

#### `components/prompt/prompt-history-card.tsx`
```typescript
// 修正前 → 修正後
history.prompt_text → history.generated_prompt
history.input_parameters → history.input_params
```

#### `components/prompt/prompt-history-list.tsx`
```typescript
// 修正前 → 修正後
history.prompt_text → history.generated_prompt
history.input_parameters → history.input_params
history.created_by → history.user_id
```

## 修正したファイル一覧

1. `lib/schemas/prompt.schema.ts` - 型定義とZodスキーマ
2. `lib/repositories/prompt-history-repository.ts` - データベース操作
3. `lib/actions/prompt.actions.ts` - Server Actions
4. `app/history/[id]/page.tsx` - 履歴詳細ページ
5. `components/prompt/prompt-history-card.tsx` - 履歴カードコンポーネント
6. `components/prompt/prompt-history-list.tsx` - 履歴一覧コンポーネント

## 期待される動作 (修正後)

✅ プロンプト生成後の保存ボタンをクリック → 正常に保存  
✅ `/history` ページで履歴一覧が表示される  
✅ `/history/[id]` ページで履歴詳細が表示される  
✅ 検索機能が正常に動作  
✅ ユーザー名が正しく表示される  

## デバッグ情報

保存時のサーバーログ：
```
[savePromptHistoryAction] Starting prompt history save
[savePromptHistoryAction] Prompt text length: 450
[savePromptHistoryAction] Got userId: f0da1b2a-c5fe-4419-9e37-15b01422bbad
[DEBUG] Creating prompt history with user_id: f0da1b2a-c5fe-4419-9e37-15b01422bbad
[DEBUG] Prompt history created successfully: <history-id>
[savePromptHistoryAction] Prompt history saved successfully: <history-id>
```

## 学んだ教訓

1. **型の一貫性が重要**: データベーススキーマとTypeScript型定義を常に一致させる
2. **マイグレーション履歴を確認**: 過去のマイグレーションでカラム名が変更されている可能性がある
3. **全体的な影響範囲の確認**: スキーマ変更は複数のレイヤー（repository, service, action, UI）に影響する
4. **デバッグログの重要性**: 詳細なログがあれば問題の特定が迅速になる

## 関連する修正

このプロンプト履歴修正は、以下の認証関連修正と連携して動作します：

- **AIツール保存機能の修正** (メモリ: `tkz-authentication-architecture-issues`)
  - RLS無効化
  - usersテーブルスキーマ変更
  - NextAuth.js signInコールバック実装

これらの修正により、AIツールとプロンプト履歴の両方の保存機能が完全に動作するようになりました。
