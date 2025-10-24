import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock NextAuth
vi.mock("next-auth", () => ({
  default: vi.fn(() => ({
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: {},
  })),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: any) => children,
}));

// Mock @/auth
vi.mock("@/auth", () => ({
  auth: vi.fn(() => Promise.resolve(null)),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}));

// Mock auth helpers
vi.mock("@/lib/auth/helpers", () => ({
  getSession: vi.fn(() => Promise.resolve(null)),
  getCurrentUser: vi.fn(() => Promise.resolve(null)),
  requireAuth: vi.fn(() => Promise.resolve({ id: "test-user-id" })),
  getCurrentUserId: vi.fn(() => Promise.resolve("test-user-id")),
  isOwner: vi.fn(() => Promise.resolve(false)),
}));

// Mock Supabase
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: vi.fn().mockImplementation(({ children }: any) => children),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});
