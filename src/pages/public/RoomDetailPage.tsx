import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatIDR } from '../../lib/utils';
import { Bed, CheckCircle, Bath, Wind, Wifi, ShieldCheck, Calendar, ArrowLeft, Clock, AlertCircle } from 'lucide-react';

export const RoomDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { rooms, createBooking } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const room = rooms.find(r => r.slug === slug);

  // Booking Form State
  const [checkIn, setCheckIn] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBookingCode, setSuccessBookingCode] = useState('');

  if (!room) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-forest">Kamar Tidak Ditemukan</h2>
        <p className="text-sm text-charcoal-muted mt-2">Kamar yang Anda tuju mungkin sudah tidak aktif atau tautan salah.</p>
        <Link to="/rooms" className="inline-block mt-4 px-4 py-2 rounded-lg bg-forest text-white text-sm">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const totalPrice = room.monthly_price * duration;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createBooking(room.id, checkIn, duration, notes);
      setSuccessBookingCode(res.bookingCode);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengajukan booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link to="/rooms" className="inline-flex items-center gap-2 text-sm text-charcoal-muted hover:text-forest mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog Kamar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Gallery */}
          <div className="rounded-3xl overflow-hidden border border-ivory-dark bg-white shadow-sm">
            <div className="relative h-96 sm:h-[480px]">
              <img
                src={room.images?.[0]?.storage_path || 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-md ${
                  room.status === 'available' ? 'bg-forest text-white' : 'bg-gray-800 text-white'
                }`}>
                  {room.status === 'available' ? 'Kamar Tersedia' : 'Sedang Terisi'}
                </span>
              </div>
            </div>
          </div>

          {/* Room Specs & Description */}
          <div className="bg-white p-8 rounded-3xl border border-ivory-dark shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-sand font-bold text-xs uppercase tracking-widest block mb-1">KOSAANN Room #{room.room_number}</span>
                <h1 className="text-3xl font-bold font-serif text-forest">{room.name}</h1>
              </div>
              <div className="text-right sm:text-left">
                <span className="text-xs text-charcoal-muted block">Tarif Bulanan</span>
                <span className="text-2xl font-bold text-forest tabular-nums">{formatIDR(room.monthly_price)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-forest mb-2">Deskripsi Kamar</h3>
              <p className="text-sm text-charcoal-muted leading-relaxed">{room.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 bg-forest-50 p-4 rounded-2xl text-center">
              <div>
                <span className="text-xs text-charcoal-muted block">Luas Kamar</span>
                <span className="text-base font-bold text-forest">{room.area} m²</span>
              </div>
              <div>
                <span className="text-xs text-charcoal-muted block">Kapasitas</span>
                <span className="text-base font-bold text-forest">{room.capacity} Orang</span>
              </div>
              <div>
                <span className="text-xs text-charcoal-muted block">Lantai</span>
                <span className="text-base font-bold text-forest">Lantai {room.room_number.startsWith('B') ? '2' : room.room_number.startsWith('C') ? '3' : '1'}</span>
              </div>
            </div>

            {/* Amenities Grid */}
            <div>
              <h3 className="text-base font-bold text-forest mb-4">Fasilitas Termasuk</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities?.map(amenity => (
                  <div key={amenity.id} className="flex items-center gap-2.5 p-3 rounded-xl bg-ivory-light border border-ivory-dark text-xs font-medium text-forest">
                    <CheckCircle className="w-4 h-4 text-sand flex-shrink-0" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Action Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-3xl border border-ivory-dark shadow-lg space-y-6">
            <div>
              <h3 className="text-xl font-bold font-serif text-forest">Ajukan Pemesanan</h3>
              <p className="text-xs text-charcoal-muted mt-1">Pemesanan ditinjau admin dalam waktu maksimal 24 jam.</p>
            </div>

            {successBookingCode ? (
              <div className="p-6 bg-forest-50 rounded-2xl border border-forest/20 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-forest mx-auto" />
                <h4 className="font-bold text-forest text-base">Pengajuan Berhasil!</h4>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Kode pemesanan Anda: <strong className="text-forest block text-sm font-mono mt-1">{successBookingCode}</strong>
                </p>
                <div className="pt-2">
                  <Link
                    to="/dashboard/bookings"
                    className="block w-full py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors"
                  >
                    Lihat di Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-forest mb-1.5">Tanggal Check-In</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark text-sm bg-ivory-light focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-forest mb-1.5">Durasi Sewa (Bulan)</label>
                  <select
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark text-sm bg-ivory-light focus:outline-none focus:ring-2 focus:ring-forest"
                  >
                    <option value={1}>1 Bulan</option>
                    <option value={3}>3 Bulan (Diskon Paket Kuartal)</option>
                    <option value={6}>6 Bulan (Prioritas Perpanjangan)</option>
                    <option value={12}>12 Bulan (1 Tahun Penuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-forest mb-1.5">Catatan Khusus (Opsional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Contoh: Estimasi tiba pukul 14:00 WIB..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark text-sm bg-ivory-light focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-xs text-charcoal-muted">
                    <span>Sewa Bulanan ({duration} bln)</span>
                    <span className="tabular-nums font-semibold text-charcoal">{formatIDR(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-charcoal-muted">
                    <span>Deposit Kunci (Refundable)</span>
                    <span className="tabular-nums font-semibold text-charcoal">Rp 0</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-forest pt-2 border-t border-dashed border-gray-200">
                    <span>Total Estimasi Biaya</span>
                    <span className="tabular-nums text-lg text-sand font-bold">{formatIDR(totalPrice)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || room.status !== 'available'}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm shadow-md transition-all ${
                    room.status === 'available'
                      ? 'bg-forest hover:bg-forest-hover text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Memproses Permohonan...' : room.status === 'available' ? 'Ajukan Sewa Kamar Ini' : 'Kamar Tidak Tersedia'}
                </button>

                {!user && (
                  <p className="text-[11px] text-center text-charcoal-muted">
                    Anda akan diarahkan untuk login terlebih dahulu sebelum booking disimpan.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
