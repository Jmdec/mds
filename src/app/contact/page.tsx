"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const inputClass =
  "bg-white/10 border-blue-500/30 text-white placeholder:text-slate-400 focus:border-cyan-400 focus-visible:ring-0 focus-visible:ring-offset-0";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const info = [
    { icon: Phone, label: "Phone", value: "+63 912 345 6789" },
    { icon: Mail, label: "Email", value: "info@clinic.com" },
    { icon: MapPin, label: "Address", value: "Mabini Batangas, Philippines" },
    { icon: Clock, label: "Hours", value: "Mon–Sat: 9AM–6PM" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name"),
      email: form.get("email"),
      subject: form.get("subject"),
      message: form.get("message"),
    };

    try {
      await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSent(true);
    } catch (err: unknown) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      {/* HERO */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#050816] to-cyan-900/10" />
        <div className="absolute top-20 left-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div {...fade}>
            <p className="text-cyan-400 text-sm uppercase tracking-[0.3em] mb-4">
              Contact
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
              Get In Touch
            </h1>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">
              Premium care starts with a conversation. Let&apos;s build your
              journey together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
          {/* FORM */}
          <motion.div {...fade}>
            <Card className="p-8 bg-white/5 border border-blue-500/20 backdrop-blur-xl shadow-[0_0_40px_rgba(0,100,255,0.08)] rounded-2xl">
              {sent ? (
                <div className="text-center py-12">
                  <CheckCircle
                    className="text-cyan-400 mx-auto mb-4"
                    size={42}
                  />
                  <h3 className="text-2xl font-semibold">Message Sent</h3>
                  <p className="text-slate-400 mt-2">
                    We&apos;ll respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-2xl font-semibold text-white mb-6">
                    Send a Message
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">Name</Label>
                      <Input
                        name="name"
                        required
                        placeholder="Juan dela Cruz"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">Email</Label>
                      <Input
                        name="email"
                        type="email"
                        required
                        placeholder="juan@email.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Subject</Label>
                    <Input
                      name="subject"
                      required
                      placeholder="Appointment inquiry"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Message</Label>
                    <Textarea
                      name="message"
                      rows={5}
                      required
                      placeholder="Write your message here..."
                      className={inputClass}
                    />
                  </div>

                  <Button
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20"
                  >
                    {loading ? "Sending..." : "Send Message"}
                    <Send size={16} className="ml-2" />
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>

          {/* INFO */}
          <motion.div
            {...fade}
            transition={{ delay: 0.15 }}
            className="space-y-6"
          >
            {info.map((item, i) => (
              <Card
                key={i}
                className="p-5 flex gap-4 bg-white/5 border border-blue-500/20 backdrop-blur-xl rounded-2xl hover:border-cyan-400/40 transition"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-400/20 shrink-0">
                  <item.icon size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-300">
                    {item.label}
                  </h4>
                  <p className="text-sm text-slate-400 whitespace-pre-line">
                    {item.value}
                  </p>
                </div>
              </Card>
            ))}

            {/* MAP */}
            <Card className="overflow-hidden bg-white/5 border border-blue-500/20 backdrop-blur-xl rounded-2xl">
              <div className="h-52 flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-cyan-900/10">
                <div className="text-center">
                  <MapPin className="text-cyan-400 mx-auto mb-2" size={34} />
                  <p className="text-slate-400 text-sm">
                    Clinic Location Preview
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
