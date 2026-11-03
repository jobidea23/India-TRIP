"use client";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Card from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-green-50">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-green/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <header className="p-6 md:p-8 flex justify-between items-center relative z-10">
        <Logo size={40} />
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200">v2.0</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-10 relative z-10">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-black text-brand-navy tracking-tighter leading-none">
            INDIA <span className="bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">TRIP</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mt-4 font-light">Your Ride, Your Way.</p>
          <div className="mt-6 flex justify-center gap-3">
            <span className="px-4 py-1.5 bg-green-100 text-brand-green rounded-full text-sm font-semibold">Bike</span>
            <span className="px-4 py-1.5 bg-blue-100 text-brand-blue rounded-full text-sm font-semibold">Auto</span>
            <span className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">Cab</span>
          </div>
        </div>

        <div className="grid gap-4 w-full max-w-lg">
          <Link href="/customer">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center gap-5 border-2 border-transparent hover:border-brand-green group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">👤</div>
              <div className="flex-1">
                <div className="font-bold text-brand-navy text-xl">Customer App</div>
                <div className="text-sm text-gray-500 mt-1">Book a ride — Bike, Auto, Cab</div>
              </div>
              <span className="text-brand-green text-3xl group-hover:translate-x-1 transition-transform">→</span>
            </Card>
          </Link>
          <Link href="/driver">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center gap-5 border-2 border-transparent hover:border-brand-blue group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">🛵</div>
              <div className="flex-1">
                <div className="font-bold text-brand-navy text-xl">Rider / Captain App</div>
                <div className="text-sm text-gray-500 mt-1">Go online, accept rides, track earnings</div>
              </div>
              <span className="text-brand-blue text-3xl group-hover:translate-x-1 transition-transform">→</span>
            </Card>
          </Link>
        </div>

        <div className="text-xs text-gray-400 text-center max-w-md">
          Real-time tracking powered by OpenStreetMap & Firebase.
        </div>
      </main>
    </div>
  );
}
