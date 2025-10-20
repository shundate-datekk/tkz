import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * 認証ミドルウェア
 * 保護されたルートへのアクセスを制御
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");

  // 認証ページへのアクセス
  if (isAuthPage) {
    // ログイン済みの場合はホームにリダイレクト
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 保護されたルート
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/tools") ||
    req.nextUrl.pathname.startsWith("/prompt") ||
    req.nextUrl.pathname.startsWith("/history");

  if (isProtectedRoute && !isLoggedIn) {
    // 未認証の場合はログインページにリダイレクト
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

/**
 * ミドルウェアを適用するパス
 */
export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスにマッチ:
     * - api (APIルート)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコンファイル)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
