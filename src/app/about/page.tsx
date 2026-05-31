'use client'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Microscope, Cpu, ScanLine, HeartPulse, Target, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const fade = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const timeline = [
  { year: '2014', title: 'Clinic Founded', desc: 'MDS Dental and Aesthetic Clinic established with a vision for precision healthcare.' },
  { year: '2016', title: 'Aesthetic Division', desc: 'Expanded into aesthetic medicine, bridging dental and cosmetic care.' },
  { year: '2019', title: 'AI Diagnostics', desc: 'Introduced AI-assisted diagnostics and 3D imaging technology.' },
  { year: '2022', title: 'Regional Excellence Award', desc: 'Recognized as the top dental and aesthetic clinic in the metropolitan area.' },
  { year: '2025', title: '15,000 Patients', desc: 'Milestone of 15,000 successful treatments with a 98% satisfaction rate.' },
];

const tech = [
  { icon: Microscope, name: '3D Cone Beam CT', desc: 'Ultra-precise imaging for implants and surgical planning.' },
  { icon: Cpu, name: 'AI Diagnostics', desc: 'Machine learning algorithms for early detection and treatment planning.' },
  { icon: ScanLine, name: 'Digital Intraoral Scanner', desc: 'Impressionless scanning for crowns, aligners, and restorations.' },
  { icon: HeartPulse, name: 'Laser Systems', desc: 'Minimally invasive laser procedures for soft tissue treatments.' },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-24 bg-[#020617] overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-cyan-400/5 rounded-full blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div {...fade} className="max-w-3xl">
            <p className="text-cyan-400 text-sm uppercase tracking-[0.3em] mb-4">About MDS Clinic</p>
            <h1 className="font-serif text-5xl md:text-6xl text-white leading-[1.1] mb-6">{"Where Science Meets Aesthetic Precision"}</h1>
            <p className="text-slate-400 text-lg leading-relaxed">{"Founded on the principle that healthcare should be both technically flawless and aesthetically refined, MDS Dental & Aesthetic Clinic represents the convergence of medical science and design thinking."}</p>
          </motion.div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="bg-[#F8FAFC] py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <motion.div {...fade}>
            <Card className="p-8 bg-white border-slate-200 h-full">
              <Target className="text-blue-600 mb-4" size={28} />
              <h3 className="font-serif text-2xl text-slate-900 mb-4">Our Mission</h3>
              <p className="text-slate-500 leading-relaxed">{"To deliver healthcare that is engineered with surgical precision and designed with aesthetic intelligence — ensuring every patient leaves with measurable results and renewed confidence."}</p>
            </Card>
          </motion.div>
          <motion.div {...fade} transition={{ delay: 0.1 }}>
            <Card className="p-8 bg-white border-slate-200 h-full">
              <Eye className="text-blue-600 mb-4" size={28} />
              <h3 className="font-serif text-2xl text-slate-900 mb-4">Our Vision</h3>
              <p className="text-slate-500 leading-relaxed">{"To redefine the standard of dental and aesthetic care globally — creating a model where technology, empathy, and artistry converge to produce outcomes that were previously impossible."}</p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Technology */}
      <section className="bg-[#020617] py-24 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div {...fade} className="text-center mb-16">
            <p className="text-cyan-400 text-sm uppercase tracking-[0.3em] mb-3">Technology</p>
            <h2 className="font-serif text-4xl text-white">Precision Equipment</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tech.map((t, i) => (
              <motion.div key={i} {...fade} transition={{ delay: i * 0.1 }}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm h-full">
                  <t.icon className="text-cyan-400 mb-3" size={24} />
                  <h3 className="text-white font-medium mb-2">{t.name}</h3>
                  <p className="text-slate-500 text-sm">{t.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-[#F8FAFC] py-24">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fade} className="text-center mb-16">
            <p className="text-blue-600 text-sm uppercase tracking-[0.3em] mb-3">Our Journey</p>
            <h2 className="font-serif text-4xl text-slate-900">Timeline of Excellence</h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-slate-200" />
            {timeline.map((t, i) => (
              <motion.div key={i} {...fade} transition={{ delay: i * 0.1 }} className={`relative flex items-start gap-8 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} hidden md:block`}>
                  <p className="text-cyan-600 font-serif text-lg">{t.year}</p>
                  <h3 className="text-slate-900 font-medium">{t.title}</h3>
                  <p className="text-slate-500 text-sm mt-1">{t.desc}</p>
                </div>
                <div className="relative z-10 w-8 h-8 rounded-full bg-blue-600 border-4 border-[#F8FAFC] shrink-0" />
                <div className="flex-1 md:hidden">
                  <p className="text-cyan-600 font-serif text-lg">{t.year}</p>
                  <h3 className="text-slate-900 font-medium">{t.title}</h3>
                  <p className="text-slate-500 text-sm mt-1">{t.desc}</p>
                </div>
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#020617] py-20">
        <motion.div {...fade} className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl text-white mb-6">Experience the MDS Difference</h2>
          <Link href="/book">
            <Button size="lg" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 px-8 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all">
              Book Consultation <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}