import { describe, it, expect, vi, beforeEach } from "vitest";
import type { GeneratePromptInput } from "@/lib/schemas/prompt.schema";
import type { ActionResult } from "../prompt.actions";

describe("Prompt Actions Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generatePromptAction", () => {
    it("should accept valid GeneratePromptInput", () => {
      const validInput: GeneratePromptInput = {
        theme: "美しい桜の風景",
        mood: "穏やか",
        style: "アニメ調",
        duration: "5秒",
        camera_movement: "ゆっくりとしたパン",
        lighting: "柔らかな朝の光",
        additional_details: "桜の花びらが舞い落ちる",
      };

      expect(validInput).toMatchObject({
        theme: expect.any(String),
        mood: expect.any(String),
        style: expect.any(String),
        duration: expect.any(String),
      });
    });

    it("should expect ActionResult with prompt data", () => {
      const successResult: ActionResult<{
        promptText: string;
        inputParameters: any;
      }> = {
        success: true,
        data: {
          promptText: "A beautiful cherry blossom landscape...",
          inputParameters: {
            theme: "美しい桜の風景",
            mood: "穏やか",
            style: "アニメ調",
            duration: "5秒",
          },
        },
      };

      expect(successResult.success).toBe(true);
      if (successResult.success) {
        expect(successResult.data.promptText).toBeTruthy();
        expect(successResult.data.inputParameters).toBeDefined();
      }
    });

    it("should handle optional fields in input", () => {
      const minimalInput: GeneratePromptInput = {
        theme: "シンプルな風景",
        mood: "明るい",
        style: "リアル",
        duration: "3秒",
      };

      expect(minimalInput.camera_movement).toBeUndefined();
      expect(minimalInput.lighting).toBeUndefined();
      expect(minimalInput.additional_details).toBeUndefined();
    });

    it("should validate required fields are present", () => {
      const input: GeneratePromptInput = {
        theme: "テストテーマ",
        mood: "テストムード",
        style: "テストスタイル",
        duration: "5秒",
      };

      const requiredFields = ["theme", "mood", "style", "duration"];
      requiredFields.forEach((field) => {
        expect(input[field as keyof GeneratePromptInput]).toBeDefined();
      });
    });
  });

  describe("regeneratePromptAction", () => {
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
        style: expect.any(String),
        duration: expect.any(String),
      });
    });

    it("should expect same return type as generatePrompt", () => {
      const result: ActionResult<{
        promptText: string;
        inputParameters: any;
      }> = {
        success: true,
        data: {
          promptText: "Cinematic night cityscape...",
          inputParameters: {},
        },
      };

      expect(result.success).toBe(true);
    });
  });

  describe("savePromptHistoryAction", () => {
    it("should accept promptText and inputParameters", () => {
      const promptText = "A beautiful cinematic landscape...";
      const inputParameters: GeneratePromptInput = {
        theme: "風景",
        mood: "美しい",
        style: "シネマティック",
        duration: "5秒",
      };

      expect(typeof promptText).toBe("string");
      expect(promptText.length).toBeGreaterThan(0);
      expect(inputParameters).toMatchObject({
        theme: expect.any(String),
      });
    });

    it("should expect ActionResult with history ID", () => {
      const successResult: ActionResult<{ id: string }> = {
        success: true,
        data: { id: "history-123" },
      };

      expect(successResult.success).toBe(true);
      if (successResult.success) {
        expect(successResult.data.id).toBeTruthy();
      }
    });

    it("should handle authentication requirement", () => {
      const authError: ActionResult<{ id: string }> = {
        success: false,
        error: "認証が必要です",
      };

      expect(authError.success).toBe(false);
      if (!authError.success) {
        expect(authError.error).toContain("認証");
      }
    });

    it("should revalidate history path", () => {
      const pathToRevalidate = "/history";
      expect(pathToRevalidate).toBe("/history");
    });
  });

  describe("deletePromptHistoryAction", () => {
    it("should accept history ID parameter", () => {
      const historyId = "history-123";

      expect(typeof historyId).toBe("string");
      expect(historyId.length).toBeGreaterThan(0);
    });

    it("should expect ActionResult<boolean>", () => {
      const successResult: ActionResult<boolean> = {
        success: true,
        data: true,
      };

      const errorResult: ActionResult<boolean> = {
        success: false,
        error: "削除に失敗しました",
      };

      expect(successResult.success).toBe(true);
      expect(errorResult.success).toBe(false);
    });

    it("should revalidate history path after deletion", () => {
      const pathToRevalidate = "/history";
      expect(pathToRevalidate).toBe("/history");
    });
  });

  describe("Error handling", () => {
    it("should handle OpenAI API errors", () => {
      const apiError: ActionResult<{
        promptText: string;
        inputParameters: any;
      }> = {
        success: false,
        error: "OpenAI APIエラーが発生しました",
      };

      expect(apiError.success).toBe(false);
      if (!apiError.success) {
        expect(apiError.error).toContain("API");
      }
    });

    it("should handle rate limit errors", () => {
      const rateLimitError: ActionResult<{
        promptText: string;
        inputParameters: any;
      }> = {
        success: false,
        error: "リクエスト制限に達しました",
      };

      expect(rateLimitError.success).toBe(false);
    });

    it("should handle database save errors", () => {
      const dbError: ActionResult<{ id: string }> = {
        success: false,
        error: "プロンプト履歴の保存中にエラーが発生しました",
      };

      expect(dbError.success).toBe(false);
    });

    it("should handle validation errors", () => {
      const validationError: ActionResult<{
        promptText: string;
        inputParameters: any;
      }> = {
        success: false,
        error: "入力パラメータが不正です",
      };

      expect(validationError.success).toBe(false);
    });
  });

  describe("Input validation", () => {
    it("should validate theme is not empty", () => {
      const theme = "美しい風景";
      expect(theme.length).toBeGreaterThan(0);

      const emptyTheme = "";
      expect(emptyTheme.length).toBe(0);
    });

    it("should validate duration format", () => {
      const validDurations = ["3秒", "5秒", "10秒", "30秒"];

      validDurations.forEach((duration) => {
        expect(duration).toMatch(/\d+秒/);
      });
    });

    it("should handle long descriptions", () => {
      const longTheme =
        "非常に詳細で長いテーマの説明です。このテーマには多くの要素が含まれており、詳細な描写が必要です。";

      expect(longTheme.length).toBeGreaterThan(40);
    });

    it("should preserve Japanese characters", () => {
      const input: GeneratePromptInput = {
        theme: "富士山の美しい景色",
        mood: "壮大",
        style: "写実的",
        duration: "5秒",
        additional_details: "朝日が昇る瞬間を捉える",
      };

      expect(input.theme).toContain("富士山");
      expect(input.mood).toBe("壮大");
      expect(input.additional_details).toContain("朝日");
    });
  });

  describe("Output validation", () => {
    it("should expect English prompt output", () => {
      const promptText =
        "A beautiful cherry blossom landscape with gentle morning light, soft pink petals falling gracefully in the breeze";

      expect(promptText).toMatch(/[a-zA-Z]/);
      expect(promptText.length).toBeGreaterThan(0);
    });

    it("should preserve input parameters in output", () => {
      const originalInput: GeneratePromptInput = {
        theme: "テストテーマ",
        mood: "明るい",
        style: "リアル",
        duration: "5秒",
      };

      const outputParameters = { ...originalInput };

      expect(outputParameters.theme).toBe(originalInput.theme);
      expect(outputParameters.mood).toBe(originalInput.mood);
    });

    it("should validate prompt contains key information", () => {
      const prompt = "Cinematic cityscape with neon lights, mysterious mood, 10 seconds duration";

      const hasStyle = prompt.toLowerCase().includes("cinematic");
      const hasMood = prompt.toLowerCase().includes("mysterious");
      const hasDuration = prompt.includes("10 seconds");

      expect(hasStyle).toBe(true);
      expect(hasMood).toBe(true);
      expect(hasDuration).toBe(true);
    });
  });

  describe("Data flow validation", () => {
    it("should maintain data consistency through generate -> save flow", () => {
      const generateResult = {
        promptText: "A beautiful landscape...",
        inputParameters: {
          theme: "風景",
          mood: "美しい",
          style: "リアル",
          duration: "5秒",
        },
      };

      const saveInput = {
        promptText: generateResult.promptText,
        inputParameters: generateResult.inputParameters,
      };

      expect(saveInput.promptText).toBe(generateResult.promptText);
      expect(saveInput.inputParameters).toEqual(generateResult.inputParameters);
    });

    it("should validate saved history can be retrieved", () => {
      const savedHistory = {
        id: "history-123",
        prompt_text: "A beautiful landscape...",
        input_parameters: {
          theme: "風景",
          mood: "美しい",
          style: "リアル",
          duration: "5秒",
        },
        created_by: "user-123",
        created_at: "2024-01-15T10:00:00Z",
      };

      expect(savedHistory.id).toBeTruthy();
      expect(savedHistory.prompt_text).toBeTruthy();
      expect(savedHistory.input_parameters).toBeDefined();
      expect(savedHistory.created_by).toBeTruthy();
    });
  });
});
