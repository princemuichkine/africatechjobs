import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

interface JobData {
  id: string
  created_at: string
  updated_at?: string
  clicks: number
  is_sponsored: boolean
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('🔍 Generating SEO files...')

    // Get all active jobs using RPC function
    const { data: jobs, error } = await supabaseClient
      .rpc('get_jobs_for_seo')

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`)
    }

    const jobsData: JobData[] = jobs || []
    console.log(`📊 Found ${jobsData.length} jobs to include in sitemap`)

    // Generate sitemap.xml
    const baseUrl = 'https://africatechjobs.xyz'
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/jobs</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/advertise</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  ${jobsData.map(job => {
    const lastModified = job.updated_at ? new Date(job.updated_at).toISOString() : new Date(job.created_at).toISOString()
    const priority = job.clicks > 50 ? '0.9' : job.is_sponsored ? '0.8' : '0.7'
    const changeFreq = job.clicks > 10 ? 'weekly' : 'monthly'

    return `  <url>
    <loc>${baseUrl}/jobs/${job.id}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join('\n')}
</urlset>`

    // Generate robots.txt
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml
`

    // Store files in Supabase Storage (you could also return them directly)
    // For now, we'll return the content so the workflow can save it

    console.log('✅ SEO files generated successfully!')
    console.log(`📄 robots.txt: ${robotsTxt.length} characters`)
    console.log(`🗺️  sitemap.xml: ${sitemapXml.length} characters`)

    return new Response(
      JSON.stringify({
        success: true,
        robotsTxt,
        sitemapXml,
        jobsCount: jobsData.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Error generating SEO files:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
