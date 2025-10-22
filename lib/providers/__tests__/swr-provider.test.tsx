import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SWRProvider } from '../swr-provider';
import useSWR from 'swr';

/**
 * SWRProviderのテスト
 *
 * このテストは、SWRのグローバル設定、データフェッチング、
 * Server Actionsとの統合を検証します。
 *
 * Requirements: 14.3
 */

// テスト用のServer Action（モック）
const mockServerAction = vi.fn(async (key: string) => {
  return { success: true, data: `Data for ${key}` };
});

// テスト用コンポーネント
function TestComponent({ testKey }: { testKey: string }) {
  const { data, error, isLoading } = useSWR(testKey, mockServerAction);

  if (isLoading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;
  if (!data) return <div data-testid="no-data">No data</div>;

  return <div data-testid="data">{data.data}</div>;
}

describe('SWRProvider', () => {
  it('should provide SWR configuration to children', async () => {
    render(
      <SWRProvider>
        <TestComponent testKey="test-key-1" />
      </SWRProvider>
    );

    // ローディング状態を確認
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // データ取得完了を待機
    await waitFor(() => {
      expect(screen.getByTestId('data')).toBeInTheDocument();
    });

    expect(screen.getByTestId('data')).toHaveTextContent('Data for test-key-1');
  });

  it('should call fetcher with correct key', async () => {
    mockServerAction.mockClear();

    render(
      <SWRProvider>
        <TestComponent testKey="test-key-2" />
      </SWRProvider>
    );

    await waitFor(() => {
      expect(mockServerAction).toHaveBeenCalledWith('test-key-2');
    });
  });

  it('should handle errors from server actions', async () => {
    const errorAction = vi.fn(async () => {
      throw new Error('Server error');
    });

    function ErrorTestComponent() {
      const { error } = useSWR('error-key', errorAction);

      if (error) return <div data-testid="error">Error: {error.message}</div>;
      return <div data-testid="no-error">No error</div>;
    }

    render(
      <SWRProvider>
        <ErrorTestComponent />
      </SWRProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('error')).toHaveTextContent('Server error');
  });

  it('should deduplicate requests with same key', async () => {
    mockServerAction.mockClear();

    function MultipleComponents() {
      return (
        <>
          <TestComponent testKey="dedup-key" />
          <TestComponent testKey="dedup-key" />
          <TestComponent testKey="dedup-key" />
        </>
      );
    }

    render(
      <SWRProvider>
        <MultipleComponents />
      </SWRProvider>
    );

    await waitFor(() => {
      // 同じキーに対しては1回しか呼ばれない（deduplication）
      expect(mockServerAction).toHaveBeenCalledTimes(1);
    });
  });
});
