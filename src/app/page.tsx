"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

import HeroSection from "@/components/sections/Hero";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const { isLoggedIn, user, initializeAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [initializeAuth]);

  useEffect(() => {
    if (!loading && isLoggedIn && user?.role?.toLowerCase() === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [loading, isLoggedIn, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-slate-500 text-sm font-medium tracking-wide">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (isLoggedIn && user?.role?.toLowerCase() === "admin") {
    return null;
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <Testimonials />
    </div>
  );
}
