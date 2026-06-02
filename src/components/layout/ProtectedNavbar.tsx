"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  Home,
  CalendarPlus,
  ClipboardList,
  User,
  LayoutDashboard,
  Users,
  Package,
  MessageSquare,
  Star,
  Bell,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface ProtectedNavProps {
  userRole?: "admin" | "user";
}

export default function ProtectedNav({ userRole = "user" }: ProtectedNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const USER_NAV_ITEMS = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/book", icon: CalendarPlus, label: "Book" },
    { path: "/appointments", icon: ClipboardList, label: "Appointments" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const ADMIN_NAV_GROUPS = [
    {
      title: "Overview",
      items: [
        { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        {
          path: "/admin/appointments",
          icon: CalendarPlus,
          label: "Appointments",
        },
        { path: "/admin/inquiry", icon: MessageSquare, label: "Inquiry" },
      ],
    },
    {
      title: "CMS",
      items: [
        { path: "/admin/services", icon: ClipboardList, label: "Services" },
        { path: "/admin/cases", icon: ClipboardList, label: "Cases" },
        { path: "/admin/testimonials", icon: Star, label: "Testimonials" },
        { path: "/admin/about", icon: Star, label: "About Section" },
      ],
    },
    {
      title: "Management",
      items: [
        { path: "/admin/users", icon: Users, label: "Users" },
        { path: "/admin/inventory", icon: Package, label: "Inventory" },
      ],
    },
    {
      title: "Account",
      items: [{ path: "/admin/profile", icon: User, label: "Profile" }],
    },
  ];

  const mobileAdminItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/appointments", icon: CalendarPlus, label: "Appointments" },
    { path: "/admin/inquiry", icon: Bell, label: "Inquiry" },
    { path: "/admin/profile", icon: User, label: "Profile" },
  ];

  const MOBILE_ITEMS = userRole === "admin" ? mobileAdminItems : USER_NAV_ITEMS;

  /* Shared logout button */
  const LogoutButton = ({ mobile = false }: { mobile?: boolean }) => (
    <button
      onClick={handleLogout}
      className={cn(
        "flex items-center gap-3 w-full transition-all duration-200 text-slate-500 hover:text-red-500 hover:bg-red-50",
        mobile ? "px-4 py-3 rounded-2xl" : "px-4 py-3 rounded-2xl",
      )}
    >
      <LogOut className="h-5 w-5 shrink-0" />
      <span className="text-sm font-medium">Logout</span>
    </button>
  );

  return (
    <>
      {/* MOBILE TOPBAR */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-blue-100 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-100">
            <Image
              src="/logo.png"
              alt="MDS Dental Logo"
              width={34}
              height={34}
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">MDS Dental</h2>
            <p className="text-[11px] text-slate-500">Premium Portal</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-11 h-11 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-700"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300",
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible",
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* MOBILE SIDEBAR */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 h-screen w-[85%] max-w-[320px] bg-white border-r border-blue-100 z-50 transition-transform duration-300 flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-6 py-6 border-b border-slate-200 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-100">
              <Image
                src="/logo.png"
                alt="MDS Dental Logo"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                MDS Dental
              </h2>
              <p className="text-xs text-slate-500">Premium Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6">
          {userRole === "admin" ? (
            <div className="space-y-8">
              {ADMIN_NAV_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3 px-2">
                    {group.title}
                  </p>
                  <div className="space-y-1">
                    {group.items.map(({ path, icon: Icon, label }) => {
                      const active = pathname === path;
                      return (
                        <Link
                          key={path}
                          href={path}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
                            active
                              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-100"
                              : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {USER_NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                const active = pathname === path;
                return (
                  <Link
                    key={path}
                    href={path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
                      active
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-100"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Mobile sidebar logout */}
        <div className="px-5 py-4 border-t border-slate-100">
          <LogoutButton mobile />
        </div>
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-white border-r border-blue-100 z-40 flex-col">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-100">
              <Image
                src="/logo.png"
                alt="MDS Dental Logo"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-slate-900">
                MDS Dental
              </h2>
              <p className="text-xs text-slate-500">
                {userRole === "admin"
                  ? "Premium Admin Portal"
                  : "Patient Portal"}
              </p>
            </div>
          </div>
        </div>

        {/* USER NAV */}
        {userRole !== "admin" && (
          <nav className="flex-1 px-5 py-6 space-y-2">
            {USER_NAV_ITEMS.map(({ path, icon: Icon, label }) => {
              const active = pathname === path;
              return (
                <Link
                  key={path}
                  href={path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                    active
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-100"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{label}</span>
                  {active && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* ADMIN NAV */}
        {userRole === "admin" && (
          <nav className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-8">
              {ADMIN_NAV_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3 px-2">
                    {group.title}
                  </p>
                  <div className="space-y-1">
                    {group.items.map(({ path, icon: Icon, label }) => {
                      const active = pathname === path;
                      return (
                        <Link
                          key={path}
                          href={path}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                            active
                              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-100"
                              : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{label}</span>
                          {active && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-white" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        )}

        {/* Desktop sidebar logout — pinned to bottom */}
        <div className="px-5 py-4 border-t border-slate-100">
          <LogoutButton />
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-blue-100 z-40 safe-area-bottom lg:hidden">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {MOBILE_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = pathname === path;
            return (
              <Link
                key={path}
                href={path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[64px]",
                  active
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-blue-600",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    active && "font-semibold",
                  )}
                >
                  {label}
                </span>
                {active && <div className="w-1 h-1 rounded-full bg-blue-600" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
