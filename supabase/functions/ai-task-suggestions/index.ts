import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskPattern {
  storeId: string;
  pattern: string;
  frequency: number;
  lastOccurrence: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storeId, type = 'suggest', limit = 5 } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Fetch recent task history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*, task_history(*)')
      .eq('store_id', storeId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (tasksError) throw tasksError;

    // Fetch KPI data for trend analysis
    const { data: kpis, error: kpisError } = await supabase
      .from('kpis')
      .select('*')
      .eq('store_id', storeId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (kpisError) throw kpisError;

    // Analyze patterns
    const patterns = analyzePatterns(tasks || [], kpis || []);

    // Build context for AI
    const context = {
      storeId,
      recentTasks: tasks?.slice(0, 20).map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.due_date,
        completedAt: t.completed_at,
        isOverdue: t.completed_at && new Date(t.completed_at) > new Date(t.due_date)
      })),
      patterns,
      kpiTrends: {
        avgShrinkage: calculateAverage(kpis, 'shrinkage_percent'),
        avgAvailability: calculateAverage(kpis, 'availability_percent'),
        avgQueueTime: calculateAverage(kpis, 'queue_time_minutes'),
        salesTrend: calculateTrend(kpis, 'sales_amount')
      }
    };

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'suggest') {
      systemPrompt = `You are an AI retail operations assistant that analyzes store data and suggests actionable tasks to improve performance.

Rules for task suggestions:
1. Detect patterns: If a task type has been delayed 3+ times in a row, suggest a preventive task
2. KPI-driven: If shrinkage > 2%, suggest inventory audits. If availability < 95%, suggest stock checks
3. Seasonal/weekly patterns: Suggest prep tasks before high-traffic periods
4. Prioritize by impact: Focus on high-impact, actionable tasks

For each suggestion, provide:
- title: Clear, action-oriented task title
- priority: low, medium, high (based on urgency and impact)
- category: The task category (e.g., "inventory", "quality", "maintenance")
- rationale: 1-2 sentence explanation using specific data points

Format your response as a JSON array of suggestions.`;

      userPrompt = `Based on this store data, suggest ${limit} high-impact tasks:

${JSON.stringify(context, null, 2)}

Return ${limit} task suggestions that address the most critical issues or patterns detected.`;

    } else if (type === 'explain') {
      const { suggestionTitle } = await req.json();
      
      systemPrompt = `You are a transparent AI assistant that explains the reasoning behind task suggestions using specific data points.`;
      
      userPrompt = `Explain why this task was suggested: "${suggestionTitle}"

Context:
${JSON.stringify(context, null, 2)}

Provide a clear, data-driven explanation in 2-3 sentences that references specific metrics or patterns.`;
    }

    // Call Lovable AI with tool calling for structured output
    const body: any = {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    };

    if (type === 'suggest') {
      body.tools = [
        {
          type: "function",
          function: {
            name: "suggest_tasks",
            description: "Return 3-5 actionable task suggestions.",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      priority: { type: "string", enum: ["low", "medium", "high"] },
                      category: { type: "string" },
                      rationale: { type: "string" }
                    },
                    required: ["title", "priority", "category", "rationale"],
                    additionalProperties: false
                  }
                }
              },
              required: ["suggestions"],
              additionalProperties: false
            }
          }
        }
      ];
      body.tool_choice = { type: "function", function: { name: "suggest_tasks" } };
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();

    let result;
    if (type === 'suggest') {
      // Extract structured tool call response
      const toolCall = aiResponse.choices[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.function.name === 'suggest_tasks') {
        const args = JSON.parse(toolCall.function.arguments);
        result = args.suggestions;
      } else {
        result = [];
      }
    } else {
      result = { explanation: aiResponse.choices[0]?.message?.content || 'No explanation available' };
    }

    // Store suggestions in ai_suggestions table
    if (type === 'suggest' && Array.isArray(result)) {
      const suggestionInserts = result.map((suggestion: any) => ({
        store_id: storeId,
        suggestion_type: 'task',
        title: suggestion.title,
        description: suggestion.category,
        rationale: suggestion.rationale,
        status: 'pending'
      }));

      await supabase.from('ai_suggestions').insert(suggestionInserts);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI suggestions error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function analyzePatterns(tasks: any[], kpis: any[]): TaskPattern[] {
  const patterns: TaskPattern[] = [];
  const tasksByTitle: { [key: string]: any[] } = {};

  // Group tasks by title
  tasks.forEach(task => {
    const key = task.title.toLowerCase().trim();
    if (!tasksByTitle[key]) {
      tasksByTitle[key] = [];
    }
    tasksByTitle[key].push(task);
  });

  // Detect patterns
  for (const [title, taskList] of Object.entries(tasksByTitle)) {
    if (taskList.length >= 3) {
      // Check for consecutive delays
      const recent = taskList.slice(0, 3);
      const consecutiveDelays = recent.filter(t => 
        t.completed_at && new Date(t.completed_at) > new Date(t.due_date)
      ).length;

      if (consecutiveDelays >= 3) {
        patterns.push({
          storeId: taskList[0].store_id,
          pattern: `${title} - 3 consecutive delays`,
          frequency: taskList.length,
          lastOccurrence: taskList[0].created_at
        });
      }
    }
  }

  return patterns;
}

function calculateAverage(data: any[], field: string): number {
  if (!data || data.length === 0) return 0;
  const values = data.map(d => d[field]).filter(v => v != null);
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + Number(val), 0) / values.length;
}

function calculateTrend(data: any[], field: string): string {
  if (!data || data.length < 2) return 'stable';
  const recent = data.slice(0, 7);
  const older = data.slice(7, 14);
  
  const recentAvg = calculateAverage(recent, field);
  const olderAvg = calculateAverage(older, field);
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (change > 5) return 'increasing';
  if (change < -5) return 'decreasing';
  return 'stable';
}
