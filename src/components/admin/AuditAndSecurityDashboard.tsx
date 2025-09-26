import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminOnly } from '@/components/ui/permission-gate';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Search, 
  Calendar, 
  User, 
  Database, 
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_values?: any;
  new_values?: any;
  changed_by?: string;
  changed_at: string;
  user_email?: string;
  user_name?: string;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  status: 'active' | 'resolved' | 'investigating';
}

export const AuditAndSecurityDashboard: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    table: '',
    action: '',
    user: '',
    dateFrom: '',
    dateTo: '',
    severity: '',
  });
  const [activeTab, setActiveTab] = useState('audit');
  const { toast } = useToast();

  const loadAuditLogs = async () => {
    try {
      let query = supabase
        .from('audit_log')
        .select(`
          *,
          profiles!audit_log_changed_by_fkey(email, full_name)
        `)
        .order('changed_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (filter.table) {
        query = query.eq('table_name', filter.table);
      }
      if (filter.action) {
        query = query.eq('action', filter.action);
      }
      if (filter.user) {
        query = query.eq('changed_by', filter.user);
      }
      if (filter.dateFrom) {
        query = query.gte('changed_at', filter.dateFrom);
      }
      if (filter.dateTo) {
        query = query.lte('changed_at', filter.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      setAuditLogs(data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
    }
  };

  const loadSecurityEvents = async () => {
    try {
      // Mock security events (in real app, this would come from security monitoring)
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          event_type: 'failed_login_attempt',
          severity: 'medium',
          description: 'Multiple failed login attempts from suspicious IP',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'investigating'
        },
        {
          id: '2',
          event_type: 'permission_escalation',
          severity: 'high',
          description: 'User attempted to access admin-only endpoint',
          user_id: 'user123',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          status: 'resolved'
        },
        {
          id: '3',
          event_type: 'data_export_large',
          severity: 'medium',
          description: 'Large data export requested outside normal hours',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          status: 'active'
        }
      ];

      // Filter by severity if set
      const filtered = filter.severity 
        ? mockEvents.filter(e => e.severity === filter.severity)
        : mockEvents;

      setSecurityEvents(filtered);
    } catch (err) {
      console.error('Failed to load security events:', err);
    }
  };

  const exportAuditLog = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('changed_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const csv = [
        'Date,Table,Record ID,Action,User,Old Values,New Values',
        ...data.map(log => [
          new Date(log.changed_at).toISOString(),
          log.table_name,
          log.record_id,
          log.action,
          log.changed_by || 'System',
          JSON.stringify(log.old_values || {}),
          JSON.stringify(log.new_values || {})
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Audit log exported successfully",
        variant: "default"
      });
    } catch (err) {
      console.error('Export failed:', err);
      toast({
        title: "Error",
        description: "Failed to export audit log",
        variant: "destructive"
      });
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
      case 'created':
        return <CheckCircle className="h-4 w-4 text-status-ok" />;
      case 'update':
      case 'modified':
        return <Eye className="h-4 w-4 text-status-warning" />;
      case 'delete':
      case 'removed':
        return <XCircle className="h-4 w-4 text-status-critical" />;
      default:
        return <Database className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-status-ok" />;
      case 'investigating': return <Eye className="h-4 w-4 text-status-warning" />;
      case 'active': return <AlertTriangle className="h-4 w-4 text-status-critical" />;
      default: return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadAuditLogs(), loadSecurityEvents()]);
      setLoading(false);
    };
    loadData();
  }, [filter]);

  return (
    <AdminOnly>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Audit & Security Dashboard
            </h2>
            <p className="text-muted-foreground">
              Monitor system activities and security events
            </p>
          </div>
          <Button onClick={exportAuditLog} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Audit Log
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="security">Security Events</TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Select value={filter.table} onValueChange={(value) => setFilter({...filter, table: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Table" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Tables</SelectItem>
                      <SelectItem value="user_roles">User Roles</SelectItem>
                      <SelectItem value="inventory_transactions">Inventory</SelectItem>
                      <SelectItem value="forecast_runs">Forecasts</SelectItem>
                      <SelectItem value="profiles">Profiles</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filter.action} onValueChange={(value) => setFilter({...filter, action: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Actions</SelectItem>
                      <SelectItem value="INSERT">Created</SelectItem>
                      <SelectItem value="UPDATE">Updated</SelectItem>
                      <SelectItem value="DELETE">Deleted</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Date From"
                    type="date"
                    value={filter.dateFrom}
                    onChange={(e) => setFilter({...filter, dateFrom: e.target.value})}
                  />

                  <Input
                    placeholder="Date To"
                    type="date"
                    value={filter.dateTo}
                    onChange={(e) => setFilter({...filter, dateTo: e.target.value})}
                  />

                  <Button variant="outline" onClick={() => setFilter({
                    table: '', action: '', user: '', dateFrom: '', dateTo: '', severity: ''
                  })}>
                    Clear Filters
                  </Button>

                  <Button onClick={loadAuditLogs}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Audit Log Table */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Log Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date/Time</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Record</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Changes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(log.changed_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              <Badge variant="outline">{log.action}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>{log.table_name}</TableCell>
                          <TableCell className="font-mono text-xs">{log.record_id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {log.user_email || log.changed_by || 'System'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.new_values && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-primary">View Changes</summary>
                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-20">
                                  {JSON.stringify(log.new_values, null, 2)}
                                </pre>
                              </details>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Security Events */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-status-critical" />
                    <div>
                      <div className="text-2xl font-bold">
                        {securityEvents.filter(e => e.severity === 'critical').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Critical</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-status-warning" />
                    <div>
                      <div className="text-2xl font-bold">
                        {securityEvents.filter(e => e.severity === 'high').length}
                      </div>
                      <div className="text-sm text-muted-foreground">High</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-status-warning" />
                    <div>
                      <div className="text-2xl font-bold">
                        {securityEvents.filter(e => e.status === 'investigating').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Investigating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-status-ok" />
                    <div>
                      <div className="text-2xl font-bold">
                        {securityEvents.filter(e => e.status === 'resolved').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Resolved</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(event.status)}
                        <div>
                          <div className="font-medium">{event.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(event.created_at).toLocaleString()}
                            {event.ip_address && ` • IP: ${event.ip_address}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(event.severity) as any}>
                          {event.severity}
                        </Badge>
                        <Badge variant="outline">{event.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnly>
  );
};