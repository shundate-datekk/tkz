# OptimizedImage コンポーネント 使用ガイド

## 概要

`OptimizedImage`は、Next.jsの`next/image`コンポーネントをラップしたパフォーマンス最適化済みの画像コンポーネントです。

### 主な機能

- ✅ **自動WebP変換** - 画像を自動的にWebP形式に変換して配信（Requirement 8.2）
- ✅ **レスポンシブ画像対応** - デバイスに応じた最適なサイズの画像を配信（Requirement 8.3）
- ✅ **遅延読み込み** - スクロール時の遅延読み込みでパフォーマンス向上（Requirement 8.5）
- ✅ **CLS防止** - width/height属性で Cumulative Layout Shift を防止
- ✅ **アクセシビリティ** - alt属性必須でスクリーンリーダー対応（Requirement 7.1）

## 基本的な使い方

### 1. 固定サイズ画像

```tsx
import { OptimizedImage } from "@/components/ui";

export function MyComponent() {
  return (
    <OptimizedImage
      src="/images/product.jpg"
      alt="プロダクト画像"
      width={800}
      height={600}
    />
  );
}
```

### 2. レスポンシブ画像（sizes指定）

デバイスの画面幅に応じて適切なサイズの画像を配信します。

```tsx
<OptimizedImage
  src="/images/hero.jpg"
  alt="ヒーロー画像"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**sizes属性の意味:**
- `(max-width: 768px) 100vw` - モバイル: 画面幅の100%
- `(max-width: 1200px) 50vw` - タブレット: 画面幅の50%
- `33vw` - デスクトップ: 画面幅の33%

### 3. 優先読み込み（Above the fold）

ファーストビューに表示される重要な画像は`priority`を指定します。

```tsx
<OptimizedImage
  src="/images/hero.jpg"
  alt="ヒーロー画像"
  width={1200}
  height={600}
  priority
/>
```

### 4. Fill モード（親要素のサイズに合わせる）

親要素のサイズに合わせて画像を表示する場合。

```tsx
<div className="relative w-full h-96">
  <OptimizedImage
    src="/images/background.jpg"
    alt="背景画像"
    fill
    className="object-cover"
  />
</div>
```

**object-fit のオプション:**
- `object-cover` - 親要素全体を覆う（はみ出た部分は切り取り）
- `object-contain` - 親要素内に収まるように表示
- `object-fill` - 親要素のサイズに合わせて引き伸ばし

## アクセシビリティのベストプラクティス

### alt属性は必須

スクリーンリーダーユーザーのために、必ず適切な代替テキストを提供してください。

```tsx
// ✅ 良い例
<OptimizedImage
  src="/images/user-avatar.jpg"
  alt="ユーザーのプロフィール画像"
  width={100}
  height={100}
/>

// ❌ 悪い例
<OptimizedImage
  src="/images/user-avatar.jpg"
  alt="" // 空のalt属性
  width={100}
  height={100}
/>
```

### 装飾的な画像の場合

純粋に装飾目的で、情報を含まない画像の場合は空のalt属性を使用します。

```tsx
<OptimizedImage
  src="/images/decorative-pattern.svg"
  alt=""
  width={200}
  height={100}
/>
```

## パフォーマンス最適化のベストプラクティス

### 1. 適切なサイズを指定

実際の表示サイズに近い width/height を指定することで、最適化された画像を配信できます。

```tsx
// ❌ 大きすぎるサイズ指定
<OptimizedImage
  src="/images/thumbnail.jpg"
  alt="サムネイル"
  width={2000}
  height={1500}
/>

// ✅ 適切なサイズ指定
<OptimizedImage
  src="/images/thumbnail.jpg"
  alt="サムネイル"
  width={200}
  height={150}
/>
```

### 2. 遅延読み込みの活用

デフォルトで遅延読み込みが有効になっているため、ファーストビュー以外の画像は自動的に最適化されます。

```tsx
// ファーストビュー（優先読み込み）
<OptimizedImage src="/hero.jpg" alt="ヒーロー" width={1200} height={600} priority />

// スクロール後に表示される画像（遅延読み込み）
<OptimizedImage src="/content.jpg" alt="コンテンツ" width={800} height={600} />
```

### 3. WebP形式の活用

Next.jsは自動的に画像をWebP形式に変換するため、手動での変換は不要です。

```tsx
// JPEGを指定してもWebPに自動変換される
<OptimizedImage
  src="/images/photo.jpg"
  alt="写真"
  width={800}
  height={600}
/>
```

## 外部画像の使用

外部ドメインの画像を使用する場合は、`next.config.ts`に設定が必要です。

### next.config.ts の設定例

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/images/**',
      },
    ],
  },
};
```

### 使用例

```tsx
<OptimizedImage
  src="https://example.com/images/external-image.jpg"
  alt="外部画像"
  width={800}
  height={600}
/>
```

## トラブルシューティング

### 画像が表示されない

1. **画像ファイルのパスが正しいか確認**
   - publicフォルダからの相対パス: `/images/photo.jpg`
   - 外部URL: `https://example.com/image.jpg`

2. **外部画像の場合、next.config.tsの設定を確認**

3. **width/heightまたはfillが指定されているか確認**

### CLSが発生する

- width/height属性を必ず指定してください
- fillモードの場合、親要素に`position: relative`を設定してください

### 開発環境でalt属性の警告が表示される

- OptimizedImageコンポーネントは、alt属性が空の場合に開発環境で警告を表示します
- 装飾的な画像以外は、必ず適切なalt属性を指定してください

## 画像圧縮と最適化のベストプラクティス

### 画像追加前の準備

プロジェクトに画像を追加する前に、適切に圧縮・最適化することでパフォーマンスを向上させます。

### 推奨される画像形式

Next.jsは自動的に最適な形式に変換しますが、元画像の選択も重要です：

| 用途 | 推奨形式 | 理由 |
|------|---------|------|
| 写真・グラデーション | JPEG, PNG | 元画像として使いやすく、Next.jsがWebP/AVIFに変換 |
| ロゴ・アイコン（透過） | PNG, SVG | 透過が必要な場合はPNG、ベクター画像はSVG |
| アニメーション | GIF, WebP | Next.jsでWebPに変換可能 |

### 画像サイズの目安

実際の表示サイズに応じて、適切なサイズの画像を用意します：

| 用途 | 推奨サイズ | 例 |
|------|----------|-----|
| サムネイル | 200x150px | ツールカード、プロフィール画像 |
| コンテンツ画像 | 800x600px | 記事内の画像 |
| ヒーロー画像 | 1920x1080px | トップページのメイン画像 |
| アイコン | 64x64px, 128x128px | ナビゲーション、ボタン |

### 画像圧縮ツール

#### オンラインツール（無料）

1. **TinyPNG / TinyJPG**
   - URL: https://tinypng.com/
   - 特徴: 高品質な圧縮、PNG/JPEG対応
   - 使い方: ドラッグ&ドロップで一括圧縮

2. **Squoosh**
   - URL: https://squoosh.app/
   - 特徴: Googleが提供、WebP/AVIF変換可能
   - 使い方: ブラウザでリアルタイムプレビュー

3. **ImageOptim（Mac）**
   - URL: https://imageoptim.com/
   - 特徴: メタデータ削除、無劣化圧縮
   - 使い方: アプリにドラッグ&ドロップ

#### CLI ツール

```bash
# ImageMagick（汎用画像処理）
brew install imagemagick

# JPEGを80%品質で圧縮
magick input.jpg -quality 80 output.jpg

# PNGを圧縮
magick input.png -strip -quality 80 output.png

# Sharp（Node.js）
npm install sharp

# シャープで画像をリサイズ・圧縮
node -e "
const sharp = require('sharp');
sharp('input.jpg')
  .resize(800, 600)
  .jpeg({ quality: 80 })
  .toFile('output.jpg');
"
```

### next.config.ts の設定

`next.config.ts`で画像最適化の設定を行っています：

```typescript
images: {
  formats: ["image/avif", "image/webp"],  // WebP/AVIF自動変換
  quality: 80,                             // 品質（デフォルト75）
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### 画像最適化のワークフロー

#### 1. 元画像の準備
```bash
# 元画像をpublic/images/originalに配置
mkdir -p public/images/original
```

#### 2. 圧縮・リサイズ
```bash
# ImageMagickで一括処理
for file in public/images/original/*.jpg; do
  magick "$file" -resize 1920x1080\> -quality 80 "public/images/$(basename "$file")"
done
```

#### 3. OptimizedImageコンポーネントで使用
```tsx
<OptimizedImage
  src="/images/optimized-photo.jpg"
  alt="説明"
  width={800}
  height={600}
/>
```

### Next.jsの自動最適化の仕組み

1. **リクエスト時に最適化**
   - ブラウザがAVIFをサポート → AVIF形式で配信
   - AVIFサポートなし → WebP形式で配信
   - WebPサポートなし → 元の形式で配信

2. **キャッシュ**
   - 最適化された画像は`_next/image`に自動キャッシュ
   - 2回目以降は高速配信

3. **レスポンシブ画像**
   - sizes属性に基づいて複数サイズを自動生成
   - デバイスに最適なサイズを自動選択

### パフォーマンス測定

#### Lighthouseでの確認

```bash
# Lighthouse CLIのインストール
npm install -g @lhci/cli

# パフォーマンステスト実行
lighthouse http://localhost:3000 --view
```

#### 確認項目
- ✅ First Contentful Paint (FCP) < 3秒
- ✅ Largest Contentful Paint (LCP) < 2.5秒
- ✅ Cumulative Layout Shift (CLS) < 0.1
- ✅ 画像が適切な形式（WebP/AVIF）で配信されている
- ✅ 画像サイズが適切（表示サイズに対して2倍以内）

### よくある質問

**Q: 元画像は何形式で保存すべき？**
A: JPEG（写真）、PNG（透過が必要な画像）で保存し、Next.jsに自動変換させるのが最適です。

**Q: 既にWebP形式の画像を持っている場合は？**
A: そのまま使用できます。Next.jsはさらに最適化します。

**Q: SVG画像はどうする？**
A: SVGは`OptimizedImage`ではなく、通常の`<img>`タグで使用します（ベクター画像は最適化不要）。

```tsx
// SVGの場合
<img src="/icons/logo.svg" alt="ロゴ" className="w-12 h-12" />
```

**Q: 画像を追加するディレクトリは？**
A: `public/images/`に配置します。URLは`/images/filename.jpg`になります。

```bash
public/
  images/
    hero.jpg          # /images/hero.jpg
    products/         # /images/products/
      product1.jpg    # /images/products/product1.jpg
```

## 関連ドキュメント

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [WCAG 2.1 画像の代替テキスト](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html)
- [Web.dev: Optimize images](https://web.dev/fast/#optimize-your-images)

## サポートされる画像形式

- JPEG
- PNG
- WebP
- AVIF
- GIF
- SVG（最適化なし）

## まとめ

`OptimizedImage`コンポーネントを使用することで:
- ✅ パフォーマンスが自動的に最適化される
- ✅ レスポンシブ対応が簡単になる
- ✅ アクセシビリティが向上する
- ✅ コードの一貫性が保たれる

**原則**: 画像を表示する際は、通常の`<img>`タグや`Image`コンポーネントではなく、常に`OptimizedImage`を使用してください。
