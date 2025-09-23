import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { facility_id, start_date, end_date } = await req.json();

    if (!facility_id || !start_date || !end_date) {
      throw new Error('Missing required parameters: facility_id, start_date, end_date');
    }

    console.log(`Processing consumption analytics for facility ${facility_id} from ${start_date} to ${end_date}`);

    // Call the database function to calculate consumption analytics
    const { error: calcError } = await supabaseClient.rpc('calculate_consumption_analytics', {
      p_facility_id: facility_id,
      p_start_date: start_date,
      p_end_date: end_date
    });

    if (calcError) {
      console.error('Error calculating consumption analytics:', calcError);
      throw calcError;
    }

    // Fetch the calculated analytics
    const { data: analytics, error: fetchError } = await supabaseClient
      .from('consumption_analytics')
      .select(`
        *,
        products:products(name, unit),
        facility:facility(facility_name)
      `)
      .eq('facility_id', facility_id)
      .eq('period_start', start_date)
      .eq('period_end', end_date);

    if (fetchError) {
      console.error('Error fetching consumption analytics:', fetchError);
      throw fetchError;
    }

    console.log(`Successfully processed ${analytics?.length || 0} consumption analytics records`);

    return new Response(
      JSON.stringify({
        success: true,
        data: analytics,
        message: `Processed consumption analytics for ${analytics?.length || 0} products`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in process-inventory-consumption function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});