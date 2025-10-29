# カスタムフック (Custom Hooks)

このディレクトリには、TKZアプリケーションで使用するカスタムフックが含まれています。

## データフェッチング用SWRフック

### use-ai-tools.ts

AIツール一覧を取得するためのSWRフック群。

#### useAITools

AIツール一覧を取得します。

```tsx
import { useAITools } from "@/lib/hooks/use-ai-tools";

function AIToolsPage() {
  const { tools, isLoading, error, mutate } = useAITools({
    category: "画像生成",
    rating: 5,
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラーが発生しました</div>;

  return (
    <div>
      {tools.map((tool) => (
        <div key={tool.id}>{tool.tool_name}</div>
      ))}
    </div>
  );
}
```

**パラメータ:**
- `filter?: AIToolFilter` - フィルタ条件（category, rating, created_by, search）
- `sortBy?: AIToolSortBy` - ソート項目（デフォルト: "usage_date"）
- `sortOrder?: SortOrder` - ソート順序（デフォルト: "desc"）

**戻り値:**
- `tools: AITool[]` - AIツール一覧
- `isLoading: boolean` - ローディング状態
- `isValidating: boolean` - 再検証中かどうか
- `error: any` - エラー
- `mutate: () => void` - 手動でキャッシュを更新

**キャッシュ設定:**
- dedupingInterval: 5分間
- revalidateOnFocus: true
- revalidateOnReconnect: true

#### useAITool

特定のAIツールを取得します。

```tsx
import { useAITool } from "@/lib/hooks/use-ai-tools";

function AIToolDetailPage({ toolId }: { toolId: string }) {
  const { tool, isLoading, error } = useAITool(toolId);

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラーが発生しました</div>;
  if (!tool) return <div>AIツールが見つかりませんでした</div>;

  return <div>{tool.tool_name}</div>;
}
```

**パラメータ:**
- `toolId: string | null` - AIツールID

**キャッシュ設定:**
- dedupingInterval: 10分間（詳細ページは更新頻度が低い）

#### useUserAITools

ユーザーが作成したAIツール一覧を取得します。

```tsx
import { useUserAITools } from "@/lib/hooks/use-ai-tools";

function UserToolsPage({ userId }: { userId: string }) {
  const { tools, isLoading, error } = useUserAITools(userId);
  // ...
}
```

### use-prompt-history.ts

プロンプト履歴を取得するためのSWRフック群。

#### usePromptHistory

プロンプト履歴一覧を取得します。

```tsx
import { usePromptHistory } from "@/lib/hooks/use-prompt-history";

function HistoryPage() {
  const {
    histories,
    isLoading,
    error,
    refresh,
    addHistoryOptimistic,
    deleteHistoryOptimistic,
  } = usePromptHistory();

  // 新しい履歴を追加（楽観的更新）
  const handleSave = async (newHistory: PromptHistory) => {
    addHistoryOptimistic(newHistory);
    // サーバーに保存...
  };

  // 履歴を削除（楽観的更新）
  const handleDelete = async (historyId: string) => {
    deleteHistoryOptimistic(historyId);
    // サーバーで削除...
  };

  return (
    <div>
      {histories.map((history) => (
        <div key={history.id}>{history.generated_prompt}</div>
      ))}
    </div>
  );
}
```

**戻り値:**
- `histories: PromptHistory[]` - プロンプト履歴一覧
- `isLoading: boolean` - ローディング状態
- `isValidating: boolean` - 再検証中かどうか
- `error: any` - エラー
- `refresh: () => void` - 手動でキャッシュを更新
- `addHistoryOptimistic: (newHistory: PromptHistory) => void` - 楽観的更新で履歴を追加
- `deleteHistoryOptimistic: (historyId: string) => void` - 楽観的更新で履歴を削除

**キャッシュ設定:**
- dedupingInterval: 2秒間
- revalidateOnFocus: true
- revalidateOnReconnect: true
- fallbackData: []

#### usePromptHistorySearch

プロンプト履歴を検索します。

```tsx
import { usePromptHistorySearch } from "@/lib/hooks/use-prompt-history";

function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const { searchResults, isLoading, error } = usePromptHistorySearch(keyword);

  return (
    <div>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      {searchResults.map((history) => (
        <div key={history.id}>{history.generated_prompt}</div>
      ))}
    </div>
  );
}
```

**パラメータ:**
- `keyword: string` - 検索キーワード

**キャッシュ設定:**
- dedupingInterval: 2秒間
- revalidateOnFocus: false（検索結果はフォーカス時に再検証しない）
- revalidateOnReconnect: false

### use-notifications.ts

通知を取得するためのSWRフック群。

#### useUnreadNotifications

未読通知一覧を取得します。

```tsx
import { useUnreadNotifications } from "@/lib/hooks/use-notifications";

function NotificationDropdown({ userId }: { userId: string }) {
  const {
    notifications,
    isLoading,
    error,
    markAsReadOptimistic,
    markAllAsReadOptimistic,
  } = useUnreadNotifications(userId, 10);

  // 通知を既読にする（楽観的更新）
  const handleMarkAsRead = async (notificationId: string) => {
    markAsReadOptimistic(notificationId);
    // サーバーで既読処理...
  };

  // すべての通知を既読にする（楽観的更新）
  const handleMarkAllAsRead = async () => {
    markAllAsReadOptimistic();
    // サーバーで既読処理...
  };

  return (
    <div>
      <button onClick={handleMarkAllAsRead}>すべて既読</button>
      {notifications.map((notif) => (
        <div key={notif.id} onClick={() => handleMarkAsRead(notif.id)}>
          {notif.message}
        </div>
      ))}
    </div>
  );
}
```

**パラメータ:**
- `userId: string | null` - ユーザーID
- `limit?: number` - 取得件数（デフォルト: 10）

**戻り値:**
- `notifications: Notification[]` - 未読通知一覧
- `isLoading: boolean` - ローディング状態
- `isValidating: boolean` - 再検証中かどうか
- `error: any` - エラー
- `mutate: () => void` - 手動でキャッシュを更新
- `markAsReadOptimistic: (notificationId: string) => void` - 楽観的更新で通知を既読に
- `markAllAsReadOptimistic: () => void` - 楽観的更新ですべての通知を既読に

**キャッシュ設定:**
- dedupingInterval: 1分間
- revalidateOnFocus: true（新しい通知を見逃さないため）
- revalidateOnReconnect: true
- refreshInterval: 30秒（定期的な再検証）

#### useUnreadCount

未読通知件数を取得します。

```tsx
import { useUnreadCount } from "@/lib/hooks/use-notifications";

function NotificationBadge({ userId }: { userId: string }) {
  const {
    unreadCount,
    isLoading,
    error,
    decrementOptimistic,
    resetOptimistic,
    incrementOptimistic,
  } = useUnreadCount(userId);

  return (
    <div>
      {unreadCount > 0 && <span>{unreadCount}</span>}
    </div>
  );
}
```

**パラメータ:**
- `userId: string | null` - ユーザーID

**戻り値:**
- `unreadCount: number` - 未読通知件数
- `isLoading: boolean` - ローディング状態
- `isValidating: boolean` - 再検証中かどうか
- `error: any` - エラー
- `mutate: () => void` - 手動でキャッシュを更新
- `decrementOptimistic: () => void` - 楽観的更新で未読件数を減らす
- `resetOptimistic: () => void` - 楽観的更新で未読件数をゼロに
- `incrementOptimistic: () => void` - 楽観的更新で未読件数を増やす

**キャッシュ設定:**
- dedupingInterval: 1分間
- revalidateOnFocus: true
- revalidateOnReconnect: true
- refreshInterval: 30秒（定期的な再検証）

## その他のフック

### use-auto-save.ts

自動保存機能を提供するフック。

### use-debounce.ts

デバウンス機能を提供するフック。

### use-swipe-gesture.ts

スワイプジェスチャーを検出するフック。

### use-unsaved-changes.ts

未保存の変更を検出するフック。

## 楽観的更新 (Optimistic Updates)

楽観的更新は、サーバーの応答を待たずにUIを即座に更新する手法です。これにより、ユーザー体験が向上します。

### 使い方

```tsx
const { histories, addHistoryOptimistic } = usePromptHistory();

const handleSave = async (newHistory: PromptHistory) => {
  // 1. 楽観的更新: UIを即座に更新
  addHistoryOptimistic(newHistory);

  try {
    // 2. サーバーに保存
    const result = await savePromptHistoryAction(newHistory);

    if (!result.success) {
      // 3. エラー時: キャッシュを再検証して元に戻す
      refresh();
      toast.error("保存に失敗しました");
    }
  } catch (error) {
    // エラー時: キャッシュを再検証
    refresh();
    toast.error("保存に失敗しました");
  }
};
```

## キャッシュ無効化

手動でキャッシュを無効化する関数も提供されています。

```tsx
import { invalidatePromptHistoryCache } from "@/lib/hooks/use-prompt-history";
import { invalidateNotificationCache } from "@/lib/hooks/use-notifications";

// プロンプト履歴のキャッシュを無効化
await invalidatePromptHistoryCache();

// 通知のキャッシュを無効化
await invalidateNotificationCache(userId);
```

## グローバルSWR設定

`app/providers.tsx`で設定されているグローバルSWR設定:

```tsx
<SWRConfig
  value={{
    // Background revalidation settings
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    focusThrottleInterval: 5000,
    loadingTimeout: 3000,

    // Cache configuration
    revalidateIfStale: true,

    // Error retry configuration
    errorRetryCount: 3,
    errorRetryInterval: 1000,
    shouldRetryOnError: true,
  }}
>
```

これらの設定は個別のフックで上書きできます。
