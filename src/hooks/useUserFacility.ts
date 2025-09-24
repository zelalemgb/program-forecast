import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UserFacilityInfo {
  facilityName: string | null;
  facilityType: string | null;
  role: string | null;
  adminLevel: string | null;
  locationDisplay: string | null;
  loading: boolean;
  error: string | null;
}

export const useUserFacility = (): UserFacilityInfo => {
  const { user } = useAuth();
  const [facilityInfo, setFacilityInfo] = useState<UserFacilityInfo>({
    facilityName: null,
    facilityType: null,
    role: null,
    adminLevel: null,
    locationDisplay: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setFacilityInfo(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchUserFacilityInfo = async () => {
      try {
        setFacilityInfo(prev => ({ ...prev, loading: true, error: null }));

        // First, get user's roles and admin assignments
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role, admin_level, facility_id, woreda_id, zone_id, region_id')
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          throw rolesError;
        }

        if (!userRoles || userRoles.length === 0) {
          // Check if user has pending role requests
          const { data: pendingRequests } = await supabase
            .from('user_role_requests')
            .select('requested_role, admin_level, status')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .limit(1);

          if (pendingRequests && pendingRequests.length > 0) {
            setFacilityInfo(prev => ({
              ...prev,
              role: 'Pending Approval',
              adminLevel: pendingRequests[0].admin_level,
              facilityName: null,
              locationDisplay: 'Role request pending approval',
              loading: false,
            }));
            return;
          }

          setFacilityInfo(prev => ({
            ...prev,
            role: 'No Role Assigned',
            locationDisplay: 'Please contact administrator',
            loading: false,
          }));
          return;
        }

        // Get the primary role (first one for now, could be enhanced to prioritize)
        const primaryRole = userRoles[0];

        let locationInfo: any = null;
        let facilityName = null;
        let facilityType = null;

        // Get facility info if user is assigned to a facility
        if (primaryRole.facility_id) {
          const { data: facilityData, error: facilityError } = await supabase
            .from('facility')
            .select(`
              facility_name,
              facility_type,
              woreda(
                woreda_name,
                zone(
                  zone_name,
                  region(region_name)
                )
              )
            `)
            .eq('facility_id', primaryRole.facility_id)
            .single();

          if (facilityError) {
            console.error('Error fetching facility data:', facilityError);
            // Don't throw, just continue without facility data
          } else if (facilityData) {
            facilityName = facilityData.facility_name;
            facilityType = facilityData.facility_type;
            locationInfo = facilityData;
          }
        }
        // Get woreda info if user is assigned to woreda level
        else if (primaryRole.woreda_id) {
          const { data: woredaData, error: woredaError } = await supabase
            .from('woreda')
            .select(`
              woreda_name,
              zone(
                zone_name,
                region(region_name)
              )
            `)
            .eq('woreda_id', primaryRole.woreda_id)
            .single();

          if (woredaError) {
            console.error('Error fetching woreda data:', woredaError);
          } else if (woredaData) {
            locationInfo = woredaData;
          }
        }
        // Get zone info if user is assigned to zone level
        else if (primaryRole.zone_id) {
          const { data: zoneData, error: zoneError } = await supabase
            .from('zone')
            .select(`
              zone_name,
              region(region_name)
            `)
            .eq('zone_id', primaryRole.zone_id)
            .single();

          if (zoneError) {
            console.error('Error fetching zone data:', zoneError);
          } else if (zoneData) {
            locationInfo = zoneData;
          }
        }
        // Get region info if user is assigned to region level
        else if (primaryRole.region_id) {
          const { data: regionData, error: regionError } = await supabase
            .from('region')
            .select('region_name')
            .eq('region_id', primaryRole.region_id)
            .single();

          if (regionError) {
            console.error('Error fetching region data:', regionError);
          } else if (regionData) {
            locationInfo = regionData;
          }
        }

        // Build location display string
        let locationDisplay = 'National Overview';
        if (facilityName) {
          const locationParts = [];
          if (locationInfo?.woreda?.woreda_name) locationParts.push(locationInfo.woreda.woreda_name);
          if (locationInfo?.woreda?.zone?.zone_name) locationParts.push(locationInfo.woreda.zone.zone_name);
          if (locationInfo?.woreda?.zone?.region?.region_name) locationParts.push(locationInfo.woreda.zone.region.region_name);
          
          locationDisplay = `${facilityName}${facilityType ? ` (${facilityType})` : ''}`;
          if (locationParts.length > 0) {
            locationDisplay += ` – ${locationParts.join(', ')}`;
          }
        } else if (locationInfo) {
          const locationParts = [];
          if (locationInfo.woreda_name) locationParts.push(locationInfo.woreda_name);
          if (locationInfo.zone_name) locationParts.push(locationInfo.zone_name);
          if (locationInfo.zone?.zone_name) locationParts.push(locationInfo.zone.zone_name);
          if (locationInfo.region_name) locationParts.push(locationInfo.region_name);
          if (locationInfo.region?.region_name) locationParts.push(locationInfo.region.region_name);
          if (locationInfo.zone?.region?.region_name) locationParts.push(locationInfo.zone.region.region_name);
          
          locationDisplay = locationParts.join(', ') + ` – ${primaryRole.admin_level} Level`;
        }

        setFacilityInfo({
          facilityName,
          facilityType,
          role: primaryRole.role,
          adminLevel: primaryRole.admin_level,
          locationDisplay,
          loading: false,
          error: null,
        });

      } catch (error: any) {
        console.error('Error fetching user facility info:', error);
        setFacilityInfo(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load user information',
        }));
      }
    };

    fetchUserFacilityInfo();
  }, [user]);

  return facilityInfo;
};