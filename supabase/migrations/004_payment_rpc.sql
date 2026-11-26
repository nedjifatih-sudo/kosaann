-- ==============================================================================
-- 004_payment_rpc.sql - Payment Submission & Verification Stored Procedures
-- ==============================================================================

-- Tenant submits manual payment receipt
CREATE OR REPLACE FUNCTION public.submit_payment(
  p_booking_id UUID,
  p_payment_method payment_method,
  p_proof_storage_path TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_booking RECORD;
  v_payment_id UUID;
BEGIN
  -- Verify caller
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Akses ditolak: Pengguna belum terautentikasi.';
  END IF;

  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pemesanan tidak ditemukan.';
  END IF;

  IF v_booking.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Akses ditolak: Pemesanan bukan milik Anda.';
  END IF;

  IF v_booking.status <> 'approved' THEN
    RAISE EXCEPTION 'Bukti pembayaran hanya dapat dikirimkan untuk pemesanan yang telah disetujui.';
  END IF;

  IF v_booking.expires_at < timezone('utc', now()) THEN
    RAISE EXCEPTION 'Batas waktu pembayaran telah kedaluwarsa.';
  END IF;

  -- Upsert payment record
  INSERT INTO public.payments (
    booking_id,
    user_id,
    amount,
    payment_method,
    proof_storage_path,
    status,
    submitted_at
  )
  VALUES (
    p_booking_id,
    auth.uid(),
    v_booking.total_price,
    p_payment_method,
    p_proof_storage_path,
    'submitted',
    timezone('utc', now())
  )
  ON CONFLICT (id) DO UPDATE SET
    payment_method = EXCLUDED.payment_method,
    proof_storage_path = EXCLUDED.proof_storage_path,
    status = 'submitted',
    submitted_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  RETURNING id INTO v_payment_id;

  -- Audit log
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, new_data)
  VALUES (auth.uid(), 'SUBMIT_PAYMENT', 'payments', v_payment_id, jsonb_build_object(
    'booking_id', p_booking_id,
    'method', p_payment_method,
    'proof_path', p_proof_storage_path
  ));

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'status', 'submitted'
  );
END;
$$;

-- Admin verifies or rejects submitted payment
CREATE OR REPLACE FUNCTION public.admin_verify_payment(
  p_payment_id UUID,
  p_decision TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_payment RECORD;
  v_booking RECORD;
  v_admin_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Akses ditolak: Khusus administrator.';
  END IF;

  v_admin_id := auth.uid();

  SELECT * INTO v_payment
  FROM public.payments
  WHERE id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Catatan pembayaran tidak ditemukan.';
  END IF;

  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = v_payment.booking_id
  FOR UPDATE;

  IF p_decision = 'verify' THEN
    -- Mark payment verified
    UPDATE public.payments
    SET status = 'verified',
        verified_at = timezone('utc', now()),
        verified_by = v_admin_id,
        updated_at = timezone('utc', now())
    WHERE id = p_payment_id;

    -- Confirm booking
    UPDATE public.bookings
    SET status = 'confirmed',
        confirmed_at = timezone('utc', now()),
        expires_at = NULL,
        updated_at = timezone('utc', now())
    WHERE id = v_payment.booking_id;

    -- Create tenant record
    INSERT INTO public.tenant_records (
      booking_id,
      user_id,
      room_id,
      check_in,
      check_out,
      status
    )
    VALUES (
      v_booking.id,
      v_booking.user_id,
      v_booking.room_id,
      v_booking.check_in,
      v_booking.check_out,
      'active'
    )
    ON CONFLICT (booking_id) DO NOTHING;

    -- Send confirmation notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_booking.user_id,
      'Pembayaran Terverifikasi & Booking Dikonfirmasi!',
      'Pembayaran sebesar Rp ' || to_char(v_payment.amount, 'FM999,999,999') || ' telah diverifikasi. Selamat datang di KOSAANN!',
      'success'
    );

  ELSIF p_decision = 'reject' THEN
    UPDATE public.payments
    SET status = 'rejected',
        rejection_reason = COALESCE(p_reason, 'Bukti pembayaran tidak terbaca atau jumlah tidak sesuai.'),
        updated_at = timezone('utc', now())
    WHERE id = p_payment_id;

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_booking.user_id,
      'Verifikasi Pembayaran Ditolak',
      'Bukti transfer ditolak: ' || COALESCE(p_reason, 'Silakan unggah bukti yang valid sebelum masa sewa berakhir.'),
      'warning'
    );
  ELSE
    RAISE EXCEPTION 'Keputusan tidak valid (hanya verify atau reject).';
  END IF;

  -- Audit log
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, new_data)
  VALUES (v_admin_id, 'VERIFY_PAYMENT_' || upper(p_decision), 'payments', p_payment_id, jsonb_build_object(
    'decision', p_decision,
    'reason', p_reason
  ));

  RETURN jsonb_build_object('success', true, 'decision', p_decision);
END;
$$;
