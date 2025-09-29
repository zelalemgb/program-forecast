import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  createUserRoleQueryOptions,
  UserRole,
} from '@/hooks/useUserRole';
import {
  createUserFacilityQueryOptions,
  defaultFacilityInfo,
  UserFacilityInfo,
} from '@/hooks/useUserFacility';

/**
 * Comprehensive hook for getting current user information
 * including authentication, role, and facility data
 */
export const useCurrentUser = () => {
  const { user, loading: authLoading } = useAuth();

  const roleQuery = useQuery<UserRole | null, Error>({
    ...createUserRoleQueryOptions(user?.id),
    enabled: !!user?.id,
  });

  const resolvedRole = roleQuery.data ?? null;
  const roleLoading = roleQuery.isPending || roleQuery.isFetching;

  const facilityQuery = useQuery<UserFacilityInfo, Error>({
    ...createUserFacilityQueryOptions(user?.id, resolvedRole),
    enabled: !!user?.id && !roleQuery.isPending && !roleQuery.isError,
  });

  const facilityInfo = facilityQuery.data ?? defaultFacilityInfo;
  const facilityLoading = facilityQuery.isPending || facilityQuery.isFetching;

  const roleDetails = resolvedRole;
  const facilityRole = facilityInfo.role ?? roleDetails?.role ?? null;
  const facilityAdminLevel = facilityInfo.adminLevel ?? roleDetails?.admin_level ?? null;

  return {
    // Authentication data
    user,
    isAuthenticated: !!user,

    // Role data
    roleDetails,
    userRole: roleDetails?.role ?? null,
    adminLevel: roleDetails?.admin_level ?? null,
    facilityId: roleDetails?.facility_id ?? null,
    woredaId: roleDetails?.woreda_id ?? null,
    zoneId: roleDetails?.zone_id ?? null,
    regionId: roleDetails?.region_id ?? null,

    // Facility data
    facilityInfo,
    facilityName: facilityInfo.facilityName,
    facilityType: facilityInfo.facilityType,
    facilityRole,
    facilityAdminLevel,
    locationDisplay: facilityInfo.locationDisplay,

    // Loading states
    loading: authLoading || (!!user?.id && (roleLoading || facilityLoading)),

    // Error states
    error:
      roleQuery.error?.message ??
      facilityQuery.error?.message ??
      facilityInfo.error,

    // Helper functions
    isAdmin: () => roleDetails?.role === 'admin',
    isAnalyst: () => roleDetails?.role === 'analyst',
    isViewer: () => roleDetails?.role === 'viewer',

    // Get user ID for forms
    getUserId: () => user?.id,

    // Get facility ID for facility-specific forms
    getFacilityId: () => roleDetails?.facility_id ?? null,
  };
};

export default useCurrentUser;
