import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatIDR, formatDate } from '../../lib/utils';
import { Calendar, CreditCard, Clock, CheckCircle, AlertTriangle, Upload, FileText, Bell, User } from 'lucide-react';

export const TenantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { bookings, payments, notifications, submitPayment, cancelBooking } = useData();

  const myBookings = bookings.filter(b => b.user_id === user?.id || user?.role === 'admin' || b.user_id === 'guest');
  const activeBooking = myBookings[0];

  // Payment upload state
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'ewallet'>('bank_transfer');
  const [proofUrl, setProofUrl] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;
    submitPayment(selectedBookingId, paymentMethod, proofUrl || 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80');
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-forest rounded-3xl p-6 sm:p-10 text-ivory flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand/20 text-sand-light text-xs font-semibold">
            <User className="w-3.5 h-3.5" /> Portal Penghuni Resmi
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">Halo, {user?.full_name || 'Penghuni'}</h1>
          <p className="text-xs sm:text-sm text-ivory/80">Pantau status sewa, tagihan bulanan, dan bukti transfer pembayaran Anda disini.</p>
        </div>
        <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/20 text-center sm:text-right">
          <span className="text-[11px] text-ivory/70 uppercase tracking-wider block">Nomor Kontak</span>
          <span className="text-sm font-semibold text-white">{user?.phone || '08123456789'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: My Bookings & Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-dark shadow-sm space-y-6">
            <h2 className="text-lg font-bold font-serif text-forest flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sand" /> Riwayat & Status Pemesanan
            </h2>

            {myBookings.length === 0 ? (
              <div className="py-12 text-center text-charcoal-muted text-xs">
                Belum ada pengajuan sewa aktif. Jelajahi katalog untuk memesan kamar.
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map(b => (
                  <div key={b.id} className="p-5 rounded-2xl border border-ivory-dark bg-ivory-light/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-forest bg-forest-50 px-2.5 py-1 rounded-md border border-forest/10">
                        {b.booking_code}
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        b.status === 'approved' ? 'bg-amber-100 text-amber-800' :
                        b.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {b.status === 'confirmed' ? 'Dikonfirmasi (Lunas)' :
                         b.status === 'approved' ? 'Disetujui (Menunggu Slip)' :
                         b.status === 'pending' ? 'Menunggu Peninjauan Admin' : b.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-start pt-1">
                      <div>
                        <h4 className="font-bold text-forest text-sm">{b.room?.name || 'Kamar KOSAANN'}</h4>
                        <p className="text-xs text-charcoal-muted mt-0.5">
                          Check-in: <strong>{formatDate(b.check_in)}</strong> ({b.duration} Bulan)
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-charcoal-muted block">Total Biaya</span>
                        <span className="text-sm font-bold text-forest tabular-nums">{formatIDR(b.total_price)}</span>
                      </div>
                    </div>

                    {b.status === 'approved' && (
                      <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Segera unggah bukti transfer
                        </span>
                        <button
                          onClick={() => setSelectedBookingId(b.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-sand hover:bg-sand-hover text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          Unggah Slip Sekarang
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Payment Instruction & Dropzone */}
        <div className="lg:col-span-5 space-y-6">
          {/* Bank Transfer Instructions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-dark shadow-sm space-y-4">
            <h3 className="text-base font-bold font-serif text-forest flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-sand" /> Rekening Resmi Pembayaran
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Silakan lakukan transfer manual ke salah satu rekening pengelola berikut sebelum batas waktu berakhir:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-forest-50 border border-forest/10 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-forest">Bank Central Asia (BCA)</span>
                  <span className="bg-forest text-white text-[10px] px-2 py-0.5 rounded font-bold">KCU Kemang</span>
                </div>
                <div className="text-lg font-mono font-bold text-forest tracking-wider">8830 1928 31</div>
                <div className="text-[11px] text-charcoal-muted">a.n. PT KOSAANN INDONESIA</div>
              </div>

              <div className="p-4 rounded-2xl bg-forest-50 border border-forest/10 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-forest">Bank Mandiri</span>
                  <span className="bg-forest text-white text-[10px] px-2 py-0.5 rounded font-bold">Kemang Village</span>
                </div>
                <div className="text-lg font-mono font-bold text-forest tracking-wider">1270 0098 7654 3</div>
                <div className="text-[11px] text-charcoal-muted">a.n. PT KOSAANN INDONESIA</div>
              </div>
            </div>
          </div>

          {/* Payment Upload Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ivory-dark shadow-sm space-y-4">
            <h3 className="text-base font-bold font-serif text-forest flex items-center gap-2">
              <Upload className="w-5 h-5 text-sand" /> Konfirmasi Pembayaran
            </h3>

            {uploadSuccess && (
              <div className="p-3 bg-green-50 text-green-800 text-xs rounded-xl flex items-center gap-2 border border-green-200">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Bukti transfer berhasil dikirim. Admin akan segera memverifikasi.</span>
              </div>
            )}

            <form onSubmit={handleUploadProof} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-forest mb-1.5">Pilih Pemesanan</label>
                <select
                  value={selectedBookingId}
                  onChange={e => setSelectedBookingId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark text-xs bg-ivory-light focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="">-- Pilih Kode Pemesanan --</option>
                  {myBookings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.booking_code} — {b.room?.name} ({formatIDR(b.total_price)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest mb-1.5">Metode Transfer</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark text-xs bg-ivory-light focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="bank_transfer">Transfer Bank (BCA / Mandiri)</option>
                  <option value="ewallet">QRIS / E-Wallet</option>
                  <option value="cash">Tunai di Lokasi Properti</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest mb-1.5">Unggah / Tautan Bukti Transfer</label>
                <input
                  type="text"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                  placeholder="https://... atau gunakan default simulasi struk"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark text-xs bg-ivory-light focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <span className="text-[10px] text-charcoal-muted mt-1 block">
                  Format gambar JPG, PNG, atau PDF yang menampilkan nominal dan tanggal jelas.
                </span>
              </div>

              <button
                type="submit"
                disabled={!selectedBookingId}
                className={`w-full py-3 rounded-xl font-semibold text-xs shadow-md transition-all ${
                  selectedBookingId
                    ? 'bg-forest hover:bg-forest-hover text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Kirim Bukti Pembayaran
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
