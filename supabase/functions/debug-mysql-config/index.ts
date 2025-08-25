import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Debug connection parameters
    const config = {
      hostname: Deno.env.get('MYSQL_HOST') || 'NOT_SET',
      port: Deno.env.get('MYSQL_PORT') || 'NOT_SET',
      username: Deno.env.get('MYSQL_USERNAME') || 'NOT_SET',
      password: Deno.env.get('MYSQL_PASSWORD') ? '***HIDDEN***' : 'NOT_SET',
      database: Deno.env.get('MYSQL_DATABASE') || 'NOT_SET',
    };

    console.log('MySQL Configuration Check:', config);

    // Test basic network connectivity first
    console.log('Testing network connectivity...');
    
    try {
      // Try to connect to the host without MySQL protocol first
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`http://${config.hostname}:${config.port}`, {
        signal: controller.signal,
        method: 'GET',
      }).catch(error => ({ error: error.message }));
      
      clearTimeout(timeoutId);
      
      console.log('Network test result:', response);
    } catch (networkError) {
      console.log('Network connectivity test failed:', networkError);
    }

    const result = {
      configurationStatus: 'OK',
      secrets: config,
      networkTest: 'Attempted basic connectivity test',
      recommendation: 'Check MySQL server configuration and firewall settings'
    };

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Debug check failed:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      recommendation: 'Check if all MySQL secrets are properly configured'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});