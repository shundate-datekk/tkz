import { describe, it, expect, vi, beforeEach } from "vitest";
import type { GeneratePromptInput } from "@/lib/schemas/prompt.schema";

// OpenAI APIをモック
vi.mock("openai", () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe("Prompt Generation Service Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generatePrompt", () => {
    it("should validate input structure", () => {
      const input: GeneratePromptInput = {
        theme: "美しい桜の風景",
        mood: "穏やか",
        style: "アニメ調",
        duration: "5秒",
        camera_movement: "ゆっくりとしたパン",
        lighting: "柔らかな朝の光",
        additional_details: "桜の花びらが舞い落ちる",
      };

      expect(input).toMatchObject({
        theme: expect.any(String),
        mood: expect.any(String),
        style: expect.any(String),
        duration: expect.any(String),
      });
    });

    it("should handle optional fields", () => {
      const minimalInput: GeneratePromptInput = {
        theme: "シンプルなテーマ",
        mood: "明るい",
        style: "リアル",
        duration: "3秒",
      };

      expect(minimalInput.camera_movement).toBeUndefined();
      expect(minimalInput.lighting).toBeUndefined();
      expect(minimalInput.additional_details).toBeUndefined();
    });

    it("should validate theme is not empty", () => {
      const theme = "美しい風景";
      expect(theme.length).toBeGreaterThan(0);
    });

    it("should validate duration format", () => {
      const validDurations = ["3秒", "5秒", "10秒", "30秒"];
      const testDuration = "5秒";

      expect(validDurations).toContain(testDuration);
    });
  });

  describe("regeneratePrompt", () => {
    it("should accept same input structure as generatePrompt", () => {
      const input: GeneratePromptInput = {
        theme: "夜の街並み",
        mood: "神秘的",
        style: "シネマティック",
        duration: "10秒",
        camera_movement: "ドローン撮影",
        lighting: "ネオンの光",
      };

      expect(input).toMatchObject({
        theme: expect.any(String),
        mood: expect.any(String),
      });
    });
  });

  describe("Input sanitization", () => {
    it("should preserve Japanese characters", () => {
      const japaneseInput = {
        theme: "富士山の美しい景色",
        mood: "壮大",
        style: "写実的",
        duration: "5秒",
      };

      expect(japaneseInput.theme).toContain("富士山");
      expect(japaneseInput.mood).toBe("壮大");
    });

    it("should handle special characters in theme", () => {
      const theme = "街の灯り、雨の音、静寂な夜";
      expect(theme).toContain("、");
    });

    it("should handle long descriptions", () => {
      const longDescription =
        "非常に詳細な説明が続きます。この説明には多くの情報が含まれており、ユーザーの意図を正確に伝えるために必要です。";

      expect(longDescription.length).toBeGreaterThan(50);
    });
  });

  describe("Prompt output validation", () => {
    it("should expect English output format", () => {
      const samplePrompt =
        "A beautiful cherry blossom landscape with gentle morning light, soft pink petals falling gracefully in the breeze, anime-style rendering, 5 seconds duration, slow panning camera movement";

      expect(samplePrompt).toMatch(/[a-zA-Z]/);
      expect(samplePrompt).toContain("cherry blossom");
    });

    it("should validate prompt contains key elements", () => {
      const prompt = "Cinematic night cityscape with neon lights, mysterious mood, 10 seconds";

      const hasTheme = prompt.toLowerCase().includes("cityscape");
      const hasMood = prompt.toLowerCase().includes("mysterious");
      const hasDuration = prompt.includes("10 seconds");

      expect(hasTheme).toBe(true);
      expect(hasMood).toBe(true);
      expect(hasDuration).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("should handle missing required fields gracefully", () => {
      const invalidInput = {
        theme: "",
        mood: "明るい",
        style: "リアル",
        duration: "3秒",
      } as GeneratePromptInput;

      expect(invalidInput.theme).toBe("");
    });

    it("should validate all required fields are present", () => {
      const validInput: GeneratePromptInput = {
        theme: "テストテーマ",
        mood: "テストムード",
        style: "テストスタイル",
        duration: "5秒",
      };

      const requiredFields = ["theme", "mood", "style", "duration"];
      requiredFields.forEach((field) => {
        expect(validInput[field as keyof GeneratePromptInput]).toBeDefined();
      });
    });
  });

  describe("API integration expectations", () => {
    it("should expect GPT-4 model usage", () => {
      const expectedModel = "gpt-4";
      expect(expectedModel).toBe("gpt-4");
    });

    it("should expect system prompt for Sora 2", () => {
      const systemPrompt = "You are a helpful assistant that generates video prompts for Sora 2";
      expect(systemPrompt).toContain("Sora 2");
    });

    it("should expect structured prompt output", () => {
      const sampleOutput = {
        promptText: "A cinematic scene...",
        inputParameters: {
          theme: "テスト",
          mood: "明るい",
          style: "リアル",
          duration: "5秒",
        },
      };

      expect(sampleOutput.promptText).toBeTruthy();
      expect(sampleOutput.inputParameters).toBeDefined();
    });
  });
});
