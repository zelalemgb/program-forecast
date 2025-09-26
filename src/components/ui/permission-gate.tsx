import React from 'react';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: keyof typeof useRolePermissions extends () => infer T ? T : never;
  customCheck?: (permissions: ReturnType<typeof useRolePermissions>) => boolean;
  fallback?: React.ReactNode;
  showAlert?: boolean;
  alertMessage?: string;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  customCheck,
  fallback,
  showAlert = false,
  alertMessage = "You don't have permission to access this feature."
}) => {
  const permissions = useRolePermissions();

  const hasPermission = () => {
    if (customCheck) {
      return customCheck(permissions);
    }
    if (permission) {
      return Boolean(permissions[permission as keyof typeof permissions]);
    }
    return true;
  };

  if (!hasPermission()) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (showAlert) {
      return (
        <Alert className="border-status-warning/20 bg-status-warning/5">
          <ShieldX className="h-4 w-4 text-status-warning" />
          <AlertDescription className="text-status-warning">
            {alertMessage}
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  }

  return <>{children}</>;
};

// Convenience components for common permission checks
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <PermissionGate customCheck={(p) => p.isAdmin} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const FacilityOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <PermissionGate customCheck={(p) => p.isFacilityLevel} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const HierarchicalOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <PermissionGate customCheck={(p) => p.isHierarchicalUser} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const EditableOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <PermissionGate customCheck={(p) => !p.isReadOnly} fallback={fallback}>
    {children}
  </PermissionGate>
);