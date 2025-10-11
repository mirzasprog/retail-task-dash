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

    // Get current date
    const today = new Date().toISOString().split('T')[0];
    const currentDow = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

    console.log(`Generating tasks for ${today} (${currentDow})`);

    // Fetch all active stores
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name, region_id')
      .order('name');

    if (storesError) {
      console.error('Error fetching stores:', storesError);
      throw storesError;
    }

    if (!stores || stores.length === 0) {
      console.log('No stores found');
      return new Response(
        JSON.stringify({ message: 'No stores found', tasksCreated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all active task templates
    const { data: templates, error: templatesError } = await supabase
      .from('task_templates')
      .select('*')
      .order('priority', { ascending: false });

    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
      throw templatesError;
    }

    if (!templates || templates.length === 0) {
      console.log('No task templates found');
      return new Response(
        JSON.stringify({ message: 'No task templates found', tasksCreated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter templates that should run today
    const templatesToRun = templates.filter(template => {
      if (template.frequency === 'DAILY') {
        return true;
      } else if (template.frequency === 'WEEKLY' || template.frequency === 'CUSTOM') {
        return template.dow && template.dow.includes(currentDow);
      }
      return false;
    });

    console.log(`Found ${templatesToRun.length} templates to run today out of ${templates.length} total`);

    let tasksCreated = 0;
    const tasksToCreate = [];

    // Create tasks for each store and applicable template
    for (const store of stores) {
      for (const template of templatesToRun) {
        // Check if task already exists for this store, template, and date
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
            category: template.category,
            priority: template.priority,
            status: 'not_started',
            due_date: today,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    // Bulk insert tasks
    if (tasksToCreate.length > 0) {
      const { data: insertedTasks, error: insertError } = await supabase
        .from('tasks')
        .insert(tasksToCreate)
        .select();

      if (insertError) {
        console.error('Error creating tasks:', insertError);
        throw insertError;
      }

      tasksCreated = insertedTasks?.length || 0;
      console.log(`Created ${tasksCreated} tasks`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: today,
        storesProcessed: stores.length,
        templatesProcessed: templatesToRun.length,
        tasksCreated
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
