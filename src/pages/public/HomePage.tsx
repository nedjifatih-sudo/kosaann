import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { formatIDR } from '../../lib/utils';
import { Room } from '../../types';
import { ShieldCheck, Wifi, Bath, Wind, ArrowRight, MapPin, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { rooms } = useData();
  const availableRooms = rooms.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-forest text-ivory overflow-hidden">
        {/* Background Image with dark luxury gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80"
            alt="KOSAANN Kemang Exterior"
            className="w-full h-full object-cover opacity-25 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand/20 border border-sand/30 text-sand-light text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-sand" /> Premium Boarding House in Kemang
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold font-serif tracking-tight text-white leading-[1.15]">
              Find your space.<br />
              <span className="text-sand font-normal italic">Feel at home.</span>
            </h1>
            <p className="text-lg text-ivory/85 max-w-2xl font-light leading-relaxed">
              KOSAANN menghadirkan ruang tinggal eksklusif di Jakarta Selatan yang memadukan kenyamanan hotel bintang lima dengan ketenangan rumah pribadi. Kamar berfasilitas penuh, koneksi serat optik dedicated, dan keamanan 24 jam.
            </p>
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Link
                to="/rooms"
                className="px-6 py-3.5 rounded-xl bg-sand hover:bg-sand-hover text-white font-semibold flex items-center gap-2 shadow-lg shadow-sand/20 transition-all transform hover:-translate-y-0.5"
              >
                Jelajahi Pilihan Kamar <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold backdrop-blur-sm border border-white/20 transition-all"
              >
                Tur Properti & Lokasi
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sand rounded-xl text-forest font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Sewa Bebas Khawatir</h4>
                <p className="text-xs text-ivory/80">Ketersediaan transparan & verifikasi resmi</p>
              </div>
            </div>
            <hr className="border-white/15" />
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/5 p-3 rounded-xl">
                <span className="text-2xl font-bold text-sand">100%</span>
                <span className="text-[11px] block text-ivory/70">Kamar Mandi Dalam</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <span className="text-2xl font-bold text-sand">100 Mbps</span>
                <span className="text-[11px] block text-ivory/70">Dedicated Wi-Fi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-sand font-bold text-xs uppercase tracking-widest block mb-2">Koleksi Pilihan</span>
            <h2 className="text-3xl font-bold font-serif text-forest">Tipe Kamar Siap Huni</h2>
          </div>
          <Link to="/rooms" className="mt-4 sm:mt-0 text-sm font-semibold text-forest hover:text-sand flex items-center gap-1.5 transition-colors">
            Lihat Seluruh Kamar ({rooms.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {availableRooms.map((room: Room) => (
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
                  {room.area} m²
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-semibold text-sand uppercase tracking-wider mb-1">Nomor {room.room_number}</div>
                  <h3 className="text-xl font-bold text-forest group-hover:text-sand transition-colors font-serif">{room.name}</h3>
                  <p className="text-sm text-charcoal-muted line-clamp-2 mt-2 leading-relaxed">{room.description}</p>
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
                    Detail Kamar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities Highlight */}
      <section className="bg-forest-50 py-20 border-y border-ivory-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-sand font-bold text-xs uppercase tracking-widest">Kenyamanan Maksimal</span>
            <h2 className="text-3xl font-bold font-serif text-forest">Fasilitas Standar Eksklusif</h2>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Setiap penghuni KOSAANN menikmati akses tanpa batas ke berbagai fasilitas premium untuk mendukung produktivitas dan istirahat berkualitas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wifi, title: 'Dedicated Wi-Fi 100 Mbps', desc: 'Serat optik berkecepatan tinggi tanpa throttling untuk zoom meeting lancar.' },
              { icon: Bath, title: 'Kamar Mandi Privat', desc: 'Saniter Toto, shower kencang dengan water heater otomatis di tiap kamar.' },
              { icon: Wind, title: 'AC Inverter Sejuk', desc: 'Pendingin ruangan inverter senyap dan hemat daya untuk tidur optimal.' },
              { icon: ShieldCheck, title: 'Keamanan Smart Lock 24/7', desc: 'Akses kartu RFID personal dan pengawasan kamera CCTV di seluruh koridor.' },
            ].map((f, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-sm hover:border-sand transition-colors">
                <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-forest mb-2">{f.title}</h3>
                <p className="text-xs text-charcoal-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest rounded-3xl overflow-hidden text-ivory p-8 sm:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-sand font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Lokasi Strategis di Kemang
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">
              Dekat ke SCBD, Cilandak, dan Pusat Gaya Hidup
            </h2>
            <p className="text-ivory/80 text-sm leading-relaxed">
              Beralamat di Jl. Bangka Raya No. 42, KOSAANN hanya berjarak 10 menit dari kawasan bisnis Kuningan & TB Simatupang, serta selangkah dari kafe, resto, dan supermarket favorit Kemang.
            </p>
            <div className="pt-2 flex gap-4">
              <Link to="/rooms" className="px-5 py-3 rounded-xl bg-sand text-white font-semibold text-sm hover:bg-sand-hover transition-colors">
                Pilih Kamar Sekarang
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 bg-white/10 rounded-2xl p-6 border border-white/10 space-y-3">
            <h4 className="text-sand font-semibold text-sm uppercase tracking-wide">Akses Terdekat</h4>
            <ul className="text-xs space-y-2.5 text-ivory/90">
              <li className="flex justify-between border-b border-white/10 pb-1.5"><span>Kemang Village Mall</span> <span className="font-semibold text-white">5 Menit</span></li>
              <li className="flex justify-between border-b border-white/10 pb-1.5"><span>Stasiun MRT Blok M</span> <span className="font-semibold text-white">8 Menit</span></li>
              <li className="flex justify-between border-b border-white/10 pb-1.5"><span>Kawasan Bisnis SCBD</span> <span className="font-semibold text-white">12 Menit</span></li>
              <li className="flex justify-between"><span>RS Brawijaya Antasari</span> <span className="font-semibold text-white">7 Menit</span></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
