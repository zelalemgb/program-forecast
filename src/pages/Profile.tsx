import React from "react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");

  React.useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      const name = (user.user_metadata?.full_name as string) || "";
      setFullName(name);
    }
  }, [user, navigate]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updates: Parameters<typeof supabase.auth.updateUser>[0] = { data: { full_name: fullName } };
      if (password) updates.password = password;
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  const canonical = `${window.location.origin}/profile`;

  return (
    <main>
      <Helmet>
        <title>User Profile | Health Forecasts</title>
        <meta name="description" content="Manage your Health Forecasts account profile and password." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <section className="container py-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">Update your account information.</p>
      </section>

      <section className="container pb-16">
        <Card className="max-w-xl surface">
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-4">
              <div>
                <label className="text-sm">Email</label>
                <Input value={user?.email || ""} readOnly aria-readonly />
              </div>
              <div>
                <label className="text-sm">Full name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm">New password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Optional" />
              </div>
              <div className="flex gap-3">
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Profile;
