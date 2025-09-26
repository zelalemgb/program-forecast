import { NavigationPage } from '@/config/navigation';
import type { RolePermissions } from '@/hooks/useRolePermissions';

export const filterNavigationByRole = (
  pages: Record<string, NavigationPage>,
  permissions: RolePermissions,
  userRole?: string,
  adminLevel?: string
): Record<string, NavigationPage> => {
  const filteredPages: Record<string, NavigationPage> = {};

  Object.entries(pages).forEach(([key, page]) => {
    // Check if page has role restrictions
    if (page.requiredRole && userRole) {
      if (!page.requiredRole.includes(userRole)) {
        return; // Skip this page
      }
    }

    // Check if page has admin level restrictions
    if (page.adminLevel && adminLevel) {
      if (!page.adminLevel.includes(adminLevel)) {
        return; // Skip this page
      }
    }

    // Check if page requires specific permissions
    if (page.requiredPermission) {
      const permission = page.requiredPermission as keyof RolePermissions;
      if (!permissions[permission]) {
        return; // Skip this page
      }
    }

    // Role-specific dashboard filtering
    if (page.path.includes('-dashboard')) {
      const dashboardType = page.path.replace('/', '').replace('-dashboard', '');
      
      // Hide dashboards that don't match user's scope
      if (dashboardType === 'facility' && !permissions.canViewOwnFacility) return;
      if (dashboardType === 'woreda' && !permissions.canViewWoredasFacilities) return;
      if (dashboardType === 'zone' && !permissions.canViewZoneFacilities) return;
      if (dashboardType === 'regional' && !permissions.canViewRegionalFacilities) return;
      if (dashboardType === 'national' && !permissions.canViewNationalData) return;
    }

    // Admin-only pages
    if (page.category === 'admin' && !permissions.canManageUsers && !permissions.isAdmin) {
      return; // Skip admin pages for non-admin users
    }

    // Add the page if it passes all checks
    filteredPages[key] = page;
  });

  return filteredPages;
};

export const getDefaultDashboardRoute = (permissions: RolePermissions): string => {
  switch (permissions.dashboardType) {
    case 'facility': return '/facility-dashboard';
    case 'woreda': return '/woreda-dashboard';
    case 'zone': return '/zone-dashboard';
    case 'regional': return '/regional-dashboard';
    case 'national': return '/national-dashboard';
    default: return '/';
  }
};

export const shouldShowInSidebar = (
  page: NavigationPage,
  permissions: RolePermissions,
  userRole?: string,
  adminLevel?: string
): boolean => {
  if (!page.showInSidebar) return false;

  // Apply role filtering logic
  const filteredPages = filterNavigationByRole(
    { [page.path]: page },
    permissions,
    userRole,
    adminLevel
  );

  return Object.keys(filteredPages).length > 0;
};