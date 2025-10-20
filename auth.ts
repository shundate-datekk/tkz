import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * NextAuth.js インスタンス
 */
export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
