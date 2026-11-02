"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { Home, Search, User, Clock, LifeBuoy } from "lucide-react";

const tabs = [
  { href: "/customer", icon: Home, label: "Home" },
  { href: "/customer/history", icon: Clock, label: "Rides" },
  { href: "/customer/profile", icon: User, label: "Profile" },
  { href: "/customer/support", icon: LifeBuoy, label: "Support" },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-4 py-3 border-b flex items-center justify-between">
        <Logo size={28} />
        <Link href="/customer/profile" className="text-sm text-brand-blue font-semibold">Account</Link>
      </header>
      <main className="flex-1 pb-20">{children}</main>
      <nav className="bottom-nav">
        {tabs.map((t) => {
          const active = path === t.href;
          return (
            <Link key={t.href} href={t.href} className={`flex flex-col items-center text-xs ${active ? "text-brand-green" : "text-gray-500"}`}>
              <t.icon size={22} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
