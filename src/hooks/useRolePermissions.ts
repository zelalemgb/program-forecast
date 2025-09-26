import { useMemo } from 'react';
import { useCurrentUser } from './useCurrentUser';

export type UserRole = 
  | 'facility_logistic_officer'
  | 'facility_admin'
  | 'facility_manager'
  | 'woreda_user'
  | 'zone_user'
  | 'regional_user'
  | 'national_user'
  | 'program_officer'
  | 'admin'
  | 'analyst'
  | 'viewer';

export type AdminLevel = 
  | 'facility'
  | 'woreda'
  | 'zone'
  | 'regional'
  | 'national';

export interface RolePermissions {
  // Data access permissions
  canEditFacilityData: boolean;
  canEditWoredasData: boolean;
  canEditZoneData: boolean;
  canEditRegionalData: boolean;
  canEditNationalData: boolean;
  
  // View permissions
  canViewOwnFacility: boolean;
  canViewWoredasFacilities: boolean;
  canViewZoneFacilities: boolean;
  canViewRegionalFacilities: boolean;
  canViewNationalData: boolean;
  
  // Feature permissions
  canGenerateForecast: boolean;
  canApproveForecast: boolean;
  canManageUsers: boolean;
  canManageSystem: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  
  // Dashboard access
  dashboardType: 'facility' | 'woreda' | 'zone' | 'regional' | 'national';
  
  // Data scope
  dataScope: AdminLevel;
  
  // Helper methods
  isReadOnly: boolean;
  isAdmin: boolean;
  isFacilityLevel: boolean;
  isHierarchicalUser: boolean;
}

export const useRolePermissions = (): RolePermissions => {
  const { userRole, adminLevel, isAdmin, isAnalyst } = useCurrentUser();

  return useMemo(() => {
    const role = userRole as UserRole;
    const level = adminLevel as AdminLevel;
    
    // Facility-level users
    if (role?.includes('facility_') || level === 'facility') {
      return {
        canEditFacilityData: true,
        canEditWoredasData: false,
        canEditZoneData: false,
        canEditRegionalData: false,
        canEditNationalData: false,
        
        canViewOwnFacility: true,
        canViewWoredasFacilities: false,
        canViewZoneFacilities: false,
        canViewRegionalFacilities: false,
        canViewNationalData: false,
        
        canGenerateForecast: true,
        canApproveForecast: false,
        canManageUsers: role === 'facility_admin',
        canManageSystem: false,
        canViewAnalytics: true,
        canExportData: true,
        
        dashboardType: 'facility',
        dataScope: 'facility',
        isReadOnly: false,
        isAdmin: false,
        isFacilityLevel: true,
        isHierarchicalUser: false,
      };
    }
    
    // Woreda-level users
    if (role === 'woreda_user' || level === 'woreda') {
      return {
        canEditFacilityData: false,
        canEditWoredasData: true,
        canEditZoneData: false,
        canEditRegionalData: false,
        canEditNationalData: false,
        
        canViewOwnFacility: false,
        canViewWoredasFacilities: true,
        canViewZoneFacilities: false,
        canViewRegionalFacilities: false,
        canViewNationalData: false,
        
        canGenerateForecast: true,
        canApproveForecast: true,
        canManageUsers: true,
        canManageSystem: false,
        canViewAnalytics: true,
        canExportData: true,
        
        dashboardType: 'woreda',
        dataScope: 'woreda',
        isReadOnly: false,
        isAdmin: false,
        isFacilityLevel: false,
        isHierarchicalUser: true,
      };
    }
    
    // Zone-level users
    if (role === 'zone_user' || level === 'zone') {
      return {
        canEditFacilityData: false,
        canEditWoredasData: false,
        canEditZoneData: true,
        canEditRegionalData: false,
        canEditNationalData: false,
        
        canViewOwnFacility: false,
        canViewWoredasFacilities: false,
        canViewZoneFacilities: true,
        canViewRegionalFacilities: false,
        canViewNationalData: false,
        
        canGenerateForecast: true,
        canApproveForecast: true,
        canManageUsers: true,
        canManageSystem: false,
        canViewAnalytics: true,
        canExportData: true,
        
        dashboardType: 'zone',
        dataScope: 'zone',
        isReadOnly: true, // Read-only on facility data
        isAdmin: false,
        isFacilityLevel: false,
        isHierarchicalUser: true,
      };
    }
    
    // Regional-level users
    if (role === 'regional_user' || level === 'regional') {
      return {
        canEditFacilityData: false,
        canEditWoredasData: false,
        canEditZoneData: false,
        canEditRegionalData: true,
        canEditNationalData: false,
        
        canViewOwnFacility: false,
        canViewWoredasFacilities: false,
        canViewZoneFacilities: false,
        canViewRegionalFacilities: true,
        canViewNationalData: false,
        
        canGenerateForecast: true,
        canApproveForecast: true,
        canManageUsers: true,
        canManageSystem: false,
        canViewAnalytics: true,
        canExportData: true,
        
        dashboardType: 'regional',
        dataScope: 'regional',
        isReadOnly: true, // Read-only on lower level data
        isAdmin: false,
        isFacilityLevel: false,
        isHierarchicalUser: true,
      };
    }
    
    // National-level users
    if (role === 'national_user' || role === 'program_officer' || level === 'national') {
      return {
        canEditFacilityData: false,
        canEditWoredasData: false,
        canEditZoneData: false,
        canEditRegionalData: false,
        canEditNationalData: true,
        
        canViewOwnFacility: false,
        canViewWoredasFacilities: false,
        canViewZoneFacilities: false,
        canViewRegionalFacilities: false,
        canViewNationalData: true,
        
        canGenerateForecast: true,
        canApproveForecast: true,
        canManageUsers: true,
        canManageSystem: false,
        canViewAnalytics: true,
        canExportData: true,
        
        dashboardType: 'national',
        dataScope: 'national',
        isReadOnly: true, // Read-only on all lower level data
        isAdmin: false,
        isFacilityLevel: false,
        isHierarchicalUser: true,
      };
    }
    
    // System administrators and analysts
    if (isAdmin() || isAnalyst()) {
      return {
        canEditFacilityData: true,
        canEditWoredasData: true,
        canEditZoneData: true,
        canEditRegionalData: true,
        canEditNationalData: true,
        
        canViewOwnFacility: true,
        canViewWoredasFacilities: true,
        canViewZoneFacilities: true,
        canViewRegionalFacilities: true,
        canViewNationalData: true,
        
        canGenerateForecast: true,
        canApproveForecast: true,
        canManageUsers: true,
        canManageSystem: true,
        canViewAnalytics: true,
        canExportData: true,
        
        dashboardType: 'national',
        dataScope: 'national',
        isReadOnly: false,
        isAdmin: true,
        isFacilityLevel: false,
        isHierarchicalUser: false,
      };
    }
    
    // Default viewer permissions
    return {
      canEditFacilityData: false,
      canEditWoredasData: false,
      canEditZoneData: false,
      canEditRegionalData: false,
      canEditNationalData: false,
      
      canViewOwnFacility: true,
      canViewWoredasFacilities: false,
      canViewZoneFacilities: false,
      canViewRegionalFacilities: false,
      canViewNationalData: false,
      
      canGenerateForecast: false,
      canApproveForecast: false,
      canManageUsers: false,
      canManageSystem: false,
      canViewAnalytics: false,
      canExportData: false,
      
      dashboardType: 'facility',
      dataScope: 'facility',
      isReadOnly: true,
      isAdmin: false,
      isFacilityLevel: true,
      isHierarchicalUser: false,
    };
  }, [userRole, adminLevel, isAdmin, isAnalyst]);
};