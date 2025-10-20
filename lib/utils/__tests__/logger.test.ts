import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, measurePerformance } from "../logger";

describe("Logger", () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe("info", () => {
    it("should log info message", () => {
      logger.info("Test info message");

      expect(consoleInfoSpy).toHaveBeenCalledOnce();
      const logCall = consoleInfoSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe("info");
      expect(logEntry.message).toBe("Test info message");
      expect(logEntry.timestamp).toBeDefined();
    });

    it("should log info message with context", () => {
      logger.info("Test info", { userId: "123", action: "login" });

      expect(consoleInfoSpy).toHaveBeenCalledOnce();
      const logCall = consoleInfoSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.context).toEqual({ userId: "123", action: "login" });
    });
  });

  describe("error", () => {
    it("should log error message", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", error);

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe("error");
      expect(logEntry.message).toBe("Error occurred");
      expect(logEntry.error.message).toBe("Test error");
    });

    it("should log error with context", () => {
      const error = new Error("Database error");
      logger.error("DB operation failed", error, { query: "SELECT * FROM users" });

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.context).toEqual({ query: "SELECT * FROM users" });
    });
  });

  describe("warn", () => {
    it("should log warning message", () => {
      logger.warn("Test warning");

      expect(consoleWarnSpy).toHaveBeenCalledOnce();
      const logCall = consoleWarnSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe("warn");
      expect(logEntry.message).toBe("Test warning");
    });
  });

  describe("performance", () => {
    it("should log performance metrics", () => {
      logger.performance("database-query", 150);

      expect(consoleInfoSpy).toHaveBeenCalledOnce();
      const logCall = consoleInfoSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.message).toBe("Performance: database-query");
      expect(logEntry.context.duration_ms).toBe(150);
      expect(logEntry.context.operation).toBe("database-query");
    });
  });

  describe("apiRequest", () => {
    it("should log API request", () => {
      logger.apiRequest("GET", "/api/tools");

      expect(consoleInfoSpy).toHaveBeenCalledOnce();
      const logCall = consoleInfoSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.message).toBe("API Request: GET /api/tools");
      expect(logEntry.context.method).toBe("GET");
      expect(logEntry.context.path).toBe("/api/tools");
    });
  });

  describe("apiResponse", () => {
    it("should log successful API response as info", () => {
      logger.apiResponse("GET", "/api/tools", 200, 50);

      expect(consoleInfoSpy).toHaveBeenCalledOnce();
      const logCall = consoleInfoSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe("info");
      expect(logEntry.context.statusCode).toBe(200);
      expect(logEntry.context.duration_ms).toBe(50);
    });

    it("should log 4xx API response as warning", () => {
      logger.apiResponse("POST", "/api/tools", 400, 30);

      expect(consoleWarnSpy).toHaveBeenCalledOnce();
      const logCall = consoleWarnSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe("warn");
      expect(logEntry.context.statusCode).toBe(400);
    });

    it("should log 5xx API response as error", () => {
      logger.apiResponse("GET", "/api/tools", 500, 100);

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe("error");
      expect(logEntry.context.statusCode).toBe(500);
    });
  });
});

describe("measurePerformance", () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
  });

  it("should measure synchronous function performance", () => {
    const result = measurePerformance("test-operation", () => {
      return "test result";
    });

    expect(result).toBe("test result");
    expect(consoleInfoSpy).toHaveBeenCalledOnce();

    const logCall = consoleInfoSpy.mock.calls[0][0];
    const logEntry = JSON.parse(logCall);

    expect(logEntry.message).toBe("Performance: test-operation");
    expect(logEntry.context.operation).toBe("test-operation");
    expect(logEntry.context.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it("should measure asynchronous function performance", async () => {
    const result = await measurePerformance("async-operation", async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return "async result";
    });

    expect(result).toBe("async result");
    expect(consoleInfoSpy).toHaveBeenCalledOnce();

    const logCall = consoleInfoSpy.mock.calls[0][0];
    const logEntry = JSON.parse(logCall);

    expect(logEntry.context.operation).toBe("async-operation");
    expect(logEntry.context.duration_ms).toBeGreaterThan(0);
  });
});
