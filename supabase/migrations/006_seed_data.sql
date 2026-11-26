-- ==============================================================================
-- 006_seed_data.sql - High Quality Demo Property & Initial Rooms
-- ==============================================================================

-- 1. Property
INSERT INTO public.properties (id, name, slug, description, address, city, province, postal_code, latitude, longitude, contact_phone)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'KOSAANN Kemang Prime',
  'kosaann-kemang-prime',
  'Hunian eksklusif dengan sentuhan hospitality modern di jantung Jakarta Selatan. Dirancang untuk para profesional muda dan ekspatriat yang mendambakan ketenangan, kenyamanan kelas hotel, dan kemudahan akses ke pusat bisnis.',
  'Jl. Bangka Raya No. 42, Kemang',
  'Jakarta Selatan',
  'DKI Jakarta',
  '12720',
  -6.260823,
  106.815340,
  '+6281299887766'
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Amenities
INSERT INTO public.amenities (id, name, icon, description)
VALUES 
  ('11111111-1111-1111-1111-111111111101', 'High-Speed Wi-Fi (100 Mbps)', 'Wifi', 'Koneksi internet serat optik dedicated stabil untuk WFH'),
  ('11111111-1111-1111-1111-111111111102', 'Kamar Mandi Dalam & Water Heater', 'Bath', 'Saniter Toto premium dengan pemanas air otomatis'),
  ('11111111-1111-1111-1111-111111111103', 'AC Inverter Hemat Energi', 'Wind', 'Daikin inverter sejuk dan senyap untuk istirahat optimal'),
  ('11111111-1111-1111-1111-111111111104', 'Smart TV 43" 4K', 'Tv', 'Smart TV dengan akses Netflix, YouTube & kabel digital'),
  ('11111111-1111-1111-1111-111111111105', 'Dapur Bersama & Kulkas', 'Utensils', 'Kitchen set lengkap, microwave, dispenser air steril'),
  ('11111111-1111-1111-1111-111111111106', 'Keamanan 24 Jam & Smart Lock', 'ShieldCheck', 'Access card RFID pintu utama dan CCTV 24/7'),
  ('11111111-1111-1111-1111-111111111107', 'Laundry Mingguan Gratis', 'Shirt', 'Fasilitas cuci setrika hingga 15 kg per bulan'),
  ('11111111-1111-1111-1111-111111111108', 'Parkir Mobil & Motor Luas', 'Car', 'Area parkir beratap dan aman di dalam gerbang properti')
ON CONFLICT (name) DO NOTHING;

-- 3. Rooms
INSERT INTO public.rooms (id, property_id, name, slug, description, room_number, monthly_price, capacity, area, status)
VALUES
  (
    '22222222-2222-2222-2222-222222222201',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Deluxe Garden Suite 101',
    'deluxe-garden-suite-101',
    'Kamar di lantai dasar dengan jendela menghadap taman tropis privat. Dilengkapi kasur King Koil Queen size, meja kerja ergonomis, dan lemari pakaian built-in.',
    'A-101',
    3500000.00,
    1,
    24.00,
    'available'
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Executive Balcony Suite 201',
    'executive-balcony-suite-201',
    'Kamar lantai dua dengan balkon pribadi menghadap pemandangan kota Kemang. Sangat tenang dengan pencahayaan alami berlimpah.',
    'B-201',
    4200000.00,
    1,
    28.00,
    'available'
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Master Studio Lofts 301',
    'master-studio-lofts-301',
    'Tipe loft eksklusif dengan area lounge santai dan pantry mini pribadi. Pilihan terbaik bagi Anda yang mengutamakan ruang luas dan privasi total.',
    'C-301',
    5500000.00,
    2,
    38.00,
    'available'
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Superior Cozy Room 102',
    'superior-cozy-room-102',
    'Kamar efisien dan modern dengan pencahayaan hangat. Sangat ideal bagi profesional yang dinamis dan mengutamakan istirahat berkualitas.',
    'A-102',
    3000000.00,
    1,
    20.00,
    'occupied'
  )
ON CONFLICT (slug) DO NOTHING;

-- 4. Connect Amenities to Rooms
INSERT INTO public.room_amenities (room_id, amenity_id)
SELECT r.id, a.id
FROM public.rooms r, public.amenities a
ON CONFLICT DO NOTHING;

-- 5. App Settings
INSERT INTO public.app_settings (key, value, description)
VALUES 
  ('bank_accounts', '[
    {"bank": "BCA", "account_number": "8830192831", "account_name": "PT KOSAANN INDONESIA", "branch": "KCU Kemang"},
    {"bank": "Mandiri", "account_number": "1270009876543", "account_name": "PT KOSAANN INDONESIA", "branch": "Kemang Village"},
    {"bank": "BCA QRIS", "account_number": "NMID: ID102003948571", "account_name": "KOSAANN KEMANG", "branch": "Dynamic QRIS"}
  ]'::jsonb, 'Rekening bank tujuan transfer pembayaran sewa'),
  ('booking_policy', '{
    "approval_window_hours": 24,
    "payment_window_hours": 24,
    "min_duration_months": 1,
    "security_deposit_amount": 1000000
  }'::jsonb, 'Konfigurasi batas waktu dan aturan booking')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
