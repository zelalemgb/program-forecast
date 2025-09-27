import React from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardWidgets from "@/components/dashboard/DashboardWidgets";
import CriticalQuickActions from "@/components/home/ForecastQuickActions";
import { FacilityWorkflow } from "@/components/workflow/FacilityWorkflow";
import { RegionalWorkflow } from "@/components/workflow/RegionalWorkflow";
import { NationalWorkflow } from "@/components/workflow/NationalWorkflow";
import UserProfileBadge from "@/components/auth/UserProfileBadge";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserFacility } from "@/hooks/useUserFacility";
import { MapPin, Users, Globe, Building, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Landing: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  const { user } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const facilityInfo = useUserFacility();

  const getRoleDisplay = (role: string | undefined) => {
    switch (role) {
      case "admin":
        return { title: "National Administrator", icon: Globe, variant: "default" as const };
      case "analyst":
        return { title: "Regional Manager", icon: MapPin, variant: "secondary" as const };
      case "viewer":
        return { title: "Facility Manager", icon: Building, variant: "outline" as const };
      default:
        return { title: "User", icon: Users, variant: "outline" as const };
    }
  };

  const renderRoleBasedView = () => {
    switch (userRole?.role) {
      case "admin":
        return <NationalWorkflow />;
      case "analyst":
        return <RegionalWorkflow />;
      case "viewer":
        return <FacilityWorkflow />;
      default:
        return <DashboardWidgets />;
    }
  };

  if (roleLoading || facilityInfo.loading) {
    return (
      <main className="container py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  const roleDisplay = getRoleDisplay(userRole?.role);
  const RoleIcon = roleDisplay.icon;

  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>Dashboard | Forlab+ Platform</title>
        <meta name="description" content="Health supply chain management dashboard for monitoring stock levels, forecasts, and facility operations." />
        <link rel="canonical" href={canonical} />
      </Helmet>



      {/* Critical Quick Actions */}
      <CriticalQuickActions />

      {/* Role-based Content */}
      <div className="space-y-6">
        {renderRoleBasedView()}
      </div>

      {/* Legacy Dashboard Widgets (for admin/analyst overview) */}
      {(userRole?.role === "admin" || userRole?.role === "analyst") && (
        <Tabs defaultValue="workflow" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workflow">Workflow Overview</TabsTrigger>
            <TabsTrigger value="analytics">System Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="workflow" className="space-y-6">
            {/* Already rendered above */}
          </TabsContent>
          <TabsContent value="analytics" className="space-y-6">
            <DashboardWidgets />
          </TabsContent>
        </Tabs>
      )}

      {/* Show message if user has no role assigned */}
      {!userRole?.role && !roleLoading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Role Assignment Pending</CardTitle>
            <CardDescription className="text-amber-700">
              Your account is created but you don't have a role assigned yet. Please contact your administrator or request a role to access the system features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link to="/user-management">Request Role</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default Landing;