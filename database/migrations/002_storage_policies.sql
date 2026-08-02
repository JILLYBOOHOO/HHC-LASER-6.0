-- Optional Storage policies (server uploads use the service role and do not need these).
-- Create buckets first (API auto-creates hhc-public + hhc-private on startup), then run if desired.

-- Public read for marketing/CMS assets
DROP POLICY IF EXISTS "Public read hhc-public" ON storage.objects;
CREATE POLICY "Public read hhc-public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hhc-public');
