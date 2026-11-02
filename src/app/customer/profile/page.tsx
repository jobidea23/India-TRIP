"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, Home, Briefcase, Edit2, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

export default function Profile() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const setRole = useAppStore((s) => s.setRole);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [home, setHome] = useState(user?.home || "");
  const [work, setWork] = useState(user?.work || "");

  if (!user) { router.replace("/customer/auth"); return null; }

  const save = () => {
    setUser({ ...user, name, home, work });
    setEditing(false);
    toast.success("Profile updated");
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    router.push("/");
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-5 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center text-3xl">👤</div>
        <h2 className="mt-3 font-bold text-brand-navy text-lg">{user.name || "Customer"}</h2>
        <p className="text-sm text-gray-500">+91 {user.phone}</p>
        <button className="mt-2 text-brand-blue text-sm flex items-center gap-1 mx-auto" onClick={() => setEditing(!editing)}>
          <Edit2 size={14} /> {editing ? "Cancel" : "Edit"}
        </button>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-bold text-brand-navy">Personal Details</h3>
        <div>
          <label className="text-xs text-gray-500">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!editing} />
        </div>
        <div>
          <label className="text-xs text-gray-500 flex items-center gap-1"><Home size={12} /> Home address</label>
          <Input value={home} onChange={(e) => setHome(e.target.value)} disabled={!editing} placeholder="Saved home" />
        </div>
        <div>
          <label className="text-xs text-gray-500 flex items-center gap-1"><Briefcase size={12} /> Work address</label>
          <Input value={work} onChange={(e) => setWork(e.target.value)} disabled={!editing} placeholder="Saved work" />
        </div>
        {editing && <Button className="w-full" onClick={save}><Save size={16} className="inline mr-2" />Save</Button>}
      </Card>

      <Card className="p-4 space-y-2">
        <h3 className="font-bold text-brand-navy">Quick Links</h3>
        {["Payment methods", "Emergency contacts", "Notifications", "Offers & promo codes"].map((l) => (
          <button key={l} className="w-full text-left py-2 border-b last:border-0 text-sm">{l}</button>
        ))}
      </Card>

      <Button variant="danger" className="w-full" onClick={logout}><LogOut size={16} className="inline mr-2" />Logout</Button>
    </div>
  );
}
