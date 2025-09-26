import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  admin_level?: string;
  created_at?: string;
  assigned_at?: string;
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

export const UserRolesList: React.FC = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserRoles();
  }, []);

  const loadUserRoles = async () => {
    try {
      // First, get all user roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) {
        setUserRoles([]);
        return;
      }

      // Get unique user IDs to fetch profiles
      const userIds = [...new Set(roleData.map(role => role.user_id))];
      
      // Fetch profiles for all users
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
      }

      // Get unique facility IDs to fetch facility names
      const facilityIds = roleData
        .filter(role => role.facility_id)
        .map(role => role.facility_id)
        .filter((id, index, self) => self.indexOf(id) === index);

      let facilityData = [];
      if (facilityIds.length > 0) {
        const { data: facilities, error: facilityError } = await supabase
          .from('facility')
          .select('facility_id, facility_name')
          .in('facility_id', facilityIds);

        if (facilityError) {
          console.error('Error fetching facilities:', facilityError);
        } else {
          facilityData = facilities || [];
        }
      }

      // Combine the data
      const combinedData = roleData.map(role => {
        const profile = profileData?.find(p => p.user_id === role.user_id);
        const facility = facilityData.find(f => f.facility_id === role.facility_id);
        
        return {
          ...role,
          profiles: profile || null,
          facility: facility ? { facility_name: facility.facility_name } : null
        };
      });

      setUserRoles(combinedData as any);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load user roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role removed successfully",
      });

      loadUserRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatRoleName = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getLocationInfo = (userRole: UserRole) => {
    if (userRole.facility) return userRole.facility.facility_name;
    if (userRole.woreda) return userRole.woreda.woreda_name;
    if (userRole.zone) return userRole.zone.zone_name;
    if (userRole.region) return userRole.region.region_name;
    return 'National Level';
  };

  const getRoleBadgeVariant = (role: string) => {
    const adminRoles = ['admin', 'national_user', 'program_officer'];
    const facilityRoles = ['facility_admin', 'facility_manager', 'facility_logistic_officer'];
    
    if (adminRoles.includes(role)) return 'destructive';
    if (facilityRoles.includes(role)) return 'default';
    return 'secondary';
  };

  if (loading) {
    return <div>Loading user roles...</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Location/Scope</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRoles.map((userRole) => (
              <TableRow key={userRole.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{userRole.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">{userRole.profiles?.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(userRole.role)}>
                    {formatRoleName(userRole.role)}
                  </Badge>
                </TableCell>
                <TableCell>{getLocationInfo(userRole)}</TableCell>
                <TableCell>{new Date(userRole.created_at || userRole.assigned_at || Date.now()).toLocaleDateString()}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove User Role</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove the "{formatRoleName(userRole.role)}" role from {userRole.profiles?.full_name}? 
                          This action cannot be undone and the user will lose access to associated features.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveRole(userRole.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove Role
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {userRoles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No user roles found
          </div>
        )}
      </CardContent>
    </Card>
  );
};