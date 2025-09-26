import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { RoleBadge } from '@/components/ui/role-badge';
import { DataScopeIndicator } from '@/components/ui/data-scope-indicator';
import { 
  Building2, 
  MapPin, 
  Map, 
  Globe, 
  Shield,
  Eye,
  Edit,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface UserContextIndicatorProps {
  showDetails?: boolean;
  showPermissions?: boolean;
  className?: string;
}

export const UserContextIndicator: React.FC<UserContextIndicatorProps> = ({ 
  showDetails = true, 
  showPermissions = false,
  className = '' 
}) => {
  const permissions = useRolePermissions();
  const { 
    userRole, 
    adminLevel, 
    facilityName, 
    locationDisplay,
    isAuthenticated,
    loading 
  } = useCurrentUser();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse bg-muted h-4 w-20 rounded" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getAccessLevelIcon = () => {
    switch (permissions.dataScope) {
      case 'facility': return Building2;
      case 'woreda': return MapPin;
      case 'zone': return Map;
      case 'regional': return Map;
      case 'national': return Globe;
      default: return Shield;
    }
  };

  const AccessIcon = getAccessLevelIcon();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Role Badge */}
      <RoleBadge 
        role={userRole} 
        adminLevel={adminLevel}
        showIcon 
        className="font-medium"
      />
      
      {showDetails && (
        <>
          <Separator orientation="vertical" className="h-4" />
          
          {/* Data Scope */}
          <div className="flex items-center gap-2">
            <AccessIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {facilityName || locationDisplay || permissions.dataScope}
            </span>
            {permissions.isReadOnly && (
              <Eye className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </>
      )}

      {showPermissions && (
        <>
          <Separator orientation="vertical" className="h-4" />
          
          {/* Permission Indicators */}
          <div className="flex items-center gap-1">
            {permissions.canEditFacilityData && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Badge>
            )}
            {permissions.canManageUsers && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                <Users className="h-3 w-3 mr-1" />
                Users
              </Badge>
            )}
            {permissions.canGenerateForecast && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                <CheckCircle className="h-3 w-3 mr-1" />
                Forecast
              </Badge>
            )}
            {permissions.isReadOnly && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                <Eye className="h-3 w-3 mr-1" />
                Read-Only
              </Badge>
            )}
          </div>
        </>
      )}
      
      {/* Admin indicator */}
      {permissions.isAdmin && (
        <>
          <Separator orientation="vertical" className="h-4" />
          <Badge variant="default" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        </>
      )}
    </div>
  );
};

interface PermissionStatusProps {
  action: string;
  allowed: boolean;
  reason?: string;
  className?: string;
}

export const PermissionStatus: React.FC<PermissionStatusProps> = ({ 
  action, 
  allowed, 
  reason,
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {allowed ? (
        <CheckCircle className="h-4 w-4 text-status-ok" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-status-warning" />
      )}
      <span className={`text-sm ${allowed ? 'text-foreground' : 'text-muted-foreground'}`}>
        {action}
      </span>
      {reason && !allowed && (
        <span className="text-xs text-muted-foreground">({reason})</span>
      )}
    </div>
  );
};

interface AccessLevelBreadcrumbProps {
  showIcons?: boolean;
  className?: string;
}

export const AccessLevelBreadcrumb: React.FC<AccessLevelBreadcrumbProps> = ({ 
  showIcons = true,
  className = '' 
}) => {
  const permissions = useRolePermissions();
  const { facilityName, locationDisplay } = useCurrentUser();

  const getLevelHierarchy = () => {
    const levels = [];
    
    if (permissions.canViewNationalData) {
      levels.push({ label: 'Ethiopia', icon: Globe, level: 'national' });
    }
    if (permissions.canViewRegionalFacilities) {
      levels.push({ label: locationDisplay || 'Region', icon: Map, level: 'regional' });
    }
    if (permissions.canViewZoneFacilities) {
      levels.push({ label: locationDisplay || 'Zone', icon: Map, level: 'zone' });
    }
    if (permissions.canViewWoredasFacilities) {
      levels.push({ label: locationDisplay || 'Woreda', icon: MapPin, level: 'woreda' });
    }
    if (permissions.canViewOwnFacility) {
      levels.push({ label: facilityName || 'Facility', icon: Building2, level: 'facility' });
    }

    return levels;
  };

  const hierarchy = getLevelHierarchy();

  if (hierarchy.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      {hierarchy.map((level, index) => (
        <React.Fragment key={level.level}>
          <div className={`flex items-center gap-1 ${
            index === hierarchy.length - 1 ? 'text-foreground font-medium' : ''
          }`}>
            {showIcons && <level.icon className="h-3 w-3" />}
            <span>{level.label}</span>
          </div>
          {index < hierarchy.length - 1 && (
            <span className="text-muted-foreground/50">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};