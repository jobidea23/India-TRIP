"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "firebase/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Logo from "@/components/ui/Logo";
import { auth } from "@/lib/firebase";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

const CATEGORIES = ["bike", "auto", "cab"] as const;

export default function DriverAuth() {
  const [step, setStep] = useState<"login" | "register">("login");
  const [gUser, setGUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [form, setForm] = useState({ name: "", vehicleNumber: "", category: "bike" as string });
  const router = useRouter();
  const setDriver = useAppStore((s) => s.setDriver);
  const setRole = useAppStore((s) => s.setRole);

  useEffect(() => {
    if (!auth) return;
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        const u = result.user;
        setGUser(u);
        setForm((f) => ({ ...f, name: u.displayName || "" }));
        setStep("register");
      }
    }).catch((e) => {
      console.error("Redirect result error:", e?.code, e?.message);
      if (e?.code === "auth/unauthorized-domain") {
        toast.error("Domain not authorized. Add this domain to Firebase Auth → Authorized domains.");
      }
    });
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setGUser(u);
        setForm((f) => ({ ...f, name: u.displayName || f.name || "" }));
        setStep("register");
      }
    });
    return () => unsubscribe();
  }, []);

  const googleLogin = async () => {
    try {
      if (!auth) {
        await new Promise((r) => setTimeout(r, 500));
        const u = { uid: "demo_drv", displayName: "Demo Driver", email: "demo@gmail.com", photoURL: "" };
        setGUser(u);
        setForm((f) => ({ ...f, name: u.displayName }));
        setStep("register");
        toast.success("Signed in (demo)");
        return;
      }
      const provider = new GoogleAuthProvider();
      toast("Google login page pe redirect ho rahe hain...");
      await signInWithRedirect(auth, provider);
    } catch (e: any) {
      toast.error(e?.message || "Login failed");
    }
  };

  const register = () => {
    if (!form.name || !phone || !form.vehicleNumber) { toast.error("Fill all fields"); return; }
    if (!/^\d{10}$/.test(phone)) { toast.error("Enter valid 10-digit phone"); return; }
    const uid = gUser?.uid || ("demo_" + phone);
    const driver = {
      id: uid,
      phone,
      name: form.name,
      email: gUser?.email || "",
      photoURL: gUser?.photoURL || "",
      status: "approved" as const,
      online: false,
      vehicle: { id: "v_" + phone, driverId: uid, category: form.category as any, number: form.vehicleNumber },
      rating: 4.8,
      completedRides: 0,
      earnings: { daily: 0, weekly: 0, monthly: 0 },
    };
    setDriver(driver);
    setRole("driver");
    toast.success("Registered & approved");
    router.push("/driver");
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <Logo />
        <h2 className="text-2xl font-bold text-brand-navy mt-4 mb-1">Captain Login</h2>
        <p className="text-sm text-gray-500 mb-6">Sign in with Google to register</p>
        {step === "login" ? (
          <>
            <Button className="w-full bg-brand-blue" onClick={googleLogin}>Sign in with Google</Button>
            <p className="text-xs text-gray-400 mt-3">If popup is blocked, you will be redirected to Google automatically.</p>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} />
              <Input placeholder="Vehicle number (e.g. DL 01 AB 1234)" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
              <div>
                <label className="text-xs text-gray-500">Vehicle category</label>
                <div className="flex gap-2 mt-1">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setForm({ ...form, category: c })} className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize ${form.category === c ? "bg-brand-blue text-white" : "bg-gray-100"}`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
            <Button className="w-full mt-4 bg-brand-blue" onClick={register}>Register & Go Online</Button>
          </>
        )}
      </Card>
    </div>
  );
}
