"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Wind,
  ShieldCheck,
  Droplets,
  HeartPulse,
  ScanLine,
  Zap,
  X,
  ZoomIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45 },
};

const iconMap: { [key: string]: React.ElementType } = {
  Wind,
  Zap,
  ShieldCheck,
  Droplets,
  HeartPulse,
  ScanLine,
};

type Facility = {
  id: string;
  icon: React.ElementType;
  label: string;
  image_url: string;
  name: string;
  description: string;
  bullets: string[];
  accent: "cyan" | "blue";
};

type FacilityData = {
  id: string;
  icon_name: string;
  label: string;
  image_url: string;
  name: string;
  description: string;
  bullets: string[];
  accent: "cyan" | "blue";
};

function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  return imagePath.startsWith("http") ? imagePath : `${baseUrl}${imagePath}`;
}

type ModalState = { src: string; alt: string } | null;

function ImageModal({
  modal,
  onClose,
}: {
  modal: ModalState;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!modal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modal, onClose]);

  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);

  return (
    <AnimatePresence>
      {modal && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          onClick={onClose}
        >
          <motion.div
            key="content"
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.93, opacity: 0 }}
            className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
            style={{ aspectRatio: "16/9" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={modal.src}
              alt={modal.alt}
              fill
              className="object-cover"
              priority
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg transition-colors z-10"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Facilities() {
  const [modal, setModal] = useState<ModalState>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch("/api/facilities");
        if (!response.ok) throw new Error("Failed to fetch facilities");
        const data: FacilityData[] = await response.json();
        setFacilities(
          data.map((f) => ({ ...f, icon: iconMap[f.icon_name] || Wind })),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  const openModal = useCallback(
    (src: string, alt: string) => setModal({ src, alt }),
    [],
  );
  const closeModal = useCallback(() => setModal(null), []);

  if (loading) {
    return (
      <div className="bg-[#020617] min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading facilities…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#020617] min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-sm">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#020617] text-white">
      <ImageModal modal={modal} onClose={closeModal} />

      {/* ── Header ── */}
      <header className="border-b border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fade}>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Our Facilities
            </h1>
            <p className="text-sm text-slate-400 max-w-lg">
              Equipped with state-of-the-art technology and comprehensive safety
              protocols
            </p>
          </motion.div>
        </div>
      </header>

      {/* ── Tab Bar ── */}
      <div className="border-b border-white/5 sticky top-0 z-30 bg-[#020617]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex overflow-x-auto">
            {facilities.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.id}
                  href={`#${f.id}`}
                  className="flex items-center gap-1.5 px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-500 hover:text-slate-200 border-b-2 border-transparent hover:border-white/20 transition-all"
                >
                  <Icon className="w-3 h-3" />
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Facility Rows ── */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-4">
        {facilities.map((f, i) => {
          const Icon = f.icon;
          const isEven = i % 2 === 0;
          const isCyan = f.accent === "cyan";
          const imgSrc = getImageUrl(f.image_url);

          return (
            <motion.section
              key={f.id}
              id={f.id}
              {...fade}
              className="flex flex-col lg:flex-row gap-0 rounded-2xl overflow-hidden border border-white/8 bg-white/[0.02]"
            >
              {/* Image — fixed height, fixed width on desktop */}
              <div
                className={`relative shrink-0 w-full lg:w-72 xl:w-80 h-48 lg:h-auto ${
                  isEven ? "lg:order-1" : "lg:order-2"
                }`}
              >
                {imgSrc ? (
                  <>
                    <Image
                      src={imgSrc}
                      alt={f.name}
                      fill
                      className="object-cover"
                    />
                    {/* subtle tint */}
                    <div
                      className={`absolute inset-0 ${
                        isCyan
                          ? "bg-gradient-to-br from-cyan-900/40 to-transparent"
                          : "bg-gradient-to-br from-blue-900/40 to-transparent"
                      }`}
                    />
                    <button
                      onClick={() => openModal(imgSrc, f.name)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity"
                    >
                      <ZoomIn className="w-6 h-6 text-white drop-shadow" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <span className="text-slate-600 text-xs">No image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div
                className={`flex flex-col justify-center px-6 py-6 gap-3 flex-1 ${
                  isEven ? "lg:order-2" : "lg:order-1"
                }`}
              >
                {/* Icon + label */}
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-md ${
                      isCyan ? "bg-cyan-500/15" : "bg-blue-500/15"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isCyan ? "text-cyan-400" : "text-blue-400"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      isCyan ? "text-cyan-400" : "text-blue-400"
                    }`}
                  >
                    {f.label}
                  </span>
                </div>

                {/* Title + description */}
                <div>
                  <h2 className="text-lg font-bold leading-tight mb-1">
                    {f.name}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {f.description}
                  </p>
                </div>

                {/* Bullets — always 2 columns */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {f.bullets.map((bullet, j) => (
                    <li key={j} className="flex gap-2 items-start">
                      <span
                        className={`shrink-0 mt-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isCyan
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        ✓
                      </span>
                      <span className="text-xs text-slate-300 leading-snug">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* ── CTA ── */}
      <motion.section {...fade} className="border-t border-white/5">
        <div className="max-w-xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl font-bold mb-2">Experience Excellence</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Our commitment to safety, innovation, and patient care is evident in
            every aspect of our clinic
          </p>
          <Link href="/book">
            <Button size="lg" className="group">
              Schedule Your Visit
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
