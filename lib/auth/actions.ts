"use server";

import { signOut } from "@/auth";

/**
 * ログアウト処理
 */
export async function logout() {
  await signOut({ redirect: true, redirectTo: "/login" });
}
