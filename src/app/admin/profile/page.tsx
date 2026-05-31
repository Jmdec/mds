"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Calendar, ShieldCheck } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import ProtectedNav from "@/components/layout/ProtectedNavbar"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoggedIn, initializeAuth, logout } = useAuthStore()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    initializeAuth()
    setMounted(true)
  }, [initializeAuth])

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.replace("/login")
    }
  }, [mounted, isLoggedIn, router])

  if (!mounted || !user) return null

  const initials = getInitials(String(user.name ?? "?"))

  return (
    <main className="min-h-screen bg-[#f4f8ff] pt-[88px] pb-12 px-4">
      <ProtectedNav userRole="admin" />

      <div className="max-w-[720px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <User size={20} className="text-blue-600" />
          <h1 className="text-lg font-semibold text-slate-800">
            My Profile
          </h1>
        </div>

        {/* Hero Card */}
        <div className="bg-white border border-blue-100 shadow-sm rounded-2xl p-6 mb-4 flex flex-wrap items-center gap-5">
          <div className="w-[72px] h-[72px] rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-slate-800">
              {String(user.name ?? "")}
            </p>

            <p className="text-sm text-slate-500">
              {String(user.email ?? "")}
            </p>

            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge>
                <ShieldCheck size={12} />
                Verified
              </Badge>

              {typeof user.role === "string" &&
                user.role.trim() !== "" && (
                  <Badge>{user.role}</Badge>
                )}
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <Card title="Personal Information">
          <InfoRow
            icon={<User size={14} />}
            label="Full Name"
            val={String(user.name ?? "—")}
          />

          <InfoRow
            icon={<Mail size={14} />}
            label="Email"
            val={String(user.email ?? "—")}
          />

          <InfoRow
            icon={<Phone size={14} />}
            label="Phone"
            val={String(user.phone ?? "—")}
          />
        </Card>

        {/* Account Info */}
        <Card title="Account Information">
          <InfoRow
            icon={<Calendar size={14} />}
            label="Member Since"
            val="January 12, 2024"
          />

          <InfoRow
            icon={<ShieldCheck size={14} />}
            label="Status"
            val="Active"
          />
        </Card>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout()
            router.push("/")
          }}
          className="text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-xl transition flex items-center gap-1"
        >
          Logout
        </button>
      </div>
    </main>
  )
}

/* ───── UI COMPONENTS ───── */

interface CardProps {
  title: string
  children: React.ReactNode
}

function Card({ title, children }: CardProps) {
  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-5 mb-4 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-4 font-medium">
        {title}
      </p>
      {children}
    </div>
  )
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  val: string | React.ReactNode
}

function InfoRow({ icon, label, val }: InfoRowProps) {
  return (
    <div className="flex justify-between py-2 border-b last:border-0 border-slate-100">
      <span className="text-sm text-slate-500 flex items-center gap-2">
        {icon}
        {label}
      </span>

      <span className="text-sm text-slate-700 font-medium">
        {val}
      </span>
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
}

function Badge({ children }: BadgeProps) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
      {children}
    </span>
  )
}