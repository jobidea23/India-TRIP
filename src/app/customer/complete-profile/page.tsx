"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

export default function CompleteProfile() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [home, setHome] = useState("");
  const [work, setWork] = useState("");

  const save = () => {
    if (!name.trim()) { toast.error("Enter your name"); return; }
    if (!/^\d{10}$/.test(phone)) { toast.error("Enter valid 10-digit phone"); return; }
    if (!user) { router.push("/customer/auth"); return; }
    setUser({ ...user, name: name.trim(), phone, home, work });
    toast.success("Profile completed");
    router.push("/customer");
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-brand-navy mb-1">Complete Your Profile</h2>
        <p className="text-sm text-gray-500 mb-6">Please add your details to book trips</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Full name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Mobile number</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Home address (optional)</label>
            <Input value={home} onChange={(e) => setHome(e.target.value)} placeholder="Home" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Work address (optional)</label>
            <Input value={work} onChange={(e) => setWork(e.target.value)} placeholder="Work" />
          </div>
        </div>
        <Button className="w-full mt-4" onClick={save}>Save & Continue</Button>
        <button className="w-full mt-3 text-sm text-brand-blue" onClick={() => router.push("/customer")}>Skip for now</button>
      </Card>
    </div>
  );
}
