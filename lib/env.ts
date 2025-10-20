/**
 * 環境変数のバリデーションとアクセスユーティリティ
 */

type EnvVarKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "OPENAI_API_KEY"
  | "NEXTAUTH_URL"
  | "NEXTAUTH_SECRET";

/**
 * 必須の環境変数を取得
 * 環境変数が設定されていない場合はエラーをスロー
 */
export function getEnv(key: EnvVarKey): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Please check your .env.local file and ensure ${key} is set.`
    );
  }

  return value;
}

/**
 * オプショナルな環境変数を取得
 */
export function getOptionalEnv(
  key: EnvVarKey,
  defaultValue?: string
): string | undefined {
  return process.env[key] || defaultValue;
}

/**
 * すべての必須環境変数が設定されているかチェック
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const requiredVars: EnvVarKey[] = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "OPENAI_API_KEY",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
  ];

  const missing: string[] = [];

  for (const key of requiredVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * 環境変数の設定状況を表示（デバッグ用）
 */
export function logEnvStatus(): void {
  const validation = validateEnv();

  if (validation.valid) {
    console.log("✓ All required environment variables are set");
  } else {
    console.error("✗ Missing environment variables:");
    validation.missing.forEach((key) => {
      console.error(`  - ${key}`);
    });
    console.error("\nPlease check your .env.local file");
  }
}
