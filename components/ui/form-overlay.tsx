import * as React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

export interface FormOverlayProps {
  /**
   * Whether the overlay is visible
   */
  isLoading: boolean;
  /**
   * Custom class name
   */
  className?: string;
}

export const FormOverlay = React.forwardRef<HTMLDivElement, FormOverlayProps>(
  ({ isLoading, className }, ref) => {
    if (!isLoading) {
      return null;
    }

    return (
      <div
        ref={ref}
        data-testid="form-overlay"
        role="status"
        aria-live="polite"
        className={cn(
          'absolute inset-0 z-50 flex items-center justify-center',
          'bg-black/20 backdrop-blur-sm',
          className
        )}
      >
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }
);

FormOverlay.displayName = 'FormOverlay';
