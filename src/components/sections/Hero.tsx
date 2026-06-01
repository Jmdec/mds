"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Shield,
  Award,
  Users,
  Star,
  Sparkles,
  Smile,
  Heart,
  Zap,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

// Map icon name strings from API to Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Smile,
  Shield,
  Heart,
  Zap,
  Star,
  Award,
  Users,
};

// Fallback icon list in order, used when API doesn't provide an icon name
const FALLBACK_ICONS: React.ElementType[] = [
  Sparkles,
  Smile,
  Shield,
  Heart,
  Zap,
  Star,
  Award,
  Users,
];

interface Service {
  id: number;
  name: string;
  description: string;
  icon?: string;
  price?: number;
  duration?: number;
  category?: string;
}

interface ServicesApiResponse {
  data: Service[];
}

function normalizeServices(raw: unknown): Service[] {
  if (Array.isArray(raw)) return raw as Service[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as Service[];
    if (Array.isArray(obj.services)) return obj.services as Service[];
  }
  return [];
}

const stats = [
  { value: "15K+", label: "Patients Treated" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "12+", label: "Years Experience" },
  { value: "25+", label: "Specialists" },
];

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        if (!res.ok) throw new Error("Failed to fetch services");
        const raw: unknown = await res.json();
        setServices(normalizeServices(raw));
      } catch (err) {
        console.error(err);
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    }
    fetchServices();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0B1220] to-[#020617]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade}>
            <p className="text-cyan-400 text-sm uppercase tracking-[0.3em] mb-6">
              {"MDS Dental & Aesthetic Clinic"}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.1] mb-6">
              {"Advanced Dental & Aesthetic Care"}
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-lg mb-10">
              Where clinical precision meets aesthetic excellence. Experience
              healthcare engineered for results and designed for beauty.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/book">
                <Button
                  size="lg"
                  className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-medium px-8 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all"
                >
                  Book Appointment <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-medium px-8 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all"
                >
                  Explore Services
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            {...fade}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <Image
              src="https://media.base44.com/images/public/6a13e4d0cd3364a569f6bbfc/a9409cf0e_generated_09de69c2.png"
              alt="MDS Clinic interior"
              width={600}
              height={450}
              className="rounded-2xl shadow-2xl shadow-cyan-400/5 border border-white/5"
            />
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-white/5 bg-[#0B1220]/50">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              {...fade}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-cyan-400 font-serif">
                {s.value}
              </p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Preview — dynamic */}
      <section className="bg-[#F8FAFC] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fade} className="text-center mb-16">
            <p className="text-blue-600 text-sm uppercase tracking-[0.3em] mb-3">
              Our Expertise
            </p>
            <h2 className="font-serif text-4xl text-slate-900">
              Precision Services
            </h2>
          </motion.div>

          {/* Loading state */}
          {servicesLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Empty state */}
          {!servicesLoading && services.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              No services available at the moment.
            </div>
          )}

          {/* Service cards */}
          {!servicesLoading && services.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s, i) => {
                // Resolve icon: use API-provided name → fallback cycle
                const IconComponent =
                  (s.icon && ICON_MAP[s.icon]) ||
                  FALLBACK_ICONS[i % FALLBACK_ICONS.length];

                return (
                  <motion.div
                    key={s.id}
                    {...fade}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="p-6 bg-white border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/5 transition-all group cursor-pointer h-full flex flex-col">
                      <IconComponent
                        className="text-blue-600 mb-4 shrink-0"
                        size={28}
                      />

                      <h3 className="font-serif text-lg text-slate-900 mb-2">
                        {s.name}
                      </h3>

                      <p className="text-slate-500 text-sm leading-relaxed flex-1">
                        {s.description}
                      </p>

                      {/* Optional price / duration badges */}
                      {(s.price !== undefined || s.duration !== undefined) && (
                        <div className="flex gap-3 mt-3 flex-wrap">
                          {s.price !== undefined && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                              ₱{Number(s.price).toLocaleString("en-PH")}
                            </span>
                          )}
                          {s.duration !== undefined && (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                              {s.duration} min
                            </span>
                          )}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* View all services link */}
          {!servicesLoading && services.length > 0 && (
            <motion.div {...fade} className="text-center mt-12">
              <Link href="/services">
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                >
                  View All Services <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Why Choose */}
      <section className="bg-[#020617] py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/5 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fade}>
            <Image
              src="https://media.base44.com/images/public/6a13e4d0cd3364a569f6bbfc/e2e277e3f_generated_49286962.png"
              alt="MDS Clinic"
              width={600}
              height={450}
              className="rounded-2xl border border-white/5"
            />
          </motion.div>
          <motion.div {...fade} transition={{ delay: 0.2 }}>
            <p className="text-cyan-400 text-sm uppercase tracking-[0.3em] mb-3">
              Why MDS Clinic
            </p>
            <h2 className="font-serif text-4xl text-white mb-8">
              Engineered for Excellence
            </h2>
            {[
              {
                icon: Award,
                title: "Board-Certified Specialists",
                desc: "Every procedure performed by verified experts with 10+ years of experience.",
              },
              {
                icon: Shield,
                title: "State-of-the-Art Technology",
                desc: "3D imaging, laser systems, and AI-assisted diagnostics for unmatched precision.",
              },
              {
                icon: Users,
                title: "Patient-First Philosophy",
                desc: "Personalized treatment plans designed around your unique goals and comfort.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0">
                  <item.icon size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}

      {/* Final CTA */}
      <section className="bg-[#020617] py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-transparent to-blue-600/5" />
        <motion.div
          {...fade}
          className="relative max-w-3xl mx-auto px-6 text-center"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">
            Ready to Transform Your Smile?
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Book your consultation today and take the first step toward clinical
            excellence.
          </p>
          <Link href="/book">
            <Button
              size="lg"
              className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-medium px-10 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all"
            >
              Book Your Appointment <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
