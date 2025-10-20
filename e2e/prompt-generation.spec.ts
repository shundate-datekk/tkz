import { test, expect } from "@playwright/test";

/**
 * Sora2プロンプト生成のE2Eテスト
 *
 * Note: これらのテストは認証が必要です。
 */
test.describe("Prompt Generation", () => {
  // 認証状態を使用
  // test.use({ storageState: 'playwright/.auth/user.json' });

  test.describe("Prompt Form", () => {
    test.skip("should display prompt generation form", async ({ page }) => {
      await page.goto("/prompt");

      // フォームの存在確認
      const form = page.locator("form");
      await expect(form).toBeVisible();

      // 必須フィールドの確認
      await expect(page.locator('input[name="theme"]')).toBeVisible();
      await expect(page.locator('input[name="mood"]')).toBeVisible();
      await expect(page.locator('input[name="style"]')).toBeVisible();
      await expect(page.locator('select[name="duration"]')).toBeVisible();
    });

    test.skip("should generate prompt with valid input", async ({ page }) => {
      await page.goto("/prompt");

      // フォームに入力
      await page.fill('input[name="theme"]', "美しい桜の風景");
      await page.fill('input[name="mood"]', "穏やか");
      await page.fill('input[name="style"]', "アニメ調");
      await page.selectOption('select[name="duration"]', "5秒");
      await page.fill('input[name="camera_movement"]', "ゆっくりとしたパン");
      await page.fill('input[name="lighting"]', "柔らかな朝の光");
      await page.fill(
        'textarea[name="additional_details"]',
        "桜の花びらが舞い落ちる"
      );

      // 生成ボタンをクリック
      await page.click('button:has-text("生成")');

      // ローディング状態を確認
      await expect(page.locator('[data-testid="loading"]').or(
        page.locator("text=生成中")
      )).toBeVisible();

      // プロンプト結果が表示されることを確認
      await expect(
        page.locator('[data-testid="prompt-result"]').or(page.locator("pre"))
      ).toBeVisible({ timeout: 30000 });

      // 結果が英語であることを確認
      const promptText = await page
        .locator('[data-testid="prompt-result"]')
        .or(page.locator("pre"))
        .textContent();
      expect(promptText).toMatch(/[a-zA-Z]/);
    });

    test.skip("should validate required fields", async ({ page }) => {
      await page.goto("/prompt");

      // 空のフォームで生成
      await page.click('button:has-text("生成")');

      // エラーメッセージを確認
      const errorMessages = page.locator('[role="alert"]');
      await expect(errorMessages.first()).toBeVisible();
    });

    test.skip("should handle optional fields", async ({ page }) => {
      await page.goto("/prompt");

      // 必須フィールドのみ入力
      await page.fill('input[name="theme"]', "シンプルな風景");
      await page.fill('input[name="mood"]', "明るい");
      await page.fill('input[name="style"]', "リアル");
      await page.selectOption('select[name="duration"]', "3秒");

      // 生成ボタンをクリック
      await page.click('button:has-text("生成")');

      // プロンプト結果が表示されることを確認
      await expect(
        page.locator('[data-testid="prompt-result"]')
      ).toBeVisible({ timeout: 30000 });
    });
  });

  test.describe("Prompt Actions", () => {
    test.skip("should copy prompt to clipboard", async ({ page, context }) => {
      // クリップボード権限を付与
      await context.grantPermissions(["clipboard-write", "clipboard-read"]);

      await page.goto("/prompt");

      // プロンプトを生成
      await page.fill('input[name="theme"]', "テスト");
      await page.fill('input[name="mood"]', "明るい");
      await page.fill('input[name="style"]', "リアル");
      await page.selectOption('select[name="duration"]', "3秒");
      await page.click('button:has-text("生成")');

      // 結果を待機
      await page.waitForSelector('[data-testid="prompt-result"]', {
        timeout: 30000,
      });

      // コピーボタンをクリック
      await page.click('button:has-text("コピー")');

      // 成功メッセージを確認
      const toast = page.locator('[data-sonner-toast]');
      await expect(toast).toContainText(/コピー/i);
    });

    test.skip("should regenerate prompt", async ({ page }) => {
      await page.goto("/prompt");

      // 最初のプロンプトを生成
      await page.fill('input[name="theme"]', "夜の街並み");
      await page.fill('input[name="mood"]', "神秘的");
      await page.fill('input[name="style"]', "シネマティック");
      await page.selectOption('select[name="duration"]', "10秒");
      await page.click('button:has-text("生成")');

      // 結果を待機
      await page.waitForSelector('[data-testid="prompt-result"]', {
        timeout: 30000,
      });

      const firstPrompt = await page
        .locator('[data-testid="prompt-result"]')
        .textContent();

      // 再生成ボタンをクリック
      await page.click('button:has-text("再生成")');

      // 新しい結果を待機
      await page.waitForTimeout(2000);

      const secondPrompt = await page
        .locator('[data-testid="prompt-result"]')
        .textContent();

      // プロンプトが異なることを確認（OpenAIの応答は毎回異なる）
      // Note: まれに同じ結果になる可能性があるため、このテストは不安定な場合があります
      expect(firstPrompt).not.toBe(secondPrompt);
    });

    test.skip("should save prompt to history", async ({ page }) => {
      await page.goto("/prompt");

      // プロンプトを生成
      await page.fill('input[name="theme"]', "保存テスト");
      await page.fill('input[name="mood"]', "明るい");
      await page.fill('input[name="style"]', "リアル");
      await page.selectOption('select[name="duration"]', "5秒");
      await page.click('button:has-text("生成")');

      // 結果を待機
      await page.waitForSelector('[data-testid="prompt-result"]', {
        timeout: 30000,
      });

      // 保存ボタンをクリック
      await page.click('button:has-text("保存")');

      // 成功メッセージを確認
      const toast = page.locator('[data-sonner-toast]');
      await expect(toast).toContainText(/保存/i);
    });
  });

  test.describe("Error Handling", () => {
    test.skip("should handle API errors gracefully", async ({ page }) => {
      // Note: このテストはモックされたAPIエラーレスポンスが必要です

      await page.goto("/prompt");

      await page.fill('input[name="theme"]', "エラーテスト");
      await page.fill('input[name="mood"]', "テスト");
      await page.fill('input[name="style"]', "テスト");
      await page.selectOption('select[name="duration"]', "3秒");

      // ネットワークエラーをシミュレート
      await page.route("**/api/prompt/generate", (route) => {
        route.abort("failed");
      });

      await page.click('button:has-text("生成")');

      // エラーメッセージを確認
      const errorToast = page.locator('[data-sonner-toast]');
      await expect(errorToast).toContainText(/エラー/i);
    });

    test.skip("should handle rate limit errors", async ({ page }) => {
      await page.goto("/prompt");

      // 多数のリクエストを送信
      for (let i = 0; i < 5; i++) {
        await page.fill('input[name="theme"]', `テスト${i}`);
        await page.fill('input[name="mood"]', "明るい");
        await page.fill('input[name="style"]', "リアル");
        await page.selectOption('select[name="duration"]', "3秒");
        await page.click('button:has-text("生成")');
        await page.waitForTimeout(100);
      }

      // レート制限エラーメッセージを確認
      const errorToast = page.locator('[data-sonner-toast]');
      await expect(errorToast).toContainText(/制限/i);
    });
  });
});
