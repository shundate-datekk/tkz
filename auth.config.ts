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
        // maxAge は動的に設定されます（jwt callbackで制御）
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
          console.log("[NextAuth signIn] User ID:", user.id);
          console.log("[NextAuth signIn] Email:", user.email);

          // usersテーブルにユーザーを作成/更新
          const { data, error } = await (supabase as any)
            .from("users")
            .upsert(
              {
                id: user.id, // NextAuth.jsが生成したID
                email: user.email,
                display_name: user.name || "Anonymous",
                email_verified: (profile as any)?.email_verified || false,
                image: user.image,
                provider: "google",
                provider_account_id: account.providerAccountId,
                username: null,
                password_hash: null,
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: "id",
              }
            )
            .select()
            .single();

          if (error) {
            console.error("[NextAuth signIn] Failed to create/update user:", error);
            // エラーが発生してもログインは継続（usersテーブルへの保存失敗は致命的ではない）
            // ただし、外部キー制約があるため、実際にはツール作成時にエラーになる
          } else {
            console.log("[NextAuth signIn] User created/updated successfully:", data?.id);
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
        // Google OAuthの場合、user.idはGoogle account IDになる
        token.id = user.id || account?.providerAccountId;
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
};
