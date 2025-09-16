// src/app/api/webhooks/jobs/route.ts
import { createClient } from "@/lib/supabase/server";

// Simple webhook signature verification (replace with proper implementation)
function verifyWebhookSignature(signature: string | null): boolean {
  // TODO: Implement proper webhook signature verification
  // For now, accept all requests in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // In production, implement proper signature verification
  // based on your webhook provider's documentation
  return !!signature;
}

// Simple job processing client (can be replaced with Trigger.dev)
class JobProcessingClient {
  async sendEvent(event: { name: string; payload: { source: string; job: Record<string, unknown>; received_at: string } }) {
    // TODO: Replace with Trigger.dev client when configured
    // For now, process the job directly
    try {
      const supabase = await createClient();
      const { source, received_at } = event.payload;

      // Log the webhook event
      await supabase.from('scrape_logs').insert({
        source,
        status: 'SUCCESS',
        jobs_found: 1,
        jobs_added: 1,
        started_at: received_at,
        completed_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error processing job:', error);
    }
  }
}

const client = new JobProcessingClient();

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-signature');
    const source = request.headers.get('x-source');

    // Get request body as JSON
    const jobData: Record<string, unknown> = await request.json();

    // Verify webhook signature
    if (!verifyWebhookSignature(signature)) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Queue job for processing
    await client.sendEvent({
      name: "job.received",
      payload: {
        source: source || 'unknown',
        job: jobData,
        received_at: new Date().toISOString()
      }
    });

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}