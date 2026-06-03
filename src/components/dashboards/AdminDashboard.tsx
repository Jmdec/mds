"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Users,
  BarChart3,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import ProtectedNav from "../layout/ProtectedNavbar";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AdminDashboardProps {
  user: User;
}

// Shape of a booking returned from your Laravel API
interface ServiceRelation {
  id?: number;
  name?: string;
  price?: number | string;
}

interface Booking {
  id: number | string;
  patient_name?: string;
  name?: string;
  service?: ServiceRelation | string;
  package?: string;
  booking_date?: string;
  appointment_date?: string;
  date?: string;
  appointment_time?: string;
  time?: string;
  status?: string;
  reservation_fee?: number | string;
  amount?: number | string;
  price?: number | string;
  created_at?: string;
}

interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  monthlyRevenue: number;
  pendingFollowUps: number;
  deltaToday: string;
  deltaPatients: string;
  deltaRevenue: string;
  deltaPending: string;
}

function isConfirmed(b: Booking): boolean {
  const s = (b.status || "").toLowerCase();
  return s === "confirmed" || s === "approved";
}

function computeStats(bookings: Booking[]): DashboardStats {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const todayBookings = bookings.filter((b) => {
    const d = b.booking_date || b.appointment_date || b.date || "";
    return d.startsWith(today);
  });

  const uniquePatients = new Set(
    bookings
      .map((b) => (b.patient_name || b.name || "").toLowerCase().trim())
      .filter(Boolean),
  );

  // ✅ Only confirmed/approved bookings count toward revenue
  const thisMonthRevenue = bookings
    .filter((b) => {
      if (!isConfirmed(b)) return false;
      const d = new Date(
        b.booking_date || b.appointment_date || b.date || b.created_at || "",
      );
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, b) => {
      const svc = typeof b.service === "object" ? b.service : null;
      return (
        sum +
        Number(svc?.price ?? b.reservation_fee ?? b.amount ?? b.price ?? 0)
      );
    }, 0);

  // ✅ Only confirmed/approved bookings count toward last month revenue
  const lastMonthRevenue = bookings
    .filter((b) => {
      if (!isConfirmed(b)) return false;
      const d = new Date(
        b.booking_date || b.appointment_date || b.date || b.created_at || "",
      );
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    })
    .reduce((sum, b) => {
      const svc = typeof b.service === "object" ? b.service : null;
      return (
        sum +
        Number(svc?.price ?? b.reservation_fee ?? b.amount ?? b.price ?? 0)
      );
    }, 0);

  const pendingCount = bookings.filter(
    (b) => (b.status || "").toLowerCase() === "pending",
  ).length;

  // Yesterday's appointments for delta
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const yesterdayCount = bookings.filter((b) => {
    const d = b.booking_date || b.appointment_date || b.date || "";
    return d.startsWith(yesterdayStr);
  }).length;

  const revenueChange =
    lastMonthRevenue > 0
      ? (
          ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
          100
        ).toFixed(1)
      : null;

  return {
    todayAppointments: todayBookings.length,
    totalPatients: uniquePatients.size,
    monthlyRevenue: thisMonthRevenue,
    pendingFollowUps: pendingCount,
    deltaToday:
      todayBookings.length - yesterdayCount >= 0
        ? `+${todayBookings.length - yesterdayCount}`
        : `${todayBookings.length - yesterdayCount}`,
    deltaPatients: `+${uniquePatients.size}`,
    deltaRevenue:
      revenueChange !== null
        ? `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}%`
        : "N/A",
    deltaPending: pendingCount > 0 ? `${pendingCount}` : "0",
  };
}

function formatRevenue(amount: number): string {
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(1)}K`;
  return `₱${amount.toLocaleString("en-PH")}`;
}

function getPatientName(b: Booking): string {
  return b.patient_name || b.name || "Unknown";
}

function getService(b: Booking): string {
  if (typeof b.service === "object" && b.service?.name) return b.service.name;
  if (typeof b.service === "string" && b.service) return b.service;
  return b.package || "—";
}

function parseBookingDate(raw: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} | null {
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!match) return null;
  return {
    year: parseInt(match[1]),
    month: parseInt(match[2]) - 1,
    day: parseInt(match[3]),
    hour: parseInt(match[4]),
    minute: parseInt(match[5]),
  };
}

function getTime(b: Booking): string {
  const raw =
    b.booking_date || b.appointment_date || b.appointment_time || b.time || "";
  if (!raw) return "—";
  const parts = parseBookingDate(raw);
  if (!parts) return raw;
  const { hour, minute } = parts;
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${ampm}`;
}

function getDate(b: Booking): string {
  const raw = b.booking_date || b.appointment_date || b.date || "";
  if (!raw) return "—";
  const parts = parseBookingDate(raw);
  if (!parts) return raw;
  const d = new Date(parts.year, parts.month, parts.day);
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatus(b: Booking): string {
  const s = b.status || "pending";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function getAvatar(b: Booking): string {
  const name = getPatientName(b);
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("");
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const { token } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/bookings?per_page=1000", {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "Failed to fetch bookings");

        const list: Booking[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.bookings)
              ? data.bookings
              : [];

        setBookings(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [token]);

  const stats = computeStats(bookings);

  // Today's appointments for the table
  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookings
    .filter((b) => {
      const d = b.booking_date || b.appointment_date || b.date || "";
      return d.startsWith(today);
    })
    .slice(0, 10);

  // ✅ Mini bar chart: last 7 months — confirmed/approved only
  const barData = (() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      return bookings
        .filter((b) => {
          if (!isConfirmed(b)) return false;
          const bd = new Date(
            b.booking_date ||
              b.appointment_date ||
              b.date ||
              b.created_at ||
              "",
          );
          return bd.getMonth() === month && bd.getFullYear() === year;
        })
        .reduce((sum, b) => {
          const svc = typeof b.service === "object" ? b.service : null;
          return (
            sum +
            Number(svc?.price ?? b.reservation_fee ?? b.amount ?? b.price ?? 0)
          );
        }, 0);
    });
  })();
  const maxBar = Math.max(...barData, 1);

  const statCards = [
    {
      label: "Today's Appointments",
      value: loading ? "—" : String(stats.todayAppointments),
      delta: loading ? "" : stats.deltaToday,
      icon: CalendarDays,
    },
    {
      label: "Active Patients",
      value: loading ? "—" : stats.totalPatients.toLocaleString(),
      delta: loading ? "" : stats.deltaPatients,
      icon: Users,
    },
    {
      label: "Monthly Revenue",
      value: loading ? "—" : formatRevenue(stats.monthlyRevenue),
      delta: loading ? "" : stats.deltaRevenue,
      icon: BarChart3,
    },
    {
      label: "Pending Follow-ups",
      value: loading ? "—" : String(stats.pendingFollowUps),
      delta: loading ? "" : stats.deltaPending,
      icon: FileText,
    },
  ];

  const statusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "confirmed" || s === "approved")
      return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    if (s === "in progress" || s === "ongoing")
      return "bg-blue-50 text-blue-600 border border-blue-100";
    if (s === "cancelled" || s === "rejected")
      return "bg-red-50 text-red-600 border border-red-100";
    return "bg-amber-50 text-amber-600 border border-amber-100";
  };

  return (
    <div
      className="min-h-screen bg-[#f4f7fb] text-slate-900"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <ProtectedNav userRole={user.role as "admin" | "user"} />

      <main className="lg:ml-72 pt-20 lg:pt-0 pb-24 lg:pb-8 px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Clinic Dashboard
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              {new Date().toLocaleDateString("en-PH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetch("/api/admin/bookings?per_page=1000", {
                headers: {
                  Accept: "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              })
                .then((r) => r.json())
                .then((data) => {
                  const list: Booking[] = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                      ? data.data
                      : Array.isArray(data?.bookings)
                        ? data.bookings
                        : [];
                  setBookings(list);
                })
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
            }}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ArrowRight size={15} className="rotate-[-90deg]" />
            )}
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <strong>Could not load bookings:</strong> {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.delta.startsWith("+");
            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-3xl rounded-full" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <Icon size={22} className="text-blue-600" />
                    </div>
                    {stat.delta && !loading && (
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          isPositive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {stat.delta}
                      </span>
                    )}
                    {loading && (
                      <Loader2
                        size={16}
                        className="animate-spin text-slate-300"
                      />
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight break-words">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
          {/* APPOINTMENTS TABLE */}
          <div className="2xl:col-span-2 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Today&apos;s Appointments
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {loading
                    ? "Loading schedules…"
                    : `${todayBookings.length} appointment${todayBookings.length !== 1 ? "s" : ""} today`}
                </p>
              </div>
              <button className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all
                <ArrowRight size={15} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Fetching appointments…</span>
              </div>
            ) : todayBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                <CalendarDays size={32} className="opacity-40" />
                <p className="text-sm">No appointments scheduled for today</p>
              </div>
            ) : (
              <>
                {/* MOBILE CARDS */}
                <div className="block md:hidden p-4 space-y-4">
                  {todayBookings.map((apt, index) => (
                    <div
                      key={apt.id ?? index}
                      className="rounded-2xl border border-slate-200 p-4 bg-slate-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                          {getAvatar(apt)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {getPatientName(apt)}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {getService(apt)}
                              </p>
                            </div>
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusColor(
                                getStatus(apt),
                              )}`}
                            >
                              {getStatus(apt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-3">
                            {getTime(apt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block divide-y divide-slate-100">
                  {todayBookings.map((apt, index) => (
                    <div
                      key={apt.id ?? index}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all"
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                        {getAvatar(apt)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {getPatientName(apt)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {getService(apt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600 font-medium">
                          {getTime(apt)}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${statusColor(
                          getStatus(apt),
                        )}`}
                      >
                        {getStatus(apt)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* REVENUE CARD */}
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-6 shadow-xl shadow-blue-100">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_35%)]" />
              <div className="relative z-10">
                <p className="text-blue-100 text-xs uppercase tracking-[0.2em] font-semibold mb-2">
                  Monthly Revenue
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {loading ? "—" : formatRevenue(stats.monthlyRevenue)}
                </h2>
                <p className="text-blue-100 text-sm mt-2">
                  {loading
                    ? "Loading…"
                    : stats.deltaRevenue === "N/A"
                      ? "No previous month data"
                      : `${stats.deltaRevenue} vs last month`}
                </p>

                {/* Mini bar chart — last 7 months */}
                <div className="mt-6 flex items-end gap-2 h-20">
                  {loading
                    ? Array.from({ length: 7 }, (_, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-full bg-white/20 animate-pulse"
                          style={{ height: `${30 + Math.random() * 40}%` }}
                        />
                      ))
                    : barData.map((val, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-full bg-white/30 transition-all duration-500"
                          style={{
                            height: `${Math.max(8, (val / maxBar) * 100)}%`,
                          }}
                          title={`₱${val.toLocaleString("en-PH")}`}
                        />
                      ))}
                </div>

                {/* Last 7 months label */}
                <p className="text-blue-200 text-[10px] mt-2 text-right">
                  Last 7 months
                </p>
              </div>
            </div>

            {/* BOOKING STATUS SUMMARY */}
            {!loading && bookings.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">
                  Booking Status Overview
                </h3>
                <div className="space-y-3">
                  {(
                    [
                      "Confirmed",
                      "Pending",
                      "In Progress",
                      "Cancelled",
                    ] as const
                  ).map((s) => {
                    const count = bookings.filter(
                      (b) => getStatus(b).toLowerCase() === s.toLowerCase(),
                    ).length;
                    const pct =
                      bookings.length > 0
                        ? Math.round((count / bookings.length) * 100)
                        : 0;
                    return (
                      <div key={s}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">{s}</span>
                          <span className="text-xs font-semibold text-slate-700">
                            {count}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-700 ${
                              s === "Confirmed"
                                ? "bg-emerald-400"
                                : s === "Pending"
                                  ? "bg-amber-400"
                                  : s === "In Progress"
                                    ? "bg-blue-400"
                                    : "bg-red-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
