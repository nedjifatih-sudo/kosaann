-- ==============================================================================
-- 003_booking_rpc.sql - Transactional Booking Stored Procedures
-- ==============================================================================

-- Create a booking atomically with conflict and pricing validation
CREATE OR REPLACE FUNCTION public.create_booking(
  p_room_id UUID,
  p_check_in DATE,
  p_duration INTEGER,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_monthly_price NUMERIC(12, 2);
  v_room_status room_status;
  v_check_out DATE;
  v_total_price NUMERIC(12, 2);
  v_booking_code TEXT;
  v_booking_id UUID;
  v_conflict_count INTEGER;
BEGIN
  -- 1. Caller verification
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Akses ditolak: Pengguna belum terautentikasi.';
  END IF;

  IF p_duration < 1 THEN
    RAISE EXCEPTION 'Durasi pemesanan minimal 1 bulan.';
  END IF;

  IF p_check_in < CURRENT_DATE THEN
    RAISE EXCEPTION 'Tanggal check-in tidak boleh di masa lampau.';
  END IF;

  -- 2. Lock room row and inspect price & status
  SELECT monthly_price, status INTO v_monthly_price, v_room_status
  FROM public.rooms
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kamar tidak ditemukan.';
  END IF;

  IF v_room_status <> 'available' THEN
    RAISE EXCEPTION 'Kamar sedang tidak tersedia (status: %)', v_room_status;
  END IF;

  -- 3. Compute check_out date (monthly intervals)
  v_check_out := p_check_in + (p_duration || ' months')::INTERVAL;
  v_total_price := v_monthly_price * p_duration;

  -- 4. Check for overlapping approved/confirmed bookings
  SELECT COUNT(*) INTO v_conflict_count
  FROM public.bookings
  WHERE room_id = p_room_id
    AND status IN ('approved', 'confirmed')
    AND daterange(check_in, check_out, '[)') && daterange(p_check_in, v_check_out, '[)');

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'Maaf, kamar ini sudah dipesan pada rentang tanggal tersebut.';
  END IF;

  -- 5. Generate human-readable booking code
  v_booking_code := 'KSN-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));

  -- 6. Insert pending booking
  INSERT INTO public.bookings (
    booking_code,
    user_id,
    room_id,
    check_in,
    check_out,
    duration,
    duration_unit,
    price_per_unit,
    total_price,
    status,
    notes,
    expires_at
  )
  VALUES (
    v_booking_code,
    v_user_id,
    p_room_id,
    p_check_in,
    v_check_out,
    p_duration,
    'monthly',
    v_monthly_price,
    v_total_price,
    'pending',
    p_notes,
    timezone('utc', now() + INTERVAL '24 hours')
  )
  RETURNING id INTO v_booking_id;

  -- 7. Insert audit record
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, new_data)
  VALUES (v_user_id, 'CREATE_BOOKING', 'bookings', v_booking_id, jsonb_build_object(
    'booking_code', v_booking_code,
    'room_id', p_room_id,
    'total_price', v_total_price,
    'check_in', p_check_in,
    'check_out', v_check_out
  ));

  -- 8. Return response
  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_code', v_booking_code,
    'total_price', v_total_price,
    'expires_at', (now() + INTERVAL '24 hours')
  );
END;
$$;

-- Admin review booking (Approve or Reject)
CREATE OR REPLACE FUNCTION public.admin_review_booking(
  p_booking_id UUID,
  p_action TEXT,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_booking RECORD;
  v_admin_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Akses ditolak: Khusus administrator.';
  END IF;

  v_admin_id := auth.uid();

  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pemesanan tidak ditemukan.';
  END IF;

  IF v_booking.status <> 'pending' THEN
    RAISE EXCEPTION 'Hanya pemesanan berstatus pending yang dapat ditinjau.';
  END IF;

  IF p_action = 'approve' THEN
    -- Check for conflicting bookings before approving
    IF EXISTS (
      SELECT 1 FROM public.bookings
      WHERE room_id = v_booking.room_id
        AND id <> p_booking_id
        AND status IN ('approved', 'confirmed')
        AND daterange(check_in, check_out, '[)') && daterange(v_booking.check_in, v_booking.check_out, '[)')
    ) THEN
      RAISE EXCEPTION 'Terdapat bentrokan jadwal dengan pemesanan lain yang telah disetujui.';
    END IF;

    UPDATE public.bookings
    SET status = 'approved',
        approved_at = timezone('utc', now()),
        expires_at = timezone('utc', now() + INTERVAL '24 hours'),
        updated_at = timezone('utc', now())
    WHERE id = p_booking_id;

    -- Create or prepare payment record
    INSERT INTO public.payments (booking_id, user_id, amount, status)
    VALUES (p_booking_id, v_booking.user_id, v_booking.total_price, 'unpaid')
    ON CONFLICT DO NOTHING;

    -- Send notification to tenant
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_booking.user_id,
      'Pemesanan Disetujui',
      'Pemesanan ' || v_booking.booking_code || ' telah disetujui. Silakan unggah bukti transfer pembayaran dalam 24 jam.',
      'action_required'
    );

  ELSIF p_action = 'reject' THEN
    UPDATE public.bookings
    SET status = 'rejected',
        notes = COALESCE(notes, '') || ' [Ditolak: ' || COALESCE(p_rejection_reason, 'Tidak memenuhi syarat') || ']',
        updated_at = timezone('utc', now())
    WHERE id = p_booking_id;

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_booking.user_id,
      'Pemesanan Ditolak',
      'Pemesanan ' || v_booking.booking_code || ' tidak disetujui: ' || COALESCE(p_rejection_reason, 'Kamar tidak tersedia'),
      'warning'
    );
  ELSE
    RAISE EXCEPTION 'Aksi tidak valid (hanya approve atau reject).';
  END IF;

  -- Audit log
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, new_data)
  VALUES (v_admin_id, 'REVIEW_BOOKING_' || upper(p_action), 'bookings', p_booking_id, jsonb_build_object(
    'action', p_action,
    'reason', p_rejection_reason
  ));

  RETURN jsonb_build_object('success', true, 'status', p_action);
END;
$$;

-- Tenant can cancel eligible booking
CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_booking RECORD;
BEGIN
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pemesanan tidak ditemukan.';
  END IF;

  IF v_booking.user_id <> auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Akses ditolak: Bukan pemilik pemesanan.';
  END IF;

  IF v_booking.status NOT IN ('pending', 'approved') THEN
    RAISE EXCEPTION 'Pemesanan berstatus % tidak dapat dibatalkan.', v_booking.status;
  END IF;

  UPDATE public.bookings
  SET status = 'cancelled',
      updated_at = timezone('utc', now())
  WHERE id = p_booking_id;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'CANCEL_BOOKING', 'bookings', p_booking_id);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Cron / Sweep routine to expire stale bookings
CREATE OR REPLACE FUNCTION public.expire_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  WITH expired_rows AS (
    UPDATE public.bookings
    SET status = 'expired',
        updated_at = timezone('utc', now())
    WHERE status IN ('pending', 'approved')
      AND expires_at < timezone('utc', now())
    RETURNING id
  )
  SELECT count(*) INTO v_expired_count FROM expired_rows;

  RETURN v_expired_count;
END;
$$;
