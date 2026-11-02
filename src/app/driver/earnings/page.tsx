"use client";
import Card from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";

export default function Earnings() {
  const driver = useAppStore((s) => s.driver);
  if (!driver) return null;
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-brand-navy">Earnings</h2>
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-green">₹{driver.earnings?.daily || 0}</div>
          <div className="text-xs text-gray-500">Today</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-blue">₹{driver.earnings?.weekly || 0}</div>
          <div className="text-xs text-gray-500">This Week</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-navy">₹{driver.earnings?.monthly || 0}</div>
          <div className="text-xs text-gray-500">This Month</div>
        </Card>
      </div>
      <Card className="p-4">
        <h3 className="font-bold text-brand-navy mb-2">Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Completed rides</span><span className="font-semibold">{driver.completedRides}</span></div>
          <div className="flex justify-between"><span>Rating</span><span className="font-semibold">⭐ {driver.rating}</span></div>
          <div className="flex justify-between"><span>Commission deducted</span><span className="font-semibold">15%</span></div>
          <div className="flex justify-between"><span>Cash collected</span><span className="font-semibold">₹0</span></div>
          <div className="flex justify-between"><span>Online payments</span><span className="font-semibold">₹0</span></div>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-bold text-brand-navy mb-2">Transaction History</h3>
        <p className="text-sm text-gray-500">No transactions yet.</p>
      </Card>
    </div>
  );
}
