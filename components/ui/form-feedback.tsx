import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export interface FormFeedbackProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'success' | 'error';
  message?: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export const FormFeedback = React.forwardRef<HTMLDivElement, FormFeedbackProps>(
  (
    {
      type,
      message,
      onDismiss,
      autoDismiss = true,
      autoDismissDelay = 5000,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      // 成功メッセージの場合のみ自動消去
      if (message && autoDismiss && type === 'success') {
        const timer = setTimeout(() => {
          if (onDismiss) {
            onDismiss();
          }
        }, autoDismissDelay);

        return () => clearTimeout(timer);
      }
    }, [message, type, autoDismiss, autoDismissDelay, onDismiss]);

    if (!message) {
      return null;
    }

    const isSuccess = type === 'success';
    const isError = type === 'error';

    const role = isError ? 'alert' : 'status';
    const ariaLive = isError ? 'assertive' : 'polite';

    const Icon = isSuccess ? CheckCircle2 : XCircle;

    return (
      <div
        ref={ref}
        role={role}
        aria-live={ariaLive}
        aria-atomic="true"
        className={cn(
          'mb-4 rounded-md border p-4',
          'flex items-start gap-3',
          'animate-in slide-in-from-top-2 fade-in duration-300',
          isSuccess && 'bg-green-50 border-green-500 text-green-900',
          isError && 'bg-red-50 border-red-500 text-red-900'
        )}
        {...props}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', isSuccess && 'text-green-600', isError && 'text-red-600')} />

        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onDismiss) {
              onDismiss();
            }
          }}
          aria-label="Close"
          className={cn(
            'flex-shrink-0 rounded-sm opacity-70 hover:opacity-100',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            isSuccess && 'focus:ring-green-500',
            isError && 'focus:ring-red-500'
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

FormFeedback.displayName = 'FormFeedback';
