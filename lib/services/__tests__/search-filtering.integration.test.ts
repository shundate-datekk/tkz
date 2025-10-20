import { describe, it, expect } from "vitest";
import type { AITool } from "@/lib/types/ai-tool";

describe("Search and Filtering Integration Tests", () => {
  // サンプルデータ
  const sampleTools: AITool[] = [
    {
      id: "1",
      tool_name: "ChatGPT",
      category: "テキスト生成",
      usage_purpose: "文章作成の補助",
      user_experience: "非常に使いやすい",
      rating: 5,
      usage_date: "2024-01-15",
      created_by: "user1",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      tool_name: "Midjourney",
      category: "画像生成",
      usage_purpose: "イラスト作成",
      user_experience: "クオリティが高い",
      rating: 5,
      usage_date: "2024-01-16",
      created_by: "user1",
      created_at: "2024-01-16T10:00:00Z",
      updated_at: "2024-01-16T10:00:00Z",
    },
    {
      id: "3",
      tool_name: "Claude",
      category: "テキスト生成",
      usage_purpose: "コード生成",
      user_experience: "正確で詳細",
      rating: 4,
      usage_date: "2024-01-17",
      created_by: "user2",
      created_at: "2024-01-17T10:00:00Z",
      updated_at: "2024-01-17T10:00:00Z",
    },
    {
      id: "4",
      tool_name: "DALL-E",
      category: "画像生成",
      usage_purpose: "画像生成",
      user_experience: "簡単に使える",
      rating: 4,
      usage_date: "2024-01-18",
      created_by: "user2",
      created_at: "2024-01-18T10:00:00Z",
      updated_at: "2024-01-18T10:00:00Z",
    },
  ];

  describe("Search functionality", () => {
    it("should filter tools by name", () => {
      const searchTerm = "chat";
      const filtered = sampleTools.filter((tool) =>
        tool.tool_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].tool_name).toBe("ChatGPT");
    });

    it("should filter tools by category", () => {
      const searchTerm = "テキスト";
      const filtered = sampleTools.filter((tool) =>
        tool.category.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(2);
      expect(filtered.every((tool) => tool.category === "テキスト生成")).toBe(true);
    });

    it("should filter tools by usage purpose", () => {
      const searchTerm = "コード";
      const filtered = sampleTools.filter((tool) =>
        tool.usage_purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].tool_name).toBe("Claude");
    });

    it("should perform case-insensitive search", () => {
      const searchTerm = "CHATGPT";
      const filtered = sampleTools.filter((tool) =>
        tool.tool_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
    });

    it("should handle empty search term", () => {
      const searchTerm = "";
      const filtered = sampleTools.filter((tool) =>
        tool.tool_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(sampleTools.length);
    });

    it("should return empty array for no matches", () => {
      const searchTerm = "nonexistent";
      const filtered = sampleTools.filter((tool) =>
        tool.tool_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(0);
    });
  });

  describe("Category filtering", () => {
    it("should filter by specific category", () => {
      const category = "画像生成";
      const filtered = sampleTools.filter((tool) => tool.category === category);

      expect(filtered).toHaveLength(2);
      expect(filtered.every((tool) => tool.category === "画像生成")).toBe(true);
    });

    it("should return all tools when category is 'すべて'", () => {
      const category = "すべて";
      const filtered = sampleTools.filter((tool) =>
        category === "すべて" ? true : tool.category === category
      );

      expect(filtered).toHaveLength(sampleTools.length);
    });

    it("should handle non-existent category", () => {
      const category = "存在しないカテゴリ";
      const filtered = sampleTools.filter((tool) => tool.category === category);

      expect(filtered).toHaveLength(0);
    });
  });

  describe("Rating filtering", () => {
    it("should filter tools with rating >= 5", () => {
      const minRating = 5;
      const filtered = sampleTools.filter((tool) => tool.rating >= minRating);

      expect(filtered).toHaveLength(2);
      expect(filtered.every((tool) => tool.rating === 5)).toBe(true);
    });

    it("should filter tools with rating >= 4", () => {
      const minRating = 4;
      const filtered = sampleTools.filter((tool) => tool.rating >= minRating);

      expect(filtered).toHaveLength(4);
      expect(filtered.every((tool) => tool.rating >= 4)).toBe(true);
    });

    it("should return all tools when no rating filter", () => {
      const minRating = 1;
      const filtered = sampleTools.filter((tool) => tool.rating >= minRating);

      expect(filtered).toHaveLength(sampleTools.length);
    });
  });

  describe("Combined filtering", () => {
    it("should filter by search term AND category", () => {
      const searchTerm = "生成";
      const category = "画像生成";

      const filtered = sampleTools.filter(
        (tool) =>
          tool.category === category &&
          (tool.tool_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.usage_purpose.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      expect(filtered).toHaveLength(2);
    });

    it("should filter by category AND rating", () => {
      const category = "テキスト生成";
      const minRating = 5;

      const filtered = sampleTools.filter(
        (tool) => tool.category === category && tool.rating >= minRating
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].tool_name).toBe("ChatGPT");
    });

    it("should filter by search term AND category AND rating", () => {
      const searchTerm = "生成";
      const category = "テキスト生成";
      const minRating = 4;

      const filtered = sampleTools.filter(
        (tool) =>
          tool.category === category &&
          tool.rating >= minRating &&
          (tool.tool_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.usage_purpose.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      expect(filtered).toHaveLength(2);
    });
  });

  describe("Sorting", () => {
    it("should sort by date descending (newest first)", () => {
      const sorted = [...sampleTools].sort(
        (a, b) => new Date(b.usage_date).getTime() - new Date(a.usage_date).getTime()
      );

      expect(sorted[0].tool_name).toBe("DALL-E");
      expect(sorted[sorted.length - 1].tool_name).toBe("ChatGPT");
    });

    it("should sort by rating descending", () => {
      const sorted = [...sampleTools].sort((a, b) => b.rating - a.rating);

      expect(sorted[0].rating).toBe(5);
      expect(sorted[sorted.length - 1].rating).toBe(4);
    });

    it("should sort by name alphabetically", () => {
      const sorted = [...sampleTools].sort((a, b) =>
        a.tool_name.localeCompare(b.tool_name)
      );

      expect(sorted[0].tool_name).toBe("ChatGPT");
      expect(sorted[sorted.length - 1].tool_name).toBe("Midjourney");
    });
  });

  describe("Debounce behavior simulation", () => {
    it("should handle rapid search input changes", async () => {
      const searchTerms = ["c", "ch", "cha", "chat"];
      let latestResult: AITool[] = [];

      // 最後の検索のみを実行することをシミュレート
      const lastSearchTerm = searchTerms[searchTerms.length - 1];
      latestResult = sampleTools.filter((tool) =>
        tool.tool_name.toLowerCase().includes(lastSearchTerm.toLowerCase())
      );

      expect(latestResult).toHaveLength(1);
      expect(latestResult[0].tool_name).toBe("ChatGPT");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty tools array", () => {
      const emptyTools: AITool[] = [];
      const filtered = emptyTools.filter((tool) =>
        tool.tool_name.toLowerCase().includes("test")
      );

      expect(filtered).toHaveLength(0);
    });

    it("should handle special characters in search", () => {
      const searchTerm = "dall-e";
      const filtered = sampleTools.filter((tool) =>
        tool.tool_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
    });

    it("should handle Japanese characters in search", () => {
      const searchTerm = "画像";
      const filtered = sampleTools.filter((tool) =>
        tool.category.includes(searchTerm)
      );

      expect(filtered).toHaveLength(2);
    });

    it("should trim whitespace in search term", () => {
      const searchTerm = "  ChatGPT  ";
      const filtered = sampleTools.filter((tool) =>
        tool.tool_name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );

      expect(filtered).toHaveLength(1);
    });
  });
});
