import { test, expect } from "@playwright/test";

/**
 * プロンプト履歴管理のE2Eテスト
 */
test.describe("History Management", () => {
  // 認証状態を使用
  // test.use({ storageState: 'playwright/.auth/user.json' });

  test.describe("History List", () => {
    test.skip("should display prompt history", async ({ page }) => {
      await page.goto("/history");

      // 履歴リストの存在確認
      const historyList = page.locator('[data-testid="history-list"]').or(
        page.locator("main")
      );
      await expect(historyList).toBeVisible();
    });

    test.skip("should search history by prompt text", async ({ page }) => {
      await page.goto("/history");

      // 検索入力
      const searchInput = page.locator('input[type="search"]').or(
        page.locator('[placeholder*="検索"]')
      );

      await searchInput.fill("cherry blossom");
      await page.waitForTimeout(500); // デバウンス待機

      // 検索結果を確認
      const results = page.locator('[data-testid="history-item"]');
      const firstResult = results.first();

      if (await firstResult.isVisible()) {
        await expect(firstResult).toContainText(/cherry blossom/i);
      }
    });

    test.skip("should filter history by date", async ({ page }) => {
      await page.goto("/history");

      // 日付フィルタを設定
      const dateFilter = page.locator('input[type="date"]').or(
        page.locator('[data-testid="date-filter"]')
      );

      await dateFilter.fill("2024-01-15");
      await page.waitForTimeout(500);

      // フィルタリングされた結果を確認
      const results = page.locator('[data-testid="history-item"]');
      await expect(results.first()).toBeVisible();
    });

    test.skip("should display empty state when no history", async ({ page }) => {
      // Note: これは新規ユーザーまたはクリアされた履歴でテストする必要があります
      await page.goto("/history");

      // 空の状態メッセージを確認
      const emptyState = page.locator('[data-testid="empty-state"]').or(
        page.locator("text=履歴がありません")
      );

      // await expect(emptyState).toBeVisible();
    });
  });

  test.describe("History Actions", () => {
    test.skip("should reuse prompt from history", async ({ page }) => {
      await page.goto("/history");

      // 履歴アイテムをクリック
      await page.click('[data-testid="history-item"]:first-child');

      // または再利用ボタンをクリック
      await page.click('button:has-text("再利用")');

      // プロンプト生成ページにリダイレクトされることを確認
      await expect(page).toHaveURL(/\/prompt/);

      // フォームが履歴データで埋められていることを確認
      const themeInput = page.locator('input[name="theme"]');
      const themeValue = await themeInput.inputValue();
      expect(themeValue.length).toBeGreaterThan(0);
    });

    test.skip("should delete history item", async ({ page }) => {
      await page.goto("/history");

      // 最初の履歴アイテムを取得
      const firstHistoryItem = page
        .locator('[data-testid="history-item"]')
        .first();
      const itemText = await firstHistoryItem.textContent();

      // 削除ボタンをクリック
      await firstHistoryItem.locator('button:has-text("削除")').click();

      // 確認ダイアログが表示されることを確認
      const confirmDialog = page.locator('[role="alertdialog"]');
      await expect(confirmDialog).toBeVisible();

      // 削除を確認
      await page.click('button:has-text("確認")');

      // 成功メッセージを確認
      const toast = page.locator('[data-sonner-toast]');
      await expect(toast).toContainText(/削除/i);

      // アイテムが削除されたことを確認
      await page.waitForTimeout(1000);
      const remainingItems = await page
        .locator('[data-testid="history-item"]')
        .allTextContents();
      expect(remainingItems).not.toContain(itemText);
    });

    test.skip("should copy prompt from history", async ({ page, context }) => {
      await context.grantPermissions(["clipboard-write", "clipboard-read"]);

      await page.goto("/history");

      // コピーボタンをクリック
      await page
        .locator('[data-testid="history-item"]')
        .first()
        .locator('button:has-text("コピー")')
        .click();

      // 成功メッセージを確認
      const toast = page.locator('[data-sonner-toast]');
      await expect(toast).toContainText(/コピー/i);
    });
  });

  test.describe("History Pagination", () => {
    test.skip("should paginate history items", async ({ page }) => {
      await page.goto("/history");

      // ページネーションボタンの存在確認
      const nextButton = page.locator('button:has-text("次へ")').or(
        page.locator('[aria-label="Next page"]')
      );

      if (await nextButton.isVisible()) {
        // 次のページに移動
        await nextButton.click();

        // URLが変更されることを確認
        await expect(page).toHaveURL(/page=2/);

        // 新しいページのコンテンツが表示されることを確認
        const historyItems = page.locator('[data-testid="history-item"]');
        await expect(historyItems.first()).toBeVisible();
      }
    });

    test.skip("should display correct page number", async ({ page }) => {
      await page.goto("/history?page=2");

      // ページ番号が正しく表示されることを確認
      const pageIndicator = page.locator('[data-testid="page-indicator"]').or(
        page.locator("text=ページ 2")
      );

      // await expect(pageIndicator).toBeVisible();
    });
  });

  test.describe("History Sorting", () => {
    test.skip("should sort history by date", async ({ page }) => {
      await page.goto("/history");

      // ソートオプションを選択
      const sortSelect = page.locator('select[name="sort"]').or(
        page.locator('[data-testid="sort-select"]')
      );

      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption("date-desc");

        // 最新の履歴が最初に表示されることを確認
        const firstItem = page.locator('[data-testid="history-item"]').first();
        await expect(firstItem).toBeVisible();
      }
    });

    test.skip("should sort history by creation date ascending", async ({
      page,
    }) => {
      await page.goto("/history");

      const sortSelect = page.locator('select[name="sort"]');

      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption("date-asc");

        // 古い履歴が最初に表示されることを確認
        const firstItem = page.locator('[data-testid="history-item"]').first();
        await expect(firstItem).toBeVisible();
      }
    });
  });

  test.describe("History Details", () => {
    test.skip("should display full prompt details", async ({ page }) => {
      await page.goto("/history");

      // 履歴アイテムをクリック
      await page.click('[data-testid="history-item"]:first-child');

      // 詳細モーダルまたは詳細ページが表示されることを確認
      const details = page.locator('[data-testid="history-details"]').or(
        page.locator('[role="dialog"]')
      );

      await expect(details).toBeVisible();

      // プロンプトテキストが表示されることを確認
      const promptText = details.locator('[data-testid="prompt-text"]').or(
        page.locator("pre")
      );
      await expect(promptText).toBeVisible();
    });

    test.skip("should display input parameters", async ({ page }) => {
      await page.goto("/history");

      await page.click('[data-testid="history-item"]:first-child');

      // 入力パラメータが表示されることを確認
      const parameters = page
        .locator('[data-testid="input-parameters"]')
        .or(page.locator("text=テーマ"));

      await expect(parameters).toBeVisible();
    });
  });
});
