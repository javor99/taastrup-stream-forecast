-- Enable Row Level Security on stream_buffer_cache table
ALTER TABLE public.stream_buffer_cache ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (since this is cached public data)
CREATE POLICY "Allow public read access to stream buffer cache" 
ON public.stream_buffer_cache 
FOR SELECT 
USING (true);