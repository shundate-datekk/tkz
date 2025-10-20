# E2E テスト

このディレクトリには、Playwrightを使用したエンドツーエンド（E2E）テストが含まれています。

## セットアップ

### Playwrightブラウザのインストール

初回のみ、Playwrightブラウザをインストールする必要があります：

```bash
npx playwright install
```

すべてのブラウザ（Chromium、Firefox、WebKit）がインストールされます。

## テストの実行

### すべてのE2Eテストを実行

```bash
npm run test:e2e
```

### UIモードでテストを実行（推奨）

```bash
npm run test:e2e:ui
```

UIモードでは、テストの実行状況を視覚的に確認でき、デバッグが容易になります。

### ヘッドモードでテストを実行（ブラウザを表示）

```bash
npm run test:e2e:headed
```

ブラウザウィンドウが表示され、テストの実行を視覚的に確認できます。

### デバッグモードでテストを実行

```bash
npm run test:e2e:debug
```

Playwright Inspectorが起動し、ステップバイステップでテストをデバッグできます。

### 特定のブラウザでテストを実行

```bash
# Chromiumのみ
npx playwright test --project=chromium

# Firefoxのみ
npx playwright test --project=firefox

# WebKit（Safari）のみ
npx playwright test --project=webkit
```

### 特定のテストファイルを実行

```bash
npx playwright test navigation.spec.ts
```

### モバイルブラウザでテストを実行

```bash
# Mobile Chrome
npx playwright test --project="Mobile Chrome"

# Mobile Safari
npx playwright test --project="Mobile Safari"
```

## テストファイル

### `navigation.spec.ts`

- ナビゲーションとレイアウト
- ページアクセシビリティ
- パフォーマンステスト

### `ai-tool-management.spec.ts`

- AIツールの一覧表示
- ツールの作成、編集、削除
- フィルタリングと検索
- バリデーション

**Note:** このファイルのテストは `test.skip()` でスキップされています。認証セットアップ後に実行してください。

### `prompt-generation.spec.ts`

- プロンプト生成フォーム
- プロンプトの生成と再生成
- プロンプトのコピーと保存
- エラーハンドリング

**Note:** このファイルのテストは `test.skip()` でスキップされています。認証セットアップ後に実行してください。

### `history-management.spec.ts`

- プロンプト履歴の表示
- 履歴の検索とフィルタリング
- 履歴からの再利用
- 履歴の削除
- ページネーションとソート

**Note:** このファイルのテストは `test.skip()` でスキップされています。認証セットアップ後に実行してください。

### `responsive-ui.spec.ts`

- モバイル、タブレット、デスクトップビューのテスト
- レスポンシブレイアウト
- タッチインタラクション
- ビューポート変更の処理
- アクセシビリティ

## 認証のセットアップ

現在、多くのE2Eテストは `test.skip()` でスキップされています。これは認証が必要なためです。

### 認証セットアップの手順

1. **テスト用ユーザーを作成**

   ```bash
   npm run db:seed
   ```

2. **`e2e/auth.setup.ts` を更新**

   実際のログインフローに合わせて認証セットアップを実装します。

3. **環境変数を設定**

   `.env.test` ファイルを作成し、テスト用の資格情報を設定します：

   ```
   TEST_USER_EMAIL=test@example.com
   TEST_USER_PASSWORD=testpassword123
   ```

4. **テストからスキップを削除**

   各テストファイルで `test.skip()` を `test()` に変更します。

## テストレポート

テスト実行後、HTMLレポートが生成されます：

```bash
npx playwright show-report
```

## CI/CDでの実行

GitHub ActionsやCircleCIなどのCI環境でE2Eテストを実行する場合：

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

## トラブルシューティング

### ブラウザが起動しない

```bash
npx playwright install
```

### タイムアウトエラー

`playwright.config.ts` でタイムアウト設定を調整：

```typescript
use: {
  actionTimeout: 10000,
  navigationTimeout: 30000,
}
```

### ネットワークエラー

開発サーバーが起動していることを確認：

```bash
npm run dev
```

## ベストプラクティス

1. **データ属性を使用**
   - テスト用に `data-testid` 属性を使用
   - UIの変更に強いテストを作成

2. **適切な待機**
   - `waitForSelector` や `waitForLoadState` を使用
   - 固定の `waitForTimeout` は避ける

3. **独立したテスト**
   - 各テストは独立して実行可能にする
   - テスト間でデータを共有しない

4. **クリーンアップ**
   - テスト後にテストデータをクリーンアップ

5. **視覚的回帰テスト**
   - 必要に応じてスクリーンショット比較を使用

## 参考資料

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Playwrightベストプラクティス](https://playwright.dev/docs/best-practices)
- [Next.jsとPlaywright](https://nextjs.org/docs/testing#playwright)
