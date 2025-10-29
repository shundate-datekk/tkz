import { describe, it, expect, beforeEach, vi } from "vitest";
import { FavoritePromptRepository } from "@/lib/repositories/favorite-prompt.repository";
import { createClient } from "@/lib/supabase/server";
import type {
  FavoritePrompt,
  AddFavoritePromptInput,
} from "@/lib/types/favorite-prompt.types";

// Supabaseクライアントのモック
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("FavoritePromptRepository", () => {
  let repository: FavoritePromptRepository;
  let mockSupabaseClient: any;

  const mockUserId = "user-123";
  const mockPromptHistoryId = "prompt-456";

  const mockFavoritePrompt: FavoritePrompt = {
    id: "fav-789",
    user_id: mockUserId,
    prompt_history_id: mockPromptHistoryId,
    created_at: "2025-10-28T00:00:00Z",
  };

  const mockFavoritePromptWithHistory = {
    ...mockFavoritePrompt,
    prompt_history: {
      id: mockPromptHistoryId,
      user_id: mockUserId,
      scene_description: "テストシーン",
      style: "cinematic",
      duration: "short",
      output_language: "ja",
      generated_prompt: "テストプロンプト",
      additional_requirements: null,
      created_at: "2025-10-28T00:00:00Z",
    },
  };

  beforeEach(() => {
    // Supabaseクライアントのモックをリセット
    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    (createClient as any).mockResolvedValue(mockSupabaseClient);

    repository = new FavoritePromptRepository();
  });

  describe("add", () => {
    it("should successfully add a favorite prompt", async () => {
      const input: AddFavoritePromptInput = {
        user_id: mockUserId,
        prompt_history_id: mockPromptHistoryId,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockFavoritePrompt,
        error: null,
      });

      const result = await repository.add(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockFavoritePrompt);
      }
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("favorite_prompts");
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(input);
    });

    it("should return error when add fails", async () => {
      const input: AddFavoritePromptInput = {
        user_id: mockUserId,
        prompt_history_id: mockPromptHistoryId,
      };

      const mockError = { message: "Duplicate entry" };
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await repository.add(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Duplicate entry");
      }
    });
  });

  describe("remove", () => {
    it("should successfully remove a favorite prompt", async () => {
      // eq().eq() のチェイニングをサポートするモック
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      mockSupabaseClient.eq = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      const result = await repository.remove(mockUserId, mockPromptHistoryId);

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("favorite_prompts");
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        "user_id",
        mockUserId,
      );
      expect(mockEq).toHaveBeenCalledWith(
        "prompt_history_id",
        mockPromptHistoryId,
      );
    });

    it("should return error when remove fails", async () => {
      const mockError = { message: "Not found" };
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });
      mockSupabaseClient.eq = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      const result = await repository.remove(mockUserId, mockPromptHistoryId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Not found");
      }
    });
  });

  describe("findByUserId", () => {
    it("should successfully find favorite prompts with history by user ID", async () => {
      mockSupabaseClient.order.mockResolvedValue({
        data: [mockFavoritePromptWithHistory],
        error: null,
      });

      const result = await repository.findByUserId(mockUserId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([mockFavoritePromptWithHistory]);
      }
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("favorite_prompts");
      expect(mockSupabaseClient.select).toHaveBeenCalledWith(`
        *,
        prompt_history (*)
      `);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(mockSupabaseClient.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
    });

    it("should return empty array when no favorites found", async () => {
      mockSupabaseClient.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByUserId(mockUserId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it("should return error when query fails", async () => {
      const mockError = { message: "Database error" };
      mockSupabaseClient.order.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await repository.findByUserId(mockUserId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Database error");
      }
    });
  });

  describe("isFavorited", () => {
    it("should return true when prompt is favorited", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockFavoritePrompt,
        error: null,
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      mockSupabaseClient.select = vi.fn().mockReturnValue({
        eq: mockEq1,
      });

      const result = await repository.isFavorited(
        mockUserId,
        mockPromptHistoryId,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("favorite_prompts");
      expect(mockSupabaseClient.select).toHaveBeenCalledWith("id");
      expect(mockEq1).toHaveBeenCalledWith("user_id", mockUserId);
      expect(mockEq2).toHaveBeenCalledWith(
        "prompt_history_id",
        mockPromptHistoryId,
      );
    });

    it("should return false when prompt is not favorited", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST116" }, // Not found error
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      mockSupabaseClient.select = vi.fn().mockReturnValue({
        eq: mockEq1,
      });

      const result = await repository.isFavorited(
        mockUserId,
        mockPromptHistoryId,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(false);
      }
    });

    it("should return error when query fails", async () => {
      const mockError = { message: "Database error", code: "OTHER_ERROR" };
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      mockSupabaseClient.select = vi.fn().mockReturnValue({
        eq: mockEq1,
      });

      const result = await repository.isFavorited(
        mockUserId,
        mockPromptHistoryId,
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Database error");
      }
    });
  });

  describe("countByUserId", () => {
    it("should successfully count favorite prompts by user ID", async () => {
      mockSupabaseClient.eq.mockResolvedValue({
        count: 5,
        error: null,
      });

      const result = await repository.countByUserId(mockUserId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(5);
      }
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("favorite_prompts");
      expect(mockSupabaseClient.select).toHaveBeenCalledWith("*", {
        count: "exact",
        head: true,
      });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith("user_id", mockUserId);
    });

    it("should return 0 when count is null", async () => {
      mockSupabaseClient.eq.mockResolvedValue({
        count: null,
        error: null,
      });

      const result = await repository.countByUserId(mockUserId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it("should return error when count fails", async () => {
      const mockError = { message: "Database error" };
      mockSupabaseClient.eq.mockResolvedValue({
        count: null,
        error: mockError,
      });

      const result = await repository.countByUserId(mockUserId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Database error");
      }
    });
  });
});
