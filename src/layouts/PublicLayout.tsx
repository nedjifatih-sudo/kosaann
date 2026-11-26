import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Home, Bed, Sparkles, Phone, ShieldCheck, User, LogOut, LayoutDashboard } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      {/* Brand Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ivory-dark transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-ivory font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              K
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-forest block font-serif">KOSAANN</span>
              <span className="text-[10px] uppercase tracking-widest text-sand font-semibold block -mt-1">Kemang Prime Residence</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal">
            <Link to="/" className="hover:text-forest transition-colors">Beranda</Link>
            <Link to="/rooms" className="hover:text-forest transition-colors">Katalog Kamar</Link>
            <Link to="/facilities" className="hover:text-forest transition-colors">Fasilitas Properti</Link>
            <Link to="/about" className="hover:text-forest transition-colors">Tentang Kami</Link>
          </nav>

          {/* User / CTA Action */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest text-white text-sm font-medium hover:bg-forest-hover shadow-sm transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {role === 'admin' ? 'Admin Console' : 'Dashboard Penyewa'}
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 text-charcoal-muted hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-forest hover:text-forest-hover px-3 py-2"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-sand text-white text-sm font-semibold hover:bg-sand-hover shadow-sm transition-all"
                >
                  Daftar Akun
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-ivory-dark px-4 pt-2 pb-6 space-y-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-charcoal font-medium">Beranda</Link>
            <Link to="/rooms" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-charcoal font-medium">Katalog Kamar</Link>
            <Link to="/facilities" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-charcoal font-medium">Fasilitas Properti</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-charcoal font-medium">Tentang Kami</Link>
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to={role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-forest text-white font-medium"
                  >
                    Buka Dashboard ({role})
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full text-center py-2 text-red-600 font-medium"
                  >
                    Keluar Akun
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 text-forest font-medium border border-forest rounded-lg">Masuk</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 bg-sand text-white rounded-lg font-medium">Daftar Akun</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-forest text-ivory py-16 border-t border-forest-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sand text-forest font-bold flex items-center justify-center text-xl">K</div>
              <span className="text-2xl font-bold font-serif tracking-tight text-white">KOSAANN</span>
            </div>
            <p className="text-sm text-ivory/80 leading-relaxed">
              Find your space. Feel at home. Hunian sewa kost eksklusif dengan kenyamanan tenang dan manajemen profesional di Kemang, Jakarta Selatan.
            </p>
          </div>

          <div>
            <h4 className="text-sand font-semibold text-sm uppercase tracking-wider mb-4">Eksplorasi</h4>
            <ul className="space-y-2.5 text-sm text-ivory/80">
              <li><Link to="/rooms" className="hover:text-white transition-colors">Tipe Kamar & Tarif</Link></li>
              <li><Link to="/facilities" className="hover:text-white transition-colors">Fasilitas Lengkap</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Lokasi & Lingkungan</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sand font-semibold text-sm uppercase tracking-wider mb-4">Bantuan & Regulasi</h4>
            <ul className="space-y-2.5 text-sm text-ivory/80">
              <li><span className="hover:text-white">Tata Tertib Hunian</span></li>
              <li><span className="hover:text-white">Prosedur Booking & Pembayaran</span></li>
              <li><span className="hover:text-white">Kebijakan Privasi</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sand font-semibold text-sm uppercase tracking-wider mb-4">Lokasi & Kontak</h4>
            <div className="text-sm text-ivory/80 space-y-2">
              <p>Jl. Bangka Raya No. 42, Kemang, Mampang Prapatan, Jakarta Selatan 12720</p>
              <p className="pt-2 font-medium text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-sand" /> +62 812-9988-7766
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-forest-light/40 text-center text-xs text-ivory/60">
          &copy; {new Date().getFullYear()} KOSAANN Residence. All rights reserved. Built with precision.
        </div>
      </footer>
    </div>
  );
};
