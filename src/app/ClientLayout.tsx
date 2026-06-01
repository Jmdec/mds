"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { usePathname } from "next/navigation";
import FloatingSocialMedia from "@/components/FloatingSocialMedia";
import CustomerServiceChatbot from "@/components/CustomerServiceChatbot";
import { useAuthStore } from "@/store/authStore";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { PWAInstallProvider } from "@/context/PWAInstallContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  const pathname = usePathname() || "";

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  const showHeader =
    !isAdminRoute && pathname !== "/login" && pathname !== "/register";

  const showFooter = !isAdminRoute;

  const showFloatingSocial = !isAdminRoute;

  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <PWAInstallProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            {showHeader && <Header />}
            <main className="flex-1">{children}</main>
            {showFooter && <Footer />}
          </div>

          {showFloatingSocial && <FloatingSocialMedia />}

          {/* Chatbot — fixed bottom-right */}
          <div className="fixed bottom-6 right-6 z-50">
            <CustomerServiceChatbot />
          </div>

          <Toaster />
          <SonnerToaster />
          <PWAInstallBanner />
        </TooltipProvider>
      </QueryClientProvider>
    </PWAInstallProvider>
  );
}
