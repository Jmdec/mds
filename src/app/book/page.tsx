"use client";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const fade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

function generateDays() {
  const days: Date[] = [];
  const now = new Date();
  for (let i = 1; i <= 28; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (d.getDay() !== 0) days.push(d);
  }
  return days;
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTimeTo24(time: string) {
  const [timeValue, modifier] = time.split(" ");
  const [rawHours, rawMinutes] = timeValue.split(":").map(Number);
  let hours = rawHours;
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(rawMinutes).padStart(2, "0")}`;
}

interface ApiService {
  id: number;
  name: string;
  duration?: string;
  price?: number;
  category?: string;
}

function BookInner() {
  const router = useRouter();
  const { isLoggedIn, user, token } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn || !token) {
      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/book";
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isLoggedIn, token, router]);

  // All services from API (for the dropdown)
  const [allServices, setAllServices] = useState<ApiService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // The selected service (either chosen from dropdown OR pre-filled from URL)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null,
  );
  const [lockedFromUrl, setLockedFromUrl] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all services for the dropdown
  useEffect(() => {
    setServicesLoading(true);
    fetch("/api/services?per_page=100", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const raw: ApiService[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.data)
              ? data.data.data
              : [];
        setAllServices(raw);
      })
      .catch(() => {})
      .finally(() => setServicesLoading(false));
  }, []);

  // Read query params — if service_id is present, lock to that service
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qId = params.get("service_id");
    if (qId) {
      setSelectedServiceId(Number(qId));
      setLockedFromUrl(true);
    }
  }, []);

  // Auto-redirect after success
  useEffect(() => {
    if (!submitted) return;
    if (countdown <= 0) {
      router.push("/");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [submitted, countdown, router]);

  const days = generateDays();

  // Resolve the active service object from allServices
  const activeService =
    allServices.find((s) => s.id === selectedServiceId) ?? null;

  async function handleSubmit() {
    if (!selectedDate || !selectedTime || !name || !email || !phone) {
      setError("Please complete all required fields.");
      return;
    }
    if (!selectedServiceId) {
      setError("Please select a service.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          date: formatDate(selectedDate),
          time: formatTimeTo24(selectedTime),
          guests: 1,
          package: activeService?.name ?? "General Booking",
          service_id: selectedServiceId,
          reservation_fee: activeService?.price ?? 0,
          payment_method: "cash",
          payment_status: "pending",
        }),
      });

      const data = (await response.json()) as Record<string, unknown>;

      if (response.status === 401) {
        router.replace("/login?redirect=/book");
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error((data.message as string) || "Failed to save booking.");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving your booking.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn || !token) return null;

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md"
          >
            <div className="relative w-20 h-20 mx-auto mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center"
              >
                <CheckCircle className="text-cyan-400" size={36} />
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-cyan-400/40"
              />
            </div>
            <h2 className="font-serif text-3xl text-white mb-3">
              Appointment Confirmed
            </h2>
            <p className="text-slate-400 mb-1 font-medium">
              {activeService?.name ?? "Your appointment"} —{" "}
              {selectedDate?.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              at {selectedTime}
            </p>
            <p className="text-slate-500 text-sm mb-8">
              A confirmation has been sent to{" "}
              <span className="text-slate-300">{email}</span>. We look forward
              to seeing you.
            </p>
            <div className="flex flex-col items-center gap-3">
              <p className="text-slate-600 text-xs">
                Redirecting to home in{" "}
                <span className="text-cyan-400 font-semibold">
                  {countdown}s
                </span>
                …
              </p>
              <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-cyan-400/60 rounded-full"
                />
              </div>
              <button
                onClick={() => router.push("/")}
                className="mt-2 text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors underline underline-offset-2"
              >
                Go home now
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Booking form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
          <motion.div
            {...fade}
            className="mb-12 flex items-start justify-between flex-wrap gap-4"
          >
            <div>
              <p className="text-cyan-400 text-sm uppercase tracking-[0.3em] mb-3">
                Booking
              </p>
              <h1 className="font-serif text-4xl md:text-5xl text-white">
                Schedule Your Visit
              </h1>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full self-start mt-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-slate-400 text-sm">
                Signed in as <span className="text-white">{user?.name}</span>
              </span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Form ── */}
            <div className="lg:col-span-2 space-y-8">
              {/* Step 1 — Service */}
              <motion.div {...fade}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-bold">
                      1
                    </span>{" "}
                    Select Service
                  </h3>

                  {/* Locked pill when coming from services page */}
                  {lockedFromUrl && activeService ? (
                    <div className="flex items-center justify-between px-4 py-3 bg-cyan-400/10 border border-cyan-400/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                        {servicesLoading ? (
                          <span className="text-slate-400 text-sm animate-pulse">
                            Loading…
                          </span>
                        ) : (
                          <span className="text-white font-medium">
                            {activeService.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400/70 text-xs">
                          Selected
                        </span>
                        <button
                          onClick={() => {
                            setSelectedServiceId(null);
                            setLockedFromUrl(false);
                          }}
                          className="text-slate-500 hover:text-slate-300 text-xs underline underline-offset-2 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Dropdown populated entirely from API */
                    <Select
                      value={selectedServiceId ? String(selectedServiceId) : ""}
                      onValueChange={(val) => {
                        setSelectedServiceId(Number(val));
                        setLockedFromUrl(false);
                      }}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue
                          placeholder={
                            servicesLoading
                              ? "Loading services…"
                              : "Choose a service"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {allServices.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Card>
              </motion.div>

              {/* Step 2 — Date */}
              <motion.div {...fade} transition={{ delay: 0.1 }}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-bold">
                      2
                    </span>{" "}
                    Choose Date
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {days.slice(0, 21).map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(d)}
                        className={`p-2 rounded-lg text-center text-sm transition-all ${
                          selectedDate?.toDateString() === d.toDateString()
                            ? "bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                            : "bg-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-[10px] opacity-60">
                          {d.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                        <div className="font-medium">{d.getDate()}</div>
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Step 3 — Time */}
              <motion.div {...fade} transition={{ delay: 0.2 }}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-bold">
                      3
                    </span>{" "}
                    Select Time
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2 px-3 rounded-lg text-sm transition-all ${
                          selectedTime === t
                            ? "bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                            : "bg-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Step 4 — Patient Info */}
              <motion.div {...fade} transition={{ delay: 0.3 }}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-bold">
                      4
                    </span>{" "}
                    Your Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-400 text-xs mb-1.5 flex items-center gap-1">
                        <User size={12} /> Full Name
                      </Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs mb-1.5 flex items-center gap-1">
                        <Mail size={12} /> Email
                      </Label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-slate-400 text-xs mb-1.5 flex items-center gap-1">
                        <Phone size={12} /> Phone
                      </Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        placeholder="+63 912 345 6789"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* ── Summary ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <motion.div {...fade} transition={{ delay: 0.2 }}>
                  <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                    <h3 className="text-white font-medium mb-6">
                      Appointment Summary
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Service</span>
                        <span className="text-white text-right max-w-[60%] leading-snug">
                          {servicesLoading ? (
                            <span className="text-slate-500 animate-pulse">
                              Loading…
                            </span>
                          ) : (
                            (activeService?.name ?? "—")
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date</span>
                        <span className="text-white">
                          {selectedDate
                            ? selectedDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Time</span>
                        <span className="text-white">
                          {selectedTime || "—"}
                        </span>
                      </div>
                      <div className="border-t border-white/10 pt-4 flex justify-between">
                        <span className="text-slate-500">Duration</span>
                        <span className="text-white">
                          {activeService?.duration ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Starting at</span>
                        <Badge
                          variant="outline"
                          className="border-cyan-400/30 text-cyan-400"
                        >
                          {activeService?.price
                            ? `₱${Number(activeService.price).toLocaleString()}`
                            : "—"}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Calendar size={12} /> MDS Dental & Aesthetic Clinic
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Clock size={12} /> Mon–Sat: 9AM–7PM
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      onClick={handleSubmit}
                      disabled={
                        !selectedServiceId ||
                        !selectedDate ||
                        !selectedTime ||
                        !name ||
                        !email ||
                        !phone ||
                        loading ||
                        servicesLoading
                      }
                      className="w-full mt-6 bg-cyan-400 text-slate-950 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all disabled:opacity-30"
                      size="lg"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                          Confirming…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Confirm Booking <ArrowRight size={16} />
                        </span>
                      )}
                    </Button>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function Book() {
  return (
    <Suspense>
      <BookInner />
    </Suspense>
  );
}
