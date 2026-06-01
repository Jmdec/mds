"use client";

import { useAuthStore } from "@/store/authStore";
import ProtectedNav from "@/components/layout/ProtectedNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.toLowerCase() === "admin" ? "admin" : "user";

  return (
    <div className="min-h-screen bg-slate-50">
      <ProtectedNav userRole={role} />

      {/* Mobile topbar spacer — only on mobile */}
      <div className="h-16 lg:hidden" />

      {/* 
        On mobile:  no left margin (sidebar is hidden, bottom nav is used)
        On desktop: ml-72 to clear the fixed 288px sidebar 
      */}
      <main className="lg:ml-72 min-h-screen p-4 lg:p-8">{children}</main>

      {/* Mobile bottom nav spacer */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
