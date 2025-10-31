import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { createClient } from "@/lib/supabase/server";

/**
 * NextAuth.js 設定
 * Google OAuth認証を使用
 */
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日間
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    /**
     * サインイン時の処理
     * Google OAuthログイン時にusersテーブルにユーザーレコードを作成/更新
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const supabase = await createClient();

          console.log("[NextAuth signIn] Creating/updating user in database");
          console.log("[NextAuth signIn] Email:", user.email);
          console.log("[NextAuth signIn] Provider Account ID:", account.providerAccountId);

          // 既存のユーザーをemailで検索
          const { data: existingUser } = await (supabase as any)
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

          if (existingUser) {
            // 既存ユーザーを更新
            const { error: updateError } = await (supabase as any)
              .from("users")
              .update({
                display_name: user.name || "Anonymous",
                email_verified: (profile as any)?.email_verified || false,
                image: user.image,
                provider: "google",
                provider_account_id: account.providerAccountId,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingUser.id);

            if (updateError) {
              console.error("[NextAuth signIn] Failed to update user:", updateError);
            } else {
              console.log("[NextAuth signIn] User updated successfully:", existingUser.id);
              // トークンにユーザーIDを設定（jwtコールバックで使用）
              user.id = existingUser.id;
            }
          } else {
            // 新規ユーザーを作成
            const { data: newUser, error: insertError } = await (supabase as any)
              .from("users")
              .insert({
                email: user.email,
                display_name: user.name || "Anonymous",
                email_verified: (profile as any)?.email_verified || false,
                image: user.image,
                provider: "google",
                provider_account_id: account.providerAccountId,
                username: null,
                password_hash: null,
              })
              .select("id")
              .single();

            if (insertError) {
              console.error("[NextAuth signIn] Failed to create user:", insertError);
            } else {
              console.log("[NextAuth signIn] User created successfully:", newUser.id);
              // トークンにユーザーIDを設定（jwtコールバックで使用）
              user.id = newUser.id;
            }
          }
        } catch (error) {
          console.error("[NextAuth signIn] Unexpected error:", error);
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // 初回ログイン時: userオブジェクトからIDを取得
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      // セッションにユーザー情報を設定
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string | undefined;
      }
      return session;
    },
  },
};;
