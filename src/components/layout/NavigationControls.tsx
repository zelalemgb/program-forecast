import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  ChevronLeft, 
  ChevronRight,
  Home
} from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { navigationPages, NavigationPage } from '@/config/navigation';
import { cn } from '@/lib/utils';

interface NavigationControlsProps {
  variant?: 'default' | 'compact';
  className?: string;
  showLabels?: boolean;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({ 
  variant = 'default',
  className,
  showLabels = false 
}) => {
  const {
    canGoBack,
    canGoForward,
    parentPage,
    goBack,
    goForward,
    goToParent,
    navigateWithHistory
  } = useNavigation();

  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      "flex items-center gap-1",
      className
    )}>
      {/* Home Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={isCompact ? "sm" : "default"}
            onClick={() => navigateWithHistory('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            {showLabels && !isCompact && <span>Home</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Go to Dashboard (Alt + H)
        </TooltipContent>
      </Tooltip>

      {/* Back Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={isCompact ? "sm" : "default"}
            onClick={goBack}
            disabled={!canGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {showLabels && !isCompact && <span>Back</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Go Back (Alt + ←)
        </TooltipContent>
      </Tooltip>

      {/* Forward Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={isCompact ? "sm" : "default"}
            onClick={goForward}
            disabled={!canGoForward}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            {showLabels && !isCompact && <span>Forward</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Go Forward (Alt + →)
        </TooltipContent>
      </Tooltip>

      {/* Parent/Up Button */}
      {parentPage && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={isCompact ? "sm" : "default"}
              onClick={goToParent}
              className="flex items-center gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              {showLabels && !isCompact && <span>Up</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Go to {parentPage.title} (Alt + ↑)
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

interface PageNavigationProps {
  className?: string;
  showLabels?: boolean;
}

export const PageNavigation: React.FC<PageNavigationProps> = ({ 
  className,
  showLabels = true 
}) => {
  const {
    currentPage,
    goToNext,
    goToPrevious,
  } = useNavigation();

  if (!currentPage?.category) return null;

  // Get category pages for navigation
  const categoryPages = Object.values(navigationPages)
    .filter((page: NavigationPage) => page.category === currentPage.category)
    .sort((a: NavigationPage, b: NavigationPage) => a.path.localeCompare(b.path));

  const currentIndex = categoryPages.findIndex((page: NavigationPage) => page.path === currentPage.path);
  const previousPage = categoryPages[currentIndex - 1];
  const nextPage = categoryPages[currentIndex + 1];

  return (
    <div className={cn(
      "flex items-center justify-between gap-4",
      className
    )}>
      {/* Previous Page */}
      <div className="flex-1">
        {previousPage && (
          <Button
            variant="ghost"
            onClick={goToPrevious}
            className="flex items-center gap-2 h-auto p-3 justify-start"
          >
            <ChevronLeft className="h-4 w-4" />
            <div className="text-left">
              {showLabels && (
                <div className="text-xs text-muted-foreground">Previous</div>
              )}
              <div className="font-medium">{previousPage.title}</div>
            </div>
          </Button>
        )}
      </div>

      {/* Next Page */}
      <div className="flex-1">
        {nextPage && (
          <Button
            variant="ghost"
            onClick={goToNext}
            className="flex items-center gap-2 h-auto p-3 justify-end ml-auto"
          >
            <div className="text-right">
              {showLabels && (
                <div className="text-xs text-muted-foreground">Next</div>
              )}
              <div className="font-medium">{nextPage.title}</div>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavigationControls;