import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/**
 * OptimizedImage Props
 *
 * next/imageをラップした最適化済み画像コンポーネント
 * Requirements: 8.2 (WebP最適化), 8.3 (レスポンシブ画像), 8.5 (遅延読み込み)
 */
export type OptimizedImageProps = ImageProps;

/**
 * OptimizedImage Component
 *
 * パフォーマンス最適化された画像コンポーネント
 *
 * Features:
 * - 自動WebP変換 (Requirement 8.2)
 * - レスポンシブ画像対応（srcset） (Requirement 8.3)
 * - 遅延読み込み（lazy loading） (Requirement 8.5)
 * - CLS（Cumulative Layout Shift）防止
 * - アクセシビリティ対応（alt属性必須） (Requirement 7.1)
 *
 * @example
 * // 基本的な使用法
 * <OptimizedImage
 *   src="/images/hero.jpg"
 *   alt="ヒーロー画像"
 *   width={1200}
 *   height={600}
 * />
 *
 * @example
 * // レスポンシブ画像
 * <OptimizedImage
 *   src="/images/product.jpg"
 *   alt="プロダクト画像"
 *   width={800}
 *   height={600}
 *   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
 * />
 *
 * @example
 * // 優先読み込み（Above the fold）
 * <OptimizedImage
 *   src="/images/hero.jpg"
 *   alt="ヒーロー画像"
 *   width={1200}
 *   height={600}
 *   priority
 * />
 *
 * @example
 * // Fill mode（親要素のサイズに合わせる）
 * <div className="relative w-full h-96">
 *   <OptimizedImage
 *     src="/images/background.jpg"
 *     alt="背景画像"
 *     fill
 *     className="object-cover"
 *   />
 * </div>
 */
export function OptimizedImage({
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  // alt属性が空の場合は警告（アクセシビリティ要件）
  if (!alt && process.env.NODE_ENV === "development") {
    console.warn(
      "OptimizedImage: alt属性は必須です。アクセシビリティのため、画像の説明を提供してください。"
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={cn(className)}
      // デフォルトで遅延読み込みを有効化（priorityがtrueの場合は無効）
      // Requirement 8.5: 遅延読み込み
      loading={props.priority ? undefined : "lazy"}
    />
  );
}
