import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const RegisterFacility: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = React.useState<"existing" | "new">("existing");
  const [facilityType, setFacilityType] = React.useState<string>("public");

  const [regions, setRegions] = React.useState<Array<{ region_id: number; region_name: string }>>([]);
  const [zones, setZones] = React.useState<Array<{ zone_id: number; zone_name: string }>>([]);
  const [woredas, setWoredas] = React.useState<Array<{ woreda_id: number; woreda_name: string }>>([]);
  const [facilities, setFacilities] = React.useState<Array<{ facility_id: number; facility_name: string }>>([]);

  const [regionId, setRegionId] = React.useState<number | null>(null);
  const [zoneId, setZoneId] = React.useState<number | null>(null);
  const [woredaId, setWoredaId] = React.useState<number | null>(null);
  const [facilityId, setFacilityId] = React.useState<number | null>(null);

  const [facilityName, setFacilityName] = React.useState("");
  const [facilityCode, setFacilityCode] = React.useState("");

  React.useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  React.useEffect(() => {
    const fetchRegions = async () => {
      const { data, error } = await supabase.from("region").select("region_id, region_name").order("region_name");
      if (error) return console.error(error);
      setRegions(data || []);
    };
    fetchRegions();
  }, []);

  React.useEffect(() => {
    const loadZones = async () => {
      if (!regionId) { setZones([]); setZoneId(null); return; }
      const { data, error } = await supabase.from("zone").select("zone_id, zone_name").eq("region_id", regionId).order("zone_name");
      if (error) return console.error(error);
      setZones(data || []);
      setZoneId(null);
    };
    loadZones();
  }, [regionId]);

  React.useEffect(() => {
    const loadWoredas = async () => {
      if (!zoneId) { setWoredas([]); setWoredaId(null); return; }
      const { data, error } = await supabase.from("woreda").select("woreda_id, woreda_name").eq("zone_id", zoneId).order("woreda_name");
      if (error) return console.error(error);
      setWoredas(data || []);
      setWoredaId(null);
    };
    loadWoredas();
  }, [zoneId]);

  React.useEffect(() => {
    const loadFacilities = async () => {
      if (!woredaId) { setFacilities([]); setFacilityId(null); return; }
      const { data, error } = await supabase.from("facility").select("facility_id, facility_name").eq("woreda_id", woredaId).order("facility_name");
      if (error) return console.error(error);
      setFacilities(data || []);
      setFacilityId(null);
    };
    loadFacilities();
  }, [woredaId]);

  const disabled = !user || !woredaId || (mode === "existing" ? !facilityId : facilityType === "public" && facilityName.trim().length === 0);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !woredaId) return;

    try {
      const payload: any = {
        user_id: user.id,
        is_new_facility: mode === "new",
        woreda_id: woredaId,
      };
      if (mode === "existing") {
        payload.facility_id = facilityId;
      } else {
        payload.facility_name = facilityName || null;
        payload.facility_code = facilityCode || null;
        payload.facility_type = facilityType || null;
      }

      const { error } = await (supabase as any).from("registration_requests").insert(payload);
      if (error) throw error;

      toast({ title: "Request submitted", description: "Your registration is pending approval." });
      setFacilityName("");
      setFacilityCode("");
      setFacilityId(null);
      setMode("existing");
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    }
  };

  const canonical = `${window.location.origin}/register`;

  return (
    <main>
      <Helmet>
        <title>Register Facility | Health Forecasts</title>
        <meta name="description" content="Register your health facility or link to an existing one for forecast submissions." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <section className="container py-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Register Facility</h1>
        <p className="text-muted-foreground mt-2">Choose your location and either pick an existing facility or create a new one.</p>
      </section>

      <section className="container pb-16">
        <Card className="max-w-3xl surface">
          <CardHeader>
            <CardTitle>Registration details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm">Region</label>
                  <Select onValueChange={(v) => setRegionId(Number(v))} value={regionId?.toString() || undefined}>
                    <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>
                      {regions.map(r => (
                        <SelectItem key={r.region_id} value={r.region_id.toString()}>{r.region_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm">Zone</label>
                  <Select onValueChange={(v) => setZoneId(Number(v))} value={zoneId?.toString() || undefined}>
                    <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                    <SelectContent>
                      {zones.map(z => (
                        <SelectItem key={z.zone_id} value={z.zone_id.toString()}>{z.zone_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm">Woreda</label>
                  <Select onValueChange={(v) => setWoredaId(Number(v))} value={woredaId?.toString() || undefined}>
                    <SelectTrigger><SelectValue placeholder="Select woreda" /></SelectTrigger>
                    <SelectContent>
                      {woredas.map(w => (
                        <SelectItem key={w.woreda_id} value={w.woreda_id.toString()}>{w.woreda_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" variant={mode === "existing" ? "default" : "outline"} onClick={() => setMode("existing")}>Existing facility</Button>
                <Button type="button" variant={mode === "new" ? "default" : "outline"} onClick={() => setMode("new")}>New facility</Button>
              </div>

              {mode === "existing" ? (
                <div className="space-y-1">
                  <label className="text-sm">Facility</label>
                  <Select onValueChange={(v) => setFacilityId(Number(v))} value={facilityId?.toString() || undefined}>
                    <SelectTrigger><SelectValue placeholder={woredaId ? "Select facility" : "Select woreda first"} /></SelectTrigger>
                    <SelectContent>
                      {facilities.map(f => (
                        <SelectItem key={f.facility_id} value={f.facility_id.toString()}>{f.facility_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm">Facility type</label>
                    <Select onValueChange={(v) => setFacilityType(v)} value={facilityType}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm">Facility name</label>
                    <Input value={facilityName} onChange={(e) => setFacilityName(e.target.value)} placeholder="e.g., Abebe Clinic" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm">Facility code (optional)</label>
                    <Input value={facilityCode} onChange={(e) => setFacilityCode(e.target.value)} placeholder="Code if available" />
                  </div>
                </div>
              )}

              <div>
                <Button type="submit" disabled={disabled}>Submit registration</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default RegisterFacility;
