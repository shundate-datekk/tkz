import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useAnimation } from "@/lib/providers/animation-provider";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        primary:
          "bg-gradient-primary text-white shadow-lg hover:shadow-xl transition-shadow",
        accent:
          "bg-gradient-accent text-white shadow-lg hover:shadow-xl transition-shadow",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-11 px-4 text-sm", // 44px - minimum touch target
        md: "h-12 px-6", // 48px - default
        lg: "h-14 px-8 text-base", // 56px - large
        icon: "h-11 w-11", // 44px square
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  /** アニメーション効果を有効にする（ホバー、タップ時のスケール）*/
  animated?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, animated = false, children, disabled, ...props }, ref) => {
    const { transitionConfig, shouldReduceMotion } = useAnimation();

    // asChild使用時はアニメーション無効（Slotは単一の子要素のみ許可）
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    // アニメーション有効時
    if (animated && !shouldReduceMotion && !disabled) {
      // motionと競合するHTML属性を除外（型の互換性のため）
      const { 
        onDragStart, 
        onDragEnd, 
        onDrag,
        onAnimationStart,
        onAnimationEnd,
        ...motionSafeProps 
      } = props;
      
      return (
        <motion.button
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={transitionConfig}
          {...(motionSafeProps as any)}
        >
          {isLoading && <Loader2 className="animate-spin" />}
          {children}
        </motion.button>
      );
    }

    // 通常のボタン
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
