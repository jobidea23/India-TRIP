"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Navigation, Search, Bike, Car, Truck, LocateFixed, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { useAppStore } from "@/store/useAppStore";
import { calculateFare, estimateDuration, isNightTime } from "@/lib/fare";
import { haversineKm } from "@/lib/googleMaps";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { createBooking, listenBooking, getFareSettings } from "@/lib/firestore";
import LeafletMap from "@/components/maps/LeafletMap";
import toast from "react-hot-toast";

const CATS = [
  { id: "bike", label: "Bike Taxi", icon: Bike, capacity: "1 seat" },
  { id: "auto", label: "Auto", icon: Truck, capacity: "3 seats" },
  { id: "cab", label: "Cab", icon: Car, capacity: "4 seats" },
] as const;

export default function CustomerHome() {
  useLocationTracking(true);
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const location = useAppStore((s) => s.location);
  const setLocation = useAppStore((s) => s.setLocation);
  const pickup = useAppStore((s) => s.pickup);
  const destination = useAppStore((s) => s.destination);
  const setPickup = useAppStore((s) => s.setPickup);
  const setDestination = useAppStore((s) => s.setDestination);
  const category = useAppStore((s) => s.category);
  const setCategory = useAppStore((s) => s.setCategory);
  const fareSettings = useAppStore((s) => s.fareSettings);
  const setFareSettings = useAppStore((s) => s.setFareSettings);
  const setActiveBooking = useAppStore((s) => s.setActiveBooking);

  const [step, setStep] = useState<"home" | "search" | "confirm" | "searching">("home");
  const [selecting, setSelecting] = useState<"pickup" | "destination">("destination");
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  const [searching, setSearching] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState(location || { lat: 28.6139, lng: 77.209 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingPlace, setSearchingPlace] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/customer/auth");
  }, [user, router]);

  useEffect(() => {
    getFareSettings().then((fs) => { if (fs) setFareSettings(fs as any); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (location) setMapCenter(location);
  }, [location]);

  // Reverse geocode center via Nominatim (free)
  const reverseGeocode = async (loc: { lat: number; lng: number }) => {
    try {
      const res = await fetch(`/api/geocode?reverse=1&lat=${loc.lat}&lon=${loc.lng}`);
      const data = await res.json();
      return data.display_name || "Selected location";
    } catch {
      return "Selected location";
    }
  };

  // Center pin updates the active field
  const handleCenterChange = async (loc: { lat: number; lng: number }) => {
    setMapCenter(loc);
    const addr = await reverseGeocode(loc);
    if (selecting === "pickup") setPickup({ address: addr, location: loc });
    else setDestination({ address: addr, location: loc });
  };

  // Search places via Nominatim (free, worldwide)
  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;
    setSearchingPlace(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Search failed");
    } finally {
      setSearchingPlace(false);
    }
  };

  const selectPlace = (place: any) => {
    const loc = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    const addr = place.display_name;
    if (selecting === "pickup") setPickup({ address: addr, location: loc });
    else setDestination({ address: addr, location: loc });
    setMapCenter(loc);
    setSearchResults([]);
    setSearchQuery("");
    setStep("home");
  };

  useEffect(() => {
    if (pickup && destination) {
      const km = haversineKm(pickup.location, destination.location);
      setDistance(km);
      setEta(estimateDuration(km, category));
    } else {
      setDistance(null); setEta(null);
    }
  }, [pickup, destination, category]);

  useEffect(() => {
    if (!currentBookingId) return;
    const unsub = listenBooking(currentBookingId, (b) => {
      if (b.status === "assigned" || b.status === "arriving" || b.status === "started" || b.status === "completed") {
        useAppStore.getState().setActiveBooking(b);
        if (b.status === "assigned") { setStep("confirm"); setSearching(false); toast.success("Driver assigned"); }
      }
      if (b.status === "cancelled") { setSearching(false); setStep("home"); toast.error("Ride cancelled"); }
    });
    return () => unsub();
  }, [currentBookingId]);

  const fare = (pickup && destination && distance !== null)
    ? calculateFare(fareSettings, category, distance, eta || 5, 0, isNightTime(), 0)
    : null;

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(loc);
      setMapCenter(loc);
      const addr = await reverseGeocode(loc);
      if (selecting === "pickup") setPickup({ address: addr, location: loc });
      else setDestination({ address: addr, location: loc });
      toast.success("Current location set");
    }, () => toast.error("Location permission denied"));
  };

  const confirmBooking = async () => {
    if (!pickup || !destination) return;
    const u = useAppStore.getState().user;
    if (!u?.phone || !u?.name) {
      toast.error("Please complete your profile (name & phone) first");
      router.push("/customer/complete-profile");
      return;
    }
    if (paymentMethod === "online") {
      const { openRazorpayCheckout } = await import("@/lib/razorpay");
      openRazorpayCheckout({
        amount: fare?.total || 0, name: "INDIA TRIP", description: "Ride payment",
        onSuccess: async () => { toast.success("Payment successful"); await doCreateBooking("paid"); },
        onFailure: () => toast.error("Payment failed/cancelled"),
      });
    } else {
      await doCreateBooking("pending");
    }
  };

  const doCreateBooking = async (paymentStatus: "pending" | "paid") => {
    const u = useAppStore.getState().user;
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    try {
      const id = await createBooking({ customerId: u!.id, customerName: u!.name, customerPhone: u!.phone, category, pickup, destination, distanceKm: distance || 0, durationMin: eta || 5, fare: fare?.total || 0, fareBreakdown: fare, paymentMethod, paymentStatus, otp });
      setCurrentBookingId(id);
      const booking = { id, customerId: u!.id, category, pickup: pickup!, destination: destination!, distanceKm: distance || 0, durationMin: eta || 5, fare: fare?.total || 0, fareBreakdown: fare!, paymentMethod, paymentStatus, otp, otpVerified: false, status: "searching" as const, createdAt: Date.now() };
      setActiveBooking(booking);
      setStep("searching");
    } catch (e: any) {
      toast.error(e?.message || "Booking failed");
    }
  };

  if (!user) return null;

  const markers = [
    ...(pickup ? [{ lat: pickup.location.lat, lng: pickup.location.lng, label: "Pickup" }] : []),
    ...(destination ? [{ lat: destination.location.lat, lng: destination.location.lng, label: "Drop" }] : []),
  ];

  return (
    <div className="relative h-[calc(100vh-56px)]">
      {/* Map area (free OpenStreetMap) */}
      <div className="absolute inset-0 bg-gray-200">
        <LeafletMap center={mapCenter} markers={markers} onCenterChange={handleCenterChange} zoom={15} className="w-full h-full" />
        {/* Center pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none">
          <svg width="36" height="46" viewBox="0 0 36 46" fill="none">
            <path d="M18 0 C8 0 0 8 0 18 C0 32 18 46 18 46 C18 46 36 32 36 18 C36 8 28 0 18 0 Z" fill={selecting === "pickup" ? "#16A34A" : "#2563EB"} />
            <circle cx="18" cy="18" r="7" fill="white" />
            <circle cx="18" cy="18" r="3.5" fill={selecting === "pickup" ? "#16A34A" : "#2563EB"} />
          </svg>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1 z-[1000] pointer-events-none">
          <div className="w-2.5 h-2.5 bg-black/30 rounded-full blur-sm" />
        </div>
      </div>

      {/* Top search bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000]">
        <Card className="p-3 flex items-center gap-2 shadow-lg">
          <Search size={18} className="text-gray-400" />
          <input
            className="flex-1 outline-none text-sm bg-transparent"
            placeholder={selecting === "pickup" ? "Search pickup location..." : "Search destination..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") searchPlaces(); }}
          />
          <button onClick={searchPlaces} className="px-3 py-1 bg-brand-green text-white rounded-lg text-xs font-semibold">
            {searchingPlace ? "..." : "Search"}
          </button>
          <button onClick={handleCurrentLocation}>
            <LocateFixed size={18} className="text-brand-green" />
          </button>
        </Card>
        {searchResults.length > 0 && (
          <Card className="mt-2 p-2 max-h-60 overflow-y-auto shadow-lg">
            {searchResults.map((r, i) => (
              <button key={i} onClick={() => selectPlace(r)} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm border-b last:border-0">
                <div className="font-medium truncate">{r.display_name}</div>
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* Bottom panel */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000]">
        {step === "search" && (
          <Card className="m-3 p-4 max-h-[50vh] overflow-y-auto">
            <div className="flex gap-2 mb-3">
              <button className={`flex-1 py-2 rounded-xl text-sm font-semibold ${selecting === "pickup" ? "bg-brand-green text-white" : "bg-gray-100"}`} onClick={() => setSelecting("pickup")}>Pickup</button>
              <button className={`flex-1 py-2 rounded-xl text-sm font-semibold ${selecting === "destination" ? "bg-brand-blue text-white" : "bg-gray-100"}`} onClick={() => setSelecting("destination")}>Destination</button>
            </div>
            <p className="text-xs text-gray-500 mb-2">Drag map to set {selecting === "pickup" ? "pickup" : "destination"} location, or search above.</p>
            <div className="text-sm space-y-1 mb-3">
              <div className="flex items-start gap-2"><MapPin size={14} className="text-brand-green mt-1" /><span className="truncate">{pickup?.address || "Not set"}</span></div>
              <div className="flex items-start gap-2"><Navigation size={14} className="text-brand-blue mt-1" /><span className="truncate">{destination?.address || "Not set"}</span></div>
            </div>
            <Button className="w-full" onClick={() => setStep("home")} variant="secondary">Done</Button>
          </Card>
        )}

        {step === "home" && (
          <Card className="m-3 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-700">Choose your ride</div>
              {distance !== null && <Badge color="blue">{distance.toFixed(1)} km · {eta} min</Badge>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CATS.map((c) => {
                const f = (pickup && destination && distance !== null) ? calculateFare(fareSettings, c.id as any, distance, eta || 5) : null;
                return (
                  <button key={c.id} onClick={() => setCategory(c.id as any)} className={`p-3 rounded-xl border-2 text-center ${category === c.id ? "border-brand-green bg-green-50" : "border-gray-200"}`}>
                    <c.icon size={28} className="mx-auto text-brand-navy" />
                    <div className="text-xs font-bold mt-1">{c.label}</div>
                    {f ? <div className="text-sm font-bold text-brand-green mt-1">₹{f.total}</div> : <div className="text-xs text-gray-400 mt-1">--</div>}
                    <div className="text-[10px] text-gray-500">{c.capacity}</div>
                  </button>
                );
              })}
            </div>
            {pickup && destination && fare && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs">
                <div className="flex justify-between"><span>Pickup</span><span className="font-semibold truncate max-w-[60%]">{pickup.address}</span></div>
                <div className="flex justify-between"><span>Drop</span><span className="font-semibold truncate max-w-[60%]">{destination.address}</span></div>
                <div className="flex justify-between mt-1"><span>Est. fare</span><span className="font-bold text-brand-green">₹{fare.total}</span></div>
              </div>
            )}
            <div className="mt-3">
              <p className="text-xs text-gray-500 font-semibold mb-2">Payment</p>
              <div className="flex gap-2">
                <button onClick={() => setPaymentMethod("cash")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${paymentMethod === "cash" ? "bg-brand-green text-white" : "bg-gray-100"}`}>Cash on Trip</button>
                <button onClick={() => setPaymentMethod("online")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${paymentMethod === "online" ? "bg-brand-blue text-white" : "bg-gray-100"}`}>Online Pay</button>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="flex-1" disabled={!pickup || !destination || searching} onClick={confirmBooking}>
                {searching ? <><Loader2 className="inline animate-spin mr-2" size={16} />Booking...</> : `Book ${CATS.find((c) => c.id === category)?.label}`}
              </Button>
              <Button variant="ghost" className="px-4" onClick={() => setStep("search")}>Edit</Button>
            </div>
          </Card>
        )}

        {step === "searching" && (
          <Card className="m-3 p-6 text-center">
            <div className="animate-pulse text-brand-green font-bold text-lg">Searching nearby drivers...</div>
            <p className="text-sm text-gray-500 mt-2">Waiting for a driver to accept</p>
            <Button variant="ghost" className="mt-4" onClick={() => setStep("home")}>Cancel</Button>
          </Card>
        )}

        {step === "confirm" && (
          <Card className="m-3 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">🛵</div>
              <div className="flex-1">
                <div className="font-bold text-brand-navy">Driver Assigned</div>
                <div className="text-sm text-gray-500">On the way to pickup</div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-green-50 rounded-xl">
              <p className="text-sm font-semibold text-brand-navy">Your Ride OTP</p>
              <p className="text-3xl font-extrabold text-brand-green tracking-widest text-center mt-1">{useAppStore.getState().activeBooking?.otp}</p>
              <p className="text-xs text-gray-500 mt-1 text-center">Share this OTP with driver to start trip</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => router.push("/customer/track")}>Track Ride</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
