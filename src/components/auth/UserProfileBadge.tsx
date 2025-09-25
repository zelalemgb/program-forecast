import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserFacility } from '@/hooks/useUserFacility';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, MapPin, Shield } from 'lucide-react';

export const UserProfileBadge: React.FC = () => {
  const { user } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const facilityInfo = useUserFacility();

  if (!user) return null;

  const loading = roleLoading || facilityInfo.loading;

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    );
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="hero-gradient text-white">
          {getInitials(user.email || 'U')}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <User className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium truncate">
            {user.email}
          </p>
        </div>
        
        {userRole && (
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              {userRole.role}
              {userRole.admin_level && ` (${userRole.admin_level})`}
            </Badge>
          </div>
        )}
        
        {facilityInfo?.facilityName && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground truncate">
              {facilityInfo.facilityName}
              {facilityInfo.locationDisplay && ` - ${facilityInfo.locationDisplay}`}
            </p>
          </div>
        )}
        
        {!facilityInfo?.facilityName && !userRole?.role && (
          <p className="text-xs text-amber-600">
            Role assignment pending
          </p>
        )}
      </div>
    </div>
  );
};

export default UserProfileBadge;