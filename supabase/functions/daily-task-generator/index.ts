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

    console.log('Starting daily task generation...');

    // Get all active stores
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name');

    if (storesError) throw storesError;

    // Get task templates
    const { data: templates, error: templatesError } = await supabase
      .from('task_templates')
      .select('*');

    if (templatesError) throw templatesError;

    const today = new Date().toISOString().split('T')[0];
    const tasksToCreate = [];

    // Generate daily tasks for each store based on templates
    for (const store of stores) {
      for (const template of templates) {
        // Check if task already exists for today
        const { data: existingTask } = await supabase
          .from('tasks')
          .select('id')
          .eq('store_id', store.id)
          .eq('template_id', template.id)
          .eq('due_date', today)
          .maybeSingle();

        if (!existingTask) {
          tasksToCreate.push({
            store_id: store.id,
            template_id: template.id,
            title: template.title,
            description: template.description,
            priority: template.priority,
            due_date: today,
            status: 'not_started'
          });
        }
      }
    }

    // Insert tasks
    if (tasksToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('tasks')
        .insert(tasksToCreate);

      if (insertError) throw insertError;
      
      console.log(`Created ${tasksToCreate.length} tasks for ${stores.length} stores`);
    } else {
      console.log('No new tasks to create');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        tasksCreated: tasksToCreate.length,
        storesProcessed: stores.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in daily-task-generator:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
