declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

    // OpenAI
    OPENAI_API_KEY: string;

    // NextAuth
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
  }
}
