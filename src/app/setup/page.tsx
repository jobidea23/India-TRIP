"use client";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ExternalLink } from "lucide-react";

export default function SetupPage() {
  const items = [
    { title: "Firebase", desc: "Create project, enable Auth (Phone), Firestore, RTDB, Storage, Functions, FCM. Add env vars.", link: "https://console.firebase.google.com" },
    { title: "Google Maps", desc: "Enable Maps JS, Places, Geocoding, Routes, Distance Matrix. Restrict API key.", link: "https://console.cloud.google.com" },
    { title: "Razorpay", desc: "Create account, get key_id/key_secret. Set in functions config.", link: "https://dashboard.razorpay.com" },
  ];
  return (
    <div className="min-h-screen bg-brand-light p-6">
      <h1 className="text-2xl font-bold text-brand-navy mb-4">Production Setup</h1>
      <div className="grid md:grid-cols-3 gap-4 max-w-5xl">
        {items.map((i) => (
          <Card key={i.title} className="p-5">
            <h3 className="font-bold text-brand-navy">{i.title}</h3>
            <p className="text-sm text-gray-500 mt-2">{i.desc}</p>
            <a href={i.link} target="_blank" rel="noreferrer">
              <Button variant="secondary" className="mt-3 w-full">Open Console <ExternalLink size={14} className="inline ml-1" /></Button>
            </a>
          </Card>
        ))}
      </div>
      <Card className="p-5 mt-6 max-w-5xl">
        <h3 className="font-bold text-brand-navy">Environment Variables (.env.local)</h3>
        <pre className="text-xs bg-gray-50 p-3 rounded-xl mt-2 overflow-x-auto">{`NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=`}</pre>
      </Card>
    </div>
  );
}
