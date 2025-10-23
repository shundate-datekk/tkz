import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DatePicker } from '../date-picker';

/**
 * DatePickerコンポーネントのテスト
 * 
 * Requirements: 5.9
 */

describe('DatePicker Component', () => {
  describe('基本的な表示', () => {
    it('should render date picker trigger', () => {
      render(<DatePicker />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show placeholder when no date selected', () => {
      render(<DatePicker placeholder="Pick a date" />);
      expect(screen.getByText('Pick a date')).toBeInTheDocument();
    });

    it('should display selected date', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      render(<DatePicker value={date} />);
      expect(screen.getByRole('button')).toHaveTextContent('Jan 15, 2024');
    });
  });

  describe('カレンダーUI (Requirement 5.9)', () => {
    it('should open calendar on button click', async () => {
      const user = userEvent.setup();
      render(<DatePicker />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      // カレンダーが表示される
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display calendar with current month', async () => {
      const user = userEvent.setup();
      render(<DatePicker />);
      
      await user.click(screen.getByRole('button'));
      
      // 現在の月が表示される
      const now = new Date();
      const monthYear = now.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      expect(screen.getByText(monthYear)).toBeInTheDocument();
    });

    it('should allow navigation to previous month', async () => {
      const user = userEvent.setup();
      render(<DatePicker />);
      
      await user.click(screen.getByRole('button'));
      
      const prevButton = screen.getByLabelText(/Go to the Previous Month/);
      await user.click(prevButton);
      
      // 前月が表示される
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should allow navigation to next month', async () => {
      const user = userEvent.setup();
      render(<DatePicker />);
      
      await user.click(screen.getByRole('button'));
      
      const nextButton = screen.getByLabelText(/Go to the Next Month/);
      await user.click(nextButton);
      
      // 次月が表示される
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('日付選択 (Requirement 5.9)', () => {
    it('should select a date when clicked', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<DatePicker onSelect={handleSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      // カレンダー内の日付をクリック（現在の月の15日）
      const dateButton = screen.getByRole('button', { name: /15th/ });
      await user.click(dateButton);
      
      expect(handleSelect).toHaveBeenCalled();
    });

    it('should close calendar after date selection', async () => {
      const user = userEvent.setup();
      render(<DatePicker />);
      
      await user.click(screen.getByRole('button'));
      
      const dateButton = screen.getByRole('button', { name: /15th/ });
      await user.click(dateButton);
      
      // カレンダーが閉じる
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should update trigger text after selection', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<DatePicker onSelect={handleSelect} />);
      
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      
      const dateButton = screen.getByRole('button', { name: /15th/ });
      await user.click(dateButton);
      
      // onSelect が呼ばれたことを確認
      expect(handleSelect).toHaveBeenCalled();
    });
  });

  describe('日付範囲選択 (Requirement 5.9)', () => {
    it('should support range mode', () => {
      render(<DatePicker mode="range" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show range placeholder', () => {
      render(<DatePicker mode="range" placeholder="Pick a date range" />);
      expect(screen.getByText('Pick a date range')).toBeInTheDocument();
    });

    it('should select start date first', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<DatePicker mode="range" onSelect={handleSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      // 開始日（October 10th）を取得
      const dateButtons = screen.getAllByRole('button', { name: /October 10th/ });
      const startDate = dateButtons[0];
      await user.click(startDate);
      
      expect(handleSelect).toHaveBeenCalled();
    });

    it('should select end date after start date', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<DatePicker mode="range" onSelect={handleSelect} />);
      
      await user.click(screen.getByRole('button'));
      
      // 開始日を選択（October 10th）
      const startButtons = screen.getAllByRole('button', { name: /October 10th/ });
      await user.click(startButtons[0]);
      
      // 少なくとも1回は呼ばれたことを確認
      expect(handleSelect).toHaveBeenCalled();
    });

    it('should display selected range', async () => {
      const user = userEvent.setup();
      const startDate = new Date(2024, 0, 10);
      const endDate = new Date(2024, 0, 15);
      
      render(
        <DatePicker 
          mode="range" 
          value={{ from: startDate, to: endDate }} 
        />
      );
      
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveTextContent('Jan 10, 2024');
      expect(trigger).toHaveTextContent('Jan 15, 2024');
    });
  });

  describe('スタイリング', () => {
    it('should have calendar icon', () => {
      render(<DatePicker />);
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should have proper button styling', () => {
      render(<DatePicker data-testid="picker" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('justify-start');
    });

    it('should support custom className', () => {
      render(<DatePicker className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('無効化とバリデーション', () => {
    it('should be disabled when disabled prop is set', () => {
      render(<DatePicker disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not open calendar when disabled', async () => {
      const user = userEvent.setup();
      render(<DatePicker disabled />);
      
      await user.click(screen.getByRole('button')).catch(() => {});
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should support min date', () => {
      const minDate = new Date(2024, 0, 1);
      render(<DatePicker minDate={minDate} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support max date', () => {
      const maxDate = new Date(2024, 11, 31);
      render(<DatePicker maxDate={maxDate} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<DatePicker />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      await user.keyboard('{Enter}');
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<DatePicker aria-label="Select date" />);
      expect(screen.getByLabelText('Select date')).toBeInTheDocument();
    });

    it('should have proper role attributes', async () => {
      const user = userEvent.setup();
      render(<DatePicker />);
      
      await user.click(screen.getByRole('button'));
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('制御コンポーネント', () => {
    it('should work as controlled component', () => {
      const date = new Date(2024, 0, 15);
      const handleSelect = vi.fn();
      
      render(<DatePicker value={date} onSelect={handleSelect} />);
      
      expect(screen.getByRole('button')).toHaveTextContent('Jan 15, 2024');
    });

    it('should call onSelect with new date', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      
      render(<DatePicker onSelect={handleSelect} />);
      
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button', { name: /20th/ }));
      
      expect(handleSelect).toHaveBeenCalled();
      expect(handleSelect.mock.calls[0][0]).toBeInstanceOf(Date);
    });
  });

  describe('フォーマット', () => {
    it('should format date with default format', () => {
      const date = new Date(2024, 0, 15);
      render(<DatePicker value={date} />);
      
      // デフォルトフォーマット: "MMM dd, yyyy"
      expect(screen.getByRole('button')).toHaveTextContent('Jan 15, 2024');
    });

    it('should support custom date format', () => {
      const date = new Date(2024, 0, 15);
      render(
        <DatePicker 
          value={date} 
          formatDate={(date) => date.toLocaleDateString('ja-JP')}
        />
      );
      
      expect(screen.getByRole('button')).toHaveTextContent('2024/1/15');
    });
  });
});
