import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAdmin = email.toLowerCase().includes('admin');
    login(isAdmin ? 'admin' : 'tenant', { 
      full_name: email.split('@')[0] || (isAdmin ? 'Admin KOSAANN' : 'Penyewa KOSAANN') 
    });
    navigate(isAdmin ? '/admin' : '/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-ivory-dark shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-forest text-sand font-bold text-2xl rounded-2xl flex items-center justify-center mx-auto shadow-md">
            K
          </div>
          <h2 className="text-2xl font-bold font-serif text-forest">Selamat Datang Kembali</h2>
          <p className="text-xs text-charcoal-muted">Masuk ke akun Anda untuk mengelola sewa & pembayaran</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-forest mb-1.5">Alamat Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark text-sm bg-ivory-light focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest mb-1.5">Kata Sandi</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark text-sm bg-ivory-light focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-forest hover:bg-forest-hover text-white font-semibold text-sm shadow-md transition-all"
          >
            Masuk ke Akun
          </button>
        </form>

        <p className="text-center text-xs text-charcoal-muted">
          Belum memiliki akun?{' '}
          <Link to="/register" className="text-sand font-semibold hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login('tenant', { full_name: fullName, phone });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-ivory-dark shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-sand text-forest font-bold text-2xl rounded-2xl flex items-center justify-center mx-auto shadow-md">
            K
          </div>
          <h2 className="text-2xl font-bold font-serif text-forest">Registrasi Penghuni Baru</h2>
          <p className="text-xs text-charcoal-muted">Buat akun untuk mengajukan sewa kamar di KOSAANN</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-forest mb-1.5">Nama Lengkap Sesuai KTP</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark text-sm bg-ivory-light focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest mb-1.5">Nomor WhatsApp Aktif</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0812XXXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark text-sm bg-ivory-light focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest mb-1.5">Alamat Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark text-sm bg-ivory-light focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-forest hover:bg-forest-hover text-white font-semibold text-sm shadow-md transition-all"
          >
            Daftar & Lanjutkan
          </button>
        </form>

        <p className="text-center text-xs text-charcoal-muted">
          Sudah terdaftar?{' '}
          <Link to="/login" className="text-sand font-semibold hover:underline">
            Masuk disini
          </Link>
        </p>
      </div>
    </div>
  );
};
