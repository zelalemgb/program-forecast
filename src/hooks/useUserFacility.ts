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

interface UserRole {
  role: string | null;
  admin_level: string | null;
  facility_id: number | null;
  woreda_id: number | null;
  zone_id: number | null;
  region_id: number | null;
}

interface FacilityHierarchy {
  facility_name: string;
  facility_type: string | null;
  woreda?: {
    woreda_name?: string;
    zone?: {
      zone_name?: string;
      region?: {
        region_name?: string;
      };
    };
  };
}

interface WoredaLocation {
  woreda_name?: string;
  zone?: {
    zone_name?: string;
    region?: {
      region_name?: string;
    };
  };
}

interface ZoneLocation {
  zone_name?: string;
  region?: {
    region_name?: string;
  };
}

interface RegionLocation {
  region_name?: string;
}

type AdministrativeLocation = WoredaLocation | ZoneLocation | RegionLocation | null;

interface PendingRequest {
  requested_role: string | null;
  admin_level: string | null;
  status: string;
}

type LocationSource = AdministrativeLocation | FacilityHierarchy['woreda'] | null | undefined;

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

    const collectLocationParts = (location: LocationSource) => {
      if (!location) return [];

      const parts: string[] = [];

      if ('woreda_name' in location && location.woreda_name) {
        parts.push(location.woreda_name);
      }

      if ('zone_name' in location && location.zone_name) {
        parts.push(location.zone_name);
      }

      if ('region_name' in location && location.region_name) {
        parts.push(location.region_name);
      }

      if ('zone' in location && location.zone?.zone_name) {
        parts.push(location.zone.zone_name);
      }

      if ('zone' in location && location.zone?.region?.region_name) {
        parts.push(location.zone.region.region_name);
      }

      if ('region' in location && location.region?.region_name) {
        parts.push(location.region.region_name);
      }

      return Array.from(new Set(parts));
    };

    const fetchFacilityWithHierarchy = async (facilityId: number): Promise<FacilityHierarchy | null> => {
      const { data, error } = await supabase
        .from('facility')
        .select(
          `
            facility_name,
            facility_type,
            woreda:woreda_id (
              woreda_name,
              zone:zone_id (
                zone_name,
                region:region_id (
                  region_name
                )
              )
            )
          `
        )
        .eq('facility_id', facilityId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data as FacilityHierarchy | null) ?? null;
    };

    const fetchAdministrativeLocation = async (role: UserRole): Promise<AdministrativeLocation> => {
      if (role.woreda_id) {
        const { data, error } = await supabase
          .from('woreda')
          .select(
            `
              woreda_name,
              zone:zone_id (
                zone_name,
                region:region_id (
                  region_name
                )
              )
            `
          )
          .eq('woreda_id', role.woreda_id)
          .maybeSingle();

        if (error) throw error;
        return data;
      }

      if (role.zone_id) {
        const { data, error } = await supabase
          .from('zone')
          .select(
            `
              zone_name,
              region:region_id (
                region_name
              )
            `
          )
          .eq('zone_id', role.zone_id)
          .maybeSingle();

        if (error) throw error;
        return data;
      }

      if (role.region_id) {
        const { data, error } = await supabase
          .from('region')
          .select('region_name')
          .eq('region_id', role.region_id)
          .maybeSingle();

        if (error) throw error;
        return data;
      }

      return null;
    };

    const buildLocationDisplay = ({
      facility,
      location,
      adminLevel,
      role,
    }: {
      facility?: FacilityHierarchy | null;
      location?: AdministrativeLocation;
      adminLevel: string | null;
      role: string | null;
    }) => {
      if (facility) {
        const locationParts = collectLocationParts(facility.woreda);
        let display = `${facility.facility_name}${facility.facility_type ? ` (${facility.facility_type})` : ''}`;
        if (locationParts.length) {
          display += ` – ${locationParts.join(', ')}`;
        }
        return display;
      }

      const locationParts = collectLocationParts(location);
      if (locationParts.length) {
        return `${locationParts.join(', ')}${adminLevel ? ` – ${adminLevel} Level` : ''}`;
      }

      return role ? `${role} Dashboard` : 'National Overview';
    };

    const buildPendingOrNoRoleInfo = async (): Promise<UserFacilityInfo> => {
      const [
        { data: pendingRequestsData, error: pendingError },
        { data: profileData, error: profileError },
      ] = await Promise.all([
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
          .maybeSingle(),
      ]);

      if (pendingError) throw pendingError;
      if (profileError) throw profileError;

      const pendingRequests = (pendingRequestsData as PendingRequest[] | null) || [];
      const preferredFacilityId = profileData?.preferred_facility_id as number | null | undefined;

      if (preferredFacilityId) {
        const facility = await fetchFacilityWithHierarchy(preferredFacilityId);
        const locationDisplay = facility
          ? buildLocationDisplay({ facility, adminLevel: pendingRequests[0]?.admin_level ?? null, role: pendingRequests[0]?.requested_role ?? null })
          : 'Preferred Facility';

        return {
          facilityName: facility?.facility_name ?? null,
          facilityType: facility?.facility_type ?? null,
          role: pendingRequests.length ? 'Pending Approval' : 'No Role Assigned',
          adminLevel: pendingRequests[0]?.admin_level ?? null,
          locationDisplay: pendingRequests.length ? `${locationDisplay} – awaiting approval` : locationDisplay,
          loading: false,
          error: null,
        };
      }

      if (pendingRequests.length > 0) {
        return {
          facilityName: null,
          facilityType: null,
          role: 'Pending Approval',
          adminLevel: pendingRequests[0].admin_level,
          locationDisplay: 'Role request pending approval',
          loading: false,
          error: null,
        };
      }

      return {
        facilityName: null,
        facilityType: null,
        role: 'No Role Assigned',
        adminLevel: null,
        locationDisplay: 'Please contact administrator',
        loading: false,
        error: null,
      };
    };

    const buildAssignedRoleInfo = async (primaryRole: UserRole): Promise<UserFacilityInfo> => {
      const facilityPromise: Promise<FacilityHierarchy | null> = primaryRole.facility_id
        ? fetchFacilityWithHierarchy(primaryRole.facility_id)
        : Promise.resolve<FacilityHierarchy | null>(null);

      const locationPromise: Promise<AdministrativeLocation> = primaryRole.facility_id
        ? Promise.resolve<AdministrativeLocation>(null)
        : fetchAdministrativeLocation(primaryRole);

      const [facility, location] = await Promise.all([facilityPromise, locationPromise]);

      const locationDisplay = buildLocationDisplay({
        facility,
        location,
        adminLevel: primaryRole.admin_level,
        role: primaryRole.role,
      });

      return {
        facilityName: facility?.facility_name ?? null,
        facilityType: facility?.facility_type ?? null,
        role: primaryRole.role,
        adminLevel: primaryRole.admin_level,
        locationDisplay,
        loading: false,
        error: null,
      };
    };

    const fetchUserFacilityInfo = async () => {
      try {
        setFacilityInfo(prev => ({ ...prev, loading: true, error: null }));

        // First, get user's roles and admin assignments
        const { data: userRolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role, admin_level, facility_id, woreda_id, zone_id, region_id')
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          throw rolesError;
        }

        const userRoles = (userRolesData as UserRole[] | null) ?? [];

        if (userRoles.length === 0) {
          const info = await buildPendingOrNoRoleInfo();
          setFacilityInfo(info);
          return;
        }

        // Get the primary role (first one for now, could be enhanced to prioritize)
        const primaryRole = userRoles[0];
        const info = await buildAssignedRoleInfo(primaryRole);
        setFacilityInfo(info);

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