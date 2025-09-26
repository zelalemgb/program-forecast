import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Building2, MapPin, Map, Globe, Eye } from 'lucide-react';

interface DataScopeIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const DataScopeIndicator: React.FC<DataScopeIndicatorProps> = ({ 
  className, 
  showDetails = false 
}) => {
  const permissions = useRolePermissions();
  const { facilityName, locationDisplay } = useCurrentUser();

  const getScopeInfo = () => {
    switch (permissions.dataScope) {
      case 'facility':
        return {
          icon: Building2,
          label: 'Facility',
          detail: facilityName || 'Your Facility',
          color: 'bg-blue-500'
        };
      case 'woreda':
        return {
          icon: MapPin,
          label: 'Woreda',
          detail: locationDisplay || 'Woreda Level',
          color: 'bg-green-500'
        };
      case 'zone':
        return {
          icon: Map,
          label: 'Zone',
          detail: locationDisplay || 'Zone Level',
          color: 'bg-orange-500'
        };
      case 'regional':
        return {
          icon: Map,
          label: 'Regional',
          detail: locationDisplay || 'Regional Level',
          color: 'bg-purple-500'
        };
      case 'national':
        return {
          icon: Globe,
          label: 'National',
          detail: 'National Level',
          color: 'bg-red-500'
        };
      default:
        return {
          icon: Eye,
          label: 'View Only',
          detail: 'Limited Access',
          color: 'bg-gray-500'
        };
    }
  };

  const { icon: Icon, label, detail, color } = getScopeInfo();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className="text-xs">
        <Icon className="h-3 w-3 mr-1" />
        {label}
        {permissions.isReadOnly && (
          <Eye className="h-3 w-3 ml-1 opacity-60" />
        )}
      </Badge>
      {showDetails && (
        <span className="text-xs text-muted-foreground">{detail}</span>
      )}
    </div>
  );
};