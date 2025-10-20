import { aiToolRepository } from "@/lib/repositories/ai-tool-repository";
import {
  createAiToolSchema,
  updateAiToolSchema,
  type AITool,
  type CreateAIToolInput,
  type UpdateAIToolInput,
  type AIToolFilter,
  type AIToolSortBy,
  type SortOrder,
} from "@/lib/schemas/ai-tool.schema";
import {
  type Result,
  type AppError,
  success,
  failure,
  validationError,
  notFoundError,
  forbiddenError,
  serverError,
} from "@/lib/types/result";
import { ZodError } from "zod";

/**
 * AIツール管理サービス
 * ビジネスロジックとバリデーションを提供
 */
export class AIToolService {
  /**
   * AIツールを作成
   */
  async createTool(
    input: CreateAIToolInput,
    userId: string
  ): Promise<Result<AITool, AppError>> {
    try {
      // バリデーション
      const validated = createAiToolSchema.parse(input);

      // リポジトリで作成
      const tool = await aiToolRepository.create(validated, userId);

      if (!tool) {
        return failure(serverError("AIツールの作成に失敗しました"));
      }

      return success(tool);
    } catch (error) {
      if (error instanceof ZodError) {
        return failure(
          validationError("入力データが不正です", error.issues)
        );
      }
      console.error("Failed to create AI tool:", error);
      return failure(serverError("AIツールの作成中にエラーが発生しました"));
    }
  }

  /**
   * AIツールを取得
   */
  async getTool(id: string): Promise<Result<AITool, AppError>> {
    try {
      const tool = await aiToolRepository.findById(id);

      if (!tool) {
        return failure(notFoundError("AIツール"));
      }

      return success(tool);
    } catch (error) {
      console.error("Failed to get AI tool:", error);
      return failure(serverError("AIツールの取得中にエラーが発生しました"));
    }
  }

  /**
   * すべてのAIツールを取得
   */
  async getAllTools(
    filter?: AIToolFilter,
    sortBy?: AIToolSortBy,
    sortOrder?: SortOrder
  ): Promise<Result<AITool[], AppError>> {
    try {
      const tools = await aiToolRepository.findAll(filter, sortBy, sortOrder);
      return success(tools);
    } catch (error) {
      console.error("Failed to get all AI tools:", error);
      return failure(
        serverError("AIツール一覧の取得中にエラーが発生しました")
      );
    }
  }

  /**
   * ページネーション付きでAIツールを取得
   */
  async getToolsWithPagination(
    page: number,
    pageSize: number,
    filter?: AIToolFilter,
    sortBy?: AIToolSortBy,
    sortOrder?: SortOrder
  ): Promise<
    Result<{ tools: AITool[]; total: number; totalPages: number }, AppError>
  > {
    try {
      const result = await aiToolRepository.findWithPagination(
        page,
        pageSize,
        filter,
        sortBy,
        sortOrder
      );
      return success(result);
    } catch (error) {
      console.error("Failed to get AI tools with pagination:", error);
      return failure(
        serverError("AIツール一覧の取得中にエラーが発生しました")
      );
    }
  }

  /**
   * ユーザーのAIツールを取得
   */
  async getUserTools(userId: string): Promise<Result<AITool[], AppError>> {
    try {
      const tools = await aiToolRepository.findByUserId(userId);
      return success(tools);
    } catch (error) {
      console.error("Failed to get user's AI tools:", error);
      return failure(
        serverError("ユーザーのAIツール取得中にエラーが発生しました")
      );
    }
  }

  /**
   * AIツールを更新
   */
  async updateTool(
    id: string,
    input: UpdateAIToolInput,
    userId: string
  ): Promise<Result<AITool, AppError>> {
    try {
      // 既存のツールを取得
      const existingTool = await aiToolRepository.findById(id);

      if (!existingTool) {
        return failure(notFoundError("AIツール"));
      }

      // 権限チェック：作成者のみが更新可能
      if (existingTool.created_by !== userId) {
        return failure(
          forbiddenError("他のユーザーが作成したツールは編集できません")
        );
      }

      // バリデーション
      const validated = updateAiToolSchema.parse(input);

      // 更新
      const updatedTool = await aiToolRepository.update(id, validated);

      if (!updatedTool) {
        return failure(serverError("AIツールの更新に失敗しました"));
      }

      return success(updatedTool);
    } catch (error) {
      if (error instanceof ZodError) {
        return failure(
          validationError("入力データが不正です", error.issues)
        );
      }
      console.error("Failed to update AI tool:", error);
      return failure(serverError("AIツールの更新中にエラーが発生しました"));
    }
  }

  /**
   * AIツールを削除
   */
  async deleteTool(
    id: string,
    userId: string
  ): Promise<Result<void, AppError>> {
    try {
      // 既存のツールを取得
      const existingTool = await aiToolRepository.findById(id);

      if (!existingTool) {
        return failure(notFoundError("AIツール"));
      }

      // 権限チェック：作成者のみが削除可能
      if (existingTool.created_by !== userId) {
        return failure(
          forbiddenError("他のユーザーが作成したツールは削除できません")
        );
      }

      // 論理削除
      const deleted = await aiToolRepository.softDelete(id);

      if (!deleted) {
        return failure(serverError("AIツールの削除に失敗しました"));
      }

      return success(undefined);
    } catch (error) {
      console.error("Failed to delete AI tool:", error);
      return failure(serverError("AIツールの削除中にエラーが発生しました"));
    }
  }

  /**
   * カテゴリ別の統計を取得
   */
  async getCategoryStats(): Promise<
    Result<Record<string, number>, AppError>
  > {
    try {
      const stats = await aiToolRepository.countByCategory();
      return success(stats);
    } catch (error) {
      console.error("Failed to get category stats:", error);
      return failure(
        serverError("カテゴリ統計の取得中にエラーが発生しました")
      );
    }
  }

  /**
   * ユーザー別の統計を取得
   */
  async getUserStats(): Promise<Result<Record<string, number>, AppError>> {
    try {
      const stats = await aiToolRepository.countByUser();
      return success(stats);
    } catch (error) {
      console.error("Failed to get user stats:", error);
      return failure(
        serverError("ユーザー統計の取得中にエラーが発生しました")
      );
    }
  }
}

// シングルトンインスタンス
export const aiToolService = new AIToolService();
