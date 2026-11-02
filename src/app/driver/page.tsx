"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Power, MapPin, Star, Bike, Truck, Car, IndianRupee } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAppStore } from "@/store/useAppStore";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import toast from "react-hot-toast";

export default function DriverHome() {
  useLocationTracking(true);
  const router = useRouter();
  const driver = useAppStore((s) => s.driver);
  const setDriver = useAppStore((s) => s.setDriver);
  const [online, setOnline] = useState(driver?.online || false);

  useEffect(() => {
    if (!driver) router.replace("/driver/auth");
  }, [driver, router]);

  if (!driver) return null;

  const toggle = async () => {
    const next = !online;
    setOnline(next);
    const updated = { ...driver, online: next };
    setDriver(updated);
    try {
      const { setDriverDoc } = await import("@/lib/firestore");
      await setDriverDoc(driver.id, { online: next });
    } catch {}
    toast.success(next ? "You are online" : "You are offline");
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-5 flex items-center justify-between">
        <div>
          <div className="font-bold text-brand-navy">{driver.name}</div>
          <div className="text-xs text-gray-500">{driver.vehicle?.number} · {driver.vehicle?.category}</div>
          <div className="text-xs text-gray-500 mt-1">⭐ {driver.rating} · {driver.completedRides} rides</div>
        </div>
        <button
          onClick={toggle}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition ${online ? "bg-brand-green" : "bg-gray-400"}`}
        >
          <Power size={28} />
        </button>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-brand-navy">Status</h3>
          <Badge color={online ? "green" : "gray"}>{online ? "Online" : "Offline"}</Badge>
        </div>
        <div className="h-40 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto text-brand-blue" size={28} />
            <p className="text-xs text-gray-500 mt-1">Live map (demo)</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <IndianRupee className="mx-auto text-brand-green" size={20} />
          <div className="text-lg font-bold text-brand-navy mt-1">₹{driver.earnings?.daily || 0}</div>
          <div className="text-xs text-gray-500">Today</div>
        </Card>
        <Card className="p-3 text-center">
          <IndianRupee className="mx-auto text-brand-blue" size={20} />
          <div className="text-lg font-bold text-brand-navy mt-1">₹{driver.earnings?.weekly || 0}</div>
          <div className="text-xs text-gray-500">Week</div>
        </Card>
        <Card className="p-3 text-center">
          <IndianRupee className="mx-auto text-gray-600" size={20} />
          <div className="text-lg font-bold text-brand-navy mt-1">₹{driver.earnings?.monthly || 0}</div>
          <div className="text-xs text-gray-500">Month</div>
        </Card>
      </div>

      {online && (
        <Button className="w-full bg-brand-blue" onClick={() => router.push("/driver/requests")}>
          View Ride Requests
        </Button>
      )}
    </div>
  );
}
