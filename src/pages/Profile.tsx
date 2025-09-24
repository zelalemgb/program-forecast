import React from "react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserFacility } from "@/hooks/useUserFacility";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Full name must be less than 100 characters"),
  phoneNumber: z.string().trim().regex(/^(\+251|0)?[79]\d{8}$/, "Invalid Ethiopian phone number format").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal(""))
});

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { facilityName, facilityType, role, adminLevel, locationDisplay, loading: facilityLoading } = useUserFacility();

  const [fullName, setFullName] = React.useState<string>("");
  const [phoneNumber, setPhoneNumber] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Load profile data from profiles table
    const loadProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profile) {
          setFullName(profile.full_name || "");
          setPhoneNumber(profile.phone_number || "");
        } else {
          // Fallback to auth metadata
          setFullName((user.user_metadata?.full_name as string) || "");
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    
    loadProfile();
  }, [user, navigate]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate form data
      const validation = profileSchema.safeParse({ fullName, phoneNumber, password });
      if (!validation.success) {
        const newErrors: Record<string, string> = {};
        validation.error.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(newErrors);
        return;
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user!.id,
          full_name: fullName,
          email: user!.email,
          phone_number: phoneNumber || null
        });

      if (profileError) throw profileError;

      // Update auth metadata if password is changed
      if (password) {
        const { error: authError } = await supabase.auth.updateUser({
          password,
          data: { full_name: fullName }
        });
        if (authError) throw authError;
        setPassword(""); // Clear password field after successful update
      } else {
        // Update just the metadata
        const { error: authError } = await supabase.auth.updateUser({
          data: { full_name: fullName }
        });
        if (authError) throw authError;
      }

      toast({ title: "Profile updated successfully" });
    } catch (err: any) {
      toast({ 
        title: "Update failed", 
        description: err.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
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

      <section className="container pb-16 space-y-6">
        {/* Account Details Card */}
        <Card className="max-w-xl surface">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={user?.email || ""} readOnly aria-readonly className="bg-muted" />
              </div>
              
              <div>
                <label className="text-sm font-medium">Full name</label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Enter your full name"
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Phone number</label>
                <Input 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  placeholder="e.g., +251912345678 or 0912345678"
                  className={errors.phoneNumber ? "border-destructive" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive mt-1">{errors.phoneNumber}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Ethiopian phone number format
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">New password</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Leave blank to keep current password"
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
                {password && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 6 characters required
                  </p>
                )}
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Facility Information Card */}
        <Card className="max-w-xl surface">
          <CardHeader>
            <CardTitle>Facility Information</CardTitle>
          </CardHeader>
          <CardContent>
            {facilityLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse bg-muted h-4 rounded w-3/4"></div>
                <div className="animate-pulse bg-muted h-4 rounded w-1/2"></div>
                <div className="animate-pulse bg-muted h-4 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Location/Facility Assignment</label>
                  <Input value={locationDisplay || "No location assigned"} readOnly className="bg-muted" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Health Facility</label>
                  <Input 
                    value={facilityName || "No facility assigned"} 
                    readOnly 
                    className="bg-muted" 
                  />
                  {!facilityName && (
                    <p className="text-xs text-amber-600 mt-1">
                      You are not currently assigned to a health facility
                    </p>
                  )}
                </div>
                
                {facilityType && (
                  <div>
                    <label className="text-sm font-medium">Facility Type</label>
                    <Input value={facilityType} readOnly className="bg-muted" />
                  </div>
                )}
                
                {adminLevel && (
                  <div>
                    <label className="text-sm font-medium">Administrative Level</label>
                    <Input value={adminLevel} readOnly className="bg-muted" />
                  </div>
                )}
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    <strong>Need facility access?</strong> Contact your system administrator to request assignment to a health facility or to change your current facility assignment.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Profile;
