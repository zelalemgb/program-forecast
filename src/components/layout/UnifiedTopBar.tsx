import React from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home, Slash, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigation } from "@/context/NavigationContext";
import { getPageByPath } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface UnifiedTopBarProps {
  className?: string;
}

export const UnifiedTopBar: React.FC<UnifiedTopBarProps> = ({ className }) => {
  const location = useLocation();
  const { 
    canGoBack, 
    canGoForward, 
    goBack, 
    goForward, 
    navigateWithHistory,
    breadcrumbs 
  } = useNavigation();

  const currentPage = getPageByPath(location.pathname);

  const handleHomeClick = () => {
    navigateWithHistory('/');
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-3 bg-background border-b border-border/60",
      "sticky top-0 z-50 backdrop-blur-sm bg-background/95",
      className
    )}>
      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          disabled={!canGoBack}
          className="h-8 w-8 p-0"
          title="Go back"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goForward}
          disabled={!canGoForward}
          className="h-8 w-8 p-0"
          title="Go forward"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleHomeClick}
          className="h-8 w-8 p-0"
          title="Go home"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            {breadcrumbs.map((page, index) => {
              const isLast = index === breadcrumbs.length - 1;
              
              return (
                <React.Fragment key={page.path}>
                  <button
                    onClick={() => navigateWithHistory(page.path)}
                    className={cn(
                      "hover:text-foreground transition-colors truncate",
                      isLast ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                    disabled={isLast}
                  >
                    {page.breadcrumbLabel || page.title}
                  </button>
                  {!isLast && (
                    <Slash className="h-3 w-3 flex-shrink-0 text-muted-foreground/60" />
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        ) : (
          // Fallback to current page title
          <div className="text-sm font-medium text-foreground truncate">
            {currentPage?.title || "Page"}
          </div>
        )}
      </div>

      {/* Page Category Badge */}
      {currentPage?.category && (
        <>
          <Separator orientation="vertical" className="h-5" />
          <div className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground uppercase tracking-wide font-medium">
            {currentPage.category.replace('-', ' ')}
          </div>
        </>
      )}

      {/* User Profile Icon */}
      <Separator orientation="vertical" className="h-5" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateWithHistory('/profile')}
        className="h-8 w-8 p-0"
        title="User Profile"
      >
        <User className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UnifiedTopBar;