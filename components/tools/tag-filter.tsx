/**
 * タグフィルターコンポーネント
 * Requirements: 27.3
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Tag as TagIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllTagsWithCountAction } from '@/lib/actions/tag.actions';
import type { TagWithCount } from '@/lib/types/tag';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const [availableTags, setAvailableTags] = useState<TagWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // タグ一覧を取得
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      const result = await getAllTagsWithCountAction();
      if (result.success) {
        // 使用回数が多い順にソート
        const sorted = result.data.sort((a, b) => b.usage_count - a.usage_count);
        setAvailableTags(sorted);
      }
      setIsLoading(false);
    };
    fetchTags();
  }, []);

  const handleToggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 選択されたタグのバッジ表示 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              <TagIcon className="h-3 w-3" />
              {tag}
              <button
                type="button"
                onClick={() => handleToggleTag(tag)}
                className="ml-1 rounded-sm opacity-70 hover:opacity-100"
                aria-label={`${tag}を削除`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 px-2 text-xs"
          >
            クリア
          </Button>
        </div>
      )}

      {/* タグ選択ポップオーバー */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="justify-start"
          >
            <TagIcon className="mr-2 h-4 w-4" />
            タグで絞り込み
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 border-b">
            <h4 className="font-medium text-sm">タグを選択</h4>
            <p className="text-xs text-muted-foreground mt-1">
              複数選択可能です
            </p>
          </div>
          <ScrollArea className="h-72">
            <div className="p-4 space-y-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  読み込み中...
                </p>
              ) : availableTags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  タグがありません
                </p>
              ) : (
                availableTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded-md p-2"
                    onClick={() => handleToggleTag(tag.name)}
                  >
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={selectedTags.includes(tag.name)}
                      onCheckedChange={() => handleToggleTag(tag.name)}
                    />
                    <label
                      htmlFor={`tag-${tag.id}`}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {tag.name}
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {tag.usage_count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          {selectedTags.length > 0 && (
            <div className="p-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="w-full"
              >
                すべてクリア
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
