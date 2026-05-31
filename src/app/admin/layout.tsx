"use client"

import { useAuthStore } from "@/store/authStore"
import ProtectedNav from "@/components/layout/ProtectedNavbar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const role = user?.role?.toLowerCase() === "admin" ? "admin" : "user"

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <ProtectedNav userRole={role} />

      {/* Mobile topbar spacer */}
      <div className="h-16 lg:hidden" />

      {/* Content starts right after the sidebar — no gap */}
      <main className="lg:ml-[288px] min-h-screen">
        {children}
      </main>

      {/* Mobile bottom nav spacer */}
      <div className="h-20 lg:hidden" />
    </div>
  )
}