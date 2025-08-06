-- Create table for caching stream buffer data
CREATE TABLE public.stream_buffer_cache (
  id INTEGER PRIMARY KEY DEFAULT 1,
  geojson_data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a constraint to ensure only one row exists
ALTER TABLE public.stream_buffer_cache ADD CONSTRAINT single_row_check CHECK (id = 1);