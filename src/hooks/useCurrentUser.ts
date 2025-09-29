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

  return {
    // Authentication data
    user,
    isAuthenticated: !!user,

    // Role data
    userRole: resolvedRole?.role,
    adminLevel: resolvedRole?.admin_level,
    facilityId: resolvedRole?.facility_id,
    woredaId: resolvedRole?.woreda_id,
    zoneId: resolvedRole?.zone_id,
    regionId: resolvedRole?.region_id,

    // Facility data
    facilityName: facilityInfo.facilityName,
    facilityType: facilityInfo.facilityType,
    locationDisplay: facilityInfo.locationDisplay,

    // Loading states
    loading: authLoading || (!!user?.id && (roleLoading || facilityLoading)),

    // Error states
    error:
      roleQuery.error?.message ??
      facilityQuery.error?.message ??
      facilityInfo.error,

    // Helper functions
    isAdmin: () => resolvedRole?.role === 'admin',
    isAnalyst: () => resolvedRole?.role === 'analyst',
    isViewer: () => resolvedRole?.role === 'viewer',

    // Get user ID for forms
    getUserId: () => user?.id,

    // Get facility ID for facility-specific forms
    getFacilityId: () => resolvedRole?.facility_id ?? null,
  };
};

export default useCurrentUser;
