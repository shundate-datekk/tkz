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
}

/**
 * OpenAIクライアント
 */
export class OpenAIClient {
  /**
   * Sora2用の動画プロンプトを生成
   * @param params プロンプト生成パラメータ
   * @returns 生成されたプロンプト
   */
  async generateVideoPrompt(params: VideoPromptParams): Promise<string> {
    return withRetry(async () => {
      const systemPrompt = `あなたはSora2（OpenAIの動画生成AI）のプロンプト作成の専門家です。
ユーザーの要望を基に、効果的な動画生成プロンプトを英語で作成してください。

プロンプト作成のガイドライン:
- 具体的で詳細な視覚的描写を含める
- カメラアングル、照明、雰囲気を明確に指定
- 動きや時間の流れを記述
- 色彩やスタイルを具体的に表現
- 150-300単語程度で簡潔に
- 英語で出力すること

プロンプトのみを出力し、説明文は含めないでください。`;

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
   * ユーザープロンプトを構築
   */
  private buildUserPrompt(params: VideoPromptParams): string {
    const parts: string[] = [];

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
      "\n上記の情報を基に、Sora2で動画を生成するための英語プロンプトを作成してください。"
    );

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
