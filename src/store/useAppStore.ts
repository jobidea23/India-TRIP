import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Driver, Booking, VehicleCategory, LatLng, FareSettings } from "@/types";

interface AppState {
  role: "customer" | "driver" | "admin" | null;
  setRole: (r: AppState["role"]) => void;

  user: User | null;
  setUser: (u: User | null) => void;

  driver: Driver | null;
  setDriver: (d: Driver | null) => void;

  isAdmin: boolean;
  setIsAdmin: (b: boolean) => void;

  location: LatLng | null;
  setLocation: (l: LatLng | null) => void;

  pickup: { address: string; location: LatLng } | null;
  destination: { address: string; location: LatLng } | null;
  setPickup: (p: AppState["pickup"]) => void;
  setDestination: (d: AppState["destination"]) => void;

  category: VehicleCategory;
  setCategory: (c: VehicleCategory) => void;

  activeBooking: Booking | null;
  setActiveBooking: (b: Booking | null) => void;

  fareSettings: FareSettings;
  setFareSettings: (f: FareSettings) => void;
}

const defaultFare: FareSettings = {
  bike: { baseFare: 20, perKm: 8, perMin: 1, minFare: 30, capacity: 1 },
  auto: { baseFare: 30, perKm: 12, perMin: 1.5, minFare: 40, capacity: 3 },
  cab: { baseFare: 50, perKm: 18, perMin: 2, minFare: 80, capacity: 4 },
  nightMultiplier: 1.25,
  waitingPerMin: 2,
  cancellationFee: 25,
  platformCommissionPct: 15,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
      user: null,
      setUser: (user) => set({ user }),
      driver: null,
      setDriver: (driver) => set({ driver }),
      isAdmin: false,
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      location: null,
      setLocation: (location) => set({ location }),
      pickup: null,
      destination: null,
      setPickup: (pickup) => set({ pickup }),
      setDestination: (destination) => set({ destination }),
      category: "bike",
      setCategory: (category) => set({ category }),
      activeBooking: null,
      setActiveBooking: (activeBooking) => set({ activeBooking }),
      fareSettings: defaultFare,
      setFareSettings: (fareSettings) => set({ fareSettings }),
    }),
    { name: "india-trip-store" }
  )
);
