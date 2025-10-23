'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DatePickerProps {
  value?: Date | DateRange;
  onSelect?: (date: Date | DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  mode?: 'single' | 'range';
  minDate?: Date;
  maxDate?: Date;
  formatDate?: (date: Date) => string;
  'aria-label'?: string;
  'data-testid'?: string;
}

export function DatePicker({
  value,
  onSelect,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  mode = 'single',
  minDate,
  maxDate,
  formatDate,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // 日付フォーマット関数
  const defaultFormatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const formatter = formatDate || defaultFormatDate;

  // 表示テキストを生成
  const getDisplayText = () => {
    if (mode === 'range' && value && typeof value === 'object' && 'from' in value) {
      const range = value as DateRange;
      if (range.from) {
        if (range.to) {
          return `${formatter(range.from)} - ${formatter(range.to)}`;
        }
        return formatter(range.from);
      }
    } else if (value && value instanceof Date) {
      return formatter(value);
    }
    return placeholder;
  };

  // 日付選択ハンドラー
  const handleSelect = (newValue: Date | DateRange | undefined) => {
    if (mode === 'single' && newValue instanceof Date) {
      onSelect?.(newValue);
      setOpen(false);
    } else if (mode === 'range') {
      onSelect?.(newValue);
      // 範囲選択の場合、両方の日付が選択されたら閉じる
      if (newValue && typeof newValue === 'object' && 'from' in newValue && newValue.to) {
        setOpen(false);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
          aria-label={ariaLabel}
          data-testid={dataTestId}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {mode === 'single' ? (
          <DayPicker
            mode="single"
            selected={value instanceof Date ? value : undefined}
            onSelect={handleSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
          />
        ) : (
          <DayPicker
            mode="range"
            selected={value && typeof value === 'object' && 'from' in value ? value : undefined}
            onSelect={handleSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
            numberOfMonths={2}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
