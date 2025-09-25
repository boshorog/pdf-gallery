import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileUrl, fileType } = await req.json()

    if (!fileUrl || !fileType) {
      return new Response(
        JSON.stringify({ error: 'Missing fileUrl or fileType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let thumbnailUrl = null

    // Handle different file types
    if (fileType.startsWith('image/')) {
      // For images, we can create thumbnails directly
      thumbnailUrl = await generateImageThumbnail(fileUrl)
    } else if (fileType.includes('pdf')) {
      // PDFs are handled client-side
      thumbnailUrl = null
    } else {
      // For Office documents, use Google Drive API (free tier)
      thumbnailUrl = await generateOfficeThumbnail(fileUrl, fileType)
    }

    return new Response(
      JSON.stringify({ thumbnailUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating thumbnail:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate thumbnail' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateImageThumbnail(imageUrl: string): Promise<string | null> {
  try {
    // For now, return the original image URL - client can resize with CSS
    // In a full implementation, you'd resize the image server-side
    return imageUrl
  } catch (error) {
    console.error('Error generating image thumbnail:', error)
    return null
  }
}

async function generateOfficeThumbnail(fileUrl: string, fileType: string): Promise<string | null> {
  try {
    // Use Google Drive API to generate preview
    // This requires the file to be publicly accessible
    const driveUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(fileUrl)}`
    
    // For now, return null and let client show file type icon
    // A full implementation would use Google Drive API with authentication
    return null
  } catch (error) {
    console.error('Error generating office thumbnail:', error)
    return null
  }
}