"use client";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Card from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-bg opacity-10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-green/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <header className="p-6 flex justify-between items-center relative z-10 animate-slide-down">
        <Logo />
        <span className="text-xs text-gray-500 bg-white/80 backdrop-blur px-3 py-1 rounded-full">v2.0</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8 relative z-10">
        <div className="text-center animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-extrabold text-brand-navy tracking-tight">
            INDIA <span className="text-brand-green">TRIP</span>
          </h1>
          <p className="text-xl text-gray-600 mt-3 font-medium">Your Ride, Your Way.</p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-brand-green rounded-full text-xs font-semibold">Bike</span>
            <span className="px-3 py-1 bg-blue-100 text-brand-blue rounded-full text-xs font-semibold">Auto</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">Cab</span>
          </div>
        </div>

        <div className="grid gap-4 w-full max-w-md animate-stagger">
          <Link href="/customer">
            <Card className="p-5 card-hover cursor-pointer flex items-center gap-4 border-2 border-transparent hover:border-brand-green">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-2xl shadow-lg animate-pulse-slow">👤</div>
              <div className="flex-1">
                <div className="font-bold text-brand-navy text-lg">Customer App</div>
                <div className="text-sm text-gray-500">Book a ride — Bike, Auto, Cab</div>
              </div>
              <span className="text-brand-green text-2xl">→</span>
            </Card>
          </Link>
          <Link href="/driver">
            <Card className="p-5 card-hover cursor-pointer flex items-center gap-4 border-2 border-transparent hover:border-brand-blue">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl shadow-lg animate-pulse-slow" style={{ animationDelay: "0.5s" }}>🛵</div>
              <div className="flex-1">
                <div className="font-bold text-brand-navy text-lg">Rider / Captain App</div>
                <div className="text-sm text-gray-500">Go online, accept rides, track earnings</div>
              </div>
              <span className="text-brand-blue text-2xl">→</span>
            </Card>
          </Link>
        </div>

        <div className="text-xs text-gray-400 text-center max-w-md animate-fade-in">
          Admin panel is a separate app. Real-time tracking powered by Google Maps & Firebase.
        </div>
      </main>
    </div>
  );
}
