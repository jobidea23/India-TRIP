"use client";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Card from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float" />
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-blue-200/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-float" style={{ animationDelay: "1.5s" }} />

      <header className="p-6 md:p-10 flex justify-between items-center relative z-10 animate-slide-down">
        <Logo size={44} />
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-gray-200/50 shadow-sm">v2.0</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-12 relative z-10">
        <div className="text-center max-w-2xl animate-slide-up">
          <h1 className="text-6xl md:text-8xl font-black text-brand-navy tracking-tighter leading-none">
            INDIA <span className="text-gradient">TRIP</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mt-4 font-light tracking-wide">Your Ride, Your Way.</p>
          <div className="mt-8 flex justify-center gap-3">
            <span className="px-5 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold shadow-sm">Bike</span>
            <span className="px-5 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold shadow-sm">Auto</span>
            <span className="px-5 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold shadow-sm">Cab</span>
          </div>
        </div>

        <div className="grid gap-5 w-full max-w-lg animate-stagger">
          <Link href="/customer">
            <Card className="p-6 card-hover cursor-pointer flex items-center gap-5 border-2 border-transparent hover:border-brand-green group bg-white/90 backdrop-blur">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform duration-300">👤</div>
              <div className="flex-1">
                <div className="font-bold text-brand-navy text-xl">Customer App</div>
                <div className="text-sm text-gray-500 mt-1">Book a ride — Bike, Auto, Cab</div>
              </div>
              <span className="text-brand-green text-3xl group-hover:translate-x-2 transition-transform duration-300">→</span>
            </Card>
          </Link>
          <Link href="/driver">
            <Card className="p-6 card-hover cursor-pointer flex items-center gap-5 border-2 border-transparent hover:border-brand-blue group bg-white/90 backdrop-blur">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform duration-300">🛵</div>
              <div className="flex-1">
                <div className="font-bold text-brand-navy text-xl">Rider / Captain App</div>
                <div className="text-sm text-gray-500 mt-1">Go online, accept rides, track earnings</div>
              </div>
              <span className="text-brand-blue text-3xl group-hover:translate-x-2 transition-transform duration-300">→</span>
            </Card>
          </Link>
        </div>

        <div className="text-xs text-gray-400 text-center max-w-md animate-fade-in">
          Real-time tracking powered by OpenStreetMap & Firebase.
        </div>
      </main>
    </div>
  );
}
