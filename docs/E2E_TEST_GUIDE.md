# E2Eテスト実行ガイド

## テスト構成

### テストファイル
- `e2e/navigation.spec.ts` - ナビゲーションとアクセシビリティ
- `e2e/ai-tool-management.spec.ts` - AIツールCRUD操作
- `e2e/prompt-generation.spec.ts` - プロンプト生成機能
- `e2e/history-management.spec.ts` - 履歴管理
- `e2e/responsive-ui.spec.ts` - レスポンシブUI

### テスト対象ブラウザ
- Chromium (デスクトップChrome)
- Firefox (デスクトップFirefox)
- WebKit (デスクトップSafari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## テスト実行方法

### 1. 全テスト実行

```bash
# すべてのテストをヘッドレスモードで実行
npm run test:e2e
```

### 2. UIモードで実行（推奨）

```bash
# Playwright UIモードで実行
npm run test:e2e:ui
```

UIモードの利点:
- テスト実行をビジュアルで確認
- 失敗したテストのデバッグが簡単
- ステップバイステップで実行可能
- スクリーンショットとトレースの確認

### 3. ブラウザ表示モードで実行

```bash
# ブラウザを表示しながらテスト実行
npm run test:e2e:headed
```

### 4. デバッグモード

```bash
# デバッグモードで実行（ステップ実行）
npm run test:e2e:debug
```

### 5. 特定のテストファイルのみ実行

```bash
# ナビゲーションテストのみ実行
npx playwright test e2e/navigation.spec.ts

# レスポンシブUIテストのみ実行
npx playwright test e2e/responsive-ui.spec.ts
```

### 6. 特定のブラウザでのみ実行

```bash
# Chromiumのみで実行
npx playwright test --project=chromium

# モバイルChromeのみで実行
npx playwright test --project="Mobile Chrome"
```

### 7. 失敗したテストのみ再実行

```bash
npx playwright test --last-failed
```

## テストレポート

### HTML レポート閲覧

```bash
# テスト実行後、レポートを開く
npx playwright show-report
```

レポートには以下が含まれます:
- テスト結果サマリー
- 失敗したテストのスクリーンショット
- トレース情報
- 実行時間

### スクリーンショット

失敗したテストのスクリーンショットは自動的に保存されます:
- 保存先: `test-results/`

### トレース

失敗したテストのトレースファイルが保存されます:
- 保存先: `test-results/`
- トレースビューアー: `npx playwright show-trace trace.zip`

## CI/CD環境での実行

### GitHub Actions（例）

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## テスト作成ガイドライン

### 1. テストの構造

```typescript
import { test, expect } from "@playwright/test";

test.describe("機能名", () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前の共通セットアップ
    await page.goto("/");
  });

  test("should do something", async ({ page }) => {
    // テストケース
    const element = page.locator("selector");
    await expect(element).toBeVisible();
  });
});
```

### 2. ベストプラクティス

#### セレクタの優先順位
1. `data-testid` 属性（最も安定）
2. `role` と `aria-label`
3. テキストコンテンツ
4. CSSクラス（最も脆弱）

```typescript
// 良い例
await page.locator('[data-testid="submit-button"]').click();
await page.getByRole('button', { name: '送信' }).click();

// 避けるべき例
await page.locator('.btn-primary.submit').click();
```

#### 待機の扱い
```typescript
// 良い例 - Playwrightの自動待機を利用
await expect(page.locator('.loading')).toBeVisible();
await expect(page.locator('.loading')).not.toBeVisible();

// 避けるべき例 - 固定時間の待機
await page.waitForTimeout(3000);
```

#### アサーションの明確化
```typescript
// 良い例
await expect(page.locator('h1')).toHaveText('AI Tools & Sora Prompt Generator');

// 悪い例
const text = await page.locator('h1').textContent();
expect(text).toBe('AI Tools & Sora Prompt Generator');
```

### 3. 認証が必要なテストの実装

```typescript
import { test as setup } from '@playwright/test';

// auth.setup.ts
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', process.env.TEST_USER_EMAIL);
  await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForURL('/');
  await page.context().storageState({ path: authFile });
});

// テストで使用
test.use({ storageState: authFile });
```

## トラブルシューティング

### よくある問題

#### 1. タイムアウトエラー

```typescript
// タイムアウトを延長
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60秒
  await page.goto('/slow-page');
});
```

#### 2. 要素が見つからない

```typescript
// 複数のセレクタを試す
const element = page.locator('[data-testid="button"]')
  .or(page.getByRole('button', { name: 'Submit' }))
  .or(page.locator('button:has-text("Submit")'));
```

#### 3. フレーキーテスト（不安定なテスト）

```typescript
// リトライ設定
test('flaky test', async ({ page }) => {
  test.setTimeout(30000);

  // 条件が満たされるまで待機
  await expect(async () => {
    const count = await page.locator('.item').count();
    expect(count).toBeGreaterThan(0);
  }).toPass();
});
```

## パフォーマンステスト

### ページ読み込み時間

```typescript
test('should load within 3 seconds', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(3000);
});
```

### Core Web Vitals

```typescript
import { chromium } from '@playwright/test';

test('should have good web vitals', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const metrics = [];

  page.on('metrics', metric => {
    metrics.push(metric);
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // メトリクスの検証
  await browser.close();
});
```

## テストカバレッジ目標

- [ ] 主要ユーザーフロー: 100%
- [ ] エラーハンドリング: 80%以上
- [ ] レスポンシブデザイン: 全ブレークポイント
- [ ] アクセシビリティ: WCAG AA準拠
- [ ] パフォーマンス: Core Web Vitals目標値達成
