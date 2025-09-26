import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Shield, Building2, MapPin, Globe, Users } from 'lucide-react';

interface RoleBadgeProps {
  role?: string;
  adminLevel?: string;
  className?: string;
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  adminLevel, 
  className,
  showIcon = false 
}) => {
  if (!role) return null;

  const getRoleDisplay = () => {
    if (role === 'admin') return { text: 'System Admin', variant: 'default' as const, icon: Shield };
    if (role === 'analyst') return { text: 'System Analyst', variant: 'secondary' as const, icon: Shield };
    if (role === 'program_officer') return { text: 'Program Officer', variant: 'outline' as const, icon: Globe };
    
    // Facility roles
    if (role === 'facility_logistic_officer') return { text: 'Logistic Officer', variant: 'secondary' as const, icon: Building2 };
    if (role === 'facility_admin') return { text: 'Facility Admin', variant: 'default' as const, icon: Building2 };
    if (role === 'facility_manager') return { text: 'Facility Manager', variant: 'outline' as const, icon: Building2 };
    
    // Administrative roles
    if (role === 'woreda_user') return { text: 'Woreda User', variant: 'secondary' as const, icon: MapPin };
    if (role === 'zone_user') return { text: 'Zone User', variant: 'secondary' as const, icon: MapPin };
    if (role === 'regional_user') return { text: 'Regional User', variant: 'secondary' as const, icon: MapPin };
    if (role === 'national_user') return { text: 'National User', variant: 'outline' as const, icon: Globe };
    
    // Default
    return { text: role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), variant: 'outline' as const, icon: Users };
  };

  const { text, variant, icon: Icon } = getRoleDisplay();

  return (
    <Badge variant={variant} className={cn("text-xs", className)}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {text}
      {adminLevel && adminLevel !== 'facility' && (
        <span className="ml-1 opacity-70">({adminLevel})</span>
      )}
    </Badge>
  );
};