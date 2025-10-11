import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting KPI aggregation...');

    const today = new Date().toISOString().split('T')[0];

    // Get all stores
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id');

    if (storesError) throw storesError;

    const kpisToUpsert = [];

    for (const store of stores) {
      // Generate random KPI data (in production, this would come from actual data)
      const kpi = {
        store_id: store.id,
        date: today,
        sales_amount: Math.floor(Math.random() * 50000) + 10000,
        queue_time_minutes: Math.floor(Math.random() * 10) + 2,
        cash_variance_amount: (Math.random() * 200) - 100,
        shrinkage_percent: Math.random() * 2,
        availability_percent: 95 + Math.random() * 5,
        sco_uptime_percent: 90 + Math.random() * 10,
      };

      kpisToUpsert.push(kpi);
    }

    // Upsert KPIs
    if (kpisToUpsert.length > 0) {
      const { error: upsertError } = await supabase
        .from('kpis')
        .upsert(kpisToUpsert, { 
          onConflict: 'store_id,date',
          ignoreDuplicates: false 
        });

      if (upsertError) throw upsertError;
      
      console.log(`Updated KPIs for ${stores.length} stores`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        kpisUpdated: kpisToUpsert.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in kpi-aggregator:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
