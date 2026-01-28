import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const method = req.method;

    // GET - Fetch ratings for a document
    if (method === 'GET') {
      const documentId = url.searchParams.get('documentId');
      const galleryId = url.searchParams.get('galleryId');
      const visitorId = url.searchParams.get('visitorId');

      if (!documentId) {
        return new Response(
          JSON.stringify({ error: 'documentId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get aggregate stats
      const { data: ratings, error: ratingsError } = await supabase
        .from('document_ratings')
        .select('rating')
        .eq('document_id', documentId);

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError);
        throw ratingsError;
      }

      const totalRatings = ratings?.length || 0;
      const averageRating = totalRatings > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
        : 0;

      // Get visitor's rating if visitorId provided
      let userRating = null;
      if (visitorId) {
        const { data: userRatingData } = await supabase
          .from('document_ratings')
          .select('rating')
          .eq('document_id', documentId)
          .eq('visitor_id', visitorId)
          .maybeSingle();
        
        userRating = userRatingData?.rating || null;
      }

      console.log(`[document-rating] GET documentId=${documentId} avg=${averageRating.toFixed(2)} total=${totalRatings}`);

      return new Response(
        JSON.stringify({
          documentId,
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings,
          userRating
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Submit, update, or remove a rating
    if (method === 'POST') {
      const { documentId, galleryId, rating, visitorId } = await req.json();

      if (!documentId || !galleryId || rating === undefined || !visitorId) {
        return new Response(
          JSON.stringify({ error: 'documentId, galleryId, rating, and visitorId are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Rating of 0 means remove the rating
      if (rating === 0) {
        const { error } = await supabase
          .from('document_ratings')
          .delete()
          .eq('document_id', documentId)
          .eq('visitor_id', visitorId);

        if (error) {
          console.error('Error deleting rating:', error);
          throw error;
        }

        console.log(`[document-rating] DELETE documentId=${documentId} visitorId=${visitorId.substring(0, 8)}...`);

        return new Response(
          JSON.stringify({ success: true, removed: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (rating < 1 || rating > 5) {
        return new Response(
          JSON.stringify({ error: 'rating must be between 1 and 5' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Upsert the rating
      const { data, error } = await supabase
        .from('document_ratings')
        .upsert(
          {
            document_id: documentId,
            gallery_id: galleryId,
            rating,
            visitor_id: visitorId,
          },
          { 
            onConflict: 'document_id,visitor_id',
            ignoreDuplicates: false 
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Error saving rating:', error);
        throw error;
      }

      console.log(`[document-rating] POST documentId=${documentId} rating=${rating} visitorId=${visitorId.substring(0, 8)}...`);

      return new Response(
        JSON.stringify({ success: true, rating: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in document-rating function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
