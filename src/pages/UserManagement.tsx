import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/layout/PageHeader';
import { RoleRequestForm } from '@/components/users/RoleRequestForm';
import { RoleApprovalTable } from '@/components/users/RoleApprovalTable';
import { UserRolesList } from '@/components/users/UserRolesList';
import { Users, UserPlus, Shield, CheckSquare } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('request');

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
      />

      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role Request</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Request access to specific roles and permissions</CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Review and approve role requests from users</CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>View and manage existing user roles</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="request" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Request Role
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Approvals
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RoleRequestForm onSuccess={() => {
                  // Optionally switch to approvals tab or show success message
                }} />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Role Descriptions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <RoleApprovalTable />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <UserRolesList />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default UserManagement;