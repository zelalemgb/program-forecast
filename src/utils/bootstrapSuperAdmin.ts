import { supabase } from "@/integrations/supabase/client";

const KEY = "bootstrap_admin_done";

export async function runBootstrapSuperAdminOnce() {
  try {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY)) return;

    const email = "zelalem@forlabplus.org";
    const password = "ForLabPlus!2025#Init";

    const { data, error } = await supabase.functions.invoke("bootstrap-super-admin", {
      body: { email, password },
    });

    if (error) {
      console.error("Super admin bootstrap error:", error);
      return;
    }

    console.log("Super admin bootstrap result:", data);
    localStorage.setItem(KEY, new Date().toISOString());
  } catch (err) {
    console.error("Super admin bootstrap unexpected error:", err);
  }
}
