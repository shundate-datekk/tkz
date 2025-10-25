/**
 * TagInput コンポーネント
 * カンマ区切りタグ入力とオートコンプリート
 * Requirements: 11.5
 */

'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAllTagsWithCountAction } from '@/lib/actions/tag.actions';
import type { TagWithCount } from '@/lib/types/tag';

interface TagInputProps {
  value: string[]; // タグ名の配列
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function TagInput({
  value,
  onChange,
  label = 'タグ',
  placeholder = 'タグを入力（カンマ区切り）',
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<TagWithCount[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allTags, setAllTags] = useState<TagWithCount[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 全タグを取得
  useEffect(() => {
    const fetchTags = async () => {
      const result = await getAllTagsWithCountAction();
      if (result.success) {
        setAllTags(result.data);
      }
    };
    fetchTags();
  }, []);

  // 入力値に基づいて候補を更新
  useEffect(() => {
    const query = inputValue.toLowerCase().trim();
    const filtered = allTags
      .filter((tag) => {
        const matchesQuery = !query || tag.name.toLowerCase().includes(query);
        const isDuplicate = value.some((v) => v.toLowerCase() === tag.name.toLowerCase());
        return matchesQuery && !isDuplicate;
      })
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 5);
    setSuggestions(filtered);
  }, [inputValue, allTags, value]);

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    // 大文字小文字を区別しない重複チェック
    const isDuplicate = value.some((tag) => tag.toLowerCase() === trimmed.toLowerCase());
    if (trimmed && !isDuplicate) {
      onChange([...value, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // カンマが入力されたら、カンマの前の部分をタグとして追加
    if (newValue.includes(',')) {
      const parts = newValue.split(',');
      const tagsToAdd = parts.slice(0, -1).map((t) => t.trim()).filter(Boolean);

      // 大文字小文字を区別しない重複除去
      const newTags = [...value];
      tagsToAdd.forEach((tag) => {
        const isDuplicate = newTags.some((existing) => existing.toLowerCase() === tag.toLowerCase());
        if (!isDuplicate) {
          newTags.push(tag);
        }
      });
      onChange(newTags);

      // 最後の部分（カンマの後）を入力値として保持
      setInputValue(parts[parts.length - 1]);
    } else {
      setInputValue(newValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // 入力が空でBackspaceを押した場合、最後のタグを削除
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      {/* 選択済みタグ */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 rounded-sm opacity-70 hover:opacity-100"
                aria-label={`${tag}を削除`}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 入力フィールド */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          disabled={disabled}
        />

        {/* オートコンプリート候補 */}
        {showSuggestions && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-1 shadow-md" role="listbox">
            {suggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => addTag(tag.name)}
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <span className="font-medium">{tag.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({tag.usage_count}個のツール)
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        カンマ区切りで複数のタグを入力できます
      </p>
    </div>
  );
}
