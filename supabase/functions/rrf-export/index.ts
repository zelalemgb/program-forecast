// Supabase Edge Function: rrf-export
// Returns latest snapshot for an RRF or live view of header+lines if no snapshot
// Auth required (inherits caller JWT). CORS enabled.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

  try {
    const { data: snaps, error: snapErr } = await supabase
      .from("rrf_snapshots")
      .select("snapshot, created_at, stage")
      .eq("rrf_id", id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (snapErr) throw snapErr;

    if (snaps && snaps.length > 0) {
      return new Response(JSON.stringify({ type: "snapshot", ...snaps[0] }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: header, error: hErr } = await supabase
      .from("rrf_headers")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (hErr) throw hErr;

    const { data: lines, error: lErr } = await supabase
      .from("rrf_lines")
      .select("*")
      .eq("rrf_id", id);
    if (lErr) throw lErr;

    return new Response(JSON.stringify({ type: "live", header, lines }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
