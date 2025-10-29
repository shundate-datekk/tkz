# フォント最適化ガイド

## 概要

このプロジェクトでは、Next.jsの`next/font/google`を使用してフォントを最適化しています。これにより、パフォーマンス向上とテキストの即座表示が保証されます（Requirement 8.6）。

## 使用フォント

### 1. Inter（英語・ラテン文字）

```typescript
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  adjustFontFallback: true,
});
```

**用途**: 英語テキスト、UI要素、数字

### 2. Noto Sans JP（日本語）

```typescript
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
  preload: true,
  adjustFontFallback: true,
});
```

**用途**: 日本語テキスト、ひらがな、カタカナ、漢字

**ウェイト**:
- 400: Regular（本文）
- 500: Medium（強調）
- 700: Bold（見出し）

## フォント最適化の仕組み

### 1. `font-display: swap`（Requirement 8.6）

```typescript
display: "swap"
```

**効果**:
- フォントの読み込み中もテキストをすぐに表示
- FOIT（Flash of Invisible Text）を防止
- FOUT（Flash of Unstyled Text）戦略でUX向上

**動作**:
1. ページ読み込み時: システムフォントで即座にテキスト表示
2. カスタムフォント読み込み完了: スムーズに切り替え

### 2. プリロード（Preload）

```typescript
preload: true
```

**効果**:
- フォントファイルを優先的に読み込み
- 初回表示の高速化
- CLS（Cumulative Layout Shift）の削減

### 3. フォールバック調整（Adjust Font Fallback）

```typescript
adjustFontFallback: true
```

**効果**:
- システムフォントとカスタムフォントのサイズを調整
- フォント切り替え時のレイアウトシフトを最小化
- CLS（Cumulative Layout Shift）のさらなる削減

## CSS変数の使用

フォントはCSS変数として定義され、Tailwind CSSから参照できます。

### HTML への適用

```tsx
<html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
  <body className="font-sans">
    {children}
  </body>
</html>
```

### Tailwind CSS 設定

`tailwind.config.ts`:

```typescript
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-noto-sans-jp)", "var(--font-inter)", "sans-serif"],
      inter: ["var(--font-inter)", "sans-serif"],
      jp: ["var(--font-noto-sans-jp)", "sans-serif"],
    },
  },
}
```

### 使用例

```tsx
// デフォルト（日本語優先）
<p className="font-sans">こんにちは、Hello</p>

// 英語フォント指定
<p className="font-inter">English Text</p>

// 日本語フォント指定
<p className="font-jp">日本語テキスト</p>
```

## パフォーマンス最適化

### next/font/googleの自動最適化機能

1. **自動サブセット化**
   - 使用する文字のみをダウンロード
   - ファイルサイズの削減

2. **自己ホスティング**
   - Googleフォントをプロジェクトに自動ダウンロード
   - 外部リクエストの削減
   - プライバシーの向上

3. **キャッシュ最適化**
   - ビルド時にフォントをバンドル
   - 永続的なキャッシュ戦略

4. **CSS最適化**
   - インラインCSS生成
   - Critical CSSの自動挿入

## フォント追加方法

### 1. Google Fontsからフォントを追加

```typescript
import { Inter, Noto_Sans_JP, Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
  weight: ["400", "700"],
  preload: true,
});
```

### 2. ローカルフォントの使用

```typescript
import localFont from "next/font/local";

const customFont = localFont({
  src: "./fonts/CustomFont.woff2",
  display: "swap",
  variable: "--font-custom",
});
```

### 3. CSS変数に追加

```tsx
<html className={`${inter.variable} ${notoSansJP.variable} ${customFont.variable}`}>
```

## ベストプラクティス

### 1. 必要なウェイトのみを読み込む

```typescript
// ❌ 悪い例：全ウェイトを読み込む
const notoSansJP = Noto_Sans_JP({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// ✅ 良い例：必要なウェイトのみ
const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"], // Regular, Medium, Bold
});
```

### 2. サブセットの最適化

```typescript
// 英語のみのサイト
const inter = Inter({
  subsets: ["latin"],
});

// 多言語サイト
const inter = Inter({
  subsets: ["latin", "latin-ext"],
});
```

### 3. font-display の選択

| 値 | 効果 | 用途 |
|---|---|---|
| `swap` | テキストをすぐ表示、フォント読み込み後切り替え | 推奨（本プロジェクト使用） |
| `optional` | フォントが即座に利用可能な場合のみ使用 | 超高速表示が必要な場合 |
| `fallback` | swapとoptionalの中間 | バランス重視 |
| `block` | フォント読み込みまで待機 | 非推奨（UX悪化） |

### 4. プリロードの適切な使用

```typescript
// ✅ Above the fold のフォントはプリロード
const primaryFont = Inter({
  preload: true, // ファーストビューで使用
});

// ❌ すべてのフォントをプリロードしない
// 必要なフォントのみプリロード
```

## パフォーマンス測定

### Lighthouse での確認

```bash
# Lighthouseを実行
npm run build
npm start
lighthouse http://localhost:3000 --view
```

**確認項目**:
- ✅ Font Display: "swap"が使用されている
- ✅ Preload Key Requests: フォントがプリロードされている
- ✅ Cumulative Layout Shift (CLS) < 0.1

### Web Vitals での確認

プロジェクトに組み込まれている`WebVitals`コンポーネントで確認:

```tsx
import { WebVitals } from "@/components/analytics/web-vitals";

// app/layout.tsx
<WebVitals />
```

## トラブルシューティング

### フォントが表示されない

1. **ビルドを確認**
   ```bash
   npm run build
   ```

2. **CSS変数の適用を確認**
   ```tsx
   <html className={`${inter.variable} ${notoSansJP.variable}`}>
   ```

3. **Tailwind設定を確認**
   ```typescript
   fontFamily: {
     sans: ["var(--font-noto-sans-jp)", "sans-serif"],
   }
   ```

### フォントの切り替えが遅い

1. **プリロードを有効化**
   ```typescript
   preload: true
   ```

2. **font-displayを確認**
   ```typescript
   display: "swap"
   ```

### レイアウトシフトが発生する

1. **adjustFontFallbackを有効化**
   ```typescript
   adjustFontFallback: true
   ```

2. **フォールバックフォントを指定**
   ```typescript
   fallback: ["system-ui", "arial"]
   ```

## 関連ドキュメント

- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Google Fonts](https://fonts.google.com/)
- [Web Vitals](https://web.dev/vitals/)
- [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)

## まとめ

このプロジェクトのフォント最適化により:
- ✅ テキストの即座表示（FOIT防止）
- ✅ レイアウトシフトの最小化
- ✅ ファイルサイズの削減
- ✅ プライバシーの向上（自己ホスティング）
- ✅ パフォーマンスの向上

**原則**: フォントを追加する際は、必ず`next/font/google`または`next/font/local`を使用し、`display: "swap"`と`preload: true`を設定してください。
