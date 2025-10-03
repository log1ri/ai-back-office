import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// Interface Segregation Principle - Define specific loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  isEmpty?: boolean;
}

// Base loading component props
interface BaseLoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Simple spinner component
interface SpinnerProps extends BaseLoadingProps {
  text?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  className, 
  size = 'md', 
  text 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

// Error display component
interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  className 
}) => {
  return (
    <div className={cn('text-center p-4', className)}>
      <div className="text-destructive text-sm mb-2">{error}</div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
};

// Empty state component
interface EmptyStateProps {
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  action, 
  className 
}) => {
  return (
    <div className={cn('text-center p-8', className)}>
      <div className="text-muted-foreground mb-4">{message}</div>
      {action && <div>{action}</div>}
    </div>
  );
};

// Main loading wrapper component - Single Responsibility Principle
interface LoadingWrapperProps extends LoadingState {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  loadingText?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  className?: string;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  error,
  isEmpty,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  loadingText = 'Loading...',
  emptyMessage = 'No data available',
  onRetry,
  className
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className={className}>
        {loadingComponent || <Spinner text={loadingText} />}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={className}>
        {errorComponent || <ErrorDisplay error={error} onRetry={onRetry} />}
      </div>
    );
  }

  // Show empty state
  if (isEmpty) {
    return (
      <div className={className}>
        {emptyComponent || <EmptyState message={emptyMessage} />} 
      </div>
    );
  }

  // Show content
  return <div className={className}>{children}</div>;
};

// Higher-order component for query loading states
interface QueryLoadingWrapperProps<T> {
  query: {
    data?: T;
    isLoading: boolean;
    error: Error | null;
    refetch?: () => void;
  };
  children: (data: T) => React.ReactNode;
  loadingText?: string;
  emptyMessage?: string;
  className?: string;
  isEmpty?: (data: T) => boolean;
}

export function QueryLoadingWrapper<T>({
  query,
  children,
  loadingText,
  emptyMessage,
  className,
  isEmpty
}: QueryLoadingWrapperProps<T>) {
  const { data, isLoading, error, refetch } = query;
  
  return (
    <LoadingWrapper
      isLoading={isLoading}
      error={error?.message || null}
      isEmpty={data ? (isEmpty ? isEmpty(data) : false) : false}
      loadingText={loadingText}
      emptyMessage={emptyMessage}
      onRetry={refetch}
      className={className}
    >
      {data && children(data)}
    </LoadingWrapper>
  );
}
