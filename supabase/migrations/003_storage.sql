-- Create a storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Allow anyone to view images
CREATE POLICY "Images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND owner = auth.uid());
