import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  admin_level: string;
  justification: string;
  status: string;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_notes?: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
  facility?: {
    facility_name: string;
  } | null;
  woreda?: {
    woreda_name: string;
  } | null;
  zone?: {
    zone_name: string;
  } | null;
  region?: {
    region_name: string;
  } | null;
}

export const RoleApprovalTable: React.FC = () => {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRoleRequests();
  }, []);

  const loadRoleRequests = async () => {
    try {
      // First get all role requests
      const { data: requests, error: requestsError } = await supabase
        .from('user_role_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (requestsError) {
        console.error('Supabase error:', requestsError);
        throw requestsError;
      }

      // Then get related data for each request
      const enrichedRequests = await Promise.all(
        (requests || []).map(async (request) => {
          // Get profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', request.user_id)
            .maybeSingle();

          // Get facility data if applicable
          let facility = null;
          if (request.facility_id) {
            const { data: facilityData } = await supabase
              .from('facility')
              .select('facility_name')
              .eq('facility_id', request.facility_id)
              .maybeSingle();
            facility = facilityData;
          }

          // Get woreda data if applicable
          let woreda = null;
          if (request.woreda_id) {
            const { data: woredaData } = await supabase
              .from('woreda')
              .select('woreda_name')
              .eq('woreda_id', request.woreda_id)
              .maybeSingle();
            woreda = woredaData;
          }

          // Get zone data if applicable
          let zone = null;
          if (request.zone_id) {
            const { data: zoneData } = await supabase
              .from('zone')
              .select('zone_name')
              .eq('zone_id', request.zone_id)
              .maybeSingle();
            zone = zoneData;
          }

          // Get region data if applicable
          let region = null;
          if (request.region_id) {
            const { data: regionData } = await supabase
              .from('region')
              .select('region_name')
              .eq('region_id', request.region_id)
              .maybeSingle();
            region = regionData;
          }

          return {
            ...request,
            profiles: profile,
            facility,
            woreda,
            zone,
            region
          };
        })
      );

      setRequests(enrichedRequests);
    } catch (error: any) {
      console.error('Failed to load role requests:', error);
      toast({
        title: "Error",
        description: "Failed to load role requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.rpc('approve_role_request', {
        request_id: requestId,
        reviewer_notes: reviewNotes || null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role request approved successfully",
      });

      setSelectedRequest(null);
      setReviewNotes('');
      loadRoleRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.rpc('reject_role_request', {
        request_id: requestId,
        reviewer_notes: reviewNotes || null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role request rejected",
      });

      setSelectedRequest(null);
      setReviewNotes('');
      loadRoleRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatRoleName = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getLocationInfo = (request: RoleRequest) => {
    if (request.facility) return request.facility.facility_name;
    if (request.woreda) return request.woreda.woreda_name;
    if (request.zone) return request.zone.zone_name;
    if (request.region) return request.region.region_name;
    return 'National Level';
  };

  if (loading) {
    return <div>Loading role requests...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Role Approval Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Requested Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{request.profiles?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatRoleName(request.requested_role)}</TableCell>
                  <TableCell>{getLocationInfo(request)}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{format(new Date(request.requested_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review Role Request</DialogTitle>
                          </DialogHeader>
                          {selectedRequest && (
                            <div className="space-y-4">
                              <div>
                                <strong>User:</strong> {selectedRequest.profiles?.full_name} ({selectedRequest.profiles?.email})
                              </div>
                              <div>
                                <strong>Requested Role:</strong> {formatRoleName(selectedRequest.requested_role)}
                              </div>
                              <div>
                                <strong>Location:</strong> {getLocationInfo(selectedRequest)}
                              </div>
                              <div>
                                <strong>Justification:</strong>
                                <p className="mt-1 text-sm text-muted-foreground">{selectedRequest.justification}</p>
                              </div>
                              
                              {selectedRequest.status === 'pending' && (
                                <>
                                  <div>
                                    <Label htmlFor="review-notes">Review Notes (Optional)</Label>
                                    <Textarea
                                      id="review-notes"
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      placeholder="Add any notes for your decision..."
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleApprove(selectedRequest.id)}
                                      disabled={actionLoading}
                                      className="flex items-center gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleReject(selectedRequest.id)}
                                      disabled={actionLoading}
                                      className="flex items-center gap-2"
                                    >
                                      <XCircle className="h-4 w-4" />
                                      Reject
                                    </Button>
                                  </div>
                                </>
                              )}
                              
                              {selectedRequest.status !== 'pending' && (
                                <div>
                                  <strong>Reviewed:</strong> {selectedRequest.reviewed_at ? format(new Date(selectedRequest.reviewed_at), 'MMM d, yyyy HH:mm') : 'N/A'}
                                  {selectedRequest.reviewer_notes && (
                                    <p className="mt-1 text-sm text-muted-foreground">{selectedRequest.reviewer_notes}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {requests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No role requests found
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};