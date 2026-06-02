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
  GraduationCap,
  Stethoscope,
  MapPin,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const slideLeft = {
  initial: { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const slideRight = {
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

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

const CREDENTIAL_ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  Stethoscope,
  Star,
  Award,
};

function CredentialIcon({
  name,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = CREDENTIAL_ICON_MAP[name] ?? Award;
  return <Icon {...props} />;
}

interface Service {
  id: number;
  name: string;
  description: string;
  icon?: string;
  price?: number;
  duration?: number;
  category?: string;
}

type Credential = {
  icon: string;
  label: string;
  value: string;
  sub: string;
};

type Stat = { value: string; label: string };

type DoctorProfile = {
  name: string;
  title: string;
  role: string;
  bio: string;
  quote: string;
  location: string;
  since_year: string;
  image_url: string | null;
  credentials: Credential[];
};

type AboutData = {
  stats: Stat[];
  doctor: DoctorProfile | null;
};

function normalizeServices(raw: unknown): Service[] {
  if (Array.isArray(raw)) return raw as Service[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as Service[];
    if (Array.isArray(obj.services)) return obj.services as Service[];
  }
  return [];
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [about, setAbout] = useState<AboutData | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((raw) => setServices(normalizeServices(raw)))
      .catch(console.error)
      .finally(() => setServicesLoading(false));

    fetch("/api/about", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: AboutData) => setAbout(d))
      .catch(console.error);
  }, []);

  const stats: Stat[] = about?.stats?.length
    ? about.stats
    : [
        { value: "15K+", label: "Patients Treated" },
        { value: "98%", label: "Satisfaction Rate" },
        { value: "12+", label: "Years Experience" },
        { value: "25+", label: "Specialists" },
      ];

  const doctor = about?.doctor ?? null;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0B1220] to-[#020617]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade}>
            <p className="text-cyan-400 text-sm uppercase tracking-[0.3em] mb-6">
              MDS Dental & Aesthetic Clinic
            </p>
            <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.1] mb-6">
              Advanced Dental & Aesthetic Care
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

      {/* ── Trust Bar ── */}
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

      {/* ── Meet the Founder ── */}
      {doctor && (
        <section className="relative bg-[#020617] py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-cyan-400/3 to-transparent pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6">
            <motion.div {...fade} className="flex items-center gap-3 mb-14">
              <div className="h-px w-8 bg-cyan-400" />
              <p className="text-cyan-400 text-xs uppercase tracking-[0.3em]">
                Meet the Founder
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-0 items-stretch">
              {/* Photo */}
              <motion.div {...slideLeft} className="lg:col-span-5 relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-cyan-400/40 rounded-tl-xl pointer-events-none z-10" />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-cyan-400/20 rounded-br-xl pointer-events-none z-10" />

                <div className="relative rounded-2xl overflow-hidden border border-white/10 h-full min-h-[520px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900">
                    {doctor.image_url ? (
                      <Image
                        src={doctor.image_url}
                        alt={doctor.name}
                        fill
                        className="object-cover object-top"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-transparent" />
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400" />

                  {/* Badges */}
                  <div className="absolute top-5 right-5 flex items-center gap-2 bg-[#020617]/80 backdrop-blur-sm border border-cyan-400/30 rounded-xl px-3 py-2">
                    <Calendar size={12} className="text-cyan-400" />
                    <span className="text-cyan-400 text-xs font-mono">
                      Since {doctor.since_year} ·{" "}
                      {new Date().getFullYear() -
                        parseInt(doctor.since_year ?? "0")}
                      + yrs
                    </span>
                  </div>
                  <div className="absolute top-14 right-5 flex items-center gap-2 bg-[#020617]/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="text-slate-400 text-xs">
                      {doctor.location}
                    </span>
                  </div>

                  {/* Name plate */}
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <p className="text-white font-serif text-2xl leading-tight mb-1">
                      {doctor.name}
                    </p>
                    <p className="text-cyan-400 text-xs uppercase tracking-[0.2em] mt-2">
                      {doctor.title}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">{doctor.role}</p>
                  </div>
                </div>
              </motion.div>

              {/* Bio + Credentials */}
              <motion.div
                {...slideRight}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="lg:col-span-7 lg:pl-12 flex flex-col gap-6 justify-center pt-8 lg:pt-0"
              >
                {/* Quote */}
                {doctor.quote && (
                  <div className="relative p-8 bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden group hover:border-cyan-400/30 transition-colors">
                    <div className="absolute top-0 right-0 w-52 h-52 bg-cyan-400/5 rounded-full blur-3xl group-hover:bg-cyan-400/10 transition-colors" />
                    <span className="absolute top-2 left-6 text-7xl font-serif text-cyan-400/20 leading-none select-none">
                      "
                    </span>
                    <div className="relative pt-6">
                      <p className="text-slate-200 text-base leading-relaxed italic mb-5">
                        {doctor.quote}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-cyan-400/50" />
                        <p className="text-slate-500 text-sm">
                          — {doctor.name.split(" ").slice(0, 2).join(" ")} ·
                          Founder, MDS Dental & Aesthetic Clinic
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bio */}
                {doctor.bio && (
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {doctor.bio}
                  </p>
                )}

                {/* Credentials */}
                {doctor.credentials?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {doctor.credentials.map((c, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.07, duration: 0.4 }}
                      >
                        <div className="flex items-start gap-4 p-5 bg-white/[0.03] border border-white/10 rounded-xl hover:border-cyan-400/30 hover:bg-white/[0.06] transition-all group cursor-default">
                          <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-400/20 transition-colors">
                            <CredentialIcon
                              name={c.icon}
                              className="text-cyan-400"
                              size={17}
                            />
                          </div>
                          <div>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-0.5">
                              {c.label}
                            </p>
                            <p className="text-white text-sm font-medium leading-snug">
                              {c.value}
                            </p>
                            <p className="text-slate-500 text-xs mt-0.5">
                              {c.sub}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Trust bar */}
                {stats.length >= 3 && (
                  <div className="flex items-center gap-6 pt-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className="text-cyan-400 fill-cyan-400"
                          />
                        ))}
                      </div>
                      <span className="text-slate-400 text-xs">
                        {stats[3]?.value ?? "4.9"} average rating
                      </span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="text-slate-400 text-xs">
                      <span className="text-white font-medium">
                        {stats[0]?.value ?? "15K+"}
                      </span>{" "}
                      patients treated
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="text-slate-400 text-xs">
                      <span className="text-white font-medium">
                        {stats[1]?.value ?? "98%"}
                      </span>{" "}
                      satisfaction rate
                    </div>
                  </div>
                )}

                <Link href="/about">
                  <Button
                    variant="outline"
                    className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 w-fit transition-all"
                  >
                    Learn More About Us{" "}
                    <ArrowRight size={15} className="ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ── Services Preview ── */}
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

          {servicesLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {!servicesLoading && services.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              No services available at the moment.
            </div>
          )}

          {!servicesLoading && services.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s, i) => {
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

      {/* ── Why Choose ── */}
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

      {/* ── Final CTA ── */}
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
