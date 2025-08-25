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

  const startTime = Date.now();

  try {
    console.log('Testing MySQL connection...');
    
    const config = {
      hostname: Deno.env.get('MYSQL_HOST') || '',
      port: parseInt(Deno.env.get('MYSQL_PORT') || '3306'),
      username: Deno.env.get('MYSQL_USERNAME') || '',
      password: Deno.env.get('MYSQL_PASSWORD') || '',
      db: Deno.env.get('MYSQL_DATABASE') || '',
      timeout: 10000, // 10 second timeout
      poolSize: 1,
      acquireTimeout: 10000,
    };

    console.log(`Attempting to connect to: ${config.hostname}:${config.port}/${config.db}`);
    
    const client = await new Client().connect(config);

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
    
    const connectionTime = Date.now() - startTime;

    const result: ConnectionTestResult = {
      success: true,
      message: `Successfully connected to MySQL database in ${connectionTime}ms. Found ${tableInfo.length} tables.`,
      tableInfo
    };

    console.log('Connection test completed successfully:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const connectionTime = Date.now() - startTime;
    console.error(`MySQL connection test failed after ${connectionTime}ms:`, error);
    
    const result: ConnectionTestResult = {
      success: false,
      message: `Connection failed after ${connectionTime}ms: ${error.message}. Please check if the MySQL server is accessible and allows external connections.`
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});