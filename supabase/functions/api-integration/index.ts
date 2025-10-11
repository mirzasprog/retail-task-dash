import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { IPISAdapter } from '../_shared/ipisAdapter.ts';
import { WMSAdapter } from '../_shared/wmsAdapter.ts';
import { IdempotencyService } from '../_shared/idempotency.ts';
import { RateLimiter } from '../_shared/rateLimiter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, idempotency-key',
};

// Rate limiter: 100 requests per minute per API key
const rateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const apiKey = req.headers.get('x-api-key') || '';
    const idempotencyKey = req.headers.get('idempotency-key');

    // Validate API key
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing x-api-key header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const rateLimitResult = rateLimiter.check(apiKey);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter)
          }
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize adapters
    const ipisAdapter = new IPISAdapter(Deno.env.get('IPIS_API_KEY') || 'demo-key');
    const wmsAdapter = new WMSAdapter(Deno.env.get('WMS_API_KEY') || 'demo-key');
    const idempotencyService = new IdempotencyService();

    // Route handling
    if (path === '/api-integration/inventory' && req.method === 'GET') {
      const storeId = url.searchParams.get('storeId');
      if (!storeId) {
        return new Response(
          JSON.stringify({ error: 'Missing storeId parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await ipisAdapter.getInventory(storeId);
      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : (result.statusCode || 500),
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (path === '/api-integration/orders' && req.method === 'POST') {
      const body = await req.json();

      // Check idempotency
      if (idempotencyKey) {
        const cached = await idempotencyService.checkIdempotency(
          idempotencyKey,
          path,
          body
        );

        if (cached.cached) {
          return new Response(
            JSON.stringify(cached.response?.body),
            { 
              status: cached.response?.status || 200,
              headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json',
                'X-Idempotency-Cache': 'HIT'
              }
            }
          );
        }
      }

      // Submit order to WMS
      const result = await wmsAdapter.submitOrder(body);

      // Store idempotency
      if (idempotencyKey && result.success) {
        await idempotencyService.storeIdempotency(
          idempotencyKey,
          path,
          body,
          result.statusCode || 200,
          result.data
        );
      }

      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : (result.statusCode || 500),
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (path.match(/^\/api-integration\/orders\/.*\/status$/) && req.method === 'GET') {
      const orderId = path.split('/')[3];
      const result = await wmsAdapter.getOrderStatus(orderId);

      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : (result.statusCode || 500),
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (path === '/api-integration/task-status' && req.method === 'POST') {
      const body = await req.json();

      // Check idempotency
      if (idempotencyKey) {
        const cached = await idempotencyService.checkIdempotency(
          idempotencyKey,
          path,
          body
        );

        if (cached.cached) {
          return new Response(
            JSON.stringify(cached.response?.body),
            { 
              status: cached.response?.status || 200,
              headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json',
                'X-Idempotency-Cache': 'HIT'
              }
            }
          );
        }
      }

      // Update task status
      const { taskId, status, comments } = body;
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status,
          comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      const responseBody = error 
        ? { error: error.message }
        : { success: true, taskId, status };

      const responseStatus = error ? 500 : 200;

      // Store idempotency
      if (idempotencyKey && !error) {
        await idempotencyService.storeIdempotency(
          idempotencyKey,
          path,
          body,
          responseStatus,
          responseBody
        );
      }

      return new Response(
        JSON.stringify(responseBody),
        { 
          status: responseStatus,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // API docs endpoint
    if (path === '/api-integration/docs') {
      const docs = {
        openapi: '3.0.0',
        info: {
          title: 'Retail Store Integration API',
          version: '1.0.0',
          description: 'API for integrating with iPIS and WMS systems'
        },
        servers: [
          {
            url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/api-integration`,
            description: 'Production server'
          }
        ],
        paths: {
          '/inventory': {
            get: {
              summary: 'Get store inventory',
              parameters: [
                {
                  name: 'storeId',
                  in: 'query',
                  required: true,
                  schema: { type: 'string' }
                }
              ],
              responses: {
                '200': {
                  description: 'Inventory data',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          success: { type: 'boolean' },
                          data: { type: 'array' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '/orders': {
            post: {
              summary: 'Submit new order',
              parameters: [
                {
                  name: 'Idempotency-Key',
                  in: 'header',
                  required: false,
                  schema: { type: 'string' }
                }
              ],
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        storeId: { type: 'string' },
                        items: { type: 'array' },
                        deliveryDate: { type: 'string' }
                      }
                    }
                  }
                }
              },
              responses: {
                '200': {
                  description: 'Order submitted',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          success: { type: 'boolean' },
                          data: {
                            type: 'object',
                            properties: {
                              orderId: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '/task-status': {
            post: {
              summary: 'Update task status',
              parameters: [
                {
                  name: 'Idempotency-Key',
                  in: 'header',
                  required: false,
                  schema: { type: 'string' }
                }
              ],
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        taskId: { type: 'string' },
                        status: { type: 'string' },
                        comments: { type: 'string' }
                      }
                    }
                  }
                }
              },
              responses: {
                '200': {
                  description: 'Task updated'
                }
              }
            }
          }
        },
        components: {
          securitySchemes: {
            ApiKeyAuth: {
              type: 'apiKey',
              in: 'header',
              name: 'x-api-key'
            }
          }
        },
        security: [{ ApiKeyAuth: [] }]
      };

      return new Response(
        JSON.stringify(docs),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Integration error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
