'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, Home, Wrench, Sparkles, History, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * グローバル検索コマンドメニュー
 * Cmd+K (Mac) または Ctrl+K (Windows/Linux) で開く
 */
export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  // キーボードショートカット
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      {/* トリガーボタン - ヘッダーに配置 */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">検索...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 md:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* コマンドダイアログ */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="グローバル検索"
        className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-0 shadow-lg sm:rounded-lg"
      >
        <Command.Input
          placeholder="検索キーワードを入力..."
          className="flex h-11 w-full rounded-md bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            結果が見つかりませんでした。
          </Command.Empty>

          <Command.Group heading="ページ" className="p-2">
            <CommandItem
              onSelect={() => runCommand(() => router.push('/'))}
              icon={Home}
            >
              ホーム
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/tools'))}
              icon={Wrench}
            >
              AIツール一覧
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/prompt'))}
              icon={Sparkles}
            >
              プロンプト生成
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/history'))}
              icon={History}
            >
              履歴
            </CommandItem>
          </Command.Group>

          {/* 今後、AIツールのデータを検索可能にする */}
          <Command.Group heading="アクション" className="p-2">
            <CommandItem
              onSelect={() => runCommand(() => router.push('/tools/new'))}
              icon={FileText}
            >
              新しいツールを作成
            </CommandItem>
          </Command.Group>
        </Command.List>
      </Command.Dialog>

      {/* オーバーレイ背景 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

interface CommandItemProps {
  children: React.ReactNode;
  onSelect: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

function CommandItem({ children, onSelect, icon: Icon }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
        'transition-colors'
      )}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </Command.Item>
  );
}
