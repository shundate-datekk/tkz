/**
 * 構造化ロギングユーティリティ
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * ログエントリを作成
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return entry;
  }

  /**
   * ログを出力
   */
  private log(entry: LogEntry): void {
    const formattedLog = JSON.stringify(entry, null, this.isDevelopment ? 2 : 0);

    switch (entry.level) {
      case "debug":
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
      case "info":
        console.info(formattedLog);
        break;
      case "warn":
        console.warn(formattedLog);
        break;
      case "error":
        console.error(formattedLog);
        break;
    }
  }

  /**
   * デバッグログ（開発環境のみ）
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const entry = this.createLogEntry("debug", message, context);
      this.log(entry);
    }
  }

  /**
   * 情報ログ
   */
  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry("info", message, context);
    this.log(entry);
  }

  /**
   * 警告ログ
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry("warn", message, context);
    this.log(entry);
  }

  /**
   * エラーログ
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry("error", message, context, error);
    this.log(entry);
  }

  /**
   * パフォーマンスログ
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      duration_ms: duration,
      operation,
    });
  }

  /**
   * APIリクエストログ
   */
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${path}`, {
      ...context,
      method,
      path,
    });
  }

  /**
   * APIレスポンスログ
   */
  apiResponse(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    const entry = this.createLogEntry(
      level,
      `API Response: ${method} ${path} - ${statusCode}`,
      {
        ...context,
        method,
        path,
        statusCode,
        duration_ms: duration,
      }
    );
    this.log(entry);
  }
}

/**
 * ロガーのシングルトンインスタンス
 */
export const logger = new Logger();

/**
 * パフォーマンス測定ヘルパー
 */
export function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>,
  context?: LogContext
): T | Promise<T> {
  const start = performance.now();
  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      logger.performance(operation, duration, context);
    });
  } else {
    const duration = performance.now() - start;
    logger.performance(operation, duration, context);
    return result;
  }
}
