/**
 * SavedSearchList コンポーネント
 * 保存済み検索の一覧を表示
 * Requirements: 11.4
 */

'use client';

import { useEffect, useState } from 'react';
import { Bookmark, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  getSavedSearchesAction,
  deleteSavedSearchAction,
} from '@/lib/actions/saved-search.actions';
import type { SavedSearch } from '@/lib/types/saved-search';
import type { AdvancedSearchConditions } from '@/lib/types/search';

interface SavedSearchListProps {
  onSelectSearch: (conditions: AdvancedSearchConditions) => void;
}

export function SavedSearchList({ onSelectSearch }: SavedSearchListProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<SavedSearch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    setIsLoading(true);
    const result = await getSavedSearchesAction();
    if (result.success) {
      setSavedSearches(result.data);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const result = await deleteSavedSearchAction(deleteTarget.id);
    if (result.success) {
      setSavedSearches((prev) =>
        prev.filter((search) => search.id !== deleteTarget.id)
      );
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <Bookmark className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
        <p className="mt-3 text-sm text-muted-foreground">
          保存済み検索はありません
        </p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="group flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <button
                onClick={() => onSelectSearch(search.conditions)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{search.name}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(search.created_at).toLocaleDateString('ja-JP')}
                </p>
              </button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => setDeleteTarget(search)}
                aria-label="削除"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>保存済み検索を削除</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteTarget?.name}」を削除してもよろしいですか？
              <br />
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  削除中...
                </>
              ) : (
                '削除'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
