import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import useSWR from 'swr';
import { SWRProvider } from '../swr-provider';

// テスト用のデータフェッチコンポーネント
function TestComponent() {
  const { data, error, isLoading, mutate } = useSWR('/api/test', async () => {
    return { message: 'Hello from SWR' };
  });

  if (isLoading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;

  return (
    <div>
      <div data-testid="data">{data?.message}</div>
      <button onClick={() => mutate()} data-testid="mutate-btn">
        Mutate
      </button>
    </div>
  );
}

// グローバル設定テスト用のコンポーネント
function ErrorTestComponent() {
  const { data, error } = useSWR('/api/error', async () => {
    throw new Error('Test error');
  });

  if (error) return <div data-testid="error-handled">Error handled</div>;
  return <div data-testid="data">{data?.message}</div>;
}

describe('SWRProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide SWR context to children', async () => {
    render(
      <SWRProvider>
        <TestComponent />
      </SWRProvider>
    );

    // ローディング状態を確認
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // データが読み込まれるまで待機
    await waitFor(() => {
      expect(screen.getByTestId('data')).toBeInTheDocument();
    });

    expect(screen.getByTestId('data').textContent).toBe('Hello from SWR');
  });

  it('should handle errors gracefully with global error handler', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <SWRProvider>
        <ErrorTestComponent />
      </SWRProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-handled')).toBeInTheDocument();
    });

    // グローバルエラーハンドラーがconsole.errorを呼んでいることを確認
    expect(consoleSpy).toHaveBeenCalledWith(
      'SWR Error:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should support revalidation', async () => {
    const user = userEvent.setup();
    let callCount = 0;

    function RevalidateTestComponent() {
      const { data, mutate } = useSWR('/api/revalidate', async () => {
        callCount++;
        return { count: callCount };
      });

      return (
        <div>
          <div data-testid="count">{data?.count}</div>
          <button onClick={() => mutate()} data-testid="revalidate-btn">
            Revalidate
          </button>
        </div>
      );
    }

    render(
      <SWRProvider>
        <RevalidateTestComponent />
      </SWRProvider>
    );

    // 初回読み込み
    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1');
    });

    // 再検証
    await user.click(screen.getByTestId('revalidate-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('2');
    });
  });

  it('should dedupe requests by default', async () => {
    let fetchCount = 0;

    function DedupeTestComponent({ id }: { id: string }) {
      const { data } = useSWR('/api/dedupe', async () => {
        fetchCount++;
        return { id, fetchCount };
      });

      return <div data-testid={`data-${id}`}>{data?.fetchCount}</div>;
    }

    render(
      <SWRProvider>
        <DedupeTestComponent id="1" />
        <DedupeTestComponent id="2" />
        <DedupeTestComponent id="3" />
      </SWRProvider>
    );

    // 3つのコンポーネントが同じキーを使用しているため、1回のみフェッチされるべき
    await waitFor(() => {
      expect(screen.getByTestId('data-1')).toBeInTheDocument();
      expect(screen.getByTestId('data-2')).toBeInTheDocument();
      expect(screen.getByTestId('data-3')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(fetchCount).toBe(1);
    });
  });

  it('should support custom fetcher configuration', async () => {
    const customFetcher = vi.fn(async (url: string) => {
      return { message: `Fetched from ${url}` };
    });

    function CustomFetcherComponent() {
      const { data } = useSWR('/api/custom', customFetcher);
      return <div data-testid="data">{data?.message}</div>;
    }

    render(
      <SWRProvider>
        <CustomFetcherComponent />
      </SWRProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('data')).toBeInTheDocument();
    });

    expect(customFetcher).toHaveBeenCalledWith('/api/custom');
    expect(screen.getByTestId('data').textContent).toBe(
      'Fetched from /api/custom'
    );
  });

  it('should provide default revalidate options', async () => {
    function RevalidateOptionsComponent() {
      const { data } = useSWR(
        '/api/options',
        async () => ({ message: 'Test' }),
        {
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        }
      );

      return <div data-testid="data">{data?.message}</div>;
    }

    render(
      <SWRProvider>
        <RevalidateOptionsComponent />
      </SWRProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('data')).toBeInTheDocument();
    });

    expect(screen.getByTestId('data').textContent).toBe('Test');
  });
});
