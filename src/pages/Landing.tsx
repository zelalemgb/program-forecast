import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardWidgets from "@/components/dashboard/DashboardWidgets";
import { FacilityWorkflow } from "@/components/workflow/FacilityWorkflow";
import { RegionalWorkflow } from "@/components/workflow/RegionalWorkflow";
import { NationalWorkflow } from "@/components/workflow/NationalWorkflow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Users, Globe, Building } from "lucide-react";

const Landing: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>("");
  const [facilityInfo, setFacilityInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        // Get user role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .order("role")
          .limit(1)
          .single();

        setUserRole(roleData?.role || "viewer");

        // Get facility info if user is facility-level
        if (roleData?.role === "viewer") {
          const { data: facilityData } = await supabase
            .from("user_facility_memberships")
            .select(`
              facility:facility_id (
                facility_name,
                facility_type,
                woreda:woreda_id (
                  woreda_name,
                  zone:zone_id (
                    zone_name,
                    region:region_id (
                      region_name
                    )
                  )
                )
              )
            `)
            .eq("user_id", user.id)
            .eq("status", "approved")
            .limit(1)
            .single();

          setFacilityInfo(facilityData?.facility);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const getRoleDisplay = (role: string) => {
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
    switch (userRole) {
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

  if (loading) {
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

  const roleDisplay = getRoleDisplay(userRole);
  const RoleIcon = roleDisplay.icon;

  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>Dashboard | Forlab+ Platform</title>
        <meta name="description" content="Health supply chain management dashboard for monitoring stock levels, forecasts, and facility operations." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Header with Role & Context */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <RoleIcon className="h-6 w-6 text-primary" />
                Welcome back!
              </CardTitle>
              <CardDescription className="mt-1">
                {facilityInfo ? (
                  <span>
                    {facilityInfo.facility_name} • {facilityInfo.woreda?.zone?.region?.region_name} Region
                  </span>
                ) : (
                  "Health Supply Chain Management Platform"
                )}
              </CardDescription>
            </div>
            <Badge variant={roleDisplay.variant} className="flex items-center gap-1">
              <RoleIcon className="h-3 w-3" />
              {roleDisplay.title}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Role-based Content */}
      <div className="space-y-6">
        {renderRoleBasedView()}
      </div>

      {/* Legacy Dashboard Widgets (for admin/analyst overview) */}
      {(userRole === "admin" || userRole === "analyst") && (
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
    </main>
  );
};

export default Landing;
