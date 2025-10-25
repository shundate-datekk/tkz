/**
 * 高度な検索パネルコンポーネントのテスト
 * Requirements: 11.1, 11.2
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdvancedSearchPanel } from '../advanced-search-panel';
import type { AdvancedSearchConditions } from '@/lib/types/search';

describe('AdvancedSearchPanel', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('パネルが正しくレンダリングされるべき', () => {
    render(<AdvancedSearchPanel onSearch={mockOnSearch} />);

    expect(screen.getByText('高度な検索')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('キーワードを入力')).toBeInTheDocument();
  });

  it('AND/OR切り替えが動作するべき', () => {
    render(<AdvancedSearchPanel onSearch={mockOnSearch} />);

    const andButton = screen.getByRole('button', { name: /AND/i });
    const orButton = screen.getByRole('button', { name: /OR/i });

    // 初期状態はAND
    expect(andButton).toHaveAttribute('data-active', 'true');

    // ORに切り替え
    fireEvent.click(orButton);
    expect(orButton).toHaveAttribute('data-active', 'true');
  });

  it('キーワード入力が動作するべき', async () => {
    render(<AdvancedSearchPanel onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('キーワードを入力');
    fireEvent.change(input, { target: { value: 'ChatGPT' } });

    await waitFor(() => {
      expect(input).toHaveValue('ChatGPT');
    });
  });

  it('カテゴリー選択が動作するべき', () => {
    render(<AdvancedSearchPanel onSearch={mockOnSearch} />);

    const textCheckbox = screen.getByLabelText('テキスト生成');
    fireEvent.click(textCheckbox);

    expect(textCheckbox).toBeChecked();
  });

  it('評価範囲スライダーが動作するべき', () => {
    render(<AdvancedSearchPanel onSearch={mockOnSearch} />);

    const minSlider = screen.getByLabelText('最小評価') as HTMLInputElement;
    const maxSlider = screen.getByLabelText('最大評価') as HTMLInputElement;

    fireEvent.change(minSlider, { target: { value: '3' } });
    fireEvent.change(maxSlider, { target: { value: '5' } });

    expect(minSlider.value).toBe('3');
    expect(maxSlider.value).toBe('5');
  });

  it('検索ボタンクリック時にonSearchが呼ばれるべき', async () => {
    render(<AdvancedSearchPanel onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('キーワードを入力');
    fireEvent.change(input, { target: { value: 'Test' } });

    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: 'Test',
          operator: 'AND',
        })
      );
    });
  });

  it('クリアボタンで条件がリセットされるべき', async () => {
    render(<AdvancedSearchPanel onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('キーワードを入力');
    fireEvent.change(input, { target: { value: 'Test' } });

    const clearButton = screen.getByRole('button', { name: 'クリア' });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('結果件数が表示されるべき', () => {
    render(<AdvancedSearchPanel onSearch={mockOnSearch} resultCount={42} />);

    expect(screen.getByText('42件ヒット')).toBeInTheDocument();
  });
});
