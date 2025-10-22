import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxLength, onChange, value, defaultValue, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(0);

    // 初期値の文字数を計算
    React.useEffect(() => {
      const initialValue = (value || defaultValue || '') as string;
      setCharCount(initialValue.length);
    }, [value, defaultValue]);

    // 文字数の変更をハンドル
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (onChange) {
        onChange(e);
      }
    };

    // 文字数カウンターの色を決定
    const getCounterColor = () => {
      if (!maxLength) return 'text-muted-foreground';
      
      const percentage = (charCount / maxLength) * 100;
      
      if (percentage >= 90) return 'text-red-600';
      if (percentage >= 80) return 'text-amber-600';
      return 'text-muted-foreground';
    };

    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          maxLength={maxLength}
          onChange={handleChange}
          value={value}
          defaultValue={defaultValue}
          {...props}
        />
        {maxLength && (
          <div className="text-right mt-1">
            <span className={cn("text-xs", getCounterColor())}>
              {charCount} / {maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
