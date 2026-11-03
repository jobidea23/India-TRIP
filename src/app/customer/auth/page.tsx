"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Logo from "@/components/ui/Logo";
import { auth } from "@/lib/firebase";
import { useAppStore } from "@/store/useAppStore";
import { getUserDoc, setUserDoc } from "@/lib/firestore";
import toast from "react-hot-toast";

export default function CustomerAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const setRole = useAppStore((s) => s.setRole);

  const handleUser = async (u: any) => {
    let existing: any = null;
    try {
      existing = await getUserDoc(u.uid);
      if (!existing) {
        const nu = { id: u.uid, phone: "", name: u.displayName || "", email: u.email || "", photoURL: u.photoURL || "", createdAt: Date.now() };
        await setUserDoc(u.uid, nu);
        existing = nu;
      }
    } catch (e) {
      console.warn("Firestore user load failed", e);
      existing = { id: u.uid, phone: "", name: u.displayName || "", email: u.email || "", photoURL: u.photoURL || "", createdAt: Date.now() };
    }
    const user = { id: u.uid, phone: existing?.phone || "", name: existing?.name || u.displayName || "", email: existing?.email || u.email || "", photoURL: existing?.photoURL || u.photoURL || "", home: existing?.home, work: existing?.work, createdAt: existing?.createdAt || Date.now() };
    setUser(user);
    setRole("customer");
    toast.success("Welcome " + (u.displayName || ""));
    if (!user.phone || !user.name) router.push("/customer/complete-profile");
    else router.push("/customer");
  };

  // Handle redirect result (mobile / popup-blocked fallback)
  useEffect(() => {
    if (!auth) return;
    getRedirectResult(auth).then((result) => {
      if (result?.user) handleUser(result.user);
    }).catch((e) => { if (e?.code !== "auth/popup-closed-by-user") toast.error(e?.message || "Login failed"); });
  }, []);

  const googleLogin = async () => {
    setLoading(true);
    try {
      if (!auth) {
        await new Promise((r) => setTimeout(r, 600));
        const user = { id: "demo_google_user", phone: "", name: "Demo User", email: "demo@gmail.com", photoURL: "", createdAt: Date.now() };
        setUser(user as any);
        setRole("customer");
        toast.success("Signed in (demo)");
        if (!user.phone) router.push("/customer/complete-profile");
        else router.push("/customer");
        return;
      }
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        await handleUser(result.user);
      } catch (e: any) {
        if (e?.code === "auth/popup-blocked" || e?.code === "auth/popup-closed-by-user") {
          // Fallback to redirect (works on mobile / popup blockers)
          await signInWithRedirect(auth, provider);
        } else {
          throw e;
        }
      }
    } catch (e: any) {
      toast.error(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      <Card className="w-full max-w-md p-8 text-center relative z-10 animate-scale-in shadow-2xl">
        <div className="animate-float">
          <Logo />
        </div>
        <h2 className="text-2xl font-bold text-brand-navy mt-6 mb-1">Welcome to INDIA TRIP</h2>
        <p className="text-sm text-gray-500 mb-8">Sign in with Google to continue</p>
        <Button className="w-full btn-ripple py-4 text-lg" onClick={googleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign in with Google"}
        </Button>
        <p className="text-xs text-gray-400 mt-4">If popup is blocked, you will be redirected to Google automatically.</p>
      </Card>
    </div>
  );
}
