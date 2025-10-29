import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/ui/breadcrumb";

/**
 * マイページのローディング状態
 */
export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="space-y-8">
          {/* User Info Skeleton */}
          <Skeleton className="h-48 w-full" />

          {/* Favorite Prompts Skeleton */}
          <div>
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
