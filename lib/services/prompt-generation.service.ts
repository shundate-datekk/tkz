import { ZodError } from "zod";
import { openaiClient } from "@/lib/clients/openai-client";
import {
  generatePromptSchema,
  type GeneratePromptInput,
} from "@/lib/schemas/prompt.schema";
import {
  type Result,
  success,
  failure,
  type AppError,
  validationError,
  openaiError,
  rateLimitError,
  serverError,
} from "@/lib/types/result";

/**
 * プロンプト生成結果
 */
export interface PromptGenerationResult {
  promptText: string;
  inputParameters: Record<string, any>;
  outputLanguage: "ja" | "en";
}

/**
 * プロンプト生成サービス
 */
class PromptGenerationService {
  /**
   * Sora2用の動画プロンプトを生成
   * @param input プロンプト生成パラメータ
   * @returns プロンプト生成結果
   */
  async generatePrompt(
    input: GeneratePromptInput
  ): Promise<Result<PromptGenerationResult, AppError>> {
    try {
      // 1. 入力のバリデーション
      const validatedInput = generatePromptSchema.parse(input);

      // 2. OpenAI APIを使用してプロンプト生成
      const promptText = await openaiClient.generateVideoPrompt({
        purpose: validatedInput.purpose,
        sceneDescription: validatedInput.sceneDescription,
        style: validatedInput.style,
        duration: validatedInput.duration,
        additionalRequirements: validatedInput.additionalRequirements,
        outputLanguage: validatedInput.outputLanguage,
      });

      // 3. 生成結果の検証
      if (!promptText || promptText.trim().length === 0) {
        return failure(
          openaiError("プロンプトの生成に失敗しました。もう一度お試しください")
        );
      }

      // 4. 成功結果を返す
      return success({
        promptText,
        inputParameters: validatedInput,
        outputLanguage: validatedInput.outputLanguage ?? "ja",
      });
    } catch (error) {
      console.error("Prompt generation error:", error);

      // Zodバリデーションエラー
      if (error instanceof ZodError) {
        return failure(validationError("入力データが不正です", error.issues));
      }

      // OpenAI APIエラー
      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as any;

        // レート制限エラー
        if (apiError.status === 429) {
          return failure(rateLimitError());
        }

        // その他のAPIエラー
        return failure(
          openaiError(
            apiError.message || "AI処理中にエラーが発生しました",
            { status: apiError.status }
          )
        );
      }

      // その他のエラー
      return failure(
        serverError(
          error instanceof Error ? error.message : "予期しないエラーが発生しました"
        )
      );
    }
  }

  /**
   * プロンプトの再生成（バリエーション生成）
   * @param originalInput 元の入力パラメータ
   * @returns 新しいプロンプト生成結果
   */
  async regeneratePrompt(
    originalInput: GeneratePromptInput
  ): Promise<Result<PromptGenerationResult, AppError>> {
    // 再生成は同じ入力で新しいプロンプトを生成
    // temperature=0.7により、異なる結果が得られる
    return this.generatePrompt(originalInput);
  }

  /**
   * 複数のバリエーションを一度に生成
   * @param originalInput 元の入力パラメータ
   * @param count 生成するバリエーション数（デフォルト: 3、最大: 5）
   * @returns バリエーション生成結果の配列
   */
  async generatePromptVariations(
    originalInput: GeneratePromptInput,
    count: number = 3
  ): Promise<Result<PromptGenerationResult[], AppError>> {
    try {
      // バリデーション
      const validatedInput = generatePromptSchema.parse(originalInput);
      
      // バリエーション数を3-5の範囲に制限
      const variationCount = Math.min(Math.max(count, 3), 5);

      // OpenAI APIを使用して複数バリエーションを生成
      const promptTexts = await openaiClient.generateVideoPromptVariations(
        {
          purpose: validatedInput.purpose,
          sceneDescription: validatedInput.sceneDescription,
          style: validatedInput.style,
          duration: validatedInput.duration,
          additionalRequirements: validatedInput.additionalRequirements,
          outputLanguage: validatedInput.outputLanguage,
        },
        variationCount
      );

      // 生成結果の検証
      if (!promptTexts || promptTexts.length === 0) {
        return failure(
          openaiError("バリエーションの生成に失敗しました。もう一度お試しください")
        );
      }

      // 各プロンプトを結果オブジェクトに変換
      const results: PromptGenerationResult[] = promptTexts.map((promptText) => ({
        promptText,
        inputParameters: validatedInput,
        outputLanguage: validatedInput.outputLanguage ?? "ja",
      }));

      return success(results);
    } catch (error) {
      console.error("Prompt variations generation error:", error);

      // Zodバリデーションエラー
      if (error instanceof ZodError) {
        return failure(validationError("入力データが不正です", error.issues));
      }

      // OpenAI APIエラー
      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as any;

        // レート制限エラー
        if (apiError.status === 429) {
          return failure(rateLimitError());
        }

        // その他のAPIエラー
        return failure(
          openaiError(
            apiError.message || "AI処理中にエラーが発生しました",
            { status: apiError.status }
          )
        );
      }

      // その他のエラー
      return failure(
        serverError(
          error instanceof Error ? error.message : "予期しないエラーが発生しました"
        )
      );
    }
  }

  /**
   * Few-shot examplesを使用した高度なプロンプト生成
   * （将来的な拡張用）
   */
  async generatePromptWithExamples(
    input: GeneratePromptInput,
    examples?: string[]
  ): Promise<Result<PromptGenerationResult, AppError>> {
    // 現時点では通常のプロンプト生成と同じ
    // 将来的にFew-shot learningを実装する場合はここに追加
    return this.generatePrompt(input);
  }
}

/**
 * プロンプト生成サービスのシングルトンインスタンス
 */
export const promptGenerationService = new PromptGenerationService();
