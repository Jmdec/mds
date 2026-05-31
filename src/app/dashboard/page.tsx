"use client"

import ClientDashboard from "@/components/dashboards/ClientDashboard"
import { useAuthStore } from "@/store/authStore"

export default function DashboardPage() {
  const { user } = useAuthStore()

  // Only allow admins
  if (!user || user.role !== "client") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            Unauthorized
          </h1>
          <p className="text-slate-500 text-sm">
            You do not have access to this page.
          </p>
        </div>
      </div>
    )
  }

  return <ClientDashboard user={user} />
}