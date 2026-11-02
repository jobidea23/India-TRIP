export type Role = "customer" | "driver" | "admin";

export type VehicleCategory = "bike" | "auto" | "cab";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  photoURL?: string;
  home?: string;
  work?: string;
  savedPlaces?: { label: string; address: string; location: LatLng }[];
  createdAt?: number;
}

export interface Vehicle {
  id: string;
  driverId: string;
  category: VehicleCategory;
  number: string;
  model?: string;
  color?: string;
}

export interface Driver {
  id: string;
  phone: string;
  email?: string;
  name: string;
  photoURL?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  online: boolean;
  vehicle?: Vehicle;
  location?: LatLng;
  rating?: number;
  completedRides?: number;
  earnings?: { daily: number; weekly: number; monthly: number };
  bank?: { account: string; ifsc: string; name: string };
  docs?: { license?: string; rc?: string; aadhaar?: string };
}

export interface FareSettings {
  bike: FareConfig;
  auto: FareConfig;
  cab: FareConfig;
  nightMultiplier?: number;
  waitingPerMin?: number;
  cancellationFee?: number;
  platformCommissionPct?: number;
}

export interface FareConfig {
  baseFare: number;
  perKm: number;
  perMin: number;
  minFare: number;
  capacity: number;
}

export interface Booking {
  id: string;
  customerId: string;
  driverId?: string;
  category: VehicleCategory;
  pickup: { address: string; location: LatLng };
  destination: { address: string; location: LatLng };
  distanceKm: number;
  durationMin: number;
  fare: number;
  fareBreakdown: FareBreakdown;
  paymentMethod: "cash" | "online";
  paymentStatus: "pending" | "paid" | "failed";
  otp: string;
  otpVerified: boolean;
  status:
    | "searching"
    | "assigned"
    | "arriving"
    | "started"
    | "completed"
    | "cancelled";
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  cancelledBy?: "customer" | "driver" | "admin";
  rating?: number;
}

export interface FareBreakdown {
  baseFare: number;
  distanceCharge: number;
  timeCharge: number;
  waitingCharge: number;
  nightCharge: number;
  subtotal: number;
  discount: number;
  total: number;
  commission: number;
  driverEarnings: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: "cash" | "online";
  status: "pending" | "success" | "failed";
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  createdAt: number;
}

export interface Rating {
  id: string;
  bookingId: string;
  from: string;
  to: string;
  role: "customer" | "driver";
  stars: number;
  comment?: string;
  createdAt: number;
}

export interface Complaint {
  id: string;
  userId: string;
  bookingId?: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  createdAt: number;
}

export interface Offer {
  id: string;
  code: string;
  discountPct: number;
  maxDiscount: number;
  active: boolean;
  expiresAt: number;
}
