import OpenAI from "openai";

/**
 * OpenAI APIクライアント設定
 * APIキーから改行やスペースを除去して正規化
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY?.trim().replace(/\s+/g, ''),
});

/**
 * リトライ設定
 */
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1秒

/**
 * 指数バックオフによるリトライ処理
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // レート制限エラー（429）またはサーバーエラー（5xx）の場合はリトライ
      const shouldRetry =
        error?.status === 429 ||
        (error?.status >= 500 && error?.status < 600);

      if (!shouldRetry || i === retries - 1) {
        throw error;
      }

      // 指数バックオフ: 1秒 -> 2秒 -> 4秒
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * OpenAIクライアントのインターフェース
 */
export interface VideoPromptParams {
  purpose: string;
  sceneDescription: string;
  style?: string;
  duration?: string;
  additionalRequirements?: string;
  outputLanguage?: "ja" | "en";
}

/**
 * Chat Completions APIのパラメータ型
 */
export interface ChatCompletionParams {
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
}

/**
 * OpenAIクライアント
 */
export class OpenAIClient {
  /**
   * Chat Completions APIを呼び出す（汎用）
   * @param params Chat Completionsパラメータ
   * @returns OpenAI API レスポンス
   */
  async chat(params: ChatCompletionParams): Promise<any> {
    return withRetry(async () => {
      const completion = await openai.chat.completions.create({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.max_tokens ?? 500,
        ...(params.response_format && { response_format: params.response_format }),
      });

      return completion;
    });
  }

  /**
   * Sora2用の動画プロンプトを生成
   * @param params プロンプト生成パラメータ
   * @returns 生成されたプロンプト
   */
  async generateVideoPrompt(params: VideoPromptParams): Promise<string> {
    return withRetry(async () => {
      const outputLanguage = params.outputLanguage || "ja";
      const systemPrompt = this.buildSystemPrompt(outputLanguage);

      const userPrompt = this.buildUserPrompt(params);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const generatedPrompt = completion.choices[0]?.message?.content?.trim();

      if (!generatedPrompt) {
        throw new Error("プロンプトの生成に失敗しました");
      }

      return generatedPrompt;
    });
  }

  /**
   * 複数のバリエーションを一度に生成
   * @param params プロンプト生成パラメータ
   * @param count 生成するバリエーション数（デフォルト: 3）
   * @returns 生成されたプロンプトの配列
   */
  async generateVideoPromptVariations(
    params: VideoPromptParams,
    count: number = 3
  ): Promise<string[]> {
    return withRetry(async () => {
      const outputLanguage = params.outputLanguage || "ja";
      const systemPrompt = this.buildSystemPromptForVariations(outputLanguage, count);
      const userPrompt = this.buildUserPrompt(params);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8, // より多様性を持たせるため高めに設定
        max_tokens: 1500, // 複数生成するため増やす
      });

      const generatedContent = completion.choices[0]?.message?.content?.trim();

      if (!generatedContent) {
        throw new Error("バリエーションの生成に失敗しました");
      }

      // レスポンスを番号付きリストで分割
      const variations = this.parseVariations(generatedContent, count);

      if (variations.length === 0) {
        throw new Error("バリエーションの解析に失敗しました");
      }

      return variations;
    });
  }

  /**
   * バリエーション生成用のSystem Promptを構築
   */
  private buildSystemPromptForVariations(language: "ja" | "en", count: number): string {
    const basePrompt = `You are an expert at creating video generation prompts for Sora2 (OpenAI's video generation AI).
Based on user requirements, create ${count} different variations of effective video generation prompts.`;

    const guidelines = {
      ja: `
プロンプト作成のガイドライン:
- ${count}つの異なるバリエーションを生成してください
- 各バリエーションは具体的で詳細な視覚的描写を含める
- カメラアングル、照明、雰囲気を明確に指定
- 動きや時間の流れを記述
- 色彩やスタイルを具体的に表現
- 各プロンプトは150-300文字程度で簡潔に
- 日本語で出力すること
- 各バリエーションは異なる視点やアプローチを取ること（例：カメラアングルを変える、時間帯を変える、雰囲気を変える）

出力形式:
1. [1つ目のプロンプト]
2. [2つ目のプロンプト]
3. [3つ目のプロンプト]

番号付きリスト形式で出力し、それぞれのプロンプトは改行で区切ってください。説明文は含めず、プロンプトのみを出力してください。`,
      en: `
Prompt creation guidelines:
- Generate ${count} different variations
- Each variation should include specific and detailed visual descriptions
- Clearly specify camera angles, lighting, and atmosphere
- Describe movement and the flow of time
- Express colors and style concretely
- Keep each prompt concise at around 150-300 words
- Output in English
- Each variation should take a different perspective or approach (e.g., change camera angle, time of day, atmosphere)

Output format:
1. [First prompt]
2. [Second prompt]
3. [Third prompt]

Output in numbered list format, separating each prompt with a line break. Do not include explanatory text, output only the prompts.`,
    };

    return `${basePrompt}
${guidelines[language]}`;
  }

  /**
   * バリエーションテキストを解析して配列に分割
   */
  private parseVariations(content: string, expectedCount: number): string[] {
    // 番号付きリスト形式で分割
    const lines = content.split('\n').filter(line => line.trim());
    const variations: string[] = [];

    let currentVariation = '';
    
    for (const line of lines) {
      // 番号付きリストのパターン: "1.", "2.", "3." など
      const match = line.match(/^(\d+)[\.\)]\s*(.+)$/);
      
      if (match) {
        // 新しいバリエーションの開始
        if (currentVariation) {
          variations.push(currentVariation.trim());
        }
        currentVariation = match[2];
      } else if (currentVariation) {
        // 前のバリエーションの続き
        currentVariation += '\n' + line;
      }
    }

    // 最後のバリエーションを追加
    if (currentVariation) {
      variations.push(currentVariation.trim());
    }

    // もし期待される数に満たない場合、分割方法を変える
    if (variations.length < expectedCount) {
      // 改行で分割してみる
      const parts = content.split(/\n\n+/).filter(p => p.trim());
      if (parts.length >= expectedCount) {
        return parts.slice(0, expectedCount).map(p => p.replace(/^\d+[\.\)]\s*/, '').trim());
      }
    }

    return variations.slice(0, expectedCount);
  }

  /**
   * System Promptを構築（言語に応じて）
   */
  private buildSystemPrompt(language: "ja" | "en"): string {
    const basePrompt = `You are an expert at creating video generation prompts for Sora2 (OpenAI's video generation AI).
Based on user requirements, create an effective video generation prompt.`;

    const guidelines = {
      ja: `
プロンプト作成のガイドライン:
- 具体的で詳細な視覚的描写を含める
- カメラアングル、照明、雰囲気を明確に指定
- 動きや時間の流れを記述
- 色彩やスタイルを具体的に表現
- 150-300文字程度で簡潔に
- 日本語で出力すること

プロンプトのみを出力し、説明文は含めないでください。`,
      en: `
Prompt creation guidelines:
- Include specific and detailed visual descriptions
- Clearly specify camera angles, lighting, and atmosphere
- Describe movement and the flow of time
- Express colors and style concretely
- Keep it concise at around 150-300 words
- Output in English

Output only the prompt, do not include any explanatory text.`,
    };

    return `${basePrompt}
${guidelines[language]}`;
  }

  /**
   * ユーザープロンプトを構築
   */
  private buildUserPrompt(params: VideoPromptParams): string {
    const language = params.outputLanguage || "ja";
    const parts: string[] = [];

    if (language === "ja") {
      parts.push(`目的: ${params.purpose}`);
      parts.push(`シーン: ${params.sceneDescription}`);

      if (params.style) {
        parts.push(`スタイル: ${params.style}`);
      }

      if (params.duration) {
        parts.push(`長さ: ${params.duration}`);
      }

      if (params.additionalRequirements) {
        parts.push(`その他の要望: ${params.additionalRequirements}`);
      }

      parts.push(
        "\n上記の情報を基に、Sora2で動画を生成するための日本語プロンプトを作成してください。"
      );
    } else {
      parts.push(`Purpose: ${params.purpose}`);
      parts.push(`Scene: ${params.sceneDescription}`);

      if (params.style) {
        parts.push(`Style: ${params.style}`);
      }

      if (params.duration) {
        parts.push(`Duration: ${params.duration}`);
      }

      if (params.additionalRequirements) {
        parts.push(`Additional requirements: ${params.additionalRequirements}`);
      }

      parts.push(
        "\nBased on the information above, create an English prompt for generating a video with Sora2."
      );
    }

    return parts.join("\n");
  }

  /**
   * APIキーの存在確認
   */
  static validateApiKey(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }
}

/**
 * OpenAIクライアントのシングルトンインスタンス
 */
export const openaiClient = new OpenAIClient();
