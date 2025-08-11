import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import React from "react";

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-3">
    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    <p className="text-sm text-muted-foreground">{description}</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  </section>
);

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [role, setRole] = React.useState<string | null>(null);
  const isAdmin = role === "admin";

  React.useEffect(() => {
    let mounted = true;
    async function loadRole() {
      if (!user) {
        setRole(null);
        return;
      }
      const { data, error } = await supabase.rpc("get_current_user_role");
      if (!mounted) return;
      if (error) {
        console.error("Failed to load role", error);
        toast({ title: "Permission check failed", description: error.message, variant: "destructive" });
        setRole(null);
      } else {
        setRole(data as string | null);
      }
    }
    loadRole();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  React.useEffect(() => {
    if (user && role && role !== "admin") {
      toast({ title: "Access denied", description: "Admin privileges required." });
    }
  }, [role]);

  const canonical = typeof window !== "undefined" ? `${window.location.origin}/admin` : "/admin";

  if (!user) {
    return (
      <main className="container py-8">
        <Helmet>
          <title>Super Admin Dashboard | Access</title>
          <meta name="description" content="Sign in to access the Super Admin dashboard." />
          <link rel="canonical" href={canonical} />
        </Helmet>
        <Card>
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You must be signed in as a Super Admin to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/auth">Go to Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="container py-8">
        <Helmet>
          <title>Super Admin Dashboard | Unauthorized</title>
          <meta name="description" content="You do not have access to the Super Admin dashboard." />
          <link rel="canonical" href={canonical} />
        </Helmet>
        <Card>
          <CardHeader>
            <CardTitle>Unauthorized</CardTitle>
            <CardDescription>Admin privileges are required to access this page.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button variant="secondary" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard">Open Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>Super Admin Dashboard | System Administration</title>
        <meta
          name="description"
          content="Super Admin dashboard for approvals, system health, configuration, settings, and security."
        />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <header className="border-b">
        <div className="container py-6">
          <h1 className="text-2xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage national-level approvals, monitor system health, configure settings, and enforce security.
          </p>
        </div>
      </header>
      <main className="container py-8 space-y-10">
        <Section title="Approvals" description="Review and approve national-level access requests">
          <Card>
            <CardHeader>
              <CardTitle>Registration Approvals</CardTitle>
              <CardDescription>Approve or reject user registration requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/approvals">Open Approvals</Link>
              </Button>
            </CardContent>
          </Card>
        </Section>

        <Section title="System Health" description="High-level telemetry and status">
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
              <CardDescription>Basic system checks and data signals.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3 flex-wrap">
              <Button variant="secondary" asChild>
                <Link to="/dashboard">Open Analytics Dashboard</Link>
              </Button>
              <Button variant="secondary" asChild>
                <a href="https://supabase.com/dashboard/project/ueisbsvhbqsjetppruwt" target="_blank" rel="noreferrer">
                  Supabase Project
                </a>
              </Button>
            </CardContent>
          </Card>
        </Section>

        <Section title="Configuration & Settings" description="System-wide configuration management">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage application-level settings (coming soon).</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled>Configure</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Products & Reference Data</CardTitle>
              <CardDescription>Manage product catalogs and reference mappings.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" asChild>
                <Link to="/validation">Open Validation</Link>
              </Button>
            </CardContent>
          </Card>
        </Section>

        <Section title="Security" description="Roles, permissions, and audit">
          <Card>
            <CardHeader>
              <CardTitle>Role & Access</CardTitle>
              <CardDescription>Your current role: {role ?? "unknown"}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3 flex-wrap">
              <Button variant="secondary" asChild>
                <a
                  href="https://supabase.com/dashboard/project/ueisbsvhbqsjetppruwt/auth/users"
                  target="_blank"
                  rel="noreferrer"
                >
                  Manage Users (Supabase)
                </a>
              </Button>
              <Button variant="secondary" asChild>
                <a
                  href="https://supabase.com/dashboard/project/ueisbsvhbqsjetppruwt/sql/new"
                  target="_blank"
                  rel="noreferrer"
                >
                  SQL Editor
                </a>
              </Button>
            </CardContent>
          </Card>
        </Section>
      </main>
    </>
  );
}
