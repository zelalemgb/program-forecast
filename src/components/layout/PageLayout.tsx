import React from 'react';
import { useNavigation } from '@/context/NavigationContext';
import PageHeader from './PageHeader';
import { PageNavigation } from './NavigationControls';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  showNavigation?: boolean;
  showBreadcrumbs?: boolean;
  showPageNavigation?: boolean;
  className?: string;
  containerClassName?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  description,
  actions,
  showNavigation = true,
  showBreadcrumbs = true,
  showPageNavigation = true,
  className,
  containerClassName
}) => {
  const { currentPage } = useNavigation();
  
  // Use navigation context for title/description if not provided
  const pageTitle = title || currentPage?.title || '';
  const pageDescription = description || currentPage?.description;

  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {/* Container for header and content */}
      <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1", containerClassName)}>
        {/* Page Header - simplified since navigation is now in top bar */}
        {(pageTitle || pageDescription || actions) && (
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              {pageTitle && <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{pageTitle}</h1>}
              {pageDescription && <p className="text-muted-foreground mt-1 max-w-3xl">{pageDescription}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </header>
        )}

        {/* Main Content */}
        <main className="mt-8">
          {children}
        </main>

        {/* Page Navigation (Previous/Next) */}
        {showPageNavigation && (
          <div className="mt-12 pt-8 border-t">
            <PageNavigation />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLayout;