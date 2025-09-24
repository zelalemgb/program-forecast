import React from "react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface Region {
  region_id: number;
  region_name: string;
}

interface Zone {
  zone_id: number;
  zone_name: string;
  region_id: number;
}

interface Woreda {
  woreda_id: number;
  woreda_name: string;
  zone_id: number;
}

interface Facility {
  facility_id: number;
  facility_name: string;
  facility_type: string;
  woreda_id: number;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { facilityName, facilityType, role, adminLevel, locationDisplay, loading: facilityLoading } = useUserFacility();

  // Profile form state
  const [fullName, setFullName] = React.useState<string>("");
  const [phoneNumber, setPhoneNumber] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Facility selection state
  const [regions, setRegions] = React.useState<Region[]>([]);
  const [zones, setZones] = React.useState<Zone[]>([]);
  const [woredas, setWoredas] = React.useState<Woreda[]>([]);
  const [facilities, setFacilities] = React.useState<Facility[]>([]);
  
  const [selectedRegion, setSelectedRegion] = React.useState<string>("");
  const [selectedZone, setSelectedZone] = React.useState<string>("");
  const [selectedWoreda, setSelectedWoreda] = React.useState<string>("");
  const [selectedFacility, setSelectedFacility] = React.useState<string>("");
  const [facilityUpdateLoading, setFacilityUpdateLoading] = React.useState(false);

  // Load initial data
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

    // Load regions
    const loadRegions = async () => {
      try {
        const { data, error } = await supabase
          .from('region')
          .select('region_id, region_name')
          .order('region_name');
        
        if (error) throw error;
        setRegions(data || []);
      } catch (error) {
        console.error('Error loading regions:', error);
      }
    };
    
    loadProfile();
    loadRegions();
  }, [user, navigate]);

  // Load zones when region changes
  React.useEffect(() => {
    if (selectedRegion) {
      const loadZones = async () => {
        try {
          const { data, error } = await supabase
            .from('zone')
            .select('zone_id, zone_name, region_id')
            .eq('region_id', parseInt(selectedRegion))
            .order('zone_name');
          
          if (error) throw error;
          setZones(data || []);
          setWoredas([]);
          setFacilities([]);
          setSelectedZone("");
          setSelectedWoreda("");
          setSelectedFacility("");
        } catch (error) {
          console.error('Error loading zones:', error);
        }
      };
      loadZones();
    } else {
      setZones([]);
      setWoredas([]);
      setFacilities([]);
    }
  }, [selectedRegion]);

  // Load woredas when zone changes
  React.useEffect(() => {
    if (selectedZone) {
      const loadWoredas = async () => {
        try {
          const { data, error } = await supabase
            .from('woreda')
            .select('woreda_id, woreda_name, zone_id')
            .eq('zone_id', parseInt(selectedZone))
            .order('woreda_name');
          
          if (error) throw error;
          setWoredas(data || []);
          setFacilities([]);
          setSelectedWoreda("");
          setSelectedFacility("");
        } catch (error) {
          console.error('Error loading woredas:', error);
        }
      };
      loadWoredas();
    } else {
      setWoredas([]);
      setFacilities([]);
    }
  }, [selectedZone]);

  // Load facilities when woreda changes
  React.useEffect(() => {
    if (selectedWoreda) {
      const loadFacilities = async () => {
        try {
          const { data, error } = await supabase
            .from('facility')
            .select('facility_id, facility_name, facility_type, woreda_id')
            .eq('woreda_id', parseInt(selectedWoreda))
            .order('facility_name');
          
          if (error) throw error;
          setFacilities(data || []);
          setSelectedFacility("");
        } catch (error) {
          console.error('Error loading facilities:', error);
        }
      };
      loadFacilities();
    } else {
      setFacilities([]);
    }
  }, [selectedWoreda]);

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

  const onUpdateFacility = async () => {
    if (!selectedFacility) {
      toast({
        title: "Facility selection required",
        description: "Please select a facility to update your assignment",
        variant: "destructive"
      });
      return;
    }

    setFacilityUpdateLoading(true);
    try {
      // Update user role with new facility
      const { error } = await supabase
        .from('user_roles')
        .update({
          facility_id: parseInt(selectedFacility)
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      toast({ title: "Facility assignment updated successfully" });
      
      // Reset selections
      setSelectedRegion("");
      setSelectedZone("");
      setSelectedWoreda("");
      setSelectedFacility("");
      
      // Refresh page to show updated facility info
      window.location.reload();
    } catch (err: any) {
      toast({
        title: "Facility update failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setFacilityUpdateLoading(false);
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
            <CardTitle>Current Facility Information</CardTitle>
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
                    <strong>Need facility access?</strong> Use the facility update section below to request assignment to a health facility or change your current assignment.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Facility Assignment Card */}
        <Card className="max-w-xl surface">
          <CardHeader>
            <CardTitle>Update Facility Assignment</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select your region, zone, woreda, and health facility to update your assignment
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="bg-background border border-input">
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-input shadow-md z-50">
                    {regions.map((region) => (
                      <SelectItem key={region.region_id} value={region.region_id.toString()}>
                        {region.region_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Zone</label>
                <Select value={selectedZone} onValueChange={setSelectedZone} disabled={!selectedRegion}>
                  <SelectTrigger className="bg-background border border-input">
                    <SelectValue placeholder={selectedRegion ? "Select a zone" : "Select region first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-input shadow-md z-50">
                    {zones.map((zone) => (
                      <SelectItem key={zone.zone_id} value={zone.zone_id.toString()}>
                        {zone.zone_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Woreda</label>
                <Select value={selectedWoreda} onValueChange={setSelectedWoreda} disabled={!selectedZone}>
                  <SelectTrigger className="bg-background border border-input">
                    <SelectValue placeholder={selectedZone ? "Select a woreda" : "Select zone first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-input shadow-md z-50">
                    {woredas.map((woreda) => (
                      <SelectItem key={woreda.woreda_id} value={woreda.woreda_id.toString()}>
                        {woreda.woreda_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Health Facility</label>
                <Select value={selectedFacility} onValueChange={setSelectedFacility} disabled={!selectedWoreda}>
                  <SelectTrigger className="bg-background border border-input">
                    <SelectValue placeholder={selectedWoreda ? "Select a health facility" : "Select woreda first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-input shadow-md z-50">
                    {facilities.map((facility) => (
                      <SelectItem key={facility.facility_id} value={facility.facility_id.toString()}>
                        {facility.facility_name} ({facility.facility_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={onUpdateFacility} 
                  disabled={!selectedFacility || facilityUpdateLoading}
                >
                  {facilityUpdateLoading ? "Updating..." : "Update Facility Assignment"}
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-md">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Updating your facility assignment will change your access permissions within the system. You will only be able to view and manage data for your newly assigned facility.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Profile;
