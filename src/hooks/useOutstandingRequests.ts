import { useState, useEffect } from 'react';
import { useCurrentUser } from './useCurrentUser';

export interface OutstandingRequest {
  id: string;
  department_name: string;
  product_name: string;
  requested_quantity: number;
  unit: string;
  requested_date: string;
  urgency_level: 'normal' | 'urgent' | 'emergency';
  status: 'pending' | 'approved' | 'rejected';
}

export const useOutstandingRequests = () => {
  const [requests, setRequests] = useState<OutstandingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { facilityId } = useCurrentUser();

  const fetchOutstandingRequests = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockRequests: OutstandingRequest[] = [
        {
          id: '1',
          department_name: 'Emergency Department',
          product_name: 'Paracetamol 500mg',
          requested_quantity: 100,
          unit: 'tablets',
          requested_date: new Date().toISOString().split('T')[0],
          urgency_level: 'urgent',
          status: 'pending'
        },
        {
          id: '2',
          department_name: 'ICU',
          product_name: 'Normal Saline 0.9%',
          requested_quantity: 50,
          unit: 'bottles',
          requested_date: new Date().toISOString().split('T')[0],
          urgency_level: 'emergency',
          status: 'pending'
        },
        {
          id: '3',
          department_name: 'Pediatrics',
          product_name: 'Amoxicillin 250mg',
          requested_quantity: 75,
          unit: 'capsules',
          requested_date: new Date().toISOString().split('T')[0],
          urgency_level: 'normal',
          status: 'pending'
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching outstanding requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (facilityId != null) {
      fetchOutstandingRequests();
    }
  }, [facilityId]);

  return {
    requests: requests.filter(r => r.status === 'pending'),
    loading,
    refetch: fetchOutstandingRequests
  };
};