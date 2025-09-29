import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserRole {
  role: string;
  admin_level?: string;
  facility_id?: number;
  woreda_id?: number;
  zone_id?: number;
  region_id?: number;
}

export const userRoleQueryKey = (userId?: string) => ['user-role', userId] as const;

export const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
  console.debug(`[react-query] fetching user role for user ${userId}`);

  const { data, error } = await supabase
    .from('user_roles')
    .select('role, admin_level, facility_id, woreda_id, zone_id, region_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return (data as UserRole | null) ?? null;
};

export const createUserRoleQueryOptions = (userId?: string) => ({
  queryKey: userRoleQueryKey(userId),
  queryFn: async () => {
    if (!userId) {
      return null;
    }

    return fetchUserRole(userId);
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
});

export const useUserRole = () => {
  const { user } = useAuth();

  const query = useQuery<UserRole | null, Error>({
    ...createUserRoleQueryOptions(user?.id),
    enabled: !!user?.id,
  });

  const userRole = query.data ?? null;
  const isQueryLoading = query.isPending || query.isFetching;

  return {
    userRole,
    loading: !!user?.id ? isQueryLoading : false,
    error: query.error?.message ?? null,
  };
};

export default useUserRole;
