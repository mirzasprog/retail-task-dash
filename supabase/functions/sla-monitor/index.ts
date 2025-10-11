import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Run SLA violation check
    const { error: checkError } = await supabase.rpc('check_task_sla_violations');
    
    if (checkError) {
      console.error('Error checking SLA violations:', checkError);
      throw checkError;
    }

    // Get new violations that haven't been notified
    const { data: violations, error: violationsError } = await supabase
      .from('task_sla_violations')
      .select(`
        *,
        tasks:task_id (
          id,
          title,
          priority,
          store_id,
          stores:store_id (
            id,
            name,
            region_id
          )
        )
      `)
      .is('notified_at', null)
      .order('created_at', { ascending: false });

    if (violationsError) throw violationsError;

    let notificationsSent = 0;

    // Process each violation
    for (const violation of violations || []) {
      const task = violation.tasks;
      if (!task || !task.stores) continue;

      const store = task.stores;

      // Get regional supervisor for this region
      const { data: supervisors, error: supervisorError } = await supabase
        .from('user_roles')
        .select('user_id, profiles:user_id(email, full_name)')
        .eq('role', 'regional_supervisor');

      if (supervisorError) {
        console.error('Error fetching supervisors:', supervisorError);
        continue;
      }

      // Get users who should be notified (regional supervisors for this region)
      const { data: regionStores } = await supabase
        .from('stores')
        .select('id')
        .eq('region_id', store.region_id);

      const storeIds = regionStores?.map(s => s.id) || [];

      // Filter supervisors who manage stores in this region
      const { data: regionSupervisors } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('store_id', storeIds);

      if (!regionSupervisors || regionSupervisors.length === 0) {
        console.log('No supervisors found for region:', store.region_id);
        continue;
      }

      // Create notifications for each supervisor
      for (const supervisor of regionSupervisors) {
        await supabase.from('notifications').insert({
          user_id: supervisor.id,
          title: `SLA Violation: ${task.title}`,
          message: `High priority task at ${store.name} is ${violation.hours_delayed.toFixed(1)} hours overdue`,
          type: 'sla_violation',
          task_id: task.id
        });
      }

      // Mark violation as notified
      await supabase
        .from('task_sla_violations')
        .update({
          notified_at: new Date().toISOString(),
          notified_users: regionSupervisors.map(s => s.id)
        })
        .eq('id', violation.id);

      notificationsSent++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        violationsChecked: violations?.length || 0,
        notificationsSent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SLA monitor error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
