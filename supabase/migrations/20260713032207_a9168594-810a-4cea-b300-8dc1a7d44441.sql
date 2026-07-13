CREATE POLICY "videos_authenticated_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'videos');