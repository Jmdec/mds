"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star } from "lucide-react"
import { motion } from "framer-motion"
import ComparisonSlider from "@/components/ComparisonSlider"
import Link from "next/link"

const fade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

const CATEGORIES = ["All", "Dental", "Aesthetic"]

type Case = {
  id: number
  category: string
  treatment: string
  before_image: string
  after_image: string
  result: string
  duration?: string
  rating?: number
  testimonial?: string
  patient?: string
}

export default function BeforeAfter() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  const [activeCategory, setActiveCategory] = useState("All")
  const [activeCase, setActiveCase] = useState<Case | null>(null)

  // FETCH FROM API
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true)

        const res = await fetch("/api/cases")
        const data = await res.json()

        const fetched = data.data || []

        setCases(fetched)
        setActiveCase(fetched[0] || null)
      } catch (err) {
        console.error("Failed to fetch cases:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  const filtered =
    activeCategory === "All"
      ? cases
      : cases.filter((c) => c.category === activeCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-cyan-400">
        Loading results...
      </div>
    )
  }

  if (!activeCase) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-400">
        No cases found
      </div>
    )
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative pt-32 pb-20 bg-[#020617] overflow-hidden">
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-cyan-400/5 rounded-full blur-[120px] -translate-y-1/2" />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div {...fade}>
            <p className="text-cyan-400 text-sm uppercase tracking-[0.3em] mb-4">
              Results Gallery
            </p>

            <h1 className="font-serif text-5xl md:text-6xl text-white mb-6">
              See the Transformation
            </h1>

            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Drag the slider to reveal real patient results.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-[#0B1220] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fade}>
            <div className="flex flex-wrap justify-between gap-4 mb-6">
              <div>
                <Badge className="bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                  {activeCase.category}
                </Badge>

                <h2 className="font-serif text-2xl text-white mt-2">
                  {activeCase.treatment}
                </h2>
              </div>

              <div className="text-right text-sm">
                <p className="text-cyan-400 font-medium">{activeCase.result}</p>
                <p className="text-slate-500">{activeCase.duration}</p>
              </div>
            </div>

            <ComparisonSlider
              before={`${process.env.NEXT_PUBLIC_API_URL}${activeCase.before_image}`}
              after={`${process.env.NEXT_PUBLIC_API_URL}${activeCase.after_image}`}
              beforeLabel="Before"
              afterLabel="After"
            />

            <div className="mt-6 flex items-start gap-4">
              <div className="flex">
                {Array(activeCase.rating || 5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
              </div>

              <div>
                <p className="text-slate-400 text-sm italic">
                  {activeCase.testimonial}
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  — Patient {activeCase.patient}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* GRID */}
      <section className="bg-[#F8FAFC] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fade} className="text-center mb-12">
            <p className="text-blue-600 text-sm uppercase tracking-[0.3em] mb-3">
              All Cases
            </p>

            <h2 className="font-serif text-3xl text-slate-900 mb-6">
              Browse Transformations
            </h2>

            <div className="flex justify-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-1.5 rounded-full text-sm border transition-all ${
                    activeCategory === cat
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                {...fade}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActiveCase(c)}
                className={`rounded-2xl overflow-hidden border-2 cursor-pointer transition-all bg-white ${
                  activeCase?.id === c.id
                    ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                    : "border-transparent hover:border-slate-300"
                }`}
              >
                <div className="p-4">
                  <ComparisonSlider
                    before={`${process.env.NEXT_PUBLIC_API_URL}${c.before_image}`}
                    after={`${process.env.NEXT_PUBLIC_API_URL}${c.after_image}`}
                    beforeLabel="Before"
                    afterLabel="After"
                  />

                  <div className="mt-4 flex justify-between">
                    <div>
                      <Badge className="mb-1 bg-slate-100 text-slate-700">
                        {c.category}
                      </Badge>

                      <h3 className="font-serif text-lg text-slate-900">
                        {c.treatment}
                      </h3>

                      <p className="text-slate-500 text-sm">{c.result}</p>
                    </div>

                    <Link href="/book" onClick={(e) => e.stopPropagation()}>
                      <Button className="bg-slate-900 text-white">
                        Book <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
