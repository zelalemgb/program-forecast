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
        {/* Page Header with Navigation */}
        <PageHeader
          title={pageTitle}
          description={pageDescription}
          actions={actions}
          showNavigation={showNavigation}
          showBreadcrumbs={showBreadcrumbs}
        />

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