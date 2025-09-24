import React from "react";
import { NavigationControls } from "./NavigationControls";
import Breadcrumbs from "./Breadcrumbs";

type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  showNavigation?: boolean;
  showBreadcrumbs?: boolean;
};

const PageHeader: React.FC<Props> = ({ 
  title, 
  description, 
  actions, 
  showNavigation = true,
  showBreadcrumbs = true 
}) => {
  return (
    <div className="space-y-4">
      {/* Navigation Controls */}
      {showNavigation && (
        <NavigationControls variant="compact" />
      )}
      
      {/* Breadcrumbs */}
      {showBreadcrumbs && <Breadcrumbs />}
      
      {/* Page Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1 max-w-3xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
    </div>
  );
};

export default PageHeader;
