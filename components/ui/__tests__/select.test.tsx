import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '../select';

/**
 * Selectコンポーネントのテスト
 * 
 * Requirements: 5.6
 */

describe('Select Components', () => {
  describe('視認性向上 (Requirement 5.6)', () => {
    it('should have white background', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('bg-white');
    });

    it('should have 2px border', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('border-2');
      expect(trigger).toHaveClass('border-input');
    });

    it('should have blue focus ring (2px)', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('focus:ring-2');
      expect(trigger).toHaveClass('focus:ring-blue-500');
      expect(trigger).toHaveClass('focus:border-blue-500');
    });

    it('should have hover border color change', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('hover:border-blue-300');
    });

    it('should have transition-colors', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('transition-colors');
    });

    it('should have shadow', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('shadow-sm');
    });
  });

  describe('ダークモード対応 (Requirement 5.6)', () => {
    it('should have dark mode background', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('dark:bg-gray-900');
    });

    it('should have dark mode border in content', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent data-testid="content">
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('dark:border-gray-700');
    });
  });

  describe('基本的な機能', () => {
    it('should render trigger with placeholder', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should render items when open', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should render group with label', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group Label</SelectLabel>
              <SelectItem value="1">Item 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      expect(screen.getByText('Group Label')).toBeInTheDocument();
    });
  });

  describe('スタイリング', () => {
    it('should have proper sizing (h-10)', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('h-10');
    });

    it('should have full width', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('w-full');
    });

    it('should have proper padding', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('px-3');
      expect(trigger).toHaveClass('py-2');
    });

    it('should have rounded corners', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('rounded-md');
    });

    it('should have proper text size', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('text-sm');
    });
  });

  describe('アイテムのスタイリング', () => {
    it('should have focus styles on items', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1" data-testid="item">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );
      const item = screen.getByTestId('item');
      expect(item).toHaveClass('focus:bg-blue-50');
      expect(item).toHaveClass('dark:focus:bg-blue-900');
    });

    it('should have hover styles on items', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1" data-testid="item">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );
      const item = screen.getByTestId('item');
      expect(item).toHaveClass('hover:bg-gray-100');
      expect(item).toHaveClass('dark:hover:bg-gray-800');
    });

    it('should have transition on items', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1" data-testid="item">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );
      const item = screen.getByTestId('item');
      expect(item).toHaveClass('transition-colors');
    });
  });

  describe('無効化状態', () => {
    it('should be disabled when disabled prop is set', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeDisabled();
    });

    it('should have disabled styles', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('disabled:cursor-not-allowed');
      expect(trigger).toHaveClass('disabled:opacity-50');
    });
  });

  describe('アクセシビリティ', () => {
    it('should support custom aria-label', () => {
      render(
        <Select>
          <SelectTrigger aria-label="Choose option">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByLabelText('Choose option')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('type', 'button');
    });

    it('should have proper focus outline', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('focus:outline-none');
    });
  });

  describe('コンテンツのアニメーション', () => {
    it('should have open animation', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent data-testid="content">
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('data-[state=open]:animate-in');
      expect(content).toHaveClass('data-[state=open]:fade-in-0');
      expect(content).toHaveClass('data-[state=open]:zoom-in-95');
    });

    it('should have close animation', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent data-testid="content">
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('data-[state=closed]:animate-out');
      expect(content).toHaveClass('data-[state=closed]:fade-out-0');
      expect(content).toHaveClass('data-[state=closed]:zoom-out-95');
    });
  });
});
