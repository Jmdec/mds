// app/facilities/page.tsx
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
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

// Icon mapping from names to components
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

// Helper function to construct image URLs with NEXT_PUBLIC_IMAGE_URL
function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  return imagePath.startsWith("http") ? imagePath : `${baseUrl}${imagePath}`;
}

// ── Image Modal ──────────────────────────────────────────────────────────────
type ModalState = { src: string; alt: string } | null;

function ImageModal({
  modal,
  onClose,
}: {
  modal: ModalState;
  onClose: () => void;
}) {
  // Close on Escape key
  useEffect(() => {
    if (!modal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modal, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (modal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);

  return (
    <AnimatePresence>
      {modal && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
          onClick={onClose}
        >
          <motion.div
            key="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-2xl w-full aspect-video bg-white rounded-xl overflow-hidden"
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
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Facilities() {
  const [modal, setModal] = useState<ModalState>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/facilities");

        if (!response.ok) {
          throw new Error("Failed to fetch facilities");
        }

        const data: FacilityData[] = await response.json();

        // Map icon names to actual components
        const mappedFacilities = data.map((f) => ({
          ...f,
          icon: iconMap[f.icon_name] || Wind,
        }));

        setFacilities(mappedFacilities);
      } catch (err) {
        console.error("[v0] Error fetching facilities:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const openModal = useCallback((src: string, alt: string) => {
    setModal({ src, alt });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  if (loading) {
    return (
      <div className="bg-[#020617] min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading facilities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#020617] min-h-screen flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#020617] text-white overflow-hidden">
      <ImageModal modal={modal} onClose={closeModal} />

      {/* ── Header ── */}
      <header className="relative border-b border-white/5 px-6 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fade}>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Our Facilities
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl">
              Equipped with state-of-the-art technology and comprehensive safety
              protocols
            </p>
          </motion.div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <motion.section {...fade} className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {facilities.map((f) => (
              <Link
                key={f.id}
                href={`#${f.id}`}
                className="px-4 py-3 whitespace-nowrap text-sm font-medium border-b-2 border-transparent hover:border-white/20 transition-colors"
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Facility Sections ── */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-0">
        {facilities.map((f, i) => {
          const Icon = f.icon;
          const isEven = i % 2 === 0;

          return (
            <motion.section
              key={f.id}
              id={f.id}
              {...fade}
              className={`grid lg:grid-cols-2 gap-16 items-center py-20 ${
                i < facilities.length - 1 ? "border-b border-white/5" : ""
              }`}
            >
              {/* Image Column */}
              <div className={isEven ? "lg:order-1" : "lg:order-2"}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group"
                >
                  {f.image_url ? (
                    <>
                      <Image
                        src={getImageUrl(f.image_url) || ""}
                        alt={f.name}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() =>
                          openModal(getImageUrl(f.image_url) || "", f.name)
                        }
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <ZoomIn className="w-8 h-8 text-white" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <span className="text-slate-600">No image</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Content Column */}
              <div className={isEven ? "lg:order-2" : "lg:order-1"}>
                {/* Label */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`p-3 rounded-lg ${
                      f.accent === "cyan" ? "bg-cyan-500/20" : "bg-blue-500/20"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        f.accent === "cyan" ? "text-cyan-400" : "text-blue-400"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-widest ${
                      f.accent === "cyan" ? "text-cyan-400" : "text-blue-400"
                    }`}
                  >
                    {f.label}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-4xl font-bold mb-4 leading-tight">
                  {f.name}
                </h2>

                {/* Description */}
                <p className="text-base text-slate-400 mb-8 leading-relaxed">
                  {f.description}
                </p>

                {/* Bullets */}
                <ul className="space-y-3 mb-12">
                  {f.bullets.map((bullet, j) => (
                    <li key={j} className="flex gap-3 items-start">
                      <span
                        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                          f.accent === "cyan"
                            ? "bg-cyan-500/30 text-cyan-400"
                            : "bg-blue-500/30 text-blue-400"
                        }`}
                      >
                        ✓
                      </span>
                      <span className="text-slate-300">{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {/* <Link href="/book">
                  <Button className="group">
                    Book a Consultation
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link> */}
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* ── CTA Section ── */}
      <motion.section
        {...fade}
        className="border-t border-white/5 bg-gradient-to-b from-white/5 to-transparent"
      >
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experience Excellence
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
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
