"use client"

import {
  CalendarDays,
  Users,
  BarChart3,
  Bell,
  Plus,
  ArrowRight,
  FileText,
} from "lucide-react"

import { useAuthStore } from "@/store/authStore"
import ProtectedNav from "../layout/ProtectedNavbar"

interface User {
  id: string
  name: string
  email: string
  role?: string
}

interface AdminDashboardProps {
  user: User
}

const stats = [
  {
    label: "Today's Appointments",
    value: "42",
    delta: "+5",
    icon: CalendarDays,
  },
  {
    label: "Active Patients",
    value: "2,124",
    delta: "+21",
    icon: Users,
  },
  {
    label: "Monthly Revenue",
    value: "₱1,176,500",
    delta: "+12.4%",
    icon: BarChart3,
  },
  {
    label: "Pending Follow-ups",
    value: "25",
    delta: "-7",
    icon: FileText,
  },
]

const recentAppointments = [
  {
    patient: "Maria Santos",
    service: "Dental Cleaning",
    time: "09:00 AM",
    status: "Confirmed",
    avatar: "MS",
  },
  {
    patient: "Sofia Villanueva",
    service: "Botox Treatment",
    time: "09:30 AM",
    status: "Confirmed",
    avatar: "SV",
  },
  {
    patient: "Juan dela Cruz",
    service: "Root Canal",
    time: "10:30 AM",
    status: "In Progress",
    avatar: "JC",
  },
  {
    patient: "Marco Garcia",
    service: "Facial Filler",
    time: "11:00 AM",
    status: "In Progress",
    avatar: "MG",
  },
  {
    patient: "Ana Reyes",
    service: "Teeth Whitening",
    time: "12:00 PM",
    status: "Pending",
    avatar: "AR",
  },
]

export default function AdminDashboard({ user }: AdminDashboardProps) {
  useAuthStore()

  const statusColor = (status: string) => {
    if (status === "Confirmed") {
      return "bg-emerald-50 text-emerald-600 border border-emerald-100"
    }

    if (status === "In Progress") {
      return "bg-blue-50 text-blue-600 border border-blue-100"
    }

    return "bg-amber-50 text-amber-600 border border-amber-100"
  }

  return (
    <div
      className="min-h-screen bg-[#f4f7fb] text-slate-900"
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <ProtectedNav userRole={user.role as "admin" | "user"} />

      {/* MAIN CONTENT */}
      <main className="lg:ml-72 pt-2 lg:pt-0 pb-24 lg:pb-8 px-4 sm:px-6 lg:px-8">
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

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none h-11 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-blue-100 hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <Plus size={16} />
              New Appointment
            </button>

            <button className="relative h-11 w-11 rounded-2xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-all shrink-0">
              <Bell size={18} className="text-slate-500" />

              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon

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

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        stat.delta.startsWith("+")
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {stat.delta}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight break-words">
                    {stat.value}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
          {/* APPOINTMENTS */}
          <div className="2xl:col-span-2 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Today&apos;s Appointments
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Manage and monitor clinic schedules
                </p>
              </div>

              <button className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all
                <ArrowRight size={15} />
              </button>
            </div>

            {/* MOBILE CARDS */}
            <div className="block md:hidden p-4 space-y-4">
              {recentAppointments.map((apt, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 p-4 bg-slate-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                      {apt.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {apt.patient}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {apt.service}
                          </p>
                        </div>

                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusColor(
                            apt.status,
                          )}`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-3">{apt.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block divide-y divide-slate-100">
              {recentAppointments.map((apt, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-sm font-semibold text-white">
                    {apt.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {apt.patient}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">{apt.service}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-600 font-medium">
                      {apt.time}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${statusColor(
                      apt.status,
                    )}`}
                  >
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            {/* REVENUE CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-6 shadow-xl shadow-blue-100">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_35%)]" />

              <div className="relative z-10">
                <p className="text-blue-100 text-xs uppercase tracking-[0.2em] font-semibold mb-2">
                  Monthly Revenue
                </p>

                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  ₱1.17M
                </h2>

                <p className="text-blue-100 text-sm mt-2">
                  +12.4% vs last month
                </p>

                <div className="mt-6 flex items-end gap-2 h-20">
                  {[40, 65, 50, 80, 70, 90, 85].map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-full bg-white/30"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
