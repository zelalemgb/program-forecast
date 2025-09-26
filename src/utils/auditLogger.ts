import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  table_name: string;
  record_id: string;
  action: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id?: string;
  metadata?: Record<string, any>;
}

export const auditLogger = {
  async logAction(entry: AuditLogEntry) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      await supabase.from('audit_log').insert([{
        table_name: entry.table_name,
        record_id: entry.record_id,
        action: entry.action,
        old_values: entry.old_values,
        new_values: entry.new_values,
        changed_by: user.user?.id,
        metadata: entry.metadata
      }]);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw error to avoid breaking main operations
    }
  },

  async logUserRoleChange(userId: string, oldRole: string, newRole: string, adminLevel?: string) {
    await this.logAction({
      table_name: 'user_roles',
      record_id: userId,
      action: 'role_changed',
      old_values: { role: oldRole },
      new_values: { role: newRole, admin_level: adminLevel },
      metadata: { event_type: 'role_change' }
    });
  },

  async logInventoryTransaction(transactionId: string, transactionData: any) {
    await this.logAction({
      table_name: 'inventory_transactions',
      record_id: transactionId,
      action: 'transaction_created',
      new_values: transactionData,
      metadata: { event_type: 'inventory_operation' }
    });
  },

  async logForecastGeneration(forecastId: string, forecastData: any) {
    await this.logAction({
      table_name: 'forecast_runs',
      record_id: forecastId,
      action: 'forecast_generated',
      new_values: forecastData,
      metadata: { event_type: 'forecast_operation' }
    });
  },

  async logDataAccess(resourceType: string, resourceId: string, accessType: 'view' | 'export' | 'download') {
    await this.logAction({
      table_name: resourceType,
      record_id: resourceId,
      action: `data_${accessType}`,
      metadata: { 
        event_type: 'data_access',
        access_type: accessType,
        timestamp: new Date().toISOString()
      }
    });
  },

  async logSecurityEvent(eventType: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any) {
    try {
      // For now, log security events to audit_log until security_events table is created
      await this.logAction({
        table_name: 'security_events',
        record_id: 'security-' + Date.now(),
        action: eventType,
        new_values: details,
        metadata: { 
          event_type: eventType,
          severity,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
};