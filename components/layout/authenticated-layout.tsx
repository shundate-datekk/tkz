import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { SidebarNavigation } from "./sidebar-navigation";
import { BottomNavigation } from "./bottom-navigation";

interface AuthenticatedLayoutProps {
  children: ReactNode;
  userName?: string;
}

export function AuthenticatedLayout({
  children,
  userName,
}: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar Navigation */}
      <SidebarNavigation userName={userName} />

      {/* Mobile Top Navbar */}
      <Navbar userName={userName} />

      {/* Main Content with sidebar offset on desktop and bottom padding on mobile */}
      <main className="pb-20 md:pb-0 md:ml-64">{children}</main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNavigation />
    </div>
  );
}
