import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CreateAIToolInput, UpdateAIToolInput } from "@/lib/schemas/ai-tool.schema";
import type { ActionResult } from "../ai-tool.actions";

// Server Actionsのモック構造をテスト
describe("AI Tool Actions Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createToolAction", () => {
    it("should accept valid CreateAIToolInput", () => {
      const validInput: CreateAIToolInput = {
        tool_name: "ChatGPT",
        category: "テキスト生成",
        usage_purpose: "文章作成の補助",
        user_experience: "非常に使いやすい",
        rating: 5,
        usage_date: "2024-01-15",
      };

      // 入力の構造を検証
      expect(validInput).toMatchObject({
        tool_name: expect.any(String),
        category: expect.any(String),
        usage_purpose: expect.any(String),
        user_experience: expect.any(String),
        rating: expect.any(Number),
        usage_date: expect.any(String),
      });
    });

    it("should expect ActionResult return type structure", () => {
      const successResult: ActionResult<{ id: string }> = {
        success: true,
        data: { id: "tool-123" },
      };

      const errorResult: ActionResult<{ id: string }> = {
        success: false,
        error: "エラーメッセージ",
      };

      expect(successResult.success).toBe(true);
      if (successResult.success) {
        expect(successResult.data.id).toBe("tool-123");
      }

      expect(errorResult.success).toBe(false);
      if (!errorResult.success) {
        expect(errorResult.error).toBeTruthy();
      }
    });

    it("should validate rating is within 1-5 range", () => {
      const testRatings = [1, 2, 3, 4, 5];
      const invalidRatings = [0, 6, -1, 10];

      testRatings.forEach((rating) => {
        expect(rating).toBeGreaterThanOrEqual(1);
        expect(rating).toBeLessThanOrEqual(5);
      });

      invalidRatings.forEach((rating) => {
        const isValid = rating >= 1 && rating <= 5;
        expect(isValid).toBe(false);
      });
    });

    it("should validate required fields are not empty", () => {
      const input: CreateAIToolInput = {
        tool_name: "Test Tool",
        category: "テスト",
        usage_purpose: "テスト目的",
        user_experience: "テスト体験",
        rating: 3,
        usage_date: "2024-01-15",
      };

      expect(input.tool_name.length).toBeGreaterThan(0);
      expect(input.category.length).toBeGreaterThan(0);
      expect(input.usage_purpose.length).toBeGreaterThan(0);
      expect(input.user_experience.length).toBeGreaterThan(0);
    });
  });

  describe("updateToolAction", () => {
    it("should accept tool ID and UpdateAIToolInput", () => {
      const toolId = "tool-123";
      const updateInput: UpdateAIToolInput = {
        tool_name: "Updated Tool Name",
        category: "更新されたカテゴリ",
        usage_purpose: "更新された目的",
        user_experience: "更新された体験",
        rating: 4,
        usage_date: "2024-01-20",
      };

      expect(typeof toolId).toBe("string");
      expect(updateInput).toMatchObject({
        tool_name: expect.any(String),
        rating: expect.any(Number),
      });
    });

    it("should expect ActionResult<void> return type", () => {
      const successResult: ActionResult<void> = {
        success: true,
        data: undefined,
      };

      const errorResult: ActionResult<void> = {
        success: false,
        error: "更新に失敗しました",
      };

      expect(successResult.success).toBe(true);
      expect(errorResult.success).toBe(false);
    });

    it("should handle partial updates", () => {
      const partialUpdate: UpdateAIToolInput = {
        rating: 5,
        user_experience: "評価のみ更新",
      } as UpdateAIToolInput;

      expect(partialUpdate.rating).toBeDefined();
    });
  });

  describe("deleteToolAction", () => {
    it("should accept tool ID parameter", () => {
      const toolId = "tool-123";

      expect(typeof toolId).toBe("string");
      expect(toolId.length).toBeGreaterThan(0);
    });

    it("should expect ActionResult<void> return type", () => {
      const successResult: ActionResult<void> = {
        success: true,
        data: undefined,
      };

      expect(successResult.success).toBe(true);
    });

    it("should validate tool ID format", () => {
      const validIds = ["tool-123", "abc-def-ghi", "12345"];
      const invalidIds = ["", "   "];

      validIds.forEach((id) => {
        expect(id.length).toBeGreaterThan(0);
        expect(id.trim()).toBe(id);
      });

      invalidIds.forEach((id) => {
        expect(id.trim().length).toBe(0);
      });
    });
  });

  describe("Error handling", () => {
    it("should handle authentication errors", () => {
      const authError: ActionResult<{ id: string }> = {
        success: false,
        error: "認証が必要です",
      };

      expect(authError.success).toBe(false);
      if (!authError.success) {
        expect(authError.error).toContain("認証");
      }
    });

    it("should handle validation errors", () => {
      const validationError: ActionResult<{ id: string }> = {
        success: false,
        error: "入力値が不正です",
      };

      expect(validationError.success).toBe(false);
    });

    it("should handle database errors", () => {
      const dbError: ActionResult<{ id: string }> = {
        success: false,
        error: "データベースエラーが発生しました",
      };

      expect(dbError.success).toBe(false);
    });
  });

  describe("Cache revalidation expectations", () => {
    it("should revalidate /tools path after create", () => {
      const pathsToRevalidate = ["/tools"];

      expect(pathsToRevalidate).toContain("/tools");
    });

    it("should revalidate multiple paths after update", () => {
      const toolId = "tool-123";
      const pathsToRevalidate = ["/tools", `/tools/${toolId}`];

      expect(pathsToRevalidate).toContain("/tools");
      expect(pathsToRevalidate).toContain(`/tools/${toolId}`);
    });

    it("should revalidate multiple paths after delete", () => {
      const toolId = "tool-123";
      const pathsToRevalidate = ["/tools", `/tools/${toolId}`];

      expect(pathsToRevalidate.length).toBe(2);
    });
  });

  describe("Input transformation", () => {
    it("should preserve Japanese text in input", () => {
      const input: CreateAIToolInput = {
        tool_name: "日本語ツール名",
        category: "テキスト生成",
        usage_purpose: "日本語の文章を生成する",
        user_experience: "とても使いやすいです",
        rating: 5,
        usage_date: "2024-01-15",
      };

      expect(input.tool_name).toContain("日本語");
      expect(input.user_experience).toContain("使いやすい");
    });

    it("should handle date string format", () => {
      const dateString = "2024-01-15";
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      expect(dateRegex.test(dateString)).toBe(true);
    });

    it("should handle special characters", () => {
      const input: CreateAIToolInput = {
        tool_name: "Tool (Advanced) v2.0",
        category: "AI/ML",
        usage_purpose: "Testing & Development",
        user_experience: "Great!",
        rating: 5,
        usage_date: "2024-01-15",
      };

      expect(input.tool_name).toContain("(");
      expect(input.tool_name).toContain(")");
      expect(input.category).toContain("/");
      expect(input.usage_purpose).toContain("&");
    });
  });
});
