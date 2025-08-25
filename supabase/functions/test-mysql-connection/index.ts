import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// MySQL client for Deno
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConnectionTestResult {
  success: boolean;
  message: string;
  tableInfo?: Array<{ tableName: string; rowCount: number }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing MySQL connection...');
    
    const client = await new Client().connect({
      hostname: Deno.env.get('MYSQL_HOST') || '',
      port: parseInt(Deno.env.get('MYSQL_PORT') || '3306'),
      username: Deno.env.get('MYSQL_USERNAME') || '',
      password: Deno.env.get('MYSQL_PASSWORD') || '',
      db: Deno.env.get('MYSQL_DATABASE') || '',
    });

    console.log('Connected successfully! Gathering table information...');

    // Get list of tables
    const tablesResult = await client.execute('SHOW TABLES');
    const tableInfo: Array<{ tableName: string; rowCount: number }> = [];

    // Get row count for each table
    if (tablesResult.rows) {
      for (const row of tablesResult.rows) {
        const tableName = Object.values(row)[0] as string;
        try {
          const countResult = await client.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
          const rowCount = parseInt(countResult.rows?.[0]?.count) || 0;
          tableInfo.push({ tableName, rowCount });
        } catch (error) {
          console.log(`Could not get count for table ${tableName}:`, error);
          tableInfo.push({ tableName, rowCount: -1 });
        }
      }
    }

    await client.close();

    const result: ConnectionTestResult = {
      success: true,
      message: `Successfully connected to MySQL database. Found ${tableInfo.length} tables.`,
      tableInfo
    };

    console.log('Connection test completed successfully:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('MySQL connection test failed:', error);
    
    const result: ConnectionTestResult = {
      success: false,
      message: `Connection failed: ${error.message}`
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});