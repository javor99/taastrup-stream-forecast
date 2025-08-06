import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting fetch-stream-buffers function...')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if we have cached data (less than 1 hour old)
    const { data: cachedData, error: cacheError } = await supabase
      .from('stream_buffer_cache')
      .select('*')
      .maybeSingle()
    
    console.log('Cache query result:', { cachedData, cacheError })

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    if (cachedData && cachedData.updated_at > oneHourAgo) {
      console.log('Returning cached stream buffer data')
      return new Response(
        JSON.stringify(cachedData.geojson_data),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('Fetching fresh stream buffer data from WFS...')
    
    // Fetch from WFS service
    const wfsUrl = "https://geodata.fvm.dk/geoserver/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=Braemmer_2-metersbraemme_2025&outputFormat=application/json&SRSNAME=EPSG:4326"
    
    const response = await fetch(wfsUrl)
    if (!response.ok) {
      throw new Error(`WFS request failed: ${response.status}`)
    }
    
    const geojsonData = await response.json()
    console.log(`Fetched ${geojsonData.features?.length || 0} features`)
    
    // Simplify the geometry to reduce size (keep every 5th coordinate)
    const simplifiedData = {
      ...geojsonData,
      features: geojsonData.features?.map((feature: any) => ({
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: feature.geometry.coordinates?.map((ring: any) => 
            ring.filter((_: any, index: number) => index % 5 === 0)
          )
        }
      })) || []
    }
    
    console.log('Simplified data created, caching...')
    
    // Cache the data in background
    const backgroundCache = async () => {
      try {
        await supabase
          .from('stream_buffer_cache')
          .upsert({
            id: 1,
            geojson_data: simplifiedData,
            updated_at: new Date().toISOString()
          })
        console.log('Successfully cached stream buffer data')
      } catch (error) {
        console.error('Failed to cache data:', error)
      }
    }
    
    // Start background caching
    EdgeRuntime.waitUntil(backgroundCache())
    
    console.log('Returning fresh stream buffer data')
    
    return new Response(
      JSON.stringify(simplifiedData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in fetch-stream-buffers function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
