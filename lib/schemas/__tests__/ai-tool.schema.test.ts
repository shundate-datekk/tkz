import { describe, it, expect } from "vitest";
import { createAiToolSchema, updateAiToolSchema, TOOL_CATEGORIES } from "../ai-tool.schema";

describe("AI Tool Schema", () => {
  describe("createAiToolSchema", () => {
    it("should validate valid tool data", () => {
      const validData = {
        tool_name: "ChatGPT",
        category: "テキスト生成",
        usage_purpose: "文章作成の補助",
        user_experience: "非常に使いやすい",
        rating: 5,
        usage_date: "2024-01-15",
      };

      const result = createAiToolSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        tool_name: "ChatGPT",
        // category is missing
        usage_purpose: "文章作成の補助",
        user_experience: "非常に使いやすい",
        rating: 5,
        usage_date: "2024-01-15",
      };

      const result = createAiToolSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject rating outside 1-5 range", () => {
      const invalidData = {
        tool_name: "ChatGPT",
        category: "テキスト生成",
        usage_purpose: "文章作成の補助",
        user_experience: "非常に使いやすい",
        rating: 6, // Invalid rating
        usage_date: "2024-01-15",
      };

      const result = createAiToolSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should accept any string category", () => {
      const validData = {
        tool_name: "ChatGPT",
        category: "カスタムカテゴリ",
        usage_purpose: "文章作成の補助",
        user_experience: "非常に使いやすい",
        rating: 5,
        usage_date: "2024-01-15",
      };

      const result = createAiToolSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("should reject empty strings", () => {
      const invalidData = {
        tool_name: "", // Empty string
        category: "テキスト生成",
        usage_purpose: "文章作成の補助",
        user_experience: "非常に使いやすい",
        rating: 5,
        usage_date: "2024-01-15",
      };

      const result = createAiToolSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe("updateAiToolSchema", () => {
    it("should validate valid update data", () => {
      const validData = {
        tool_name: "ChatGPT",
        category: "テキスト生成",
        usage_purpose: "Updated purpose",
        user_experience: "Updated experience",
        rating: 4,
        usage_date: "2024-01-20",
      };

      const result = updateAiToolSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe("TOOL_CATEGORIES", () => {
    it("should have expected categories", () => {
      expect(TOOL_CATEGORIES).toContain("テキスト生成");
      expect(TOOL_CATEGORIES).toContain("画像生成");
      expect(TOOL_CATEGORIES).toContain("動画生成");
      expect(TOOL_CATEGORIES).toContain("音声生成");
      expect(TOOL_CATEGORIES).toContain("コード生成");
      expect(TOOL_CATEGORIES).toContain("その他");
    });

    it("should have exactly 10 categories", () => {
      expect(TOOL_CATEGORIES).toHaveLength(10);
    });
  });
});
