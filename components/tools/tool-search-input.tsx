"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ToolSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ToolSearchInput({
  value,
  onChange,
  placeholder = "ツール名、使用目的、使用感で検索...",
}: ToolSearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
