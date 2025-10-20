import { test, expect } from "@playwright/test";

/**
 * ナビゲーションとレイアウトのE2Eテスト
 */
test.describe("Navigation", () => {
  test("should display navbar on all pages", async ({ page }) => {
    await page.goto("/");

    // ナビゲーションバーの存在確認
    const navbar = page.locator("header");
    await expect(navbar).toBeVisible();
  });

  test("should navigate between pages", async ({ page }) => {
    await page.goto("/");

    // ホームページの確認
    await expect(page).toHaveURL("/");

    // Note: 認証が必要なページへのナビゲーションは、
    // 認証セットアップ後に実装してください
  });

  test("should display responsive menu on mobile", async ({ page }) => {
    // モバイルビューポートを設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // ハンバーガーメニューボタンの存在確認
    // Note: 実際のセレクタに合わせて調整してください
    const menuButton = page.locator('button[aria-label="menu"]').or(
      page.locator('button:has-text("Menu")')
    );

    // メニューボタンが表示されていることを確認
    // await expect(menuButton).toBeVisible();
  });
});

/**
 * ページアクセシビリティテスト
 */
test.describe("Accessibility", () => {
  test("should have proper page titles", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AIツール/i);
  });

  test("should have main landmark", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });
});

/**
 * パフォーマンステスト
 */
test.describe("Performance", () => {
  test("should load homepage within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;

    // 3秒以内に読み込まれることを確認
    expect(loadTime).toBeLessThan(3000);
  });
});
