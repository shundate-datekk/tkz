"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { ToolForm } from "@/components/tools/tool-form";
import { createToolAction } from "@/lib/actions/ai-tool.actions";
import type { CreateAIToolInput } from "@/lib/schemas/ai-tool.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ToolCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(data: CreateAIToolInput) {
    startTransition(async () => {
      try {
        // Optimistic UI: フォームをすぐに無効化してフィードバック
        const loadingToast = toast.loading("ツールを登録中...");

        const result = await createToolAction(data);

        // ローディングトーストを削除
        toast.dismiss(loadingToast);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        // 成功
        toast.success("ツールを登録しました！");

        // ツール一覧ページにリダイレクト
        router.push("/tools");
        router.refresh();
      } catch (error) {
        console.error("Failed to create tool:", error);
        toast.error("ツールの登録中にエラーが発生しました");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ツール情報</CardTitle>
      </CardHeader>
      <CardContent>
        <ToolForm onSubmit={handleSubmit} isLoading={isPending} />
      </CardContent>
    </Card>
  );
}
