import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavigationPage, getPageByPath, getParentPage, getBreadcrumbPath, getNextPage, getPreviousPage } from '@/config/navigation';

interface NavigationHistory {
  path: string;
  timestamp: number;
  scrollPosition?: number;
}

interface NavigationContextType {
  currentPage: NavigationPage | undefined;
  parentPage: NavigationPage | undefined;
  breadcrumbs: NavigationPage[];
  history: NavigationHistory[];
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
  goToParent: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  navigateWithHistory: (path: string) => void;
  clearHistory: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [history, setHistory] = useState<NavigationHistory[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Get current page information
  const currentPage = getPageByPath(location.pathname);
  const parentPage = getParentPage(location.pathname);
  const breadcrumbs = getBreadcrumbPath(location.pathname);

  // Add current location to history when location changes
  useEffect(() => {
    const newHistoryItem: NavigationHistory = {
      path: location.pathname,
      timestamp: Date.now(),
      scrollPosition: window.scrollY,
    };

    setHistory(prev => {
      // If we're not at the end of history (user went back), remove forward history
      const newHistory = currentHistoryIndex >= 0 ? prev.slice(0, currentHistoryIndex + 1) : prev;
      
      // Don't add duplicate consecutive entries
      if (newHistory.length > 0 && newHistory[newHistory.length - 1].path === location.pathname) {
        return newHistory;
      }
      
      // Add new item and limit history size
      const updatedHistory = [...newHistory, newHistoryItem];
      return updatedHistory.slice(-50); // Keep last 50 entries
    });

    setCurrentHistoryIndex(prev => {
      const newIndex = prev >= 0 ? prev + 1 : 0;
      return Math.min(newIndex, 49); // Adjust for history limit
    });
  }, [location.pathname]);

  // Navigation functions
  const goBack = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const previousItem = history[currentHistoryIndex - 1];
      setCurrentHistoryIndex(prev => prev - 1);
      navigate(previousItem.path);
      
      // Restore scroll position after navigation
      setTimeout(() => {
        if (previousItem.scrollPosition !== undefined) {
          window.scrollTo(0, previousItem.scrollPosition);
        }
      }, 0);
    }
  }, [history, currentHistoryIndex, navigate]);

  const goForward = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const nextItem = history[currentHistoryIndex + 1];
      setCurrentHistoryIndex(prev => prev + 1);
      navigate(nextItem.path);
      
      // Restore scroll position after navigation
      setTimeout(() => {
        if (nextItem.scrollPosition !== undefined) {
          window.scrollTo(0, nextItem.scrollPosition);
        }
      }, 0);
    }
  }, [history, currentHistoryIndex, navigate]);

  const goToParent = useCallback(() => {
    if (parentPage) {
      navigate(parentPage.path);
    }
  }, [parentPage, navigate]);

  const goToNext = useCallback(() => {
    if (currentPage) {
      const nextPage = getNextPage(currentPage.path, currentPage.category);
      if (nextPage) {
        navigate(nextPage.path);
      }
    }
  }, [currentPage, navigate]);

  const goToPrevious = useCallback(() => {
    if (currentPage) {
      const previousPage = getPreviousPage(currentPage.path, currentPage.category);
      if (previousPage) {
        navigate(previousPage.path);
      }
    }
  }, [currentPage, navigate]);

  const navigateWithHistory = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentHistoryIndex(-1);
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Browser navigation handled by React Router
      // We just need to update our history index
      const currentPath = location.pathname;
      const historyIndex = history.findIndex(item => item.path === currentPath);
      if (historyIndex >= 0) {
        setCurrentHistoryIndex(historyIndex);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [history, location.pathname]);

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + Left Arrow = Go Back
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        goBack();
      }
      
      // Alt + Right Arrow = Go Forward
      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();
        goForward();
      }
      
      // Alt + Up Arrow = Go to Parent
      if (event.altKey && event.key === 'ArrowUp') {
        event.preventDefault();
        goToParent();
      }
      
      // Alt + H = Go Home
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, goForward, goToParent, navigate]);

  const value: NavigationContextType = {
    currentPage,
    parentPage,
    breadcrumbs,
    history,
    canGoBack: currentHistoryIndex > 0,
    canGoForward: currentHistoryIndex < history.length - 1,
    goBack,
    goForward,
    goToParent,
    goToNext,
    goToPrevious,
    navigateWithHistory,
    clearHistory,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};