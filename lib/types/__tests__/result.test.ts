import { describe, it, expect } from "vitest";
import {
  success,
  failure,
  validationError,
  authError,
  forbiddenError,
  notFoundError,
  serverError,
  openaiError,
  rateLimitError,
} from "../result";

describe("Result Pattern", () => {
  describe("success", () => {
    it("should create a success result", () => {
      const result = success({ id: "123", name: "Test" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: "123", name: "Test" });
      }
    });
  });

  describe("failure", () => {
    it("should create a failure result", () => {
      const error = { message: "Something went wrong" };
      const result = failure(error);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual(error);
      }
    });
  });

  describe("Error creators", () => {
    it("should create validation error", () => {
      const error = validationError("Invalid input", { field: "email" });

      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.message).toBe("Invalid input");
      expect(error.details).toEqual({ field: "email" });
    });

    it("should create auth error", () => {
      const error = authError();

      expect(error.code).toBe("AUTH_ERROR");
      expect(error.message).toBe("認証が必要です");
    });

    it("should create auth error with custom message", () => {
      const error = authError("Invalid credentials");

      expect(error.code).toBe("AUTH_ERROR");
      expect(error.message).toBe("Invalid credentials");
    });

    it("should create forbidden error", () => {
      const error = forbiddenError();

      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toBe("この操作を実行する権限がありません");
    });

    it("should create not found error", () => {
      const error = notFoundError("ユーザー");

      expect(error.code).toBe("NOT_FOUND");
      expect(error.message).toBe("ユーザーが見つかりません");
    });

    it("should create server error", () => {
      const error = serverError();

      expect(error.code).toBe("SERVER_ERROR");
      expect(error.message).toBe("サーバーエラーが発生しました");
    });

    it("should create OpenAI error", () => {
      const error = openaiError("API rate limit exceeded", { status: 429 });

      expect(error.code).toBe("OPENAI_ERROR");
      expect(error.message).toBe("API rate limit exceeded");
      expect(error.details).toEqual({ status: 429 });
    });

    it("should create rate limit error", () => {
      const error = rateLimitError();

      expect(error.code).toBe("RATE_LIMIT_ERROR");
      expect(error.message).toBe("リクエスト制限に達しました。しばらく待ってから再度お試しください");
    });
  });
});
