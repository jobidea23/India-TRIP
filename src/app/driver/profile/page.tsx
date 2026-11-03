"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useHydrated } from "@/hooks/useHydrated";
import { LogOut } from "lucide-react";

export default function DriverProfile() {
  const router = useRouter();
  const hydrated = useHydrated();
  const driver = useAppStore((s) => s.driver);
  const setDriver = useAppStore((s) => s.setDriver);
  const setRole = useAppStore((s) => s.setRole);
  if (!hydrated) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (!driver) return null;
  return (
    <div className="p-4 space-y-4">
      <Card className="p-5 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-3xl">🛵</div>
        <h2 className="mt-3 font-bold text-brand-navy text-lg">{driver.name}</h2>
        <p className="text-sm text-gray-500">+91 {driver.phone}</p>
        <p className="text-xs text-gray-400 mt-1">{driver.vehicle?.number} · {driver.vehicle?.category}</p>
      </Card>
      <Card className="p-4 space-y-2">
        <h3 className="font-bold text-brand-navy">Verification Status</h3>
        <p className="text-sm">Status: <span className="font-semibold text-brand-green capitalize">{driver.status}</span></p>
        <p className="text-xs text-gray-500">Documents: License, RC, Aadhaar (demo approved)</p>
      </Card>
      <Card className="p-4 space-y-2">
        <h3 className="font-bold text-brand-navy">Bank Details</h3>
        <p className="text-sm text-gray-500">Not added. Add for payouts.</p>
      </Card>
      <Button variant="danger" className="w-full" onClick={async () => { try { if (auth) await signOut(auth); } catch (e) { console.error("Logout error:", e); } setDriver(null); setRole(null); router.push("/"); }}>
        <LogOut size={16} className="inline mr-2" />Logout
      </Button>
    </div>
  );
}
