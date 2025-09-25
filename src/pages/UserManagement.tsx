import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PageHeader from '@/components/layout/PageHeader';
import { RoleRequestForm } from '@/components/users/RoleRequestForm';
import { RoleApprovalTable } from '@/components/users/RoleApprovalTable';
import { UserPlus } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>User Management | Health Supply Management System</title>
        <meta name="description" content="Manage user roles, approvals, and access control for the health supply management system." />
        <link rel="canonical" href="/user-management" />
      </Helmet>
      
      
      <PageHeader
        title="User Management"
        description="Manage user roles, permissions, and access control across the system"
        actions={
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Request Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Request User Role</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RoleRequestForm onSuccess={() => {
                    setIsRequestDialogOpen(false);
                  }} />
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-4">Role Descriptions</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Facility Roles</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li><strong>Logistic Officer:</strong> Manages inventory and forecasts</li>
                          <li><strong>Admin:</strong> Manages users and system settings</li>
                          <li><strong>Manager:</strong> Approves requests and supplies</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium">Administrative Roles</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li><strong>Woreda User:</strong> Manages health facilities in woreda</li>
                          <li><strong>Zone User:</strong> Manages woreda-level data in zone</li>
                          <li><strong>Regional User:</strong> Manages all zones in region</li>
                          <li><strong>National User:</strong> Views and manages national data</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium">Program Roles</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li><strong>Program Officer:</strong> Manages health program forecasts and national data access</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-6">
        <RoleApprovalTable />
      </div>
    </>
  );
};

export default UserManagement;