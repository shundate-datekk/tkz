import { ZodError } from "zod";
import { promptHistoryRepository } from "@/lib/repositories/prompt-history-repository";
import {
  promptHistorySchema,
  type PromptHistory,
  type CreatePromptHistoryInput,
} from "@/lib/schemas/prompt.schema";
import {
  type Result,
  success,
  failure,
  type AppError,
  validationError,
  notFoundError,
  serverError,
} from "@/lib/types/result";

/**
 * プロンプト履歴サービス
 */
class PromptHistoryService {
  /**
   * プロンプト履歴を保存
   */
  async savePromptHistory(
    input: CreatePromptHistoryInput
  ): Promise<Result<PromptHistory, AppError>> {
    try {
      // バリデーション
      const validatedInput = promptHistorySchema.parse(input);

      // リポジトリで保存
      const promptHistory = await promptHistoryRepository.create(validatedInput);

      if (!promptHistory) {
        return failure(serverError("プロンプト履歴の保存に失敗しました"));
      }

      return success(promptHistory);
    } catch (error) {
      console.error("Save prompt history error:", error);

      if (error instanceof ZodError) {
        return failure(validationError("入力データが不正です", error.issues));
      }

      return failure(
        serverError(
          error instanceof Error ? error.message : "予期しないエラーが発生しました"
        )
      );
    }
  }

  /**
   * プロンプト履歴を取得
   */
  async getPromptHistory(id: string): Promise<Result<PromptHistory, AppError>> {
    try {
      const promptHistory = await promptHistoryRepository.findById(id);

      if (!promptHistory) {
        return failure(notFoundError("プロンプト履歴"));
      }

      return success(promptHistory);
    } catch (error) {
      console.error("Get prompt history error:", error);
      return failure(
        serverError(
          error instanceof Error ? error.message : "予期しないエラーが発生しました"
        )
      );
    }
  }

  /**
   * ユーザーのプロンプト履歴一覧を取得
   */
  async getUserPromptHistories(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: "created_at" | "updated_at";
      order?: "asc" | "desc";
    }
  ): Promise<Result<PromptHistory[], AppError>> {
    try {
      const histories = await promptHistoryRepository.findByUserId(
        userId,
        options
      );
      return success(histories);
    } catch (error) {
      console.error("Get user prompt histories error:", error);
      return failure(
        serverError(
          error instanceof Error ? error.message : "予期しないエラーが発生しました"
        )
      );
    }
  }

  /**
   * 全てのプロンプト履歴を取得
   */
  async getAllPromptHistories(options?: {
    limit?: number;
    offset?: number;
    orderBy?: "created_at" | "updated_at";
    order?: "asc" | "desc";
  }): Promise<Result<PromptHistory[], AppError>> {
    try {
      const histories = await promptHistoryRepository.findAll(options);
      return success(histories);
    } catch (error) {
      console.error("Get all prompt histories error:", error);
      return failure(
        serverError(
          error instanceof Error ? error.message : "予期しないエラーが発生しました"
        )
      );
    }
  }

  /**
   * プロンプト履歴を検索
   */
  async searchPromptHistories(
    keyword: string,
    options?: {
      userId?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<PromptHistory[], AppError>> {
    try {
      const histories = await promptHistoryRepository.search(keyword, options);
      return success(histories);
    } catch (error) {
      console.error("Search prompt histories error:", error);
      return failure(
        serverError(
          error instanceof Error ? error.message : "予期しないエラーが発生しました"
        )
      );
    }
  }

  /**
   * プロンプト履歴を削除
   */
  async deletePromptHistory(id: string): Promise<Result<boolean, AppError>> {
    try {
      const result = await promptHistoryRepository.delete(id);

      if (!result) {
        return failure(serverError("プロンプト履歴の削除に失敗しました"));
      }

      return success(true);
    } catch (error) {
      console.error("Delete prompt history error:", error);
      return failure(
        serverError(
          error instanceof Error ? error.message : "予期しないエラーが発生しました"
        )
      );
    }
  }

  /**
   * ユーザーのプロンプト履歴数を取得
   */
  async getUserPromptHistoryCount(userId: string): Promise<number> {
    try {
      return await promptHistoryRepository.countByUserId(userId);
    } catch (error) {
      console.error("Get user prompt history count error:", error);
      return 0;
    }
  }
}

/**
 * プロンプト履歴サービスのシングルトンインスタンス
 */
export const promptHistoryService = new PromptHistoryService();
