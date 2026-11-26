import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/public/HomePage';
import { RoomsPage } from './pages/public/RoomsPage';
import { RoomDetailPage } from './pages/public/RoomDetailPage';
import { LoginPage, RegisterPage } from './pages/auth/AuthPages';
import { TenantDashboardPage } from './pages/tenant/TenantDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Simple Facilities & About Pages
const FacilitiesPage: React.FC = () => (
  <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    <div className="text-center max-w-2xl mx-auto">
      <span className="text-sand font-bold text-xs uppercase tracking-widest block mb-2">Fasilitas Properti</span>
      <h1 className="text-3xl sm:text-4xl font-bold font-serif text-forest">Kenyamanan Tinggal Berstandar Tinggi</h1>
      <p className="text-sm text-charcoal-muted mt-2">Setiap aspek dirancang untuk menghadirkan ketenangan dan kepraktisan hidup sehari-hari.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
      {[
        { title: 'Wi-Fi Dedicated 100 Mbps', desc: 'Jaringan serat optik stabil dengan redundancy untuk kenyamanan work from home tanpa gangguan.' },
        { title: 'Saniter Toto & Water Heater', desc: 'Kamar mandi dalam berkualitas tinggi dengan pemanas air otomatis bertekanan stabil.' },
        { title: 'Dapur Bersama Modern', desc: 'Dilengkapi kompor induksi, microwave, kulkas besar, dan dispenser air steril higienis.' },
        { title: 'Akses Keamanan Kartu RFID & CCTV', desc: 'Sistem penguncian pintar 24 jam dengan rekaman kamera di seluruh area umum.' },
        { title: 'Area Parkir Mobil & Motor Luas', desc: 'Parkir beratap di dalam gerbang properti yang diawasi petugas keamanan malam.' },
        { title: 'Layanan Cuci Baju Mingguan', desc: 'Fasilitas laundry gratis hingga 15 kg per bulan untuk penghuni aktif.' },
      ].map((f, i) => (
        <div key={i} className="p-6 bg-white rounded-2xl border border-ivory-dark shadow-sm">
          <h3 className="font-bold text-forest text-base mb-2">{f.title}</h3>
          <p className="text-xs text-charcoal-muted leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const AboutPage: React.FC = () => (
  <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    <div className="max-w-3xl mx-auto text-center space-y-4">
      <span className="text-sand font-bold text-xs uppercase tracking-widest block">Filosofi KOSAANN</span>
      <h1 className="text-3xl sm:text-4xl font-bold font-serif text-forest">Find your space. Feel at home.</h1>
      <p className="text-sm text-charcoal-muted leading-relaxed">
        KOSAANN lahir dari aspirasi untuk menghadirkan hunian sewa eksklusif di Jakarta yang menghilangkan segala friksi mencari tempat tinggal. Dari proses pemesanan transparan tanpa calo, sistem konfirmasi manual yang akuntabel, hingga suasana hunian yang tenang dan asri di jantung Kemang.
      </p>
    </div>
    <div className="rounded-3xl overflow-hidden border border-ivory-dark h-80 sm:h-96">
      <img
        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80"
        alt="KOSAANN Residence Building"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
);

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role } = useAuth();
  if (role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="rooms/:slug" element={<RoomDetailPage />} />
              <Route path="facilities" element={<FacilitiesPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="dashboard" element={<TenantDashboardPage />} />
              <Route path="dashboard/bookings" element={<TenantDashboardPage />} />
              <Route
                path="admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboardPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
