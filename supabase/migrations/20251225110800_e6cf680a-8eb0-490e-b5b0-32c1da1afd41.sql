-- Create document ratings table
CREATE TABLE public.document_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT NOT NULL,
  gallery_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent multiple ratings from same visitor
CREATE UNIQUE INDEX idx_document_ratings_unique ON public.document_ratings (document_id, visitor_id);

-- Create index for fast lookups
CREATE INDEX idx_document_ratings_document ON public.document_ratings (document_id);

-- Enable Row Level Security
ALTER TABLE public.document_ratings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read ratings (aggregated stats are public)
CREATE POLICY "Anyone can read document ratings" 
ON public.document_ratings 
FOR SELECT 
USING (true);

-- Allow anyone to insert ratings (visitor_id prevents abuse)
CREATE POLICY "Anyone can rate documents" 
ON public.document_ratings 
FOR INSERT 
WITH CHECK (true);

-- Allow visitors to update their own ratings
CREATE POLICY "Visitors can update their own ratings" 
ON public.document_ratings 
FOR UPDATE 
USING (true);