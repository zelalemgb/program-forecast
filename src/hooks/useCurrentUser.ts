import { useMemo } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserFacility } from '@/hooks/useUserFacility';

/**
 * Comprehensive hook for getting current user information
 * including authentication, role, and facility data
 */
export const useCurrentUser = () => {
  const { user, loading: authLoading } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const facilityInfo = useUserFacility();

  const userId = useMemo(() => user?.id ?? null, [user?.id]);
  const facilityId = useMemo(() => userRole?.facility_id ?? null, [userRole?.facility_id]);
  const woredaId = useMemo(() => userRole?.woreda_id ?? null, [userRole?.woreda_id]);
  const zoneId = useMemo(() => userRole?.zone_id ?? null, [userRole?.zone_id]);
  const regionId = useMemo(() => userRole?.region_id ?? null, [userRole?.region_id]);
  const isAdmin = useMemo(() => userRole?.role === 'admin', [userRole?.role]);
  const isAnalyst = useMemo(() => userRole?.role === 'analyst', [userRole?.role]);
  const isViewer = useMemo(() => userRole?.role === 'viewer', [userRole?.role]);
  const isAuthenticated = useMemo(() => !!user, [user]);

  return {
    // Authentication data
    user,
    isAuthenticated,
    
    // Role data
    userRole: userRole?.role,
    adminLevel: userRole?.admin_level,
    facilityId,
    woredaId,
    zoneId,
    regionId,
    
    // Facility data
    facilityName: facilityInfo.facilityName,
    facilityType: facilityInfo.facilityType,
    locationDisplay: facilityInfo.locationDisplay,
    
    // Loading states
    loading: authLoading || roleLoading || facilityInfo.loading,
    
    // Error states
    error: facilityInfo.error,
    
    // Helper flags
    isAdmin,
    isAnalyst,
    isViewer,

    // Identifiers for forms
    userId,
  };
};

export default useCurrentUser;