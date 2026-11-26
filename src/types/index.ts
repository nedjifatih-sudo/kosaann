export type UserRole = 'guest' | 'tenant' | 'admin';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'inactive';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'confirmed' | 'cancelled' | 'expired' | 'completed';
export type PaymentStatus = 'unpaid' | 'submitted' | 'verified' | 'rejected';
export type PaymentMethod = 'bank_transfer' | 'ewallet' | 'cash';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface RoomImage {
  id: string;
  room_id: string;
  storage_path: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
}

export interface Room {
  id: string;
  property_id: string;
  name: string;
  slug: string;
  description: string;
  room_number: string;
  monthly_price: number;
  capacity: number;
  area: number;
  status: RoomStatus;
  amenities?: Amenity[];
  images?: RoomImage[];
}

export interface Booking {
  id: string;
  booking_code: string;
  user_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  duration: number;
  duration_unit: 'monthly';
  price_per_unit: number;
  total_price: number;
  status: BookingStatus;
  notes?: string;
  approved_at?: string;
  confirmed_at?: string;
  expires_at?: string;
  created_at: string;
  room?: Room;
  tenant_name?: string;
  tenant_phone?: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  proof_storage_path?: string;
  status: PaymentStatus;
  submitted_at?: string;
  verified_at?: string;
  rejection_reason?: string;
  booking_code?: string;
  room_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'action_required';
  read_at?: string;
  created_at: string;
}
