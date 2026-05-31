"use client"

import Link from "next/link"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export default function Footer() {
  const { isLoggedIn } = useAuthStore()

  // Hide footer when logged in
  if (isLoggedIn) return null

  return (
    <footer className="relative bg-[#020617] border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <span className="font-serif text-[20vw] text-white whitespace-nowrap">
          MDS
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-serif text-lg text-white mb-4">
            MDS <span className="text-cyan-400">Clinic</span>
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Advanced dental and aesthetic care, engineered for precision and designed for beauty.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-slate-400 mb-4">
            Navigation
          </h4>
          <div className="space-y-2">
            {["/", "/about", "/services", "/book", "/contact"].map((p, i) => (
              <Link
                key={p}
                href={p}
                className="block text-sm text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {["Home", "About", "Services", "Book", "Contact"][i]}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-slate-400 mb-4">
            Services
          </h4>
          <div className="space-y-2 text-sm text-slate-500">
            <p>Dental Implants</p>
            <p>Teeth Whitening</p>
            <p>Orthodontics</p>
            <p>Skin Rejuvenation</p>
            <p>Facial Contouring</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-slate-400 mb-4">
            Contact
          </h4>
          <div className="space-y-3 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-cyan-400" /> +1 (555) 234-5678
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-cyan-400" /> info@mdsclinic.com
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-cyan-400" /> 123 Medical Ave, Suite 200
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-cyan-400" /> Mon–Sat: 9AM–7PM
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
        &copy; 2026 MDS Dental & Aesthetic Clinic. All rights reserved.
      </div>
    </footer>
  )
}