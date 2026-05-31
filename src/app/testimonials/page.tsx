"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Testimonial {
  id: string
  content: string
  author: string
  role: string
  rating: number
  image?: string
}

const fade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/testimonials", { cache: "no-store" })
        const data = await res.json()
        setTestimonials(data.data || [])
      } catch {
        console.error("Failed to fetch testimonials")
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % (testimonials.length || 1))
  }

  const prev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + (testimonials.length || 1)) % (testimonials.length || 1),
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-center">
          <div className="inline-block w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin mb-4" />
          <p className="text-slate-400">Loading testimonials...</p>
        </div>
      </div>
    )
  }

  const current = testimonials[currentIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div {...fade} className="text-center mb-16">
          <span
            className="inline-block text-xs uppercase tracking-[0.35em] mb-4 px-4 py-1.5 rounded-full border"
            style={{
              color: "#93C5FD",
              borderColor: "rgba(147,197,253,0.25)",
              background: "rgba(59,130,246,0.08)",
            }}
          >
            Testimonials
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Stories From Our Clients
          </h1>
          <p className="text-slate-400 text-lg">
            Real results from real people who transformed their appearance and confidence.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        {testimonials.length > 0 && current ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 md:p-12 border border-blue-500/20 mb-8"
          >
            <div className="flex gap-1 mb-6">
              {[...Array(current.rating || 5)].map((_, i) => (
                <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            <blockquote className="text-xl md:text-2xl text-white mb-8 font-light leading-relaxed">
              {`"${current.content}"`}
            </blockquote>

            <div className="flex items-center gap-4">
              {current.image && (
                <Image
                  src={current.image}
                  alt={current.author}
                  width={48}
                  height={48}
                  className="rounded-full object-cover border-2 border-blue-400"
                />
              )}
              <div>
                <p className="text-white font-semibold">{current.author}</p>
                <p className="text-slate-400 text-sm">{current.role}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            No testimonials available yet.
          </div>
        )}

        {/* Navigation */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={prev}
              className="p-3 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-blue-400 w-8"
                      : "bg-slate-600 hover:bg-slate-500 w-2"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-3 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* Stats Section */}
        <motion.div
          {...fade}
          className="grid md:grid-cols-3 gap-8 mt-20 pt-20 border-t border-slate-700"
        >
          <div className="text-center">
            <p className="text-4xl font-serif text-blue-400 mb-2">98%</p>
            <p className="text-slate-400">Client Satisfaction</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-serif text-blue-400 mb-2">5K+</p>
            <p className="text-slate-400">Transformations</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-serif text-blue-400 mb-2">15+</p>
            <p className="text-slate-400">Years Experience</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}