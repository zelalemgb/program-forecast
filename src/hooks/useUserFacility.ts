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
          // Check pending requests and preferred facility in profile concurrently
          const [pendingReqRes, profileRes] = await Promise.all([
            supabase
              .from('user_role_requests')
              .select('requested_role, admin_level, status')
              .eq('user_id', user.id)
              .eq('status', 'pending')
              .limit(1),
            supabase
              .from('profiles')
              .select('preferred_facility_id')
              .eq('user_id', user.id)
              .maybeSingle()
          ]);

          const pendingRequests = pendingReqRes.data || [];
          const preferredFacilityId = profileRes.data?.preferred_facility_id as number | null | undefined;

          // If user saved a preferred facility in profile, use it for display
          if (preferredFacilityId) {
            // Fetch facility basic info
            const { data: fac, error: facErr } = await supabase
              .from('facility')
              .select('facility_name, facility_type, woreda_id')
              .eq('facility_id', preferredFacilityId)
              .maybeSingle();

            let locationDisplay = 'Preferred Facility';
            let facilityName: string | null = null;
            let facilityType: string | null = null;

            if (!facErr && fac) {
              facilityName = fac.facility_name;
              facilityType = fac.facility_type;

              // Resolve hierarchy
              let parts: string[] = [];
              if (fac.woreda_id) {
                const { data: w } = await supabase.from('woreda').select('woreda_name, zone_id').eq('woreda_id', fac.woreda_id).maybeSingle();
                if (w) {
                  parts.push(w.woreda_name);
                  const { data: z } = await supabase.from('zone').select('zone_name, region_id').eq('zone_id', w.zone_id).maybeSingle();
                  if (z) {
                    parts.push(z.zone_name);
                    const { data: r } = await supabase.from('region').select('region_name').eq('region_id', z.region_id).maybeSingle();
                    if (r) parts.push(r.region_name);
                  }
                }
              }
              locationDisplay = `${facilityName}${facilityType ? ` (${facilityType})` : ''}${parts.length ? ` – ${parts.join(', ')}` : ''}`;
            }

            setFacilityInfo({
              facilityName,
              facilityType,
              role: pendingRequests.length ? 'Pending Approval' : 'No Role Assigned',
              adminLevel: pendingRequests[0]?.admin_level ?? null,
              locationDisplay: pendingRequests.length ? `${locationDisplay} – awaiting approval` : locationDisplay,
              loading: false,
              error: null,
            });
            return;
          }

          // Fall back to pending/no role messages
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
          // Fetch facility and resolve hierarchy step-by-step to avoid ambiguous FK embeds
          const { data: fac, error: facErr } = await supabase
            .from('facility')
            .select('facility_name, facility_type, woreda_id')
            .eq('facility_id', primaryRole.facility_id)
            .maybeSingle();

          if (!facErr && fac) {
            facilityName = fac.facility_name;
            facilityType = fac.facility_type;
            
            // Resolve hierarchy
            let resolved: any = {};
            if (fac.woreda_id) {
              const { data: w } = await supabase.from('woreda').select('woreda_name, zone_id').eq('woreda_id', fac.woreda_id).maybeSingle();
              if (w) {
                resolved.woreda = { woreda_name: w.woreda_name } as any;
                const { data: z } = await supabase.from('zone').select('zone_name, region_id').eq('zone_id', w.zone_id).maybeSingle();
                if (z) {
                  resolved.woreda.zone = { zone_name: z.zone_name } as any;
                  const { data: r } = await supabase.from('region').select('region_name').eq('region_id', z.region_id).maybeSingle();
                  if (r) {
                    resolved.woreda.zone.region = { region_name: r.region_name } as any;
                  }
                }
              }
            }
            locationInfo = resolved;
          } else if (facErr) {
            console.error('Error fetching facility data:', facErr);
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
        } else {
          // For users without facility assignment, show role-based view
          locationDisplay = `${primaryRole.role} Dashboard`;
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