-- Add design image URL to job orders
ALTER TABLE job_orders
  ADD COLUMN design_image_url TEXT;

-- Create storage bucket for job designs (run in Supabase dashboard or via CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('job-designs', 'job-designs', true)
-- ON CONFLICT (id) DO NOTHING;
