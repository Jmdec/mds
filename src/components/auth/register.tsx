"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  ArrowLeftCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === "phone") {
      const numbersOnly = value.replace(/\D/g, "");

      setFormData((prev) => ({
        ...prev,
        [field]: numbersOnly,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.password_confirmation
    ) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields.",
      });

      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error("Password Mismatch", {
        description: "Passwords do not match. Please check and try again.",
      });

      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password Too Short", {
        description: "Password must be at least 8 characters long.",
      });

      return;
    }

    // UPDATED: Phone validation — must be exactly 11 digits and start with "09"
    if (
      formData.phone &&
      (formData.phone.length !== 11 || !formData.phone.startsWith("09"))
    ) {
      toast.error("Invalid Phone Number", {
        description:
          "Phone number must be exactly 11 digits and start with 09.",
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Registration Successful!", {
          description: "You can login now.",
        });

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        toast.error("Registration Failed", {
          description: data.message || "Registration failed. Please try again.",
        });
      }
    } catch {
      toast.error("Connection Error", {
        description: "Unable to register. Please check your connection.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-10 relative overflow-hidden">
        {/* GRID */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(56,189,248,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* GLOWS */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />

        <div className="absolute bottom-[-80px] left-[-60px] w-72 h-72 bg-blue-600/10 blur-[100px] rounded-full" />

        <div className="absolute top-1/3 right-[-80px] w-64 h-64 bg-sky-400/10 blur-[100px] rounded-full" />

        {/* CARD */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-2xl z-10"
        >
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-cyan-400/30 via-blue-500/10 to-transparent" />

          <div
            className="relative bg-[#0a1628]/90 border border-white/[0.08]
                       rounded-2xl p-6 sm:p-8 backdrop-blur-xl"
          >
            {/* BACK */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 mb-6"
            >
              <ArrowLeftCircle className="w-5 h-5" />

              <span className="text-xs uppercase tracking-widest">Back</span>
            </button>

            {/* HEADER */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 mb-4">
                <User className="text-cyan-400" />
              </div>

              <h1 className="text-2xl font-semibold text-white">
                Create Account
              </h1>

              <p className="text-cyan-400/80 text-xs uppercase tracking-[0.2em] mt-1">
                MSD Dental & Aesthetic Clinic
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Full Name"
                  icon={User}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="John Doe"
                />

                <Field
                  label="Email"
                  icon={Mail}
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="you@email.com"
                />

                <div className="md:col-span-2">
                  <PhoneField
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              {/* PASSWORDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PASSWORD */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Min. 8 characters"
                      className="w-full h-12 rounded-xl bg-[#060e1e] border border-white/[0.08]
                                 px-4 pr-10 text-white placeholder:text-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-cyan-400/10
                                 focus:border-cyan-400/50 transition"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.password_confirmation}
                      onChange={(e) =>
                        handleInputChange(
                          "password_confirmation",
                          e.target.value,
                        )
                      }
                      placeholder="Repeat your password"
                      className="w-full h-12 rounded-xl bg-[#060e1e] border border-white/[0.08]
                                 px-4 pr-10 text-white placeholder:text-slate-400
                                 focus:outline-none focus:ring-2 focus:ring-cyan-400/10
                                 focus:border-cyan-400/50 transition"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500
                           hover:from-cyan-400 hover:to-blue-400 text-white font-semibold
                           transition disabled:opacity-60"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>

              {/* FOOTER */}
              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      <Toaster theme="dark" />
    </>
  );
}

// ─── Reusable Field ───────────────────────────────────────────────────────────

function Field({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ElementType;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-cyan-400" />
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 rounded-xl bg-[#060e1e] border border-white/[0.08]
                   px-4 text-white placeholder:text-slate-400  {/* FIXED: was placeholder:text-slate-600 */}
                   focus:outline-none focus:ring-2 focus:ring-cyan-400/10
                   focus:border-cyan-400/50 transition"
      />
    </div>
  );
}

// ─── Phone Field with inline validation ──────────────────────────────────────

function PhoneField({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  // Derive validation state from the current value
  const getValidationState = () => {
    if (value.length === 0) return null;
    if (!value.startsWith("09"))
      return { ok: false, message: "Phone number must start with 09." };
    if (value.length < 11)
      return {
        ok: false,
        message: `${value.length}/11 digits — must be exactly 11.`,
      };
    return { ok: true, message: "Valid phone number" };
  };

  const validation = getValidationState();

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <Phone className="w-3.5 h-3.5 text-cyan-400" />
        Phone Number
      </label>

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="09123456789"
        maxLength={11}
        className={`w-full h-12 rounded-xl bg-[#060e1e] border
                   px-4 text-white placeholder:text-slate-400
                   focus:outline-none focus:ring-2 focus:ring-cyan-400/10
                   focus:border-cyan-400/50 transition
                   ${
                     validation === null
                       ? "border-white/[0.08]"
                       : validation.ok
                         ? "border-cyan-400/50"
                         : "border-red-500/60"
                   }`}
      />

      {validation !== null && (
        <p
          className={`text-[11px] ${
            validation.ok ? "text-cyan-400" : "text-red-400"
          }`}
        >
          {validation.ok ? "✓ " : ""}
          {validation.message}
        </p>
      )}
    </div>
  );
}
