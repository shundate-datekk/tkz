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
        console.log('[AUTH] Starting authorization...');

        if (!credentials?.username || !credentials?.password) {
          console.log('[AUTH] Missing credentials');
          return null;
        }

        console.log('[AUTH] Credentials received:', {
          username: credentials.username,
          passwordLength: (credentials.password as string).length
        });

        try {
          // ユーザー情報を取得
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("username", credentials.username as string)
            .single();

          console.log('[AUTH] Supabase query result:', {
            found: !!user,
            error: error?.message,
            errorDetails: error
          });

          if (error || !user) {
            console.log('[AUTH] User not found or query error');
            return null;
          }

          // 型アサーション（Supabaseの型が正しく推論されない場合の対処）
          const userData = user as any;

          console.log('[AUTH] User data retrieved:', {
            id: userData.id,
            username: userData.username,
            displayName: userData.display_name,
            hasPasswordHash: !!userData.password_hash,
            hashLength: userData.password_hash?.length,
            hashPreview: userData.password_hash?.substring(0, 10)
          });

          // パスワード検証
          console.log('[AUTH] Starting password verification...');
          const isValid = await bcrypt.compare(
            credentials.password as string,
            userData.password_hash
          );

          console.log('[AUTH] Password verification result:', {
            isValid,
            providedPassword: credentials.password,
            storedHashPreview: userData.password_hash?.substring(0, 20)
          });

          if (!isValid) {
            console.log('[AUTH] Invalid password');
            return null;
          }

          console.log('[AUTH] Authentication successful!');

          // 認証成功 - ユーザー情報を返す
          return {
            id: userData.id,
            name: userData.display_name,
            email: userData.username, // emailフィールドが必須なのでusernameを使用
          };
        } catch (error) {
          console.error("[AUTH] Authentication error:", error);
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
