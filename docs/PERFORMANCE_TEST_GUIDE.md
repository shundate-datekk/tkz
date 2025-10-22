# パフォーマンステストガイド

## Web Vitals測定

### Core Web Vitals目標値

| メトリクス | 目標値 | 説明 |
|----------|--------|------|
| **LCP** (Largest Contentful Paint) | < 2.5秒 | 最大コンテンツの描画時間 |
| **FID** (First Input Delay) | < 100ms | 初回入力遅延 |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 累積レイアウトシフト |
| **FCP** (First Contentful Paint) | < 1.8秒 | 最初のコンテンツ描画 |
| **TTFB** (Time to First Byte) | < 800ms | 最初のバイト到達時間 |
| **INP** (Interaction to Next Paint) | < 200ms | 次のペイントまでのインタラクション時間 |

### 測定方法

#### 1. ブラウザDevTools（開発環境）

```bash
# 開発サーバー起動
npm run dev
```

1. Chrome DevToolsを開く（F12）
2. Lighthouseタブを選択
3. カテゴリで「パフォーマンス」を選択
4. 「レポートを生成」をクリック

#### 2. コマンドライン（本番ビルド）

```bash
# 本番ビルド作成
npm run build

# 本番サーバー起動
npm start

# Lighthouse CLI実行（別ターミナル）
npx lighthouse http://localhost:3000 --view

# JSON形式で保存
npx lighthouse http://localhost:3000 --output json --output-path ./lighthouse-report.json
```

#### 3. Web Vitalsコンポーネント

アプリ内に統合済みの`WebVitals`コンポーネントが自動的にメトリクスを収集します。

**開発環境**: ブラウザコンソールに出力
**本番環境**: Google Analyticsに送信（設定済みの場合）

### パフォーマンス改善チェックリスト

- [x] next/font/googleでフォント最適化
- [x] 動的インポートでコード分割 (PromptGenerator)
- [x] loading.tsxでストリーミングUI
- [x] transformベースのCSSアニメーション
- [ ] 画像最適化（next/image）※現在画像未使用
- [x] Tailwind CSSで未使用スタイル削除

## バンドルサイズ分析

### Next.js自動分析

```bash
# 本番ビルド実行
npm run build
```

ビルド出力例:
```
Route (app)                              Size     First Load JS
┌ ○ /                                    1.2 kB         85.3 kB
├ ○ /history                             2.5 kB         87.6 kB
├ ○ /prompt                              3.1 kB         88.2 kB
└ ○ /tools                               2.8 kB         87.9 kB

○  (Static)  prerendered as static content
```

### 目標値

- **First Load JS**: < 200 KB (gzipped)
- **ページ個別サイズ**: < 50 KB

### バンドルアナライザー（オプション）

```bash
# @next/bundle-analyzerインストール
npm install --save-dev @next/bundle-analyzer

# next.config.jsに追加
# const withBundleAnalyzer = require('@next/bundle-analyzer')({
#   enabled: process.env.ANALYZE === 'true',
# })
# module.exports = withBundleAnalyzer(nextConfig)

# 分析実行
ANALYZE=true npm run build
```

ブラウザが自動的に開き、バンドル構成を可視化します。

## パフォーマンス最適化実績

### 実装済み最適化

1. **フォント最適化**
   - next/font/googleでInter、Noto Sans JPを最適化
   - display: swapでFOUTを防止
   - 自動サブセット化

2. **コード分割**
   - PromptGeneratorを動的インポート
   - ルートセグメント単位の自動分割

3. **ストリーミングUI**
   - loading.tsxでスケルトン表示
   - Suspenseによる段階的レンダリング

4. **CSSアニメーション**
   - transform/opacityベースで高速化
   - レイアウト再計算を回避

5. **キャッシュ戦略**
   - Next.js自動キャッシュ
   - フォント、静的アセットの長期キャッシュ

## テスト実行手順

### 1. 開発環境でのクイックチェック

```bash
# 開発サーバー起動
npm run dev

# ブラウザでhttp://localhost:3000にアクセス
# DevToolsのLighthouseでパフォーマンスチェック
```

### 2. 本番環境シミュレーション

```bash
# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lighthouse実行
npx lighthouse http://localhost:3000 --view
```

### 3. 継続的モニタリング

本番環境デプロイ後:
- Vercel Analyticsダッシュボードで監視
- Google Search ConsoleのCore Web Vitalsレポート確認
- Real User Monitoring (RUM)データの分析

## ベンチマーク結果記録

### 実施日: 2025-10-22 (UIUX包括的改善プロジェクト完了後)

#### Web Vitals
- LCP: 3.0 秒 (目標: < 2.5秒) ⚠️
- FID: 90 ms (目標: < 100ms) ✅
- CLS: 0 (目標: < 0.1) ✅
- FCP: 1.5 秒 (目標: < 1.8秒) ✅
- TTFB: N/A
- INP: N/A
- TBT: 40 ms (非常に優秀) ✅
- TTI: 3.0 秒

#### Lighthouseスコア
- パフォーマンス: **94** / 100 ✅
- アクセシビリティ: **100** / 100 ✅
- ベストプラクティス: **96** / 100 ✅
- SEO: **100** / 100 ✅

#### バンドルサイズ
- First Load JS (ホーム `/`): 129 KB ✅
- First Load JS (ツール一覧 `/tools`): 172 KB ✅
- First Load JS (プロンプト生成 `/prompt`): 190 KB ✅
- First Load JS (履歴 `/history`): 191 KB ✅
- Middleware: 86.6 KB

**すべてのページが目標値 200 KB 以下を達成！**

#### 改善が必要な項目
1. LCPが3.0秒とやや長め（目標2.5秒未満）
   - Vercel本番環境ではCDNとエッジネットワークで改善される見込み
   - フォント最適化は実装済み（next/font/google + display: swap）
2. ブラウザコンソールエラーが1件検出
   - E2Eテスト時のReact.Children.only問題は修正済み
3. 今後の追加最適化候補
   - 画像最適化（現在未使用）
   - Service WorkerによるPWA化
   - HTTP/3対応（Vercel自動対応済み）

#### 総合評価
**優秀** - アクセシビリティ・SEOが満点、パフォーマンスも94点の高スコアを達成。Core Web Vitalsも多くの指標で目標達成。
