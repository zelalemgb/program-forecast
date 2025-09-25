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

  return {
    // Authentication data
    user,
    isAuthenticated: !!user,
    
    // Role data
    userRole: userRole?.role,
    adminLevel: userRole?.admin_level,
    facilityId: userRole?.facility_id,
    woredaId: userRole?.woreda_id,
    zoneId: userRole?.zone_id,
    regionId: userRole?.region_id,
    
    // Facility data
    facilityName: facilityInfo.facilityName,
    facilityType: facilityInfo.facilityType,
    locationDisplay: facilityInfo.locationDisplay,
    
    // Loading states
    loading: authLoading || roleLoading || facilityInfo.loading,
    
    // Error states
    error: facilityInfo.error,
    
    // Helper functions
    isAdmin: () => userRole?.role === 'admin',
    isAnalyst: () => userRole?.role === 'analyst',
    isViewer: () => userRole?.role === 'viewer',
    
    // Get user ID for forms
    getUserId: () => user?.id,
    
    // Get facility ID for facility-specific forms
    getFacilityId: () => userRole?.facility_id || null,
  };
};

export default useCurrentUser;