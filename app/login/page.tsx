import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "ログイン | AI Tools & Sora Prompt Generator",
  description: "アカウントにログイン",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            AI Tools & Sora Prompt Generator
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            アカウントにログインしてください
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
