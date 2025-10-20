import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase/client";

/**
 * NextAuth.js 設定
 * Credentials Providerを使用したユーザー名/パスワード認証
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // ユーザー情報を取得
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("username", credentials.username as string)
            .single();

          if (error || !user) {
            return null;
          }

          // 型アサーション（Supabaseの型が正しく推論されない場合の対処）
          const userData = user as any;

          // パスワード検証
          const isValid = await bcrypt.compare(
            credentials.password as string,
            userData.password_hash
          );

          if (!isValid) {
            return null;
          }

          // 認証成功 - ユーザー情報を返す
          return {
            id: userData.id,
            name: userData.display_name,
            email: userData.username, // emailフィールドが必須なのでusernameを使用
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24時間
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
