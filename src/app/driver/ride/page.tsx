"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Navigation, KeyRound, CheckCircle2, LocateFixed } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useHydrated";
import { listenBooking, updateBooking, verifyOtpClient, pushDriverLocation, listenDriverLocation } from "@/lib/firestore";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import toast from "react-hot-toast";

export default function ActiveRide() {
  useLocationTracking(true);
  const router = useRouter();
  const hydrated = useHydrated();
  const bookingStore = useAppStore((s) => s.activeBooking);
  const setActiveBooking = useAppStore((s) => s.setActiveBooking);
  const driver = useAppStore((s) => s.driver);
  const location = useAppStore((s) => s.location);
  const [booking, setBooking] = useState<any>(bookingStore);
  const [otp, setOtp] = useState("");
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [driverLoc, setDriverLoc] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!bookingStore?.id) return;
    const unsub = listenBooking(bookingStore.id, (b) => {
      setBooking(b);
      setActiveBooking(b);
      if (b.status === "started") setStarted(true);
      if (b.status === "completed") setCompleted(true);
    });
    return () => unsub();
  }, [bookingStore?.id]);

  // Push driver location to RTDB
  useEffect(() => {
    if (!driver?.id || !location) return;
    pushDriverLocation(driver.id, location.lat, location.lng).catch(() => {});
  }, [driver?.id, location]);

  useEffect(() => {
    if (driver?.id) {
      const unsub = listenDriverLocation(driver.id, setDriverLoc);
      return () => unsub();
    }
  }, [driver?.id]);

  if (!hydrated) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (!booking) {
    return (
      <div className="p-4">
        <Card className="p-6 text-center text-gray-500">No active ride. Accept a request first.</Card>
      </div>
    );
  }

  const verifyOtp = async () => {
    if (attempts >= 3) { toast.error("Too many attempts. Ride cancelled."); await updateBooking(booking.id, { status: "cancelled", cancelledBy: "system" }); return; }
    try {
      // Debug: show driver ID and booking driverId
      console.log("Driver ID:", driver?.id);
      console.log("Booking driverId:", booking.driverId);
      console.log("Auth UID:", (await import("firebase/auth")).getAuth().currentUser?.uid);
      const ok = await verifyOtpClient(booking.id, otp, booking.customerId);
      if (!ok) {
        setAttempts((a) => a + 1);
        toast.error("Invalid OTP. Ask customer for correct code.");
        return;
      }
      await updateBooking(booking.id, { otpVerified: true, status: "started", startedAt: Date.now() });
      setStarted(true);
      toast.success("OTP verified. Trip started!");
    } catch (e: any) {
      console.error("OTP verify error:", e);
      toast.error("Permission error: " + (e?.code || e?.message || "unknown"));
    }
  };

  const complete = async () => {
    await updateBooking(booking.id, { status: "completed", completedAt: Date.now(), paymentStatus: booking.paymentMethod === "cash" ? "pending" : booking.paymentStatus });
    setCompleted(true);
    // update driver earnings doc
    if (driver) {
      const { getDriverDoc, setDriverDoc } = await import("@/lib/firestore");
      const d: any = await getDriverDoc(driver.id);
      if (d) {
        const earnings = d.earnings || { daily: 0, weekly: 0, monthly: 0 };
        const fare = booking.fare || 0;
        const driverShare = Math.round(fare * 0.85);
        await setDriverDoc(driver.id, {
          completedRides: (d.completedRides || 0) + 1,
          earnings: {
            daily: (earnings.daily || 0) + driverShare,
            weekly: (earnings.weekly || 0) + driverShare,
            monthly: (earnings.monthly || 0) + driverShare,
          },
        });
        useAppStore.getState().setDriver({ ...driver, completedRides: (driver.completedRides || 0) + 1, earnings: { daily: (driver.earnings?.daily || 0) + driverShare, weekly: (driver.earnings?.weekly || 0) + driverShare, monthly: (driver.earnings?.monthly || 0) + driverShare } });
      }
    }
    toast.success("Trip completed");
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <h2 className="font-bold text-brand-navy">Active Ride</h2>
        <div className="mt-3 h-40 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl flex items-center justify-center">
          <MapPin className="text-brand-green" size={28} />
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center gap-2"><MapPin size={14} className="text-brand-green" /> {booking.pickup?.address}</div>
          <div className="flex items-center gap-2"><Navigation size={14} className="text-brand-blue" /> {booking.destination?.address}</div>
          <div className="flex justify-between"><span>Fare</span><span className="font-bold text-brand-green">₹{booking.fare}</span></div>
          <div className="flex justify-between"><span>Payment</span><span>{booking.paymentMethod} ({booking.paymentStatus})</span></div>
          {booking.customerPhone && (
            <div className="flex justify-between items-center">
              <span>Customer</span>
              <a href={`tel:${booking.customerPhone}`} className="font-semibold text-brand-blue flex items-center gap-1">
                📞 {booking.customerPhone}
              </a>
            </div>
          )}
        </div>
      </Card>

      {!started && !completed && (
        <Card className="p-4 space-y-3">
          <h3 className="font-bold text-brand-navy flex items-center gap-2"><KeyRound size={18} /> Enter Customer OTP</h3>
          <p className="text-xs text-gray-500">Ask the customer for their 4-digit code. Attempts left: {3 - attempts}</p>
          <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="4-digit OTP" className="text-center tracking-widest text-xl" />
          <p className="text-xs text-gray-400 text-center">Booking OTP (for debug): {booking.otp || "not found"}</p>
          <Button className="w-full bg-brand-blue" onClick={verifyOtp}>Verify & Start Trip</Button>
        </Card>
      )}

      {started && !completed && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-brand-green font-bold">
            <CheckCircle2 size={20} /> Trip in progress
          </div>
          <p className="text-xs text-gray-500">Navigate to destination. Collect payment on completion.</p>
          <Button className="w-full bg-brand-green" onClick={complete}>Complete Trip</Button>
        </Card>
      )}

      {completed && (
        <Card className="p-4 space-y-3 text-center">
          <CheckCircle2 size={40} className="mx-auto text-brand-green" />
          <h3 className="font-bold text-brand-navy">Trip Completed</h3>
          <p className="text-sm text-gray-500">Collect ₹{booking.fare} ({booking.paymentMethod}).</p>
          <Button className="w-full" onClick={() => { setActiveBooking(null); router.push("/driver"); }}>Back to Home</Button>
        </Card>
      )}
    </div>
  );
}
