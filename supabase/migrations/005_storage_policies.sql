-- ==============================================================================
-- 005_storage_policies.sql - Supabase Storage Buckets & Access Policies
-- ==============================================================================

-- Create buckets via storage schema
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('room-images', 'room-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('payment-proofs', 'payment-proofs', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 1. Policies for room-images (Public read, admin write)
CREATE POLICY "Public Read Room Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'room-images');

CREATE POLICY "Admin Upload Room Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'room-images' AND public.is_admin());

CREATE POLICY "Admin Manage Room Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'room-images' AND public.is_admin());

CREATE POLICY "Admin Delete Room Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'room-images' AND public.is_admin());

-- 2. Policies for payment-proofs (Private bucket, tenant can read own, admin can read/verify)
CREATE POLICY "Tenant Upload Payment Proof"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  (auth.uid()::text = (storage.foldername(name))[2])
);

CREATE POLICY "Tenant and Admin Read Payment Proof"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND (
    auth.uid()::text = (storage.foldername(name))[2] OR
    public.is_admin()
  )
);
