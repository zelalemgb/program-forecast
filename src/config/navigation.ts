export interface NavigationPage {
  path: string;
  title: string;
  description?: string;
  parent?: string;
  children?: string[];
  category?: string;
  breadcrumbLabel?: string;
  showInSidebar?: boolean;
}

export interface NavigationCategory {
  id: string;
  label: string;
  order: number;
}

// Define page categories for logical grouping
export const navigationCategories: NavigationCategory[] = [
  { id: 'dashboard', label: 'Dashboard', order: 1 },
  { id: 'data-capture', label: 'Data Capture', order: 2 },
  { id: 'forecasting', label: 'Forecasting', order: 3 },
  { id: 'supply-planning', label: 'Supply Planning', order: 4 },
  { id: 'analytics', label: 'Analytics & Reports', order: 5 },
  { id: 'settings', label: 'Settings', order: 6 },
  { id: 'admin', label: 'Admin', order: 7 },
  { id: 'help', label: 'Help & Training', order: 8 },
];

// Define the complete page hierarchy and navigation structure
export const navigationPages: Record<string, NavigationPage> = {
  // Dashboard pages
  '/': {
    path: '/',
    title: 'Facility Dashboard',
    description: 'Overview of facility operations and key metrics',
    category: 'dashboard',
    breadcrumbLabel: 'Home',
    showInSidebar: true,
  },
  '/cdss-dashboard': {
    path: '/cdss-dashboard',
    title: 'CDSS Dashboard',
    description: 'Central Drug Supply System dashboard and metrics',
    category: 'dashboard',
    breadcrumbLabel: 'CDSS Dashboard',
    showInSidebar: true,
  },

  // Data Capture
  '/dagu': {
    path: '/dagu',
    title: 'Inventory Management',
    description: 'Manage inventory data and stock levels',
    category: 'data-capture',
    breadcrumbLabel: 'Inventory Management',
    showInSidebar: true,
  },
  '/forecast-upload': {
    path: '/forecast-upload',
    title: 'Forecast Upload',
    description: 'Upload and manage forecast data',
    category: 'data-capture',
    breadcrumbLabel: 'Forecast Upload',
    showInSidebar: true,
  },

  // Forecasting
  '/forecast': {
    path: '/forecast',
    title: 'Run Forecast',
    description: 'Execute forecasting algorithms and analyze results',
    category: 'forecasting',
    breadcrumbLabel: 'Run Forecast',
    showInSidebar: true,
  },
  '/dashboard': {
    path: '/dashboard',
    title: 'Validate Excel Forecast',
    description: 'Validate and review Excel-based forecasts',
    category: 'forecasting',
    breadcrumbLabel: 'Validate Forecast',
    showInSidebar: true,
  },
  '/forecast-workbench': {
    path: '/forecast-workbench',
    title: 'Forecast Workbench',
    description: 'Advanced forecasting tools and analysis',
    category: 'forecasting',
    breadcrumbLabel: 'Forecast Workbench',
    showInSidebar: false,
  },
  '/forecast-analysis': {
    path: '/forecast-analysis',
    title: 'Forecast Analysis',
    description: 'Analyze historical consumption patterns and future demand forecasts',
    category: 'forecasting',
    breadcrumbLabel: 'Forecast Analysis',
    showInSidebar: true,
  },

  // Supply Planning
  '/supply-planning': {
    path: '/supply-planning',
    title: 'Supply Planning',
    description: 'Plan and optimize supply chain operations',
    category: 'supply-planning',
    breadcrumbLabel: 'Supply Planning',
    showInSidebar: true,
  },
  '/budget-alignment': {
    path: '/budget-alignment',
    title: 'CDSS Budget Alignment',
    description: 'Align budget with supply planning requirements',
    category: 'supply-planning',
    breadcrumbLabel: 'Budget Alignment',
    showInSidebar: true,
  },

  // Analytics
  '/analytics/facility': {
    path: '/analytics/facility',
    title: 'Facility Trends',
    description: 'Analyze facility-level trends and patterns',
    category: 'analytics',
    breadcrumbLabel: 'Facility Trends',
    showInSidebar: true,
  },
  '/analytics/regional': {
    path: '/analytics/regional',
    title: 'Regional/National Trends',
    description: 'Regional and national trend analysis',
    category: 'analytics',
    breadcrumbLabel: 'Regional Trends',
    showInSidebar: true,
  },
  '/analytics/accuracy': {
    path: '/analytics/accuracy',
    title: 'Forecast Accuracy',
    description: 'Measure and analyze forecast accuracy',
    category: 'analytics',
    breadcrumbLabel: 'Forecast Accuracy',
    showInSidebar: true,
  },

  // Settings
  '/settings/metadata': {
    path: '/settings/metadata',
    title: 'Metadata Organization',
    description: 'Manage system metadata and organizational settings',
    category: 'settings',
    breadcrumbLabel: 'Metadata',
    showInSidebar: true,
  },
  '/settings/metadata/facilities': {
    path: '/settings/metadata/facilities',
    title: 'Facilities Management',
    description: 'Manage health facilities and their configurations',
    parent: '/settings/metadata',
    category: 'settings',
    breadcrumbLabel: 'Facilities',
    showInSidebar: false,
  },
  '/settings/metadata/products': {
    path: '/settings/metadata/products',
    title: 'Products Management',
    description: 'Manage product catalog and specifications',
    parent: '/settings/metadata',
    category: 'settings',
    breadcrumbLabel: 'Products',
    showInSidebar: false,
  },
  '/settings/metadata/bulk-import': {
    path: '/settings/metadata/bulk-import',
    title: 'Bulk Import',
    description: 'Import data in bulk from external sources',
    parent: '/settings/metadata',
    category: 'settings',
    breadcrumbLabel: 'Bulk Import',
    showInSidebar: false,
  },

  // Admin
  '/admin/users': {
    path: '/admin/users',
    title: 'User Management',
    description: 'Manage user accounts and permissions',
    category: 'admin',
    breadcrumbLabel: 'Users',
    showInSidebar: true,
  },
  '/admin': {
    path: '/admin',
    title: 'Super Admin Dashboard',
    description: 'System administration and management',
    category: 'admin',
    breadcrumbLabel: 'Admin',
    showInSidebar: false,
  },

  // Help & Training
  '/help/guides': {
    path: '/help/guides',
    title: 'Guides',
    description: 'User guides and documentation',
    category: 'help',
    breadcrumbLabel: 'Guides',
    showInSidebar: true,
  },
  '/help/videos': {
    path: '/help/videos',
    title: 'Micro-learning Videos',
    description: 'Training videos and tutorials',
    category: 'help',
    breadcrumbLabel: 'Videos',
    showInSidebar: true,
  },

  // Other pages
  '/validation': {
    path: '/validation',
    title: 'Validation',
    description: 'Data validation and verification',
    category: 'data-capture',
    breadcrumbLabel: 'Validation',
    showInSidebar: false,
  },
  '/profile': {
    path: '/profile',
    title: 'Profile',
    description: 'User profile and account settings',
    breadcrumbLabel: 'Profile',
    showInSidebar: false,
  },
  '/auth': {
    path: '/auth',
    title: 'Authentication',
    description: 'User authentication',
    breadcrumbLabel: 'Auth',
    showInSidebar: false,
  },
  '/register': {
    path: '/register',
    title: 'Register Facility',
    description: 'Register a new health facility',
    breadcrumbLabel: 'Register',
    showInSidebar: false,
  },
  '/approvals': {
    path: '/approvals',
    title: 'Approvals',
    description: 'Review and approve requests',
    breadcrumbLabel: 'Approvals',
    showInSidebar: false,
  },
  '/requests': {
    path: '/requests',
    title: 'Requests',
    description: 'Manage supply requests and orders',
    breadcrumbLabel: 'Requests',
    showInSidebar: false,
  },
  '/requests/new': {
    path: '/requests/new',
    title: 'New Request',
    description: 'Create a new supply request',
    parent: '/requests',
    breadcrumbLabel: 'New Request',
    showInSidebar: false,
  },
  '/requests/:id': {
    path: '/requests/:id',
    title: 'Request Details',
    description: 'View and manage request details',
    parent: '/requests',
    breadcrumbLabel: 'Request Details',
    showInSidebar: false,
  },
};

// Helper functions for navigation logic
export const getPageByPath = (path: string): NavigationPage | undefined => {
  // Handle dynamic routes like /requests/:id
  if (path.includes('/requests/') && path !== '/requests/new') {
    return navigationPages['/requests/:id'];
  }
  return navigationPages[path];
};

export const getParentPage = (path: string): NavigationPage | undefined => {
  const page = getPageByPath(path);
  if (page?.parent) {
    return navigationPages[page.parent];
  }
  return undefined;
};

export const getChildPages = (path: string): NavigationPage[] => {
  return Object.values(navigationPages).filter(page => page.parent === path);
};

export const getBreadcrumbPath = (path: string): NavigationPage[] => {
  const breadcrumbs: NavigationPage[] = [];
  let currentPage = getPageByPath(path);
  
  while (currentPage) {
    breadcrumbs.unshift(currentPage);
    currentPage = currentPage.parent ? navigationPages[currentPage.parent] : undefined;
  }
  
  return breadcrumbs;
};

export const getNextPage = (currentPath: string, category?: string): NavigationPage | undefined => {
  const allPages = Object.values(navigationPages);
  const currentIndex = allPages.findIndex(page => page.path === currentPath);
  
  if (category) {
    const categoryPages = allPages.filter(page => page.category === category);
    const categoryIndex = categoryPages.findIndex(page => page.path === currentPath);
    return categoryPages[categoryIndex + 1];
  }
  
  return allPages[currentIndex + 1];
};

export const getPreviousPage = (currentPath: string, category?: string): NavigationPage | undefined => {
  const allPages = Object.values(navigationPages);
  const currentIndex = allPages.findIndex(page => page.path === currentPath);
  
  if (category) {
    const categoryPages = allPages.filter(page => page.category === category);
    const categoryIndex = categoryPages.findIndex(page => page.path === currentPath);
    return categoryPages[categoryIndex - 1];
  }
  
  return allPages[currentIndex - 1];
};
