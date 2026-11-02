"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { LifeBuoy, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const submit = () => {
    if (!subject || !message) { toast.error("Fill all fields"); return; }
    toast.success("Complaint submitted. We'll get back soon.");
    setSubject(""); setMessage("");
  };
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-brand-navy">Customer Support</h2>
      <Card className="p-4 space-y-3">
        <div className="flex gap-3">
          <a href="tel:1800123456" className="flex-1 p-3 bg-green-50 rounded-xl text-center">
            <Phone className="mx-auto text-brand-green" size={20} />
            <div className="text-xs mt-1">Call Us</div>
          </a>
          <a href="mailto:support@indiatrip.in" className="flex-1 p-3 bg-blue-50 rounded-xl text-center">
            <Mail className="mx-auto text-brand-blue" size={20} />
            <div className="text-xs mt-1">Email</div>
          </a>
          <button className="flex-1 p-3 bg-red-50 rounded-xl text-center">
            <LifeBuoy className="mx-auto text-red-500" size={20} />
            <div className="text-xs mt-1">Emergency</div>
          </button>
        </div>
      </Card>
      <Card className="p-4 space-y-3">
        <h3 className="font-bold text-brand-navy">Raise a complaint</h3>
        <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <textarea
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green"
          rows={4}
          placeholder="Describe your issue"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button className="w-full" onClick={submit}>Submit</Button>
      </Card>
    </div>
  );
}
