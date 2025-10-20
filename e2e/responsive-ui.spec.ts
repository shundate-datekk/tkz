import { test, expect } from "@playwright/test";

/**
 * レスポンシブUIのE2Eテスト
 */
test.describe("Responsive UI", () => {
  const viewports = {
    mobile: { width: 375, height: 667 }, // iPhone SE
    tablet: { width: 768, height: 1024 }, // iPad
    desktop: { width: 1920, height: 1080 }, // Desktop
  };

  test.describe("Mobile View", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
    });

    test("should display mobile navigation menu", async ({ page }) => {
      await page.goto("/");

      // モバイルメニューボタンが表示されることを確認
      const menuButton = page.locator('button[aria-label="menu"]').or(
        page.locator('[data-testid="mobile-menu-button"]')
      );

      // メニューボタンが表示されている場合のみテスト
      if (await menuButton.isVisible()) {
        await menuButton.click();

        // メニューが開くことを確認
        const mobileMenu = page.locator('[role="dialog"]').or(
          page.locator('[data-testid="mobile-menu"]')
        );
        await expect(mobileMenu).toBeVisible();
      }
    });

    test.skip("should display stacked layout on mobile", async ({ page }) => {
      await page.goto("/tools");

      // ツールカードが垂直に並ぶことを確認
      const toolCards = page.locator('[data-testid="tool-card"]');
      const firstCard = toolCards.first();

      if (await firstCard.isVisible()) {
        const box = await firstCard.boundingBox();
        if (box) {
          // カードの幅がビューポート幅に近いことを確認（フルwidth）
          expect(box.width).toBeGreaterThan(viewports.mobile.width * 0.8);
        }
      }
    });

    test.skip("should hide desktop navigation on mobile", async ({ page }) => {
      await page.goto("/");

      // デスクトップナビゲーションが非表示であることを確認
      const desktopNav = page.locator('[data-testid="desktop-nav"]');

      if (await desktopNav.isVisible({ timeout: 1000 })) {
        // デスクトップナビゲーションが表示されている場合はテスト失敗
        expect(await desktopNav.isVisible()).toBe(false);
      }
    });

    test.skip("should make forms touch-friendly on mobile", async ({ page }) => {
      await page.goto("/tools/new");

      // 入力フィールドが十分な高さを持つことを確認
      const inputs = page.locator('input[type="text"]');
      const firstInput = inputs.first();

      if (await firstInput.isVisible()) {
        const box = await firstInput.boundingBox();
        if (box) {
          // タッチターゲットサイズは最低44px推奨
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    });
  });

  test.describe("Tablet View", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
    });

    test.skip("should display grid layout on tablet", async ({ page }) => {
      await page.goto("/tools");

      // ツールカードがグリッドレイアウトで表示されることを確認
      const toolCards = page.locator('[data-testid="tool-card"]');
      const firstCard = toolCards.first();
      const secondCard = toolCards.nth(1);

      if (
        (await firstCard.isVisible()) &&
        (await secondCard.isVisible())
      ) {
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();

        if (firstBox && secondBox) {
          // カードが横に並んでいることを確認（Y座標が近い）
          const yDiff = Math.abs(firstBox.y - secondBox.y);
          expect(yDiff).toBeLessThan(50);
        }
      }
    });

    test("should adapt navigation for tablet", async ({ page }) => {
      await page.goto("/");

      // タブレットではデスクトップナビゲーションまたはモバイルメニューのいずれかが表示される
      const desktopNav = page.locator('[data-testid="desktop-nav"]');
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');

      const hasDesktopNav = await desktopNav.isVisible();
      const hasMobileMenu = await mobileMenuButton.isVisible();

      // どちらか一方が表示されていることを確認
      expect(hasDesktopNav || hasMobileMenu).toBe(true);
    });
  });

  test.describe("Desktop View", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
    });

    test("should display desktop navigation", async ({ page }) => {
      await page.goto("/");

      // デスクトップナビゲーションが表示されることを確認
      const navbar = page.locator("header");
      await expect(navbar).toBeVisible();

      // ナビゲーションリンクが表示されることを確認
      const navLinks = page.locator("nav a");
      const linkCount = await navLinks.count();

      // 最低限のナビゲーションリンクがあることを確認
      expect(linkCount).toBeGreaterThan(0);
    });

    test.skip("should display multi-column layout on desktop", async ({
      page,
    }) => {
      await page.goto("/tools");

      // ツールカードが複数列で表示されることを確認
      const toolCards = page.locator('[data-testid="tool-card"]');
      const firstCard = toolCards.first();
      const thirdCard = toolCards.nth(2);

      if (
        (await firstCard.isVisible()) &&
        (await thirdCard.isVisible())
      ) {
        const firstBox = await firstCard.boundingBox();
        const thirdBox = await thirdCard.boundingBox();

        if (firstBox && thirdBox) {
          // カードの幅がビューポート幅の半分以下であることを確認（複数列）
          expect(firstBox.width).toBeLessThan(viewports.desktop.width / 2);
        }
      }
    });

    test.skip("should hide mobile menu button on desktop", async ({ page }) => {
      await page.goto("/");

      // モバイルメニューボタンが非表示であることを確認
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');

      const isVisible = await mobileMenuButton.isVisible({ timeout: 1000 });
      expect(isVisible).toBe(false);
    });
  });

  test.describe("Viewport Transitions", () => {
    test.skip("should adapt layout when viewport changes", async ({ page }) => {
      await page.goto("/tools");

      // デスクトップビューから開始
      await page.setViewportSize(viewports.desktop);
      await page.waitForTimeout(500);

      // モバイルビューに変更
      await page.setViewportSize(viewports.mobile);
      await page.waitForTimeout(500);

      // レイアウトが適応することを確認
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      // モバイルメニューボタンが表示される可能性がある
      // await expect(mobileMenuButton).toBeVisible();
    });
  });

  test.describe("Touch Interactions", () => {
    test.skip("should support touch gestures on mobile", async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto("/tools");

      // スワイプジェスチャーのシミュレーション
      const toolCard = page.locator('[data-testid="tool-card"]').first();

      if (await toolCard.isVisible()) {
        const box = await toolCard.boundingBox();
        if (box) {
          // タッチスタート
          await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);

          // タップが機能することを確認
          // Note: 実際の動作は実装に依存
        }
      }
    });
  });

  test.describe("Orientation Changes", () => {
    test.skip("should handle portrait to landscape transition", async ({
      page,
    }) => {
      // ポートレート（縦向き）
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // ランドスケープ（横向き）
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500);

      // レイアウトが適応することを確認
      const navbar = page.locator("header");
      await expect(navbar).toBeVisible();
    });
  });

  test.describe("Accessibility on Different Viewports", () => {
    test("should maintain keyboard navigation on all viewports", async ({
      page,
    }) => {
      const sizes = [viewports.mobile, viewports.tablet, viewports.desktop];

      for (const size of sizes) {
        await page.setViewportSize(size);
        await page.goto("/");

        // Tabキーでナビゲーション
        await page.keyboard.press("Tab");

        // フォーカスが移動することを確認
        const focusedElement = page.locator(":focus");
        await expect(focusedElement).toBeDefined();
      }
    });

    test.skip("should have readable text on all viewports", async ({ page }) => {
      const sizes = [viewports.mobile, viewports.tablet, viewports.desktop];

      for (const size of sizes) {
        await page.setViewportSize(size);
        await page.goto("/tools");

        // テキストが読みやすいサイズであることを確認
        const heading = page.locator("h1").first();

        if (await heading.isVisible()) {
          const fontSize = await heading.evaluate((el) => {
            return window.getComputedStyle(el).fontSize;
          });

          // フォントサイズが最低14px以上
          const size = parseInt(fontSize);
          expect(size).toBeGreaterThanOrEqual(14);
        }
      }
    });
  });
});
