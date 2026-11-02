"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Wallet, User, Route } from "lucide-react";
import Logo from "@/components/ui/Logo";

const tabs = [
  { href: "/driver", icon: Home, label: "Home" },
  { href: "/driver/requests", icon: List, label: "Requests" },
  { href: "/driver/trips", icon: Route, label: "Trips" },
  { href: "/driver/earnings", icon: Wallet, label: "Earnings" },
  { href: "/driver/profile", icon: User, label: "Profile" },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-4 py-3 border-b flex items-center justify-between">
        <Logo size={28} />
        <span className="text-xs bg-blue-100 text-brand-blue px-2 py-1 rounded-full font-semibold">Captain</span>
      </header>
      <main className="flex-1 pb-20">{children}</main>
      <nav className="bottom-nav">
        {tabs.map((t) => {
          const active = path === t.href;
          return (
            <Link key={t.href} href={t.href} className={`flex flex-col items-center text-xs ${active ? "text-brand-blue" : "text-gray-500"}`}>
              <t.icon size={22} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
