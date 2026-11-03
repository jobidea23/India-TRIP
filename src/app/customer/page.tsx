"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Navigation, Search, Bike, Car, Truck, ChevronUp, LocateFixed, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { useAppStore } from "@/store/useAppStore";
import { calculateFare, estimateDuration, isNightTime } from "@/lib/fare";
import { haversineKm, isMapsConfigured, loadGoogleMaps, getGoogleMapsKey, computeRoute } from "@/lib/googleMaps";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { createBooking, listenBooking, getFareSettings } from "@/lib/firestore";
import { useAppStore as store } from "@/store/useAppStore";
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
  const [routeInfo, setRouteInfo] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  const [searching, setSearching] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const directionsRenderer = useRef<any>(null);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);
  const pickupAutoRef = useRef<any>(null);
  const destAutoRef = useRef<any>(null);

  useEffect(() => {
    if (!user) router.replace("/customer/auth");
  }, [user, router]);

  // Load fare settings from Firestore
  useEffect(() => {
    getFareSettings().then((fs) => {
      if (fs) setFareSettings(fs as any);
    }).catch(() => {});
  }, []);

  // Init map + autocomplete when maps available
  useEffect(() => {
    if (!isMapsConfigured()) return;
    loadGoogleMaps().then((ok) => {
      if (!ok || !mapRef.current) return;
      const g = (window as any).google;
      const center = location || { lat: 28.6139, lng: 77.209 };
      const map = new g.maps.Map(mapRef.current, { center, zoom: 15, gestureHandling: "greedy" });
      mapInstance.current = map;
      directionsRenderer.current = new g.maps.DirectionsRenderer({ map, suppressMarkers: false });

      // Center pin reverse-geocode on map idle (Rapido-style)
      map.addListener("idle", () => {
        const c = map.getCenter();
        if (!c) return;
        const loc = { lat: c.lat(), lng: c.lng() };
        const geocoder = new g.maps.Geocoder();
        geocoder.geocode({ location: loc }, (results: any, status: string) => {
          const addr = (status === "OK" && results && results[0]) ? results[0].formatted_address : "Selected location";
          const cur = selecting;
          if (cur === "pickup") setPickup({ address: addr, location: loc });
          else setDestination({ address: addr, location: loc });
        });
      });

      // Autocomplete (legacy Places) — only if available
      if (g.maps.places && g.maps.places.Autocomplete) {
        if (pickupInputRef.current) {
          try {
            pickupAutoRef.current = new g.maps.places.Autocomplete(pickupInputRef.current, { types: ["geocode"] });
            pickupAutoRef.current.addListener("place_changed", () => {
              const place = pickupAutoRef.current.getPlace();
              if (place.geometry) {
                const loc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
                setPickup({ address: place.formatted_address || place.name, location: loc });
                if (mapInstance.current) mapInstance.current.setCenter(loc);
              }
            });
          } catch (e) { console.warn("Places autocomplete unavailable", e); }
        }
        if (destInputRef.current) {
          try {
            destAutoRef.current = new g.maps.places.Autocomplete(destInputRef.current, { types: ["geocode"] });
            destAutoRef.current.addListener("place_changed", () => {
              const place = destAutoRef.current.getPlace();
              if (place.geometry) {
                const loc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
                setDestination({ address: place.formatted_address || place.name, location: loc });
                if (mapInstance.current) mapInstance.current.setCenter(loc);
              }
            });
          } catch (e) { console.warn("Places autocomplete unavailable", e); }
        }
      }
    });
  }, [location]);

  // Update map center when location changes
  useEffect(() => {
    if (mapInstance.current && location) {
      mapInstance.current.setCenter(location);
    }
  }, [location]);

  // Calculate route when pickup & destination set
  useEffect(() => {
    if (!pickup || !destination) {
      setDistance(null); setEta(null); setRouteInfo("");
      if (directionsRenderer.current) directionsRenderer.current.set("directions", null);
      return;
    }
    if (!isMapsConfigured()) {
      const km = haversineKm(pickup.location, destination.location);
      setDistance(km);
      setEta(estimateDuration(km, category));
      return;
    }
    (async () => {
      const r = await computeRoute(pickup.location, destination.location);
      if (r) {
        setDistance(r.distanceKm);
        setEta(r.durationMin);
        setRouteInfo(`${r.distanceKm.toFixed(1)} km · ${r.durationMin} min`);
        // draw polyline
        if (mapInstance.current && r.encodedPolyline && (window as any).google?.maps?.geometry?.encoding) {
          const g = (window as any).google;
          const path = g.maps.geometry.encoding.decodePath(r.encodedPolyline);
          if ((mapInstance.current as any)._poly) {
            (mapInstance.current as any)._poly.setMap(null);
          }
          if (directionsRenderer.current) {
            directionsRenderer.current.set("directions", null);
          }
          const poly = new g.maps.Polyline({ path, strokeColor: "#2563EB", strokeWeight: 4, map: mapInstance.current });
          // store reference to remove later
          (mapInstance.current as any)._poly = poly;
        }
      } else {
        const km = haversineKm(pickup.location, destination.location);
        setDistance(km);
        setEta(estimateDuration(km, category));
      }
    })();
  }, [pickup, destination, category]);

  // Listen to booking updates
  useEffect(() => {
    if (!currentBookingId) return;
    const unsub = listenBooking(currentBookingId, (b) => {
      if (b.status === "assigned" || b.status === "arriving" || b.status === "started" || b.status === "completed") {
        store.getState().setActiveBooking(b);
        if (b.status === "assigned") {
          setStep("confirm");
          setSearching(false);
          toast.success("Driver assigned");
        }
      }
      if (b.status === "cancelled") {
        setSearching(false);
        setStep("home");
        toast.error("Ride cancelled");
      }
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
      if (mapInstance.current) mapInstance.current.setCenter(loc);
      if (isMapsConfigured() && (window as any).google) {
        const g = (window as any).google;
        const geocoder = new g.maps.Geocoder();
        geocoder.geocode({ location: loc }, (results: any, status: string) => {
          const addr = (status === "OK" && results && results[0]) ? results[0].formatted_address : "Current Location";
          setPickup({ address: addr, location: loc });
          toast.success("Current location set");
        });
      } else {
        setPickup({ address: "Current Location", location: loc });
        toast.success("Current location set");
      }
    }, () => toast.error("Location permission denied"));
  };

  const confirmBooking = async () => {
    if (!pickup || !destination) return;
    const u = store.getState().user;
    if (!u?.phone || !u?.name) {
      toast.error("Please complete your profile (name & phone) first");
      router.push("/customer/complete-profile");
      return;
    }
    if (paymentMethod === "online") {
      // Razorpay flow (real when configured)
      const { openRazorpayCheckout } = await import("@/lib/razorpay");
      openRazorpayCheckout({
        amount: fare?.total || 0,
        name: "INDIA TRIP",
        description: "Ride payment",
        onSuccess: async () => {
          toast.success("Payment successful");
          await doCreateBooking("paid");
        },
        onFailure: () => toast.error("Payment failed/cancelled"),
      });
    } else {
      await doCreateBooking("pending");
    }
  };

  const doCreateBooking = async (paymentStatus: "pending" | "paid") => {
    const u = store.getState().user;
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    try {
      const id = await createBooking({
        customerId: u!.id,
        customerName: u!.name,
        customerPhone: u!.phone,
        category,
        pickup,
        destination,
        distanceKm: distance || 0,
        durationMin: eta || 5,
        fare: fare?.total || 0,
        fareBreakdown: fare,
        paymentMethod,
        paymentStatus,
        otp,
      });
      setCurrentBookingId(id);
      const booking = {
        id, customerId: u!.id, category, pickup: pickup!, destination: destination!,
        distanceKm: distance || 0, durationMin: eta || 5,
        fare: fare?.total || 0, fareBreakdown: fare!,
        paymentMethod, paymentStatus, otp, otpVerified: false,
        status: "searching" as const, createdAt: Date.now(),
      };
      setActiveBooking(booking);
      setStep("searching");
    } catch (e: any) {
      toast.error(e?.message || "Booking failed");
    }
  };

  if (!user) return null;

  return (
    <div className="relative h-[calc(100vh-56px)]">
      {/* Map area */}
      <div className="absolute inset-0 bg-gray-200">
        <div ref={mapRef} className="w-full h-full" />
        {/* Center pin (Rapido-style) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none animate-bounce">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
            <path d="M20 0 C9 0 0 9 0 20 C0 35 20 50 20 50 C20 50 40 35 40 20 C40 9 31 0 20 0 Z" fill={selecting === "pickup" ? "#16A34A" : "#2563EB"} />
            <circle cx="20" cy="20" r="8" fill="white" />
            <circle cx="20" cy="20" r="4" fill={selecting === "pickup" ? "#16A34A" : "#2563EB"} />
          </svg>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 z-10 pointer-events-none">
          <div className="w-3 h-3 bg-black/30 rounded-full blur-sm" />
        </div>
      </div>

      {/* Top search bar */}
      <div className="absolute top-3 left-3 right-3 z-20">
        <Card className="p-3 flex items-center gap-2">
          <Search size={18} className="text-gray-400" />
          <input
            className="flex-1 outline-none text-sm"
            placeholder="Where to?"
            onFocus={() => { setStep("search"); setSelecting("destination"); }}
          />
          <button onClick={handleCurrentLocation}>
            <LocateFixed size={18} className="text-brand-green" />
          </button>
        </Card>
      </div>

      {/* Bottom panel */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {step === "search" && (
          <Card className="m-3 p-4 max-h-[60vh] overflow-y-auto">
            <div className="flex gap-2 mb-3">
              <button
                className={`flex-1 py-2 rounded-xl text-sm font-semibold ${selecting === "pickup" ? "bg-brand-green text-white" : "bg-gray-100"}`}
                onClick={() => setSelecting("pickup")}
              >Pickup</button>
              <button
                className={`flex-1 py-2 rounded-xl text-sm font-semibold ${selecting === "destination" ? "bg-brand-blue text-white" : "bg-gray-100"}`}
                onClick={() => setSelecting("destination")}
              >Destination</button>
            </div>
            {selecting === "pickup" ? (
              <Input ref={pickupInputRef} placeholder="Pickup address" defaultValue={pickup?.address || ""} />
            ) : (
              <Input ref={destInputRef} placeholder="Destination address" defaultValue={destination?.address || ""} />
            )}
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={handleCurrentLocation}>Use current location</Button>
            </div>
            <Button className="w-full mt-4" onClick={() => setStep("home")} variant="secondary">Done</Button>
          </Card>
        )}

        {step === "home" && (
          <Card className="m-3 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-700">Choose your ride</div>
              {distance !== null && (
                <Badge color="blue">{distance.toFixed(1)} km · {eta} min</Badge>
              )}
            </div>
            {routeInfo && <p className="text-xs text-gray-500 mb-2">{routeInfo}</p>}
            <div className="grid grid-cols-3 gap-2">
              {CATS.map((c) => {
                const f = (pickup && destination && distance !== null) ? calculateFare(fareSettings, c.id as any, distance, eta || 5) : null;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id as any)}
                    className={`p-3 rounded-xl border-2 text-center ${category === c.id ? "border-brand-green bg-green-50" : "border-gray-200"}`}
                  >
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
            <Button className="w-full mt-4" disabled={!pickup || !destination || searching} onClick={confirmBooking}>
              {searching ? <><Loader2 className="inline animate-spin mr-2" size={16} />Booking...</> : `Book ${CATS.find((c) => c.id === category)?.label}`}
            </Button>
          </Card>
        )}

        {step === "searching" && (
          <Card className="m-3 p-6 text-center">
            <div className="animate-pulse text-brand-green font-bold text-lg">Searching nearby drivers...</div>
            <p className="text-sm text-gray-500 mt-2">Waiting for a driver to accept</p>
            <Button variant="ghost" className="mt-4" onClick={() => { setStep("home"); }}>Cancel</Button>
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
              <p className="text-3xl font-extrabold text-brand-green tracking-widest text-center mt-1">
                {store.getState().activeBooking?.otp}
              </p>
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
