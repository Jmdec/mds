// app/about/page.tsx

"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Microscope,
  Cpu,
  ScanLine,
  HeartPulse,
  Target,
  Eye,
  GraduationCap,
  Stethoscope,
  Award,
  Star,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type Credential = {
  icon: string;
  label: string;
  value: string;
  sub: string;
};

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

type Stat = {
  value: string;
  label: string;
};

type TimelineItem = {
  id: number;
  year: string;
  title: string;
  description: string;
  sort_order: number;
};

type TechItem = {
  id: number;
  icon_name: string;
  name: string;
  description: string;
  sort_order: number;
};

type AboutData = {
  hero_heading: string;
  hero_subheading: string;
  mission: string;
  vision: string;
  cta_heading: string;
  cta_subheading: string;
  stats: Stat[];
  doctor: DoctorProfile | null;
  timeline: TimelineItem[];
  tech: TechItem[];
};

/* ─────────────────────────────────────────
   ICON MAP
───────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  Microscope,
  Cpu,
  ScanLine,
  HeartPulse,
  GraduationCap,
  Stethoscope,
  Award,
  Star,
};

function DynamicIcon({
  name,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = ICON_MAP[name] ?? Stethoscope;
  return <Icon {...props} />;
}

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

/* ─────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────── */
const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
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

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function About() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/about", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: AboutData) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-[#020617] min-h-screen flex items-center justify-center">
        <Loader2 className="text-cyan-400 animate-spin" size={32} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#020617] min-h-screen flex items-center justify-center">
        <p className="text-slate-500 text-sm">Failed to load page data.</p>
      </div>
    );
  }

  const { doctor, stats, timeline, tech } = data;

  return (
    <div className="bg-[#020617] min-h-screen">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-400/5 rounded-full blur-[120px]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[160px] md:text-[220px] font-black text-white/[0.02] leading-none tracking-tighter">
            MDS
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div {...fade} className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-cyan-400" />
              <p className="text-cyan-400 text-xs uppercase tracking-[0.3em]">
                About MDS Clinic
              </p>
            </div>
            <h1
              className="font-serif text-5xl md:text-7xl text-white leading-[1.05] mb-6"
              dangerouslySetInnerHTML={{ __html: data.hero_heading ?? "" }}
            />
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              {data.hero_subheading}
            </p>
          </motion.div>

          {/* Stats */}
          {stats.length > 0 && (
            <motion.div
              {...fade}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-px mt-16 bg-white/10 border border-white/10 rounded-2xl overflow-hidden"
            >
              {stats.map((s, i) => (
                <div key={i} className="bg-[#020617] px-6 py-6 text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">
                    {s.value}
                  </div>
                  <div className="text-slate-500 text-xs uppercase tracking-widest">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Founder ── */}
      {doctor && (
        <section className="relative py-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-cyan-400/3 to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 py-20">
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
                    {doctor.image_url && (
                      <Image
                        src={doctor.image_url}
                        alt={doctor.name}
                        fill
                        className="object-cover object-top"
                        priority
                      />
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
                      &ldquo;
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
                        {stats[2]?.value ?? "15,000+"}
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
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ── Mission / Vision ── */}
      {(data.mission || data.vision) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-6">
              {data.mission && (
                <motion.div {...fade}>
                  <div className="relative p-8 bg-white/5 border border-white/10 rounded-2xl h-full overflow-hidden group hover:border-cyan-400/30 transition-colors">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400/5 rounded-full blur-2xl group-hover:bg-cyan-400/10 transition-colors" />
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-5">
                        <Target className="text-cyan-400" size={18} />
                      </div>
                      <h3 className="font-serif text-2xl text-white mb-3">
                        Our Mission
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-sm">
                        {data.mission}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {data.vision && (
                <motion.div {...fade} transition={{ delay: 0.1 }}>
                  <div className="relative p-8 bg-white/5 border border-white/10 rounded-2xl h-full overflow-hidden group hover:border-cyan-400/30 transition-colors">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/5 rounded-full blur-2xl group-hover:bg-blue-400/10 transition-colors" />
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center mb-5">
                        <Eye className="text-blue-400" size={18} />
                      </div>
                      <h3 className="font-serif text-2xl text-white mb-3">
                        Our Vision
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-sm">
                        {data.vision}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Technology ── */}
      {tech.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div {...fade} className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-cyan-400" />
                <p className="text-cyan-400 text-xs uppercase tracking-[0.3em]">
                  Technology
                </p>
              </div>
              <h2 className="font-serif text-3xl text-white">
                Precision Equipment
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tech.map((t, i) => (
                <motion.div
                  key={t.id}
                  {...fade}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl h-full hover:bg-white/[0.07] hover:border-white/20 transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 transition-colors">
                      <DynamicIcon
                        name={t.icon_name}
                        className="text-cyan-400"
                        size={18}
                      />
                    </div>
                    <h3 className="text-white font-medium text-sm mb-1.5">
                      {t.name}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Timeline ── */}
      {timeline.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div {...fade} className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-cyan-400" />
                <p className="text-cyan-400 text-xs uppercase tracking-[0.3em]">
                  Our Journey
                </p>
              </div>
              <h2 className="font-serif text-3xl text-white">
                Timeline of Excellence
              </h2>
            </motion.div>

            <div className="relative">
              <div className="absolute left-[72px] top-0 bottom-0 w-px bg-white/10" />
              <div className="space-y-0">
                {timeline.map((t, i) => (
                  <motion.div
                    key={t.id}
                    {...fade}
                    transition={{ delay: i * 0.08 }}
                    className="relative flex items-start gap-6 group"
                  >
                    <div className="w-[72px] shrink-0 pt-5 text-right">
                      <span className="text-cyan-400 font-mono text-xs font-semibold">
                        {t.year}
                      </span>
                    </div>
                    <div className="relative shrink-0 mt-5">
                      <div className="w-3 h-3 rounded-full border-2 border-cyan-400/50 bg-[#020617] group-hover:border-cyan-400 group-hover:bg-cyan-400/20 transition-all" />
                    </div>
                    <div className="flex-1 py-4 border-b border-white/5 group-hover:border-white/10 transition-colors">
                      <h3 className="text-white font-medium text-sm mb-0.5">
                        {t.title}
                      </h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      {(data.cta_heading || data.cta_subheading) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              {...fade}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-12 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-blue-600/5" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-cyan-400/10 rounded-full blur-[80px]" />
              <div className="relative">
                <p className="text-cyan-400 text-xs uppercase tracking-[0.3em] mb-3">
                  Get Started
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">
                  {data.cta_heading}
                </h2>
                <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
                  {data.cta_subheading}
                </p>
                <Link href="/book">
                  <Button
                    size="lg"
                    className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 px-8 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all font-medium"
                  >
                    Book Consultation <ArrowRight className="ml-2" size={16} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
