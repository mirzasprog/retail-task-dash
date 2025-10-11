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
    const { storeId, category, lookAheadDays = 7 } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Fetch historical order data (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeId)
      .gte('order_date', ninetyDaysAgo.toISOString().split('T')[0])
      .order('order_date', { ascending: true });

    if (ordersError) throw ordersError;

    // Filter by category if specified
    const filteredOrders = category 
      ? orders?.filter(o => o.category === category)
      : orders;

    // Aggregate order quantities by date and category
    const ordersByDate: { [key: string]: number } = {};
    filteredOrders?.forEach(order => {
      const date = order.order_date;
      if (!ordersByDate[date]) {
        ordersByDate[date] = 0;
      }
      
      // Sum quantities from items
      const items = order.items as any[];
      const totalQty = items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      ordersByDate[date] += totalQty;
    });

    // Prepare time series data
    const dates = Object.keys(ordersByDate).sort();
    const quantities = dates.map(d => ordersByDate[d]);

    // Calculate simple moving average and trend
    const movingAvgWindow = 7;
    const movingAvg = calculateMovingAverage(quantities, movingAvgWindow);
    const trend = calculateLinearTrend(quantities);

    // Build forecast using simple linear extrapolation
    const forecast: { date: string; predictedQuantity: number; confidence: string }[] = [];
    const lastKnownQty = quantities[quantities.length - 1] || 0;
    const avgDailyChange = trend.slope;

    for (let i = 1; i <= lookAheadDays; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      
      const predicted = Math.max(0, lastKnownQty + (avgDailyChange * i));
      
      // Confidence decreases with distance
      let confidence = 'high';
      if (i > 3) confidence = 'medium';
      if (i > 5) confidence = 'low';

      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedQuantity: Math.round(predicted),
        confidence
      });
    }

    // Use AI to provide insights and recommendations
    const systemPrompt = `You are a retail demand forecasting assistant. Analyze historical order patterns and provide actionable recommendations for inventory management.`;

    const userPrompt = `Analyze this order data and provide demand hints:

Store: ${storeId}
Category: ${category || 'all categories'}
Historical average daily orders: ${calculateAverage(quantities).toFixed(1)}
Trend: ${trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable'} (${trend.slope.toFixed(2)} units/day)
Forecast for next ${lookAheadDays} days: ${forecast[0].predictedQuantity} - ${forecast[forecast.length - 1].predictedQuantity} units/day

Provide:
1. A brief interpretation of the trend (1 sentence)
2. Specific ordering recommendation (e.g., "Order 20% more produce on Tuesday-Wednesday")
3. Any risk factors to watch (1 sentence)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const insights = aiResponse.choices[0]?.message?.content || 'No insights available';

    return new Response(
      JSON.stringify({
        forecast,
        statistics: {
          historicalAverage: calculateAverage(quantities),
          trend: trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable',
          trendSlope: trend.slope,
          lastValue: lastKnownQty
        },
        insights
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Demand forecasting error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateMovingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = data.slice(start, i + 1);
    const avg = subset.reduce((sum, val) => sum + val, 0) / subset.length;
    result.push(avg);
  }
  return result;
}

function calculateLinearTrend(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  const xValues = Array.from({ length: n }, (_, i) => i);
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = data.reduce((sum, y) => sum + y, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (data[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  return { slope, intercept };
}

function calculateAverage(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, val) => sum + val, 0) / data.length;
}
