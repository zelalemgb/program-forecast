import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MetadataSummary {
  totalFacilities: number;
  facilityTypes: { type: string; count: number }[];
  totalProducts: number;
  totalUsers: number;
  loading: boolean;
  error: string | null;
}

export const useMetadataSummary = () => {
  const [summary, setSummary] = useState<MetadataSummary>({
    totalFacilities: 0,
    facilityTypes: [],
    totalProducts: 0,
    totalUsers: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setSummary(prev => ({ ...prev, loading: true, error: null }));

        // Fetch facilities data
        const { data: facilities, error: facilitiesError } = await supabase
          .from('facility')
          .select('facility_type');

        if (facilitiesError) throw facilitiesError;

        // Fetch products data
        const { data: products, error: productsError } = await supabase
          .from('product_reference')
          .select('id');

        if (productsError) throw productsError;

        // Fetch users data
        const { data: users, error: usersError } = await supabase
          .from('user_roles')
          .select('user_id');

        if (usersError) throw usersError;

        // Process facility types
        const typeCount: { [key: string]: number } = {};
        facilities?.forEach(facility => {
          const type = facility.facility_type || 'Unknown';
          typeCount[type] = (typeCount[type] || 0) + 1;
        });

        const facilityTypes = Object.entries(typeCount)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count);

        // Get unique users
        const uniqueUsers = new Set(users?.map(user => user.user_id) || []);

        setSummary({
          totalFacilities: facilities?.length || 0,
          facilityTypes,
          totalProducts: products?.length || 0,
          totalUsers: uniqueUsers.size,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching metadata summary:', err);
        setSummary(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch summary',
        }));
      }
    };

    fetchSummary();
  }, []);

  return summary;
};