import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenAIClient } from "../openai-client";

// OpenAI APIをモック
vi.mock("openai", () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: "Generated prompt text",
              },
            },
          ],
        }),
      },
    },
  })),
}));

describe("OpenAIClient - Language Support", () => {
  let client: OpenAIClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new OpenAIClient();
  });

  describe("buildSystemPrompt", () => {
    it("日本語用のシステムプロンプトを生成できる", () => {
      // @ts-ignore - private methodにアクセス
      const prompt = client.buildSystemPrompt("ja");

      expect(prompt).toContain("日本語で出力すること");
      expect(prompt).toContain("プロンプト作成のガイドライン");
    });

    it("英語用のシステムプロンプトを生成できる", () => {
      // @ts-ignore - private methodにアクセス
      const prompt = client.buildSystemPrompt("en");

      expect(prompt).toContain("Output in English");
      expect(prompt).toContain("Prompt creation guidelines");
    });
  });

  describe("buildUserPrompt", () => {
    it("日本語用のユーザープロンプトを生成できる", () => {
      // @ts-ignore - private methodにアクセス
      const prompt = client.buildUserPrompt({
        purpose: "テスト動画",
        sceneDescription: "美しい風景",
        outputLanguage: "ja",
      });

      expect(prompt).toContain("目的: テスト動画");
      expect(prompt).toContain("シーン: 美しい風景");
      expect(prompt).toContain("日本語プロンプトを作成してください");
    });

    it("英語用のユーザープロンプトを生成できる", () => {
      // @ts-ignore - private methodにアクセス
      const prompt = client.buildUserPrompt({
        purpose: "Test video",
        sceneDescription: "Beautiful landscape",
        outputLanguage: "en",
      });

      expect(prompt).toContain("Purpose: Test video");
      expect(prompt).toContain("Scene: Beautiful landscape");
      expect(prompt).toContain("create an English prompt");
    });

    it("outputLanguageが指定されない場合、デフォルトで日本語を使用する", () => {
      // @ts-ignore - private methodにアクセス
      const prompt = client.buildUserPrompt({
        purpose: "デフォルトテスト",
        sceneDescription: "デフォルトシーン",
      });

      expect(prompt).toContain("目的: デフォルトテスト");
      expect(prompt).toContain("日本語プロンプトを作成してください");
    });

    it("オプションフィールドが日本語の場合、日本語ラベルを使用する", () => {
      // @ts-ignore - private methodにアクセス
      const prompt = client.buildUserPrompt({
        purpose: "テスト",
        sceneDescription: "シーン",
        style: "アニメ",
        duration: "5秒",
        additionalRequirements: "明るい雰囲気",
        outputLanguage: "ja",
      });

      expect(prompt).toContain("スタイル: アニメ");
      expect(prompt).toContain("長さ: 5秒");
      expect(prompt).toContain("その他の要望: 明るい雰囲気");
    });

    it("オプションフィールドが英語の場合、英語ラベルを使用する", () => {
      // @ts-ignore - private methodにアクセス
      const prompt = client.buildUserPrompt({
        purpose: "Test",
        sceneDescription: "Scene",
        style: "Anime",
        duration: "5 seconds",
        additionalRequirements: "Bright atmosphere",
        outputLanguage: "en",
      });

      expect(prompt).toContain("Style: Anime");
      expect(prompt).toContain("Duration: 5 seconds");
      expect(prompt).toContain("Additional requirements: Bright atmosphere");
    });
  });

  describe("generateVideoPrompt", () => {
    it("日本語でプロンプトを生成できる", async () => {
      const result = await client.generateVideoPrompt({
        purpose: "テスト動画",
        sceneDescription: "美しい風景",
        outputLanguage: "ja",
      });

      expect(result).toBe("Generated prompt text");
    });

    it("英語でプロンプトを生成できる", async () => {
      const result = await client.generateVideoPrompt({
        purpose: "Test video",
        sceneDescription: "Beautiful landscape",
        outputLanguage: "en",
      });

      expect(result).toBe("Generated prompt text");
    });
  });
});
