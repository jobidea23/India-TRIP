"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Logo from "@/components/ui/Logo";
import { auth } from "@/lib/firebase";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

export default function CustomerAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const setRole = useAppStore((s) => s.setRole);

  const isFirebase = Boolean(auth);

  const googleLogin = async () => {
    setLoading(true);
    try {
      if (!auth) {
        // Demo mode: simulate Google login
        await new Promise((r) => setTimeout(r, 600));
        const user = { id: "demo_google_user", phone: "", name: "Demo User", email: "demo@gmail.com", photoURL: "", createdAt: Date.now() };
        setUser(user);
        setRole("customer");
        toast.success("Signed in (demo)");
        if (!user.phone) router.push("/customer/complete-profile");
        else router.push("/customer");
        return;
      }
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      // Load or create user doc in Firestore
      let existing: any = null;
      try {
        const { getUserDoc, setUserDoc } = await import("@/lib/firestore");
        existing = await getUserDoc(u.uid);
        if (!existing) {
          const nu = {
            id: u.uid,
            phone: "",
            name: u.displayName || "",
            email: u.email || "",
            photoURL: u.photoURL || "",
            createdAt: Date.now(),
          };
          await setUserDoc(u.uid, nu);
          existing = nu;
        }
      } catch (e) {
        console.warn("Firestore user load failed", e);
        existing = { id: u.uid, phone: "", name: u.displayName || "", email: u.email || "", photoURL: u.photoURL || "", createdAt: Date.now() };
      }
      const user = {
        id: u.uid,
        phone: existing?.phone || "",
        name: existing?.name || u.displayName || "",
        email: existing?.email || u.email || "",
        photoURL: existing?.photoURL || u.photoURL || "",
        home: existing?.home,
        work: existing?.work,
        createdAt: existing?.createdAt || Date.now(),
      };
      setUser(user);
      setRole("customer");
      toast.success("Welcome " + (u.displayName || ""));
      if (!user.phone || !user.name) router.push("/customer/complete-profile");
      else router.push("/customer");
    } catch (e: any) {
      toast.error(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 text-center">
        <Logo />
        <h2 className="text-2xl font-bold text-brand-navy mt-4 mb-1">Welcome to INDIA TRIP</h2>
        <p className="text-sm text-gray-500 mb-6">Sign in with Google to continue</p>
        <Button className="w-full" onClick={googleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign in with Google"}
        </Button>
        {!isFirebase && (
          <p className="text-xs text-gray-400 mt-4">Demo mode: Google Sign-In simulated</p>
        )}
      </Card>
    </div>
  );
}
