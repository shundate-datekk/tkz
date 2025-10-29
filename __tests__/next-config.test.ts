import { describe, it, expect } from "vitest";

/**
 * next.config.tsの画像最適化設定をテスト
 * Requirement 8.2: WebP/AVIF形式の最適化された画像配信
 */
describe("next.config.ts - Image Optimization", () => {
  it("should have image optimization configuration", async () => {
    // next.config.tsをimportして設定を確認
    const config = await import("../next.config");
    const nextConfig = config.default;

    // images設定が存在することを確認
    expect(nextConfig).toHaveProperty("images");
  });

  it("should support WebP and AVIF formats (Requirement 8.2)", async () => {
    const config = await import("../next.config");
    const nextConfig = config.default;

    // WebP/AVIF形式がサポートされていることを確認
    expect(nextConfig.images.formats).toContain("image/webp");
    expect(nextConfig.images.formats).toContain("image/avif");
  });

  it("should have image formats configuration", async () => {
    const config = await import("../next.config");
    const nextConfig = config.default;

    // formats配列が定義されていることを確認
    expect(nextConfig.images.formats).toBeDefined();
    expect(Array.isArray(nextConfig.images.formats)).toBe(true);
    expect(nextConfig.images.formats.length).toBeGreaterThan(0);
  });

  it("should have device sizes for responsive images (Requirement 8.3)", async () => {
    const config = await import("../next.config");
    const nextConfig = config.default;

    // デバイスサイズが定義されていることを確認
    expect(nextConfig.images.deviceSizes).toBeDefined();
    expect(Array.isArray(nextConfig.images.deviceSizes)).toBe(true);
    expect(nextConfig.images.deviceSizes.length).toBeGreaterThan(0);

    // 一般的なデバイスサイズ（640, 1080, 1920）が含まれることを確認
    expect(nextConfig.images.deviceSizes).toContain(640); // モバイル
    expect(nextConfig.images.deviceSizes).toContain(1080); // タブレット
    expect(nextConfig.images.deviceSizes).toContain(1920); // デスクトップ
  });

  it("should have image sizes for thumbnails and icons", async () => {
    const config = await import("../next.config");
    const nextConfig = config.default;

    // 画像サイズが定義されていることを確認
    expect(nextConfig.images.imageSizes).toBeDefined();
    expect(Array.isArray(nextConfig.images.imageSizes)).toBe(true);

    // 小サイズ（アイコン、サムネイル用）が含まれることを確認
    expect(nextConfig.images.imageSizes).toContain(64);
    expect(nextConfig.images.imageSizes).toContain(128);
    expect(nextConfig.images.imageSizes).toContain(256);
  });
});

describe("next.config.ts - Security Headers", () => {
  it("should have security headers configuration", async () => {
    const config = await import("../next.config");
    const nextConfig = config.default;

    expect(nextConfig).toHaveProperty("headers");
    expect(typeof nextConfig.headers).toBe("function");
  });
});

describe("next.config.ts - Server Actions", () => {
  it("should have server actions configuration", async () => {
    const config = await import("../next.config");
    const nextConfig = config.default;

    expect(nextConfig).toHaveProperty("experimental");
    expect(nextConfig.experimental).toHaveProperty("serverActions");
    expect(nextConfig.experimental.serverActions).toHaveProperty(
      "bodySizeLimit"
    );
  });
});
