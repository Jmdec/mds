"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Microscope,
  Cpu,
  ScanLine,
  HeartPulse,
  Target,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const timeline = [
  {
    year: "2014",
    title: "Clinic Founded",
    desc: "Established with a vision for precision healthcare.",
  },
  {
    year: "2016",
    title: "Aesthetic Division",
    desc: "Expanded into aesthetic medicine, bridging dental and cosmetic care.",
  },
  {
    year: "2019",
    title: "AI Diagnostics",
    desc: "Introduced AI-assisted diagnostics and 3D imaging technology.",
  },
  {
    year: "2022",
    title: "Regional Excellence Award",
    desc: "Recognized as the top dental and aesthetic clinic in the region.",
  },
  {
    year: "2025",
    title: "15,000 Patients",
    desc: "Milestone of 15,000 successful treatments with 98% satisfaction.",
  },
];

const tech = [
  {
    icon: Microscope,
    name: "3D Cone Beam CT",
    desc: "Ultra-precise imaging for implants and surgical planning.",
  },
  {
    icon: Cpu,
    name: "AI Diagnostics",
    desc: "Machine learning for early detection and treatment planning.",
  },
  {
    icon: ScanLine,
    name: "Digital Scanner",
    desc: "Impressionless scanning for crowns, aligners, and restorations.",
  },
  {
    icon: HeartPulse,
    name: "Laser Systems",
    desc: "Minimally invasive laser procedures for soft tissue treatments.",
  },
];

const stats = [
  { value: "15K+", label: "Patients Treated" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "11+", label: "Years of Excellence" },
  { value: "4.9★", label: "Average Rating" },
];

export default function About() {
  return (
    <div className="bg-[#020617] min-h-screen">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-400/5 rounded-full blur-[120px]" />
        </div>
        {/* Large background text */}
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
            <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.05] mb-6">
              Where Science Meets{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Aesthetic Precision
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              Founded on the principle that healthcare should be both
              technically flawless and aesthetically refined — MDS represents
              the convergence of medical science and design thinking.
            </p>
          </motion.div>

          {/* Stats row */}
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
        </div>
      </section>

      {/* ── Mission / Vision ── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
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
                    To deliver healthcare engineered with surgical precision and
                    designed with aesthetic intelligence — ensuring every
                    patient leaves with measurable results and renewed
                    confidence.
                  </p>
                </div>
              </div>
            </motion.div>
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
                    To redefine the standard of dental and aesthetic care
                    globally — creating a model where technology, empathy, and
                    artistry converge to produce outcomes previously impossible.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Technology ── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            {...fade}
            className="flex items-end justify-between mb-10 flex-wrap gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-cyan-400" />
                <p className="text-cyan-400 text-xs uppercase tracking-[0.3em]">
                  Technology
                </p>
              </div>
              <h2 className="font-serif text-3xl text-white">
                Precision Equipment
              </h2>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tech.map((t, i) => (
              <motion.div key={i} {...fade} transition={{ delay: i * 0.08 }}>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl h-full hover:bg-white/[0.07] hover:border-white/20 transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 transition-colors">
                    <t.icon className="text-cyan-400" size={18} />
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1.5">
                    {t.name}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
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
            {/* Vertical line */}
            <div className="absolute left-[72px] top-0 bottom-0 w-px bg-white/10" />

            <div className="space-y-0">
              {timeline.map((t, i) => (
                <motion.div
                  key={i}
                  {...fade}
                  transition={{ delay: i * 0.08 }}
                  className="relative flex items-start gap-6 group"
                >
                  {/* Year */}
                  <div className="w-[72px] shrink-0 pt-5 text-right">
                    <span className="text-cyan-400 font-mono text-xs font-semibold">
                      {t.year}
                    </span>
                  </div>

                  {/* Dot */}
                  <div className="relative shrink-0 mt-5">
                    <div className="w-3 h-3 rounded-full border-2 border-cyan-400/50 bg-[#020617] group-hover:border-cyan-400 group-hover:bg-cyan-400/20 transition-all" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 py-4 border-b border-white/5 group-hover:border-white/10 transition-colors">
                    <h3 className="text-white font-medium text-sm mb-0.5">
                      {t.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
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
                Experience the MDS Difference
              </h2>
              <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
                Join over 15,000 patients who trust MDS for their dental and
                aesthetic care.
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
    </div>
  );
}
