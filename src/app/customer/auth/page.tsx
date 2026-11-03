"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "firebase/auth";
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

  // Handle redirect result
  useEffect(() => {
    if (!auth) return;
    // If already logged in, redirect to customer
    if (auth.currentUser) {
      handleUser(auth.currentUser);
      return;
    }
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        handleUser(result.user);
      } else {
        // No redirect result — check if user is logged in via auth state
        // (handles case where redirect completed but getRedirectResult returned null)
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, (u) => {
          if (u) handleUser(u);
          unsubscribe();
        });
      }
    }).catch((e) => {
      console.error("Redirect result error:", e?.code, e?.message);
      if (e?.code === "auth/unauthorized-domain") {
        toast.error("Domain not authorized. Add indiatripnow.vercel.app to Firebase Auth → Authorized domains.");
      } else if (e?.code === "auth/popup-closed-by-user" || e?.code === "auth/cancelled-popup-request") {
        // User closed popup — do nothing
      } else {
        toast.error(e?.message || "Login failed. Check console for details.");
      }
    });
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
      // Use redirect directly (more reliable than popup on all browsers)
      toast("Google login page pe redirect ho rahe hain...");
      await signInWithRedirect(auth, provider);
    } catch (e: any) {
      toast.error(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-float" style={{ animationDelay: "1.5s" }} />
      <Card className="w-full max-w-md p-10 text-center relative z-10 animate-scale-in shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
        <div className="animate-float mb-8">
          <Logo size={52} />
        </div>
        <h2 className="text-3xl font-black text-brand-navy mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-sm text-gray-500 mb-8">Sign in with Google to book your ride</p>
        <Button className="w-full btn-ripple py-4 text-lg rounded-2xl shadow-xl shadow-green-500/20" onClick={googleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>
        <p className="text-xs text-gray-400 mt-8">By signing in, you agree to our Terms & Privacy Policy.</p>
      </Card>
    </div>
  );
}
