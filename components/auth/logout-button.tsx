"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";

interface LogoutButtonProps {
  children?: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

export function LogoutButton({
  children = "ログアウト",
  variant = "ghost",
  className,
}: LogoutButtonProps) {
  return (
    <form action={logout}>
      <Button type="submit" variant={variant} className={className}>
        {children}
      </Button>
    </form>
  );
}
