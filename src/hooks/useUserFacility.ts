import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useUserRole, UserRole } from '@/hooks/useUserRole';

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

type LocationSource =
  | AdministrativeLocation
  | FacilityHierarchy['woreda']
  | null
  | undefined;

interface PendingRequest {
  requested_role: string | null;
  admin_level: string | null;
  status: string;
}

export interface UserFacilityInfo {
  facilityName: string | null;
  facilityType: string | null;
  role: string | null;
  adminLevel: string | null;
  locationDisplay: string | null;
  loading: boolean;
  error: string | null;
}

export const defaultFacilityInfo: UserFacilityInfo = {
  facilityName: null,
  facilityType: null,
  role: null,
  adminLevel: null,
  locationDisplay: null,
  loading: false,
  error: null,
};

const collectLocationParts = (location: LocationSource) => {
  if (!location) return [] as string[];

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

const fetchFacilityWithHierarchy = async (
  facilityId: number,
): Promise<FacilityHierarchy | null> => {
  const { data, error } = await supabase
    .from('facility')
    .select(
      `
        facility_name,
        facility_type,
        woreda!facility_woreda_id_fkey (
          woreda_name,
          zone!woreda_zone_id_fkey (
            zone_name,
            region!zone_region_id_fkey (
              region_name
            )
          )
        )
      `,
    )
    .eq('facility_id', facilityId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as FacilityHierarchy | null) ?? null;
};

const fetchAdministrativeLocation = async (
  role: UserRole,
): Promise<AdministrativeLocation> => {
  if (role.woreda_id) {
    const { data, error } = await supabase
      .from('woreda')
      .select(
        `
          woreda_name,
          zone!woreda_zone_id_fkey (
            zone_name,
            region!zone_region_id_fkey (
              region_name
            )
          )
        `,
      )
      .eq('woreda_id', role.woreda_id)
      .maybeSingle();

    if (error) throw error;
    return data as WoredaLocation | null;
  }

  if (role.zone_id) {
    const { data, error } = await supabase
      .from('zone')
      .select(
        `
          zone_name,
          region!zone_region_id_fkey (
            region_name
          )
        `,
      )
      .eq('zone_id', role.zone_id)
      .maybeSingle();

    if (error) throw error;
    return data as ZoneLocation | null;
  }

  if (role.region_id) {
    const { data, error } = await supabase
      .from('region')
      .select('region_name')
      .eq('region_id', role.region_id)
      .maybeSingle();

    if (error) throw error;
    return data as RegionLocation | null;
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

const buildPendingOrNoRoleInfo = async (userId: string): Promise<UserFacilityInfo> => {
  const [
    { data: pendingRequestsData, error: pendingError },
    { data: profileData, error: profileError },
  ] = await Promise.all([
    supabase
      .from('user_role_requests')
      .select('requested_role, admin_level, status')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .limit(1),
    supabase
      .from('profiles')
      .select('preferred_facility_id')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  if (pendingError) throw pendingError;
  if (profileError) throw profileError;

  const pendingRequests = (pendingRequestsData as PendingRequest[] | null) || [];
  const preferredFacilityId = profileData?.preferred_facility_id as number | null | undefined;

  if (preferredFacilityId) {
    const facility = await fetchFacilityWithHierarchy(preferredFacilityId);
    const locationDisplay = facility
      ? buildLocationDisplay({
          facility,
          adminLevel: pendingRequests[0]?.admin_level ?? null,
          role: pendingRequests[0]?.requested_role ?? null,
        })
      : 'Preferred Facility';

    return {
      facilityName: facility?.facility_name ?? null,
      facilityType: facility?.facility_type ?? null,
      role: pendingRequests.length ? 'Pending Approval' : 'No Role Assigned',
      adminLevel: pendingRequests[0]?.admin_level ?? null,
      locationDisplay: pendingRequests.length
        ? `${locationDisplay} – awaiting approval`
        : locationDisplay,
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

const buildAssignedRoleInfo = async (
  primaryRole: UserRole,
): Promise<UserFacilityInfo> => {
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
    adminLevel: primaryRole.admin_level ?? null,
    role: primaryRole.role ?? null,
  });

  return {
    facilityName: facility?.facility_name ?? null,
    facilityType: facility?.facility_type ?? null,
    role: primaryRole.role ?? null,
    adminLevel: primaryRole.admin_level ?? null,
    locationDisplay,
    loading: false,
    error: null,
  };
};

export const buildUserRoleSignature = (role: UserRole | null | undefined) => {
  if (!role) {
    return 'no-role';
  }

  return [
    role.role ?? 'unknown-role',
    role.admin_level ?? 'unknown-level',
    role.facility_id ?? 'no-facility',
    role.woreda_id ?? 'no-woreda',
    role.zone_id ?? 'no-zone',
    role.region_id ?? 'no-region',
  ].join('|');
};

export const userFacilityQueryKey = (
  userId?: string,
  roleSignature?: string,
) => ['user-facility', userId, roleSignature ?? 'no-role'] as const;

export const fetchUserFacilityInfo = async ({
  userId,
  primaryRole,
}: {
  userId: string;
  primaryRole: UserRole | null;
}): Promise<UserFacilityInfo> => {
  console.debug(
    `[react-query] fetching facility metadata for user ${userId} (role signature: ${buildUserRoleSignature(primaryRole)})`,
  );

  if (!primaryRole) {
    return buildPendingOrNoRoleInfo(userId);
  }

  return buildAssignedRoleInfo(primaryRole);
};

export const createUserFacilityQueryOptions = (
  userId?: string,
  primaryRole?: UserRole | null,
) => ({
  queryKey: userFacilityQueryKey(userId, buildUserRoleSignature(primaryRole)),
  queryFn: async () => {
    if (!userId) {
      return defaultFacilityInfo;
    }

    return fetchUserFacilityInfo({
      userId,
      primaryRole: primaryRole ?? null,
    });
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
});

export const useUserFacility = (): UserFacilityInfo => {
  const { user } = useAuth();
  const { userRole, loading: roleLoading, error: roleError } = useUserRole();

  const facilityQuery = useQuery<UserFacilityInfo, Error>({
    ...createUserFacilityQueryOptions(user?.id, userRole),
    enabled: !!user?.id && !roleLoading && !roleError,
  });

  const facilityInfo = facilityQuery.data ?? defaultFacilityInfo;
  const facilityLoading = facilityQuery.isPending || facilityQuery.isFetching;

  return {
    ...facilityInfo,
    loading: !!user?.id ? roleLoading || facilityLoading : false,
    error: roleError ?? facilityQuery.error?.message ?? facilityInfo.error,
  };
};

export default useUserFacility;
