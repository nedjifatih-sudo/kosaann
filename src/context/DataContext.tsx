import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, Booking, Payment, Notification } from '../types';
import { INITIAL_ROOMS, INITIAL_BOOKINGS, INITIAL_PAYMENTS, INITIAL_NOTIFICATIONS, useAuth } from './AuthContext';

interface DataContextType {
  rooms: Room[];
  bookings: Booking[];
  payments: Payment[];
  notifications: Notification[];
  createBooking: (roomId: string, checkIn: string, duration: number, notes?: string) => Promise<{ success: boolean; bookingCode: string }>;
  cancelBooking: (bookingId: string) => void;
  adminReviewBooking: (bookingId: string, action: 'approve' | 'reject', reason?: string) => void;
  submitPayment: (bookingId: string, method: any, proofUrl: string) => void;
  adminVerifyPayment: (paymentId: string, decision: 'verify' | 'reject', reason?: string) => void;
  addRoom: (room: Partial<Room>) => void;
  updateRoomStatus: (roomId: string, status: any) => void;
}

const DataContext = createContext<DataContextType>({} as any);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('kosaann_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('kosaann_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('kosaann_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('kosaann_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('kosaann_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('kosaann_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('kosaann_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('kosaann_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const createBooking = async (roomId: string, checkIn: string, duration: number, notes?: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Kamar tidak ditemukan');

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setMonth(checkOutDate.getMonth() + duration);

    const bookingCode = 'KSN-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const totalPrice = room.monthly_price * duration;

    const newBooking: Booking = {
      id: 'b-' + Date.now(),
      booking_code: bookingCode,
      user_id: user?.id || 'guest',
      room_id: roomId,
      check_in: checkIn,
      check_out: checkOutDate.toISOString().slice(0, 10),
      duration,
      duration_unit: 'monthly',
      price_per_unit: room.monthly_price,
      total_price: totalPrice,
      status: 'pending',
      notes,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      tenant_name: user?.full_name || 'Tamu',
      tenant_phone: user?.phone || '08123456789',
      room
    };

    setBookings(prev => [newBooking, ...prev]);

    // Add notification
    const newNotif: Notification = {
      id: 'n-' + Date.now(),
      user_id: user?.id || 'guest',
      title: 'Pemesanan Dibuat',
      message: `Pemesanan ${bookingCode} untuk ${room.name} telah diterima dan menunggu verifikasi admin.`,
      type: 'info',
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    return { success: true, bookingCode };
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
  };

  const adminReviewBooking = (bookingId: string, action: 'approve' | 'reject', reason?: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      if (action === 'approve') {
        // Automatically create unpaid payment entry
        const newPayment: Payment = {
          id: 'pay-' + Date.now(),
          booking_id: b.id,
          user_id: b.user_id,
          amount: b.total_price,
          payment_method: 'bank_transfer',
          status: 'unpaid',
          booking_code: b.booking_code,
          room_name: b.room?.name || 'Kamar'
        };
        setPayments(p => [newPayment, ...p]);

        // Push tenant notification
        setNotifications(n => [{
          id: 'n-' + Date.now(),
          user_id: b.user_id,
          title: 'Booking Disetujui!',
          message: `Booking ${b.booking_code} disetujui. Silakan unggah bukti transfer pembayaran.`,
          type: 'action_required',
          created_at: new Date().toISOString()
        }, ...n]);

        return { ...b, status: 'approved', approved_at: new Date().toISOString(), expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString() };
      } else {
        return { ...b, status: 'rejected', notes: (b.notes || '') + ` [Ditolak: ${reason || 'Tidak memenuhi kriteria'}]` };
      }
    }));
  };

  const submitPayment = (bookingId: string, method: any, proofUrl: string) => {
    setPayments(prev => {
      const existing = prev.find(p => p.booking_id === bookingId);
      const b = bookings.find(item => item.id === bookingId);
      if (existing) {
        return prev.map(p => p.booking_id === bookingId ? {
          ...p,
          payment_method: method,
          proof_storage_path: proofUrl,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        } : p);
      } else {
        return [{
          id: 'pay-' + Date.now(),
          booking_id: bookingId,
          user_id: user?.id || 'u-tenant-1',
          amount: b ? b.total_price : 3500000,
          payment_method: method,
          proof_storage_path: proofUrl,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          booking_code: b?.booking_code,
          room_name: b?.room?.name
        }, ...prev];
      }
    });

    setNotifications(n => [{
      id: 'n-' + Date.now(),
      user_id: user?.id || 'guest',
      title: 'Bukti Pembayaran Terkirim',
      message: 'Bukti transfer Anda telah dikirim dan sedang dalam verifikasi oleh manajemen KOSAANN.',
      type: 'info',
      created_at: new Date().toISOString()
    }, ...n]);
  };

  const adminVerifyPayment = (paymentId: string, decision: 'verify' | 'reject', reason?: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    setPayments(prev => prev.map(p => {
      if (p.id !== paymentId) return p;
      return decision === 'verify'
        ? { ...p, status: 'verified', verified_at: new Date().toISOString() }
        : { ...p, status: 'rejected', rejection_reason: reason || 'Bukti transfer tidak valid' };
    }));

    if (decision === 'verify') {
      setBookings(prev => prev.map(b => b.id === payment.booking_id ? {
        ...b,
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      } : b));

      setNotifications(n => [{
        id: 'n-' + Date.now(),
        user_id: payment.user_id,
        title: 'Pembayaran Terverifikasi & Booking Resmi Aktif!',
        message: `Pembayaran sebesar Rp ${payment.amount.toLocaleString('id-ID')} telah disetujui. Selamat datang di KOSAANN!`,
        type: 'success',
        created_at: new Date().toISOString()
      }, ...n]);
    }
  };

  const addRoom = (roomData: Partial<Room>) => {
    const newRoom: Room = {
      id: 'room-' + Date.now(),
      property_id: 'prop-1',
      name: roomData.name || 'Kamar Baru',
      slug: (roomData.name || 'kamar-baru').toLowerCase().replace(/\s+/g, '-'),
      description: roomData.description || 'Deskripsi fasilitas kamar lengkap.',
      room_number: roomData.room_number || 'A-999',
      monthly_price: Number(roomData.monthly_price) || 3000000,
      capacity: Number(roomData.capacity) || 1,
      area: Number(roomData.area) || 20,
      status: (roomData.status as any) || 'available',
      amenities: [
        { id: '1', name: 'Wi-Fi 100 Mbps', icon: 'Wifi' },
        { id: '2', name: 'AC Inverter', icon: 'Wind' },
        { id: '3', name: 'Kamar Mandi Dalam', icon: 'Bath' }
      ],
      images: [
        {
          id: 'img-' + Date.now(),
          room_id: 'room-' + Date.now(),
          storage_path: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
          alt_text: roomData.name || 'Kamar KOSAANN',
          display_order: 1,
          is_primary: true
        }
      ]
    };
    setRooms(prev => [newRoom, ...prev]);
  };

  const updateRoomStatus = (roomId: string, status: any) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status } : r));
  };

  return (
    <DataContext.Provider value={{
      rooms,
      bookings,
      payments,
      notifications,
      createBooking,
      cancelBooking,
      adminReviewBooking,
      submitPayment,
      adminVerifyPayment,
      addRoom,
      updateRoomStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
