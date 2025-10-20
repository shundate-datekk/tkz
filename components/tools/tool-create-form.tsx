"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
        toast.loading("ツールを登録中...", { id: "create-tool" });

        const result = await createToolAction(data);

        if (!result.success) {
          toast.error(result.error, { id: "create-tool" });
          return;
        }

        // 成功
        toast.success("ツールを登録しました！", { id: "create-tool" });

        // ツール一覧ページにリダイレクト
        router.push("/tools");
        router.refresh();
      } catch (error) {
        console.error("Failed to create tool:", error);
        toast.error("ツールの登録中にエラーが発生しました", {
          id: "create-tool",
        });
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
