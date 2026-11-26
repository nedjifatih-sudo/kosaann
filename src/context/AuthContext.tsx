import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole, Room, Booking, Payment, Notification } from '../types';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  login: (role: UserRole, customProfile?: Partial<Profile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'guest',
  login: () => {},
  logout: () => {},
});

// Demo data initial states
export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    property_id: 'prop-1',
    name: 'Deluxe Garden Suite 101',
    slug: 'deluxe-garden-suite-101',
    description: 'Kamar di lantai dasar dengan jendela menghadap taman tropis privat. Dilengkapi kasur King Koil Queen size, meja kerja ergonomis, dan lemari pakaian built-in.',
    room_number: 'A-101',
    monthly_price: 3500000,
    capacity: 1,
    area: 24,
    status: 'available',
    amenities: [
      { id: '1', name: 'Wi-Fi 100 Mbps', icon: 'Wifi' },
      { id: '2', name: 'Kamar Mandi Dalam', icon: 'Bath' },
      { id: '3', name: 'AC Inverter', icon: 'Wind' },
      { id: '4', name: 'Smart TV 43"', icon: 'Tv' },
    ],
    images: [
      { id: 'img-1', room_id: 'room-1', storage_path: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', alt_text: 'Deluxe Garden Suite Interior', display_order: 1, is_primary: true }
    ]
  },
  {
    id: 'room-2',
    property_id: 'prop-1',
    name: 'Executive Balcony Suite 201',
    slug: 'executive-balcony-suite-201',
    description: 'Kamar lantai dua dengan balkon pribadi menghadap pemandangan kota Kemang. Sangat tenang dengan pencahayaan alami berlimpah.',
    room_number: 'B-201',
    monthly_price: 4200000,
    capacity: 1,
    area: 28,
    status: 'available',
    amenities: [
      { id: '1', name: 'Wi-Fi 100 Mbps', icon: 'Wifi' },
      { id: '2', name: 'Water Heater', icon: 'Bath' },
      { id: '3', name: 'AC Inverter', icon: 'Wind' },
      { id: '4', name: 'Balkon Privat', icon: 'Maximize2' },
    ],
    images: [
      { id: 'img-2', room_id: 'room-2', storage_path: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80', alt_text: 'Executive Balcony Suite Interior', display_order: 1, is_primary: true }
    ]
  },
  {
    id: 'room-3',
    property_id: 'prop-1',
    name: 'Master Studio Lofts 301',
    slug: 'master-studio-lofts-301',
    description: 'Tipe loft eksklusif dengan area lounge santai dan pantry mini pribadi. Pilihan terbaik bagi Anda yang mengutamakan ruang luas dan privasi total.',
    room_number: 'C-301',
    monthly_price: 5500000,
    capacity: 2,
    area: 38,
    status: 'available',
    amenities: [
      { id: '1', name: 'Wi-Fi 100 Mbps', icon: 'Wifi' },
      { id: '2', name: 'Kitchenette & Kulkas', icon: 'Utensils' },
      { id: '3', name: 'Smart TV 50"', icon: 'Tv' },
      { id: '4', name: 'Bathtub & Shower', icon: 'Bath' },
    ],
    images: [
      { id: 'img-3', room_id: 'room-3', storage_path: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', alt_text: 'Master Studio Loft Interior', display_order: 1, is_primary: true }
    ]
  },
  {
    id: 'room-4',
    property_id: 'prop-1',
    name: 'Superior Cozy Room 102',
    slug: 'superior-cozy-room-102',
    description: 'Kamar efisien dan modern dengan pencahayaan hangat. Sangat ideal bagi profesional yang dinamis dan mengutamakan istirahat berkualitas.',
    room_number: 'A-102',
    monthly_price: 3000000,
    capacity: 1,
    area: 20,
    status: 'occupied',
    amenities: [
      { id: '1', name: 'Wi-Fi 100 Mbps', icon: 'Wifi' },
      { id: '2', name: 'Kamar Mandi Dalam', icon: 'Bath' },
      { id: '3', name: 'AC Inverter', icon: 'Wind' },
    ],
    images: [
      { id: 'img-4', room_id: 'room-4', storage_path: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', alt_text: 'Superior Cozy Room Interior', display_order: 1, is_primary: true }
    ]
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-001',
    booking_code: 'KSN-20261120-A8F1',
    user_id: 'u-tenant-1',
    room_id: 'room-1',
    check_in: '2026-12-01',
    check_out: '2027-01-01',
    duration: 1,
    duration_unit: 'monthly',
    price_per_unit: 3500000,
    total_price: 3500000,
    status: 'approved',
    created_at: '2026-11-20T10:00:00Z',
    expires_at: '2026-11-28T10:00:00Z',
    tenant_name: 'Budi Santoso',
    tenant_phone: '081288889999',
    room: INITIAL_ROOMS[0]
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-001',
    booking_id: 'b-001',
    user_id: 'u-tenant-1',
    amount: 3500000,
    payment_method: 'bank_transfer',
    proof_storage_path: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80',
    status: 'submitted',
    submitted_at: '2026-11-21T14:30:00Z',
    booking_code: 'KSN-20261120-A8F1',
    room_name: 'Deluxe Garden Suite 101'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'u-tenant-1',
    title: 'Booking Anda Disetujui',
    message: 'Booking KSN-20261120-A8F1 telah disetujui. Silakan unggah bukti transfer pembayaran.',
    type: 'action_required',
    created_at: '2026-11-20T11:00:00Z'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('kosaann_user');
    return saved ? JSON.parse(saved) : null;
  });

  const role: UserRole = user ? user.role : 'guest';

  const login = (newRole: UserRole, customProfile?: Partial<Profile>) => {
    const defaultProfile: Profile = {
      id: newRole === 'admin' ? 'u-admin-1' : 'u-tenant-1',
      full_name: newRole === 'admin' ? 'Admin KOSAANN' : (customProfile?.full_name || 'Budi Santoso'),
      phone: customProfile?.phone || '081288889999',
      avatar_url: newRole === 'admin' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: newRole,
      created_at: new Date().toISOString()
    };
    const finalProfile = { ...defaultProfile, ...customProfile };
    setUser(finalProfile);
    localStorage.setItem('kosaann_user', JSON.stringify(finalProfile));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kosaann_user');
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
