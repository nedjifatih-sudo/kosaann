import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatIDR, formatDate } from '../../lib/utils';
import { 
  Building2, Users, Bed, CreditCard, CheckCircle2, XCircle, 
  PlusCircle, RefreshCw, AlertCircle, Eye, ArrowUpRight 
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { rooms, bookings, payments, adminReviewBooking, adminVerifyPayment, addRoom, updateRoomStatus } = useData();

  // Metrics calculation
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const submittedPayments = payments.filter(p => p.status === 'submitted');
  const verifiedRevenue = payments
    .filter(p => p.status === 'verified')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'payments' | 'rooms'>('overview');

  // Modal / Add Room form
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPrice, setNewRoomPrice] = useState(3500000);
  const [newRoomArea, setNewRoomArea] = useState(25);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    addRoom({
      room_number: newRoomNumber,
      name: newRoomName,
      monthly_price: newRoomPrice,
      area: newRoomArea,
      status: 'available'
    });
    setIsAddRoomOpen(false);
    setNewRoomNumber('');
    setNewRoomName('');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-sand font-bold text-xs uppercase tracking-widest block mb-1">
            Manajemen Operasional
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-forest">
            KOSAANN Admin Console
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-ivory-dark shadow-sm gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Ringkasan' },
            { id: 'bookings', label: `Pemesanan (${pendingBookings.length})` },
            { id: 'payments', label: `Verifikasi Slip (${submittedPayments.length})` },
            { id: 'rooms', label: `Kelola Kamar (${rooms.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-forest text-white shadow-sm'
                  : 'text-charcoal-muted hover:text-forest hover:bg-ivory-light'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-ivory-dark shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-charcoal-muted font-medium">Total Kamar</span>
            <Bed className="w-4 h-4 text-forest" />
          </div>
          <div className="text-2xl font-bold text-forest">{totalRooms}</div>
          <span className="text-[11px] text-green-700 font-medium">{availableRooms} Kamar Siap Huni</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-dark shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-charcoal-muted font-medium">Pemesanan Pending</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{pendingBookings.length}</div>
          <span className="text-[11px] text-charcoal-muted">Menunggu persetujuan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-dark shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-charcoal-muted font-medium">Verifikasi Slip</span>
            <CreditCard className="w-4 h-4 text-sand" />
          </div>
          <div className="text-2xl font-bold text-sand">{submittedPayments.length}</div>
          <span className="text-[11px] text-charcoal-muted">Perlu pencocokan mutasi</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ivory-dark shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-charcoal-muted font-medium">Pendapatan Terverifikasi</span>
            <CheckCircle2 className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl font-bold text-forest tabular-nums">{formatIDR(verifiedRevenue)}</div>
          <span className="text-[11px] text-green-700 font-medium">Total dana sewa masuk</span>
        </div>
      </div>

      {/* TAB CONTENT: OVERVIEW / BOOKINGS */}
      {(activeTab === 'overview' || activeTab === 'bookings') && (
        <div className="bg-white rounded-3xl border border-ivory-dark shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif text-forest">
              Persetujuan Pemesanan Masuk ({bookings.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-50 text-forest uppercase tracking-wider font-semibold border-b border-ivory-dark">
                <tr>
                  <th className="py-3 px-4">Kode Booking</th>
                  <th className="py-3 px-4">Penghuni</th>
                  <th className="py-3 px-4">Kamar</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Total Biaya</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-ivory-light/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-forest">{b.booking_code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-charcoal">{b.tenant_name}</div>
                      <div className="text-[11px] text-charcoal-muted">{b.tenant_phone}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{b.room?.name || 'Kamar'}</td>
                    <td className="py-3 px-4">{formatDate(b.check_in)} ({b.duration} Bln)</td>
                    <td className="py-3 px-4 font-bold tabular-nums">{formatIDR(b.total_price)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        b.status === 'approved' ? 'bg-amber-100 text-amber-800' :
                        b.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.status === 'pending' && (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => adminReviewBooking(b.id, 'approve')}
                            className="px-2.5 py-1.5 bg-forest text-white rounded-lg hover:bg-forest-hover transition-colors font-semibold"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => adminReviewBooking(b.id, 'reject', 'Kamar penuh')}
                            className="px-2.5 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PAYMENTS */}
      {(activeTab === 'overview' || activeTab === 'payments') && (
        <div className="bg-white rounded-3xl border border-ivory-dark shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif text-forest">
              Verifikasi Mutasi & Bukti Transfer Pembayaran ({payments.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {payments.map(p => (
              <div key={p.id} className="p-5 rounded-2xl border border-ivory-dark bg-ivory-light/40 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-forest">{p.booking_code}</span>
                    <h4 className="font-bold text-sm text-charcoal mt-0.5">{p.room_name}</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    p.status === 'verified' ? 'bg-green-100 text-green-800' :
                    p.status === 'submitted' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-ivory-dark text-xs">
                  <div>
                    <span className="text-charcoal-muted block text-[10px]">Nominal Transfer</span>
                    <span className="font-bold text-forest tabular-nums text-sm">{formatIDR(p.amount)}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-muted block text-[10px]">Metode</span>
                    <span className="font-semibold uppercase">{p.payment_method.replace('_', ' ')}</span>
                  </div>
                </div>

                {p.proof_storage_path && (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 h-44 bg-black/5">
                    <img
                      src={p.proof_storage_path}
                      alt="Bukti Transfer"
                      className="w-full h-full object-cover"
                    />
                    <a
                      href={p.proof_storage_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1"
                    >
                      Buka Resolusi Penuh <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {p.status === 'submitted' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => adminVerifyPayment(p.id, 'verify')}
                      className="flex-1 py-2 rounded-xl bg-forest hover:bg-forest-hover text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      Verifikasi & Terbitkan Sewa
                    </button>
                    <button
                      onClick={() => adminVerifyPayment(p.id, 'reject', 'Nominal tidak sesuai rekening')}
                      className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ROOMS */}
      {activeTab === 'rooms' && (
        <div className="bg-white rounded-3xl border border-ivory-dark shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif text-forest">
              Daftar Inventaris Kamar ({rooms.length})
            </h2>
            <button
              onClick={() => setIsAddRoomOpen(true)}
              className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Tambah Kamar Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <div key={room.id} className="p-5 rounded-2xl border border-ivory-dark bg-ivory-light/40 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-sand uppercase">Nomor {room.room_number}</span>
                    <h3 className="font-bold text-forest text-base">{room.name}</h3>
                  </div>
                  <select
                    value={room.status}
                    onChange={e => updateRoomStatus(room.id, e.target.value)}
                    className="text-[10px] font-bold uppercase rounded-lg border border-gray-300 px-2 py-1 bg-white focus:outline-none"
                  >
                    <option value="available">Tersedia</option>
                    <option value="occupied">Terisi</option>
                    <option value="maintenance">Perawatan</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>

                <div className="flex justify-between text-xs text-charcoal-muted pt-2 border-t border-gray-200">
                  <span>Luas: {room.area} m²</span>
                  <span className="font-bold text-forest tabular-nums">{formatIDR(room.monthly_price)} / bln</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-ivory-dark shadow-2xl space-y-4">
            <h3 className="text-xl font-bold font-serif text-forest">Tambah Unit Kamar Baru</h3>
            <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-forest mb-1">Nomor Kamar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: A-105"
                  value={newRoomNumber}
                  onChange={e => setNewRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest mb-1">Nama Tipe Kamar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Deluxe Terrace Suite"
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-forest mb-1">Tarif Bulanan (IDR)</label>
                  <input
                    type="number"
                    required
                    value={newRoomPrice}
                    onChange={e => setNewRoomPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest mb-1">Luas Kamar (m²)</label>
                  <input
                    type="number"
                    required
                    value={newRoomArea}
                    onChange={e => setNewRoomArea(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-forest text-white font-semibold"
                >
                  Simpan Unit
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-charcoal font-semibold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
