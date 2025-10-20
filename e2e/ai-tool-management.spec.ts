import { test, expect } from "@playwright/test";

/**
 * AIツール管理のE2Eテスト
 *
 * Note: これらのテストは認証が必要です。
 * auth.setup.tsで認証を設定した後、以下のコメントを解除してください。
 */

test.describe("AI Tool Management", () => {
  // 認証状態を使用
  // test.use({ storageState: 'playwright/.auth/user.json' });

  test.describe("Tool List", () => {
    test.skip("should display list of AI tools", async ({ page }) => {
      await page.goto("/tools");

      // ツールリストの確認
      const toolsList = page.locator('[data-testid="tools-list"]').or(
        page.locator("main")
      );
      await expect(toolsList).toBeVisible();

      // 少なくとも1つのツールカードが表示されることを確認
      // const toolCards = page.locator('[data-testid="tool-card"]');
      // await expect(toolCards.first()).toBeVisible();
    });

    test.skip("should filter tools by category", async ({ page }) => {
      await page.goto("/tools");

      // カテゴリフィルタを選択
      const categoryFilter = page.locator('select[name="category"]').or(
        page.locator('[data-testid="category-filter"]')
      );

      // await categoryFilter.selectOption('テキスト生成');

      // フィルタリングされた結果を確認
      // await page.waitForTimeout(500); // デバウンス待機
      // const filteredTools = page.locator('[data-testid="tool-card"]');
      // await expect(filteredTools.first()).toBeVisible();
    });

    test.skip("should search tools by name", async ({ page }) => {
      await page.goto("/tools");

      // 検索入力
      const searchInput = page.locator('input[type="search"]').or(
        page.locator('[placeholder*="検索"]')
      );

      await searchInput.fill("ChatGPT");
      await page.waitForTimeout(500); // デバウンス待機

      // 検索結果を確認
      // const results = page.locator('[data-testid="tool-card"]');
      // await expect(results.first()).toContainText('ChatGPT');
    });
  });

  test.describe("Tool Creation", () => {
    test.skip("should create a new AI tool", async ({ page }) => {
      await page.goto("/tools/new");

      // フォーム入力
      await page.fill('input[name="tool_name"]', "Test Tool E2E");
      await page.fill('input[name="usage_purpose"]', "E2Eテスト目的");
      await page.fill('textarea[name="user_experience"]', "テスト用の体験");
      await page.selectOption('select[name="category"]', "テキスト生成");

      // 評価を選択
      await page.click('[data-rating="5"]');

      // 使用日を入力
      await page.fill('input[name="usage_date"]', "2024-01-15");

      // フォーム送信
      await page.click('button[type="submit"]');

      // リダイレクトを確認
      await expect(page).toHaveURL(/\/tools$/);

      // 成功メッセージを確認
      const toast = page.locator('[data-sonner-toast]').or(
        page.locator('[role="status"]')
      );
      await expect(toast).toContainText(/登録/i);
    });

    test.skip("should validate required fields", async ({ page }) => {
      await page.goto("/tools/new");

      // 空のフォームで送信
      await page.click('button[type="submit"]');

      // エラーメッセージを確認
      const errorMessages = page.locator('[role="alert"]').or(
        page.locator(".error-message")
      );
      await expect(errorMessages.first()).toBeVisible();
    });

    test.skip("should validate rating range", async ({ page }) => {
      await page.goto("/tools/new");

      // すべての必須フィールドを入力
      await page.fill('input[name="tool_name"]', "Test Tool");
      await page.fill('input[name="usage_purpose"]', "Test Purpose");
      await page.fill('textarea[name="user_experience"]', "Test Experience");
      await page.selectOption('select[name="category"]', "テキスト生成");
      await page.fill('input[name="usage_date"]', "2024-01-15");

      // 評価を選択せずに送信
      await page.click('button[type="submit"]');

      // エラーメッセージを確認
      const errorMessage = page.locator('[role="alert"]');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe("Tool Editing", () => {
    test.skip("should edit an existing tool", async ({ page }) => {
      // まず、ツール詳細ページに移動
      await page.goto("/tools");
      await page.click('[data-testid="tool-card"]:first-child');

      // 編集ボタンをクリック
      await page.click('button:has-text("編集")');

      // フォームが表示されることを確認
      await expect(page).toHaveURL(/\/tools\/.*\/edit$/);

      // ツール名を変更
      const nameInput = page.locator('input[name="tool_name"]');
      await nameInput.clear();
      await nameInput.fill("Updated Tool Name");

      // 変更を保存
      await page.click('button[type="submit"]');

      // 詳細ページにリダイレクトされることを確認
      await expect(page).toHaveURL(/\/tools\/.*$/);

      // 更新された名前が表示されることを確認
      await expect(page.locator("h1")).toContainText("Updated Tool Name");
    });

    test.skip("should show warning when editing other users tools", async ({
      page,
    }) => {
      // 他のユーザーのツールの編集ページに移動
      // Note: これは実際のテストデータに依存します
      await page.goto("/tools/other-user-tool-id/edit");

      // 警告バナーが表示されることを確認
      const warningBanner = page.locator('[role="alert"]').or(
        page.locator(".warning-banner")
      );
      await expect(warningBanner).toBeVisible();
      await expect(warningBanner).toContainText(/他のユーザー/i);
    });
  });

  test.describe("Tool Deletion", () => {
    test.skip("should delete a tool with confirmation", async ({ page }) => {
      await page.goto("/tools");
      await page.click('[data-testid="tool-card"]:first-child');

      // 削除ボタンをクリック
      await page.click('button:has-text("削除")');

      // 確認ダイアログが表示されることを確認
      const confirmDialog = page.locator('[role="alertdialog"]');
      await expect(confirmDialog).toBeVisible();

      // 削除を確認
      await page.click('button:has-text("確認")');

      // ツール一覧にリダイレクトされることを確認
      await expect(page).toHaveURL(/\/tools$/);

      // 成功メッセージを確認
      const toast = page.locator('[data-sonner-toast]');
      await expect(toast).toContainText(/削除/i);
    });

    test.skip("should cancel deletion", async ({ page }) => {
      await page.goto("/tools");
      await page.click('[data-testid="tool-card"]:first-child');

      const currentUrl = page.url();

      // 削除ボタンをクリック
      await page.click('button:has-text("削除")');

      // キャンセルボタンをクリック
      await page.click('button:has-text("キャンセル")');

      // URLが変わらないことを確認
      await expect(page).toHaveURL(currentUrl);
    });
  });
});
