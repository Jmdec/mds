"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  )
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link. No token provided.")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage(data.message || "Email verified successfully!")
        } else {
          setStatus("error")
          setMessage(data.message || "Email verification failed.")
        }
      } catch {
        setStatus("error")
        setMessage("An error occurred during verification. Please try again.")
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617]">
      <Card className="w-full gap-0 p-0 max-w-md bg-white border border-[#C8DCF0] shadow-lg rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center gap-1.5 p-5 bg-[#1A4E8A]">
          <div className="flex items-center gap-3">
            <h1
              className={`${playfair.className} text-2xl font-semibold text-white tracking-wide`}
            >
              MDS Dental and Aesthetic Clinic
            </h1>
          </div>
          <span className="text-xs text-white/60 uppercase tracking-widest font-light">
            Email Verification
          </span>
        </div>

        <CardContent className="py-9 text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <div className="w-[72px] h-[72px] rounded-full bg-[#EAF2FB] flex items-center justify-center mx-auto">
                <Loader2 className="w-9 h-9 text-[#1A4E8A] animate-spin" />
              </div>
              <p className="text-sm text-[#5a7a99]">
                Verifying your email address, please wait…
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-3">
              <div className="w-[72px] h-[72px] rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9 text-[#1A8A4E]" />
              </div>
              <h2 className="text-lg font-semibold text-[#1A8A4E]">
                Email Verified
              </h2>
              <p className="text-sm text-[#5a7a99] leading-relaxed">
                {message}
              </p>
              <Link href="/login">
                <Button className="mt-2 bg-[#1A4E8A] hover:bg-[#153f70] text-white font-medium rounded-xl px-7">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <div className="w-[72px] h-[72px] rounded-full bg-[#FDEAEA] flex items-center justify-center mx-auto">
                <XCircle className="w-9 h-9 text-[#A32D2D]" />
              </div>
              <h2 className="text-lg font-semibold text-[#A32D2D]">
                Verification Failed
              </h2>
              <p className="text-sm text-[#5a7a99] leading-relaxed">
                {message}
              </p>
              <div className="border-t border-[#E6EEF8] pt-4 flex flex-col gap-2.5 mt-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full border-[#C8DCF0] text-[#1A4E8A] bg-transparent hover:bg-[#EAF2FB] rounded-xl"
                  >
                    Go to Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full bg-[#1A4E8A] hover:bg-[#153f70] text-white font-medium rounded-xl">
                    Register Again
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F0F5FA]">
          <Loader2 className="w-12 h-12 text-[#1A4E8A] animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}