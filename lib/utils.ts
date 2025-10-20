import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS クラス名を結合するユーティリティ関数
 * clsxとtailwind-mergeを組み合わせて、競合するクラス名を自動的に解決
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
