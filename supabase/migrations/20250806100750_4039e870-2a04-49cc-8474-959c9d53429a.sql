-- Remove RLS policies from stream_buffer_cache table
DROP POLICY IF EXISTS "Allow public read access to stream buffer cache" ON public.stream_buffer_cache;

-- Disable RLS on the table since it's public data
ALTER TABLE public.stream_buffer_cache DISABLE ROW LEVEL SECURITY;