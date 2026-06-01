"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const fade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

interface Service {
  id: number;
  title: string;
  desc: string;
  duration: string;
  image: string;
  status: string;
  category: string;
  price: number;
}

interface RawService {
  id: number;
  name: string;
  description?: string;
  duration?: string;
  image?: string;
  status: string;
  category: string;
  price: number;
}

export default function Services() {
  const [tab, setTab] = useState("Dental");
  const [search, setSearch] = useState("");
  const [dentalServices, setDentalServices] = useState<Service[]>([]);
  const [aestheticServices, setAestheticServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        const res = await fetch("/api/services?per_page=100", {
          cache: "no-store",
        });
        const data = await res.json();

        // Handle both flat array and paginated { data: [...] } shapes
        const raw: RawService[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.data)
              ? data.data.data
              : [];

        const formattedServices: Service[] = raw.map((s) => ({
          id: s.id,
          title: s.name,
          desc: s.description || "",
          duration: s.duration || "Varies",
          image: s.image
            ? s.image.startsWith("http")
              ? s.image
              : `${process.env.NEXT_PUBLIC_API_URL}${s.image}`
            : "/placeholder-service.jpg",
          status: s.status,
          category: s.category,
          price: s.price,
        }));

        setDentalServices(
          formattedServices.filter((s) => s.category === "Dental"),
        );
        setAestheticServices(
          formattedServices.filter((s) => s.category === "Aesthetic"),
        );
      } catch (error) {
        console.error("Failed to fetch services:", error);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const allItems = tab === "Dental" ? dentalServices : aestheticServices;

  const items = useMemo(() => {
    return allItems.filter(
      (s) =>
        search === "" ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.desc.toLowerCase().includes(search.toLowerCase()),
    );
  }, [allItems, search]);

  const handleTabChange = (val: string) => {
    setTab(val);
    setSearch("");
  };

  return (
    <div className="font-sans">
      {/* ── Hero ── */}
      <section
        className="relative pt-32 pb-20 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #03091A 0%, #071535 60%, #0A1F4E 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-[100px]" />
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.04]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div {...fade}>
            <span
              className="inline-block text-xs uppercase tracking-[0.35em] mb-5 px-4 py-1.5 rounded-full border"
              style={{
                color: "#93C5FD",
                borderColor: "rgba(147,197,253,0.25)",
                background: "rgba(59,130,246,0.08)",
              }}
            >
              Services
            </span>

            <h1
              className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight"
              style={{ color: "#EFF6FF" }}
            >
              The Aesthetic Index
            </h1>

            <div className="flex items-center justify-center gap-3 mb-6">
              <div
                className="h-px w-16"
                style={{
                  background: "linear-gradient(to right, transparent, #3B82F6)",
                }}
              />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <div
                className="h-px w-16"
                style={{
                  background: "linear-gradient(to left, transparent, #3B82F6)",
                }}
              />
            </div>

            <p
              className="text-base md:text-lg max-w-2xl mx-auto"
              style={{ color: "#94A3B8" }}
            >
              Comprehensive dental and aesthetic services, each
              precision-engineered for measurable results.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Filter + Cards ── */}
      <section className="py-24" style={{ background: "#F0F4FF" }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "#94A3B8" }}
              size={15}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search treatments..."
              className="pl-10 pr-10 h-11 rounded-xl border text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
              style={{
                background: "#fff",
                borderColor: "#BFDBFE",
                boxShadow: "0 1px 4px rgba(59,130,246,0.08)",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "#94A3B8" }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex rounded-xl p-1 gap-1"
              style={{ background: "#DBEAFE", border: "1px solid #BFDBFE" }}
            >
              {["Dental", "Aesthetic"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleTabChange(t)}
                  className="px-8 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={
                    tab === t
                      ? {
                          background:
                            "linear-gradient(135deg, #1D4ED8, #2563EB)",
                          color: "#fff",
                          boxShadow: "0 2px 12px rgba(37,99,235,0.35)",
                        }
                      : { color: "#3B82F6" }
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <p className="text-center text-sm mb-10" style={{ color: "#94A3B8" }}>
            {!loading &&
              `${items.length} treatment${items.length !== 1 ? "s" : ""} found`}
          </p>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab + search}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {/* Loading skeleton */}
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden animate-pulse"
                    style={{
                      background: "#fff",
                      border: "1px solid #DBEAFE",
                      boxShadow: "0 2px 12px rgba(59,130,246,0.06)",
                    }}
                  >
                    <div className="h-48 bg-blue-100/60" />
                    <div className="p-6 space-y-3">
                      <div className="h-3 w-1/3 rounded bg-blue-100" />
                      <div className="h-5 w-2/3 rounded bg-blue-100" />
                      <div className="h-3 w-full rounded bg-blue-50" />
                      <div className="h-3 w-4/5 rounded bg-blue-50" />
                    </div>
                  </div>
                ))}

              {/* Error state */}
              {!loading && fetchError && (
                <div className="col-span-3 text-center py-20">
                  <p className="text-lg mb-2" style={{ color: "#94A3B8" }}>
                    Failed to load services.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm hover:underline"
                    style={{ color: "#2563EB" }}
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!loading && !fetchError && items.length === 0 && (
                <div className="col-span-3 text-center py-20">
                  <p className="text-lg mb-2" style={{ color: "#94A3B8" }}>
                    No treatments found.
                  </p>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="text-sm hover:underline"
                      style={{ color: "#2563EB" }}
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}

              {/* Cards */}
              {!loading &&
                !fetchError &&
                items.map((s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div
                      className="group rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full"
                      style={{
                        background: "#fff",
                        border: "1px solid #DBEAFE",
                        boxShadow: "0 2px 12px rgba(59,130,246,0.06)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 8px 32px rgba(37,99,235,0.16), 0 0 0 1px #93C5FD";
                        e.currentTarget.style.borderColor = "#93C5FD";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 2px 12px rgba(59,130,246,0.06)";
                        e.currentTarget.style.borderColor = "#DBEAFE";
                      }}
                    >
                      {/* Image */}
                      <div className="h-48 overflow-hidden relative">
                        <Image
                          src={s.image}
                          alt={s.title}
                          width={400}
                          height={192}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder-service.jpg";
                          }}
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background:
                              "linear-gradient(180deg, transparent 40%, rgba(29,78,216,0.18) 100%)",
                          }}
                        />
                      </div>

                      {/* Body */}
                      <div className="p-6 flex flex-col flex-1">
                        <div
                          className="w-8 h-0.5 rounded-full mb-3 transition-all duration-300 group-hover:w-14"
                          style={{
                            background:
                              "linear-gradient(to right, #2563EB, #60A5FA)",
                          }}
                        />

                        <h3
                          className="font-serif text-xl mb-2 leading-snug"
                          style={{ color: "#0F172A" }}
                        >
                          {s.title}
                        </h3>

                        <p
                          className="text-sm leading-relaxed mb-4 flex-1"
                          style={{ color: "#64748B" }}
                        >
                          {s.desc}
                        </p>

                        {/* Duration + Price — now populated from API */}
                        <div className="flex items-center gap-3 mb-5">
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                            style={{
                              background: "#EFF6FF",
                              color: "#3B82F6",
                            }}
                          >
                            <Clock size={11} />
                            {s.duration}
                          </span>
                          {s.price > 0 && (
                            <span
                              className="text-xs font-semibold"
                              style={{ color: "#1D4ED8" }}
                            >
                              ₱{Number(s.price).toLocaleString()}+
                            </span>
                          )}
                        </div>

                        <div
                          className="flex items-center justify-between pt-4"
                          style={{ borderTop: "1px solid #EFF6FF" }}
                        >
                          <span
                            className="text-xs"
                            style={{ color: "#94A3B8" }}
                          >
                            {s.category}
                          </span>
                          <Link
                            href={`/book?service_id=${s.id}&service=${encodeURIComponent(s.title)}`}
                          >
                            <button
                              className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-200"
                              style={{
                                background:
                                  "linear-gradient(135deg, #1D4ED8, #2563EB)",
                                color: "#fff",
                                boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow =
                                  "0 4px 16px rgba(37,99,235,0.45)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow =
                                  "0 2px 8px rgba(37,99,235,0.25)";
                              }}
                            >
                              Book Now <ArrowRight size={13} />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #03091A 0%, #071535 60%, #0A1F4E 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(37,99,235,0.12) 0%, transparent 70%)",
            }}
          />
          <div className="absolute top-8 left-1/4 w-2 h-2 rounded-full bg-blue-400/40" />
          <div className="absolute bottom-12 right-1/3 w-1.5 h-1.5 rounded-full bg-blue-300/30" />
          <div className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full bg-blue-400/50" />
        </div>

        <motion.div
          {...fade}
          className="relative max-w-3xl mx-auto px-6 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div
              className="h-px w-12"
              style={{
                background: "linear-gradient(to right, transparent, #3B82F6)",
              }}
            />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <div
              className="h-px w-12"
              style={{
                background: "linear-gradient(to left, transparent, #3B82F6)",
              }}
            />
          </div>

          <h2
            className="font-serif text-3xl md:text-4xl mb-5 leading-tight"
            style={{ color: "#EFF6FF" }}
          >
            Not Sure Which Service Is Right?
          </h2>
          <p className="mb-10 text-base" style={{ color: "#94A3B8" }}>
            Our specialists will design a personalized treatment plan during
            your consultation.
          </p>

          <Link href="/book">
            <button
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
                color: "#fff",
                boxShadow: "0 4px 24px rgba(59,130,246,0.35)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 6px 32px rgba(59,130,246,0.55)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 24px rgba(59,130,246,0.35)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Book Free Consultation
              <ArrowRight size={16} />
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
