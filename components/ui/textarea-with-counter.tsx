import * as React from "react"
import { Textarea, TextareaProps } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface TextareaWithCounterProps extends TextareaProps {
  maxLength?: number
  showCounter?: boolean
}

const TextareaWithCounter = React.forwardRef<HTMLTextAreaElement, TextareaWithCounterProps>(
  ({ className, maxLength, showCounter = true, value, onChange, ...props }, ref) => {
    const [count, setCount] = React.useState(0)

    React.useEffect(() => {
      if (typeof value === "string") {
        setCount(value.length)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length)
      if (onChange) {
        onChange(e)
      }
    }

    const isOverLimit = maxLength !== undefined && count > maxLength

    return (
      <div className="relative">
        <Textarea
          ref={ref}
          className={cn(className, isOverLimit && "border-destructive focus-visible:ring-destructive")}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {showCounter && (
          <div className={cn(
            "mt-1 text-xs text-right",
            isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"
          )}>
            {maxLength !== undefined ? (
              <>
                {count}/{maxLength}文字
                {isOverLimit && <span className="ml-1">(上限を超えています)</span>}
              </>
            ) : (
              <>{count}文字</>
            )}
          </div>
        )}
      </div>
    )
  }
)
TextareaWithCounter.displayName = "TextareaWithCounter"

export { TextareaWithCounter }
