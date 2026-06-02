"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LogOut,
  Download,
  Calendar,
  User,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { usePWAInstall } from "@/hooks/use-pwa-install";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/facilities", label: "Facilities" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { isLoggedIn, user, logout, initializeAuth } = useAuthStore();
  const { canInstall, handleInstall } = usePWAInstall();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAuth();
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#020617]/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-xl text-white tracking-wide shrink-0"
        >
          MDS Dental & <span className="text-cyan-400">Aesthetic Clinic</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm tracking-wide transition-colors ${
                pathname === l.href
                  ? "text-cyan-400"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {canInstall && mounted && (
            <Button
              onClick={handleInstall}
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 text-sm px-4 flex items-center gap-2"
            >
              <Download size={16} />
              Download App
            </Button>
          )}

          {mounted &&
            (isLoggedIn && user ? (
              <div className="flex items-center gap-3">
                <Link href="/book">
                  <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-medium text-sm px-5 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center gap-2">
                    <Calendar size={14} />
                    Book
                  </Button>
                </Link>

                <div
                  className="relative flex items-center gap-2 pl-3 border-l border-white/10"
                  ref={dropdownRef}
                >
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 text-xs font-bold select-none">
                      {initials}
                    </div>
                    <span className="text-white text-sm font-medium max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-slate-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-3 w-52 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-white text-sm font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-slate-500 text-xs truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push("/profile");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white text-sm transition-colors"
                        >
                          <User size={14} className="text-cyan-400" />
                          Profile & Bookings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-white/5 hover:text-red-400 text-sm transition-colors"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-medium text-sm px-6 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all">
                  Login
                </Button>
              </Link>
            ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#020617]/95 backdrop-blur-xl border-t border-white/5 px-5 pb-6 pt-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block py-3 text-sm border-b border-white/[0.04] ${
                pathname === l.href ? "text-cyan-400" : "text-slate-300"
              }`}
            >
              {l.label}
            </Link>
          ))}

          {canInstall && mounted && (
            <Button
              onClick={() => {
                handleInstall();
                setMobileOpen(false);
              }}
              className="w-full mt-4 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 border border-cyan-400 flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download App
            </Button>
          )}

          {mounted &&
            (isLoggedIn && user ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 px-1 py-2 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 text-xs font-bold">
                    {initials}
                  </div>
                  <span className="text-white text-sm font-medium truncate">
                    {user.name}
                  </span>
                </div>
                <Link href="/book" className="block">
                  <Button className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 flex items-center justify-center gap-2">
                    <Calendar size={15} />
                    Book Appointment
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 text-slate-300 hover:bg-white/5 hover:text-white flex items-center justify-center gap-2"
                  >
                    <User size={15} className="text-cyan-400" />
                    Profile & Bookings
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-400/30 text-red-400 hover:bg-red-400/10 flex items-center justify-center gap-2"
                >
                  <LogOut size={15} />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="w-full mt-4 bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                  Login
                </Button>
              </Link>
            ))}
        </div>
      )}
    </nav>
  );
}
