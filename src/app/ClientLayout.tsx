"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Header from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { usePathname } from "next/navigation"
import FloatingSocialMedia from "@/components/FloatingSocialMedia"
import CustomerServiceChatbot from "@/components/CustomerServiceChatbot"
import { useAuthStore } from "@/store/authStore"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  const pathname = usePathname() || ""

  const showHeader =
    pathname !== "/login" &&
    pathname !== "/register" &&
    pathname !== "/admin" &&
    !pathname.startsWith("/admin/") &&
    pathname !== "/dashboard" &&
    pathname !== "/profile" &&
    pathname !== "/appointments"
  // ↑ "/book" removed — it should show the nav and footer

  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            {showHeader && <Header />}
            <main className="flex-1">{children}</main>
            {showHeader && <Footer />}
          </div>
          {showHeader && <FloatingSocialMedia />}
          <CustomerServiceChatbot />
          <Toaster />
          <SonnerToaster />
        </TooltipProvider>
      </QueryClientProvider>
    </>
  )
}