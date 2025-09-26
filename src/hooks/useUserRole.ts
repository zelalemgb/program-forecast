import { useState, useEffect } from 'react';
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

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role, admin_level, facility_id, woreda_id, zone_id, region_id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (roleError && roleError.code !== 'PGRST116') {
          throw roleError;
        }

        setUserRole(roleData);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user role');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { userRole, loading, error };
};

export default useUserRole;