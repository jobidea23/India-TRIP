"use client";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Card from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-light flex flex-col">
      <header className="p-6 flex justify-between items-center">
        <Logo />
        <span className="text-xs text-gray-500">v1.0</span>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-brand-navy">INDIA TRIP</h1>
          <p className="text-lg text-gray-600 mt-2">Your Ride, Your Way.</p>
        </div>
        <div className="grid gap-4 w-full max-w-md">
          <Link href="/customer">
            <Card className="p-5 hover:shadow-md transition cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">👤</div>
              <div className="flex-1">
                <div className="font-bold text-brand-navy">Customer App</div>
                <div className="text-sm text-gray-500">Book a ride - Bike, Auto, Cab</div>
              </div>
              <span className="text-brand-green">→</span>
            </Card>
          </Link>
          <Link href="/driver">
            <Card className="p-5 hover:shadow-md transition cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">🛵</div>
              <div className="flex-1">
                <div className="font-bold text-brand-navy">Rider / Captain App</div>
                <div className="text-sm text-gray-500">Go online, accept rides, track earnings</div>
              </div>
              <span className="text-brand-blue">→</span>
            </Card>
          </Link>
        </div>
        <div className="text-xs text-gray-400 text-center max-w-md">
          Admin panel is a separate app: see <code>india-trip-admin</code> folder. Demo mode active when credentials are not configured.
        </div>
      </main>
    </div>
  );
}
