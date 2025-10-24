<!-- Inclusion Mode: Conditional: "**/prompt*" | "**/i18n*" | "**/*localization*" -->

# 国際化（i18n）と多言語対応ガイドライン

## 目的

TKZ AIツール共有アプリにおける多言語対応（日本語・英語）の統一的な実装方針を定める。特にSora2プロンプト生成機能において、ユーザーが出力言語を選択できるようにする。

## 対象範囲

### 現時点での対応範囲（MVP）

- **Sora2プロンプト生成機能の出力言語**: 日本語/英語の選択可能
- **UIは日本語固定**: アプリケーション全体のUI表示は日本語のまま（TKZ & コボちゃんは日本語話者）

### 将来的な拡張可能性

- UIの多言語化（next-intl等の導入）
- プロンプト履歴での言語フィルタリング
- AIツール情報の多言語対応

## アーキテクチャ方針

### 1. 言語選択の実装パターン

#### フォーム入力における言語選択

```tsx
// プロンプト生成フォームの例
interface PromptGenerationInput {
  purpose: string;
  sceneDescription: string;
  style?: string;
  duration?: string;
  additionalRequirements?: string;
  outputLanguage: 'ja' | 'en'; // 必須フィールドとして追加
}

// UIコンポーネント（shadcn/ui RadioGroup推奨）
<RadioGroup defaultValue="ja" onValueChange={setLanguage}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="ja" id="lang-ja" />
    <Label htmlFor="lang-ja">日本語</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="en" id="lang-en" />
    <Label htmlFor="lang-en">English</Label>
  </div>
</RadioGroup>
```

### 2. データベーススキーマの拡張

#### prompt_historyテーブルへの追加カラム

```sql
ALTER TABLE prompt_history
ADD COLUMN output_language VARCHAR(5) DEFAULT 'ja';

-- 既存データのマイグレーション（デフォルト値: 日本語）
UPDATE prompt_history
SET output_language = 'ja'
WHERE output_language IS NULL;
```

### 3. AIプロンプト生成ロジックの実装

#### System Promptの言語対応

```typescript
// services/prompt-generation.service.ts
export class PromptGenerationService {
  private buildSystemPrompt(language: 'ja' | 'en'): string {
    const basePrompt = `You are an expert at creating video generation prompts for OpenAI Sora.`;

    const languageInstructions = {
      ja: 'Generate the prompt in Japanese. Use natural, descriptive Japanese language.',
      en: 'Generate the prompt in English. Use vivid, descriptive English language.'
    };

    return `${basePrompt}\n${languageInstructions[language]}`;
  }

  async generatePrompt(input: PromptGenerationInput): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(input.outputLanguage);

    // OpenAI API呼び出し
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: this.buildUserPrompt(input) }
      ],
      temperature: 0.7
    });

    return response.choices[0].message.content;
  }
}
```

### 4. バリデーションスキーマの更新

```typescript
// lib/validations/prompt.validation.ts
import { z } from 'zod';

export const promptGenerationSchema = z.object({
  purpose: z.string().min(1, '動画の目的を入力してください'),
  sceneDescription: z.string().min(10, 'シーンの説明は10文字以上で入力してください'),
  style: z.string().optional(),
  duration: z.string().optional(),
  additionalRequirements: z.string().optional(),
  outputLanguage: z.enum(['ja', 'en'], {
    errorMap: () => ({ message: '日本語または英語を選択してください' })
  })
});
```

## UIデザインガイドライン

### 言語選択コンポーネントの配置

**推奨**: フォームの上部、必須項目と同等の視認性

```tsx
// 良い例: フォームの冒頭で明示
<form>
  <FormField
    control={form.control}
    name="outputLanguage"
    render={({ field }) => (
      <FormItem>
        <FormLabel>プロンプトの言語</FormLabel>
        <FormControl>
          <RadioGroup
            onValueChange={field.onChange}
            defaultValue={field.value}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ja" id="lang-ja" />
              <Label htmlFor="lang-ja">日本語</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="en" id="lang-en" />
              <Label htmlFor="lang-en">English</Label>
            </div>
          </RadioGroup>
        </FormControl>
      </FormItem>
    )}
  />

  {/* その他のフォームフィールド */}
</form>
```

### アクセシビリティ要件

- `aria-label` または `<Label>` を必ず使用
- キーボードナビゲーション対応（RadioGroup標準機能）
- フォーカス時の視覚的フィードバック

## テスト戦略

### ユニットテスト

```typescript
// __tests__/services/prompt-generation.service.test.ts
describe('PromptGenerationService', () => {
  it('日本語でプロンプトを生成できる', async () => {
    const result = await service.generatePrompt({
      purpose: 'テスト動画',
      sceneDescription: 'サンプルシーン',
      outputLanguage: 'ja'
    });

    expect(result).toMatch(/日本語の文章パターン/);
  });

  it('英語でプロンプトを生成できる', async () => {
    const result = await service.generatePrompt({
      purpose: 'Test video',
      sceneDescription: 'Sample scene',
      outputLanguage: 'en'
    });

    expect(result).toMatch(/[A-Za-z\s]+/);
  });
});
```

### E2Eテスト

```typescript
// e2e/prompt-generation-language.spec.ts
test('言語選択が正しく動作する', async ({ page }) => {
  await page.goto('/prompts/new');

  // 英語を選択
  await page.click('input[value="en"]');
  await page.fill('input[name="purpose"]', 'Test video');
  await page.fill('textarea[name="sceneDescription"]', 'A beautiful sunset');
  await page.click('button[type="submit"]');

  // 英語のプロンプトが生成されることを確認
  await expect(page.locator('.generated-prompt')).toContainText(/sunset|sky|scene/i);
});
```

## データ移行戦略

### 既存プロンプト履歴の扱い

```sql
-- Phase 1: カラム追加（デフォルト値付き）
ALTER TABLE prompt_history
ADD COLUMN output_language VARCHAR(5) DEFAULT 'ja';

-- Phase 2: 既存データを日本語として扱う
UPDATE prompt_history
SET output_language = 'ja'
WHERE output_language IS NULL;

-- Phase 3: NOT NULL制約を追加
ALTER TABLE prompt_history
ALTER COLUMN output_language SET NOT NULL;
```

## パフォーマンス考慮事項

### キャッシング戦略

- **言語別のFew-shot examples**: メモリ内キャッシュ（起動時ロード）
- **System prompt**: 言語ごとに静的定義（計算コストなし）

### OpenAI API使用量

- 言語選択により生成トークン数が変動する可能性
- 英語プロンプトの方が一般的にトークン数が少ない傾向
- コスト管理: 月次使用量のモニタリング推奨

## セキュリティ考慮事項

### 入力バリデーション

```typescript
// 言語パラメータのホワイトリスト検証
const ALLOWED_LANGUAGES = ['ja', 'en'] as const;

function validateLanguage(lang: string): lang is 'ja' | 'en' {
  return ALLOWED_LANGUAGES.includes(lang as any);
}

// Server Actionでの使用例
export async function generatePromptAction(input: unknown) {
  const parsed = promptGenerationSchema.safeParse(input);

  if (!parsed.success) {
    return { error: 'Invalid input', details: parsed.error };
  }

  // 追加の検証（念のため）
  if (!validateLanguage(parsed.data.outputLanguage)) {
    return { error: 'Unsupported language' };
  }

  // プロンプト生成処理...
}
```

## ベストプラクティス

### DO（推奨）

✅ **言語コードはISO 639-1を使用**: `'ja'`, `'en'`
✅ **デフォルト値を明示**: 新規フォームは日本語デフォルト
✅ **型安全性を確保**: `'ja' | 'en'` のユニオン型
✅ **履歴に言語情報を保存**: 後からフィルタリング可能に

### DON'T（非推奨）

❌ **UIの多言語化を混同しない**: プロンプト出力言語 ≠ アプリUI言語
❌ **動的な言語追加**: 現時点では日本語・英語のみ
❌ **ユーザーごとの言語設定保存**: 都度選択でシンプルに

## 将来的な拡張ロードマップ

### Phase 2: 履歴フィルタリング

- プロンプト履歴一覧で言語フィルタを追加
- 「日本語のみ」「英語のみ」の絞り込み

### Phase 3: AI翻訳サポート

- 生成後のプロンプトを別言語に翻訳する機能
- OpenAI APIまたはGoogle Translate API利用

### Phase 4: UIの多言語化

- next-intlまたはnext-i18next導入
- アプリ全体のUI言語切り替え（必要に応じて）

## 参考資料

- **OpenAI API Documentation**: https://platform.openai.com/docs/guides/text-generation
- **Next.js Internationalization**: https://nextjs.org/docs/app/building-your-application/routing/internationalization
- **ISO 639-1 Language Codes**: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
