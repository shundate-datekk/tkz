'use client';

/**
 * 高度な検索パネルコンポーネント
 * Requirements: 11.1, 11.2
 */

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdvancedSearchConditions } from '@/lib/types/search';

interface AdvancedSearchPanelProps {
  onSearch: (conditions: AdvancedSearchConditions) => void;
  resultCount?: number;
}

const CATEGORIES = [
  { value: 'text', label: 'テキスト生成' },
  { value: 'image', label: '画像生成' },
  { value: 'video', label: '動画生成' },
  { value: 'audio', label: '音声生成' },
  { value: 'code', label: 'コード生成' },
  { value: 'other', label: 'その他' },
];

export function AdvancedSearchPanel({ onSearch, resultCount }: AdvancedSearchPanelProps) {
  const [keyword, setKeyword] = useState('');
  const [operator, setOperator] = useState<'AND' | 'OR'>('AND');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(1);
  const [maxRating, setMaxRating] = useState(5);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = () => {
    const conditions: AdvancedSearchConditions = {
      operator,
      ...(keyword && { keyword }),
      ...(selectedCategories.length > 0 && { category: selectedCategories }),
      ...(minRating !== 1 || maxRating !== 5 ? { ratingRange: { min: minRating, max: maxRating } } : {}),
      ...(startDate && endDate && {
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate),
        },
      }),
    };

    onSearch(conditions);
  };

  const handleClear = () => {
    setKeyword('');
    setOperator('AND');
    setSelectedCategories([]);
    setMinRating(1);
    setMaxRating(5);
    setStartDate('');
    setEndDate('');
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Search className="h-5 w-5" />
          高度な検索
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* キーワード検索 */}
        <div className="space-y-2">
          <Label htmlFor="keyword">キーワード</Label>
          <Input
            id="keyword"
            placeholder="キーワードを入力"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* AND/OR切り替え */}
        <div className="space-y-2">
          <Label>検索条件</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={operator === 'AND' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOperator('AND')}
              data-active={operator === 'AND'}
            >
              AND
            </Button>
            <Button
              type="button"
              variant={operator === 'OR' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOperator('OR')}
              data-active={operator === 'OR'}
            >
              OR
            </Button>
          </div>
        </div>

        {/* カテゴリー選択 */}
        <div className="space-y-2">
          <Label>カテゴリー</Label>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={category.value}
                  checked={selectedCategories.includes(category.value)}
                  onCheckedChange={() => toggleCategory(category.value)}
                />
                <Label
                  htmlFor={category.value}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* 評価範囲 */}
        <div className="space-y-2">
          <Label>評価範囲</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="min-rating" className="text-xs">最小評価</Label>
              <Input
                id="min-rating"
                type="number"
                min="1"
                max="5"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                aria-label="最小評価"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="max-rating" className="text-xs">最大評価</Label>
              <Input
                id="max-rating"
                type="number"
                min="1"
                max="5"
                value={maxRating}
                onChange={(e) => setMaxRating(Number(e.target.value))}
                aria-label="最大評価"
              />
            </div>
          </div>
        </div>

        {/* 日付範囲 */}
        <div className="space-y-2">
          <Label>登録日</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="start-date" className="text-xs">開始日</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end-date" className="text-xs">終了日</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            検索
          </Button>
          <Button onClick={handleClear} variant="outline">
            <X className="h-4 w-4 mr-2" />
            クリア
          </Button>
        </div>

        {/* 結果件数 */}
        {resultCount !== undefined && (
          <div className="text-sm text-muted-foreground text-center pt-2 border-t">
            {resultCount}件ヒット
          </div>
        )}
      </CardContent>
    </Card>
  );
}
