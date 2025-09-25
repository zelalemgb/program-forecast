import React from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6'
  };

  return (
    <div className={cn(sizeClasses[size], className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-sm font-medium text-foreground">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn(
        "space-y-3",
        size === 'sm' && "space-y-2",
        size === 'lg' && "space-y-4"
      )}>
        {children}
      </div>
    </div>
  );
};

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ children, className }) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      {children}
    </div>
  );
};

interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const FormGrid: React.FC<FormGridProps> = ({ 
  children, 
  columns = 2, 
  className 
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(
      "grid gap-4",
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  );
};

interface FormContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  className,
  maxWidth = 'lg'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-none'
  };

  return (
    <div className={cn(
      "mx-auto space-y-6 p-6",
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
};