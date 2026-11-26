import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { formatIDR } from '../../lib/utils';
import { Search, SlidersHorizontal, Bed, Check, Users } from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const { rooms } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(6000000);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : room.status === 'available';
    const matchesPrice = room.monthly_price <= maxPrice;
    return matchesSearch && matchesStatus && matchesPrice;
  });

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-sand font-bold text-xs uppercase tracking-widest block mb-2">Katalog Kamar</span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-forest">Kamar Kost Eksklusif KOSAANN</h1>
        <p className="text-sm text-charcoal-muted mt-2">
          Seluruh kamar dilengkapi kamar mandi dalam, AC, kasur King Koil, dan furnitur lengkap siap huni.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-ivory-dark shadow-sm mb-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari tipe kamar atau nomor kamar..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-ivory-dark focus:outline-none focus:ring-2 focus:ring-forest text-sm bg-ivory-light"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <span className="text-xs text-charcoal-muted whitespace-nowrap">Maksimal:</span>
          <input
            type="range"
            min="2500000"
            max="6000000"
            step="500000"
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            className="w-full accent-forest cursor-pointer"
          />
          <span className="text-xs font-bold text-forest whitespace-nowrap tabular-nums">{formatIDR(maxPrice)}</span>
        </div>

        <div className="md:col-span-3 flex justify-end gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all' ? 'bg-forest text-white' : 'bg-gray-100 text-charcoal hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'available' ? 'bg-forest text-white' : 'bg-gray-100 text-charcoal hover:bg-gray-200'
            }`}
          >
            Hanya Tersedia
          </button>
        </div>
      </div>

      {/* Room Listing Grid */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-ivory-dark">
          <Bed className="w-12 h-12 text-sand mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-forest">Tidak ada kamar yang sesuai</h3>
          <p className="text-xs text-charcoal-muted mt-1">Coba sesuaikan kata kunci pencarian atau batas tarif Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map(room => (
            <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-ivory-dark flex flex-col group">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.images?.[0]?.storage_path || 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${
                    room.status === 'available' ? 'bg-forest text-white' : 'bg-gray-800 text-white'
                  }`}>
                    {room.status === 'available' ? 'Tersedia' : 'Terisi'}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-medium">
                  {room.area} m² &bull; {room.capacity} Orang
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-semibold text-sand uppercase tracking-wider mb-1">Nomor {room.room_number}</div>
                  <h3 className="text-xl font-bold text-forest group-hover:text-sand transition-colors font-serif">{room.name}</h3>
                  <p className="text-sm text-charcoal-muted line-clamp-2 mt-2 leading-relaxed">{room.description}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {room.amenities?.slice(0, 3).map(a => (
                      <span key={a.id} className="text-[11px] bg-forest-50 text-forest px-2.5 py-1 rounded-md font-medium">
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-charcoal-muted block">Tarif Bulanan</span>
                    <span className="text-lg font-bold text-forest tabular-nums">{formatIDR(room.monthly_price)}</span>
                  </div>
                  <Link
                    to={`/rooms/${room.slug}`}
                    className="px-4 py-2 rounded-lg bg-forest text-white text-sm font-semibold hover:bg-forest-hover transition-colors"
                  >
                    Detail & Pesan
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
