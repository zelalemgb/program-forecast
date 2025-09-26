import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface FacilityData {
  facility_id: number;
  facility_name: string;
  facility_type?: string;
  woreda_id?: number;
}

export const useCurrentFacility = () => {
  const { user } = useAuth();
  const [facility, setFacility] = useState<FacilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchCurrentFacility = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's facility assignment from user_roles or user_facility_memberships
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('facility_id')
          .eq('user_id', user.id)
          .not('facility_id', 'is', null)
          .limit(1)
          .maybeSingle();

        if (rolesError) throw rolesError;

        let facilityId = userRoles?.facility_id;

        // If no facility in roles, check memberships
        if (!facilityId) {
          const { data: membership, error: membershipError } = await supabase
            .from('user_facility_memberships')
            .select('facility_id')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .limit(1)
            .maybeSingle();

          if (membershipError) throw membershipError;
          facilityId = membership?.facility_id;
        }

        if (facilityId) {
          const { data: facilityData, error: facilityError } = await supabase
            .from('facility')
            .select('facility_id, facility_name, facility_type, woreda_id')
            .eq('facility_id', facilityId)
            .single();

          if (facilityError) throw facilityError;
          setFacility(facilityData);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch facility');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentFacility();
  }, [user]);

  return { facility, loading, error };
};