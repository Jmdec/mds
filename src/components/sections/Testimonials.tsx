"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

const fade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

type Testimonial = {
  id: number
  client_name: string
  message: string
  rating: number
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials?status=approved`
        )

        const data = await res.json()

        setTestimonials(Array.isArray(data) ? data : data.data || [])
      } catch (err) {
        console.error("Failed to load testimonials", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  if (loading) {
    return (
      <section className="bg-[#F8FAFC] py-24">
        <div className="text-center text-slate-500">Loading testimonials...</div>
      </section>
    )
  }

  return (
    <section className="bg-[#F8FAFC] py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER (UNCHANGED DESIGN) */}
        <motion.div {...fade} className="text-center mb-16">
          <p className="text-blue-600 text-sm uppercase tracking-[0.3em] mb-3">
            Testimonials
          </p>
          <h2 className="font-serif text-4xl text-slate-900">
            Patient Stories
          </h2>
        </motion.div>

        {/* GRID (UNCHANGED DESIGN) */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t.id} {...fade} transition={{ delay: i * 0.1 }}>
              <Card className="p-6 bg-white border-slate-200 h-full">
                
                {/* STARS */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* TEXT (UNCHANGED STYLE) */}
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {`"${t.message}"`}
                </p>

                {/* NAME */}
                <p className="text-slate-900 font-medium text-sm">
                  {t.client_name}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}