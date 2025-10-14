import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StoreConfig {
  store_id: string;
  host: string;
  port: number;
  database_path: string;
  username: string;
  store_code: string;
}

interface SalesData {
  store_code: string;
  current_year_sales: number;
  previous_year_sales: number;
  current_year_customers: number;
  previous_year_customers: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting sales data synchronization...');

    const today = new Date();
    const currentHour = today.getHours();
    const dateStr = today.toISOString().split('T')[0];

    // Calculate previous year date using same logic as Python script
    const previousYearDate = await calculatePreviousYearDate(supabase, dateStr);

    // Get active store database configurations
    const { data: storeConfigs, error: configError } = await supabase
      .from('store_database_configs')
      .select(`
        store_id,
        host,
        port,
        database_path,
        username,
        stores!inner(code)
      `)
      .eq('active', true);

    if (configError) throw configError;

    if (!storeConfigs || storeConfigs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active store configurations found',
          synced: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${storeConfigs.length} active store configurations`);

    // Process stores in parallel (similar to Python's ThreadPoolExecutor)
    const salesDataPromises = storeConfigs.map(async (config: any) => {
      try {
        const storeCode = config.stores.code;
        const salesData = await fetchStoreSalesData({
          store_id: config.store_id,
          host: config.host,
          port: config.port,
          database_path: config.database_path,
          username: config.username,
          store_code: storeCode,
        }, dateStr, previousYearDate, currentHour);

        return {
          ...salesData,
          store_id: config.store_id,
        };
      } catch (error) {
        console.error(`Failed to fetch data for store ${config.store_id}:`, error);
        // Return zero data for failed stores
        return {
          store_id: config.store_id,
          store_code: config.stores.code,
          current_year_sales: 0,
          previous_year_sales: 0,
          current_year_customers: 0,
          previous_year_customers: 0,
        };
      }
    });

    const allSalesData = await Promise.all(salesDataPromises);

    // Prepare records for upsert
    const salesRecords = allSalesData.map(data => {
      const salesGrowth = data.previous_year_sales > 0
        ? ((data.current_year_sales / data.previous_year_sales) - 1) * 100
        : 0;
      
      const customerGrowth = data.previous_year_customers > 0
        ? ((data.current_year_customers / data.previous_year_customers) - 1) * 100
        : 0;

      return {
        store_id: data.store_id,
        date: dateStr,
        hour: currentHour,
        current_year_sales: data.current_year_sales,
        previous_year_sales: data.previous_year_sales,
        current_year_customers: data.current_year_customers,
        previous_year_customers: data.previous_year_customers,
        sales_growth_percent: salesGrowth,
        customer_growth_percent: customerGrowth,
      };
    });

    // Upsert sales data (on conflict update)
    if (salesRecords.length > 0) {
      const { error: upsertError } = await supabase
        .from('daily_sales')
        .upsert(salesRecords, {
          onConflict: 'store_id,date,hour',
          ignoreDuplicates: false,
        });

      if (upsertError) throw upsertError;

      console.log(`Successfully synced sales data for ${salesRecords.length} stores`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: salesRecords.length,
        date: dateStr,
        hour: currentHour,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sales-data-sync:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function calculatePreviousYearDate(supabase: any, dateStr: string): Promise<string> {
  const { data, error } = await supabase
    .rpc('calculate_previous_year_date', { input_date: dateStr });

  if (error) throw error;
  return data;
}

async function fetchStoreSalesData(
  config: StoreConfig,
  currentDate: string,
  previousYearDate: string,
  currentHour: number
): Promise<SalesData> {
  // NOTE: Firebird database connectivity from Deno edge functions is not directly supported
  // This function demonstrates the structure based on the Python script
  // In production, you would need to:
  // 1. Use a connector service/proxy that can connect to Firebird
  // 2. Or migrate Firebird data to a cloud-accessible database
  // 3. Or use an HTTP API endpoint that queries the Firebird database

  console.log(`Attempting to fetch sales data for store ${config.store_code}`);
  console.log(`Config: ${config.host}:${config.port}${config.database_path}`);

  // SQL queries based on Python script logic
  const currentYearQuery = `
    SELECT
      za_siforg AS PRODAVNICA,
      ROUND(SUM(za_vrdrac), 2) AS UKUPNI_PROMET,
      COUNT(za_sifrac) AS UKUPNO_RACUNA
    FROM za_zagrac
    WHERE
      CAST(za_datrac AS DATE) = '${currentDate}' AND
      SUBSTRING(za_vrmrac FROM 1 FOR 2) < '${currentHour.toString().padStart(2, '0')}' AND
      za_siforg = '${config.store_code}'
    GROUP BY za_siforg
  `;

  const previousYearQuery = `
    SELECT
      za_siforg AS PRODAVNICA,
      ROUND(SUM(za_vrdrac), 2) AS UKUPNI_PROMET_PRETHODNA_GODINA,
      COUNT(za_sifrac) AS UKUPNO_RACUNA_PRETHODNA_GODINA
    FROM ex_zagrac
    WHERE
      CAST(za_datrac AS DATE) = '${previousYearDate}' AND
      SUBSTRING(za_vrmrac FROM 1 FOR 2) < '${currentHour.toString().padStart(2, '0')}' AND
      za_siforg = '${config.store_code}'
    GROUP BY za_siforg
  `;

  // TODO: Implement actual Firebird connection
  // For now, return mock data structure
  // When deployed locally with access to Firebird databases, replace this with actual queries
  
  return {
    store_code: config.store_code,
    current_year_sales: 0,
    previous_year_sales: 0,
    current_year_customers: 0,
    previous_year_customers: 0,
  };
}
