"use client";

import { useRef, useState } from "react";

type Case = {
  id: number;
  category: string;
  treatment: string;
  before_image: string;
  after_image: string;
  result: string;
  duration?: string;
  rating?: number;
  testimonial?: string;
  patient?: string;
};

const CASES: Case[] = [
  {
    id: 1,
    category: "Cosmetic",
    treatment: "Porcelain Veneers",
    before_image: "https://picsum.photos/seed/dba1/800/500",
    after_image: "https://picsum.photos/seed/daa1/800/500",
    result: "Smile fully transformed",
    duration: "2 appointments · 2 weeks",
    rating: 5,
    testimonial:
      "I never smiled with my teeth for 20 years. Now I can't stop. Dr. Santos completely changed my life.",
    patient: "M.R., 34",
  },
  {
    id: 2,
    category: "Orthodontic",
    treatment: "Clear Aligners",
    before_image: "https://picsum.photos/seed/dba2/800/500",
    after_image: "https://picsum.photos/seed/daa2/800/500",
    result: "Crowding corrected",
    duration: "12 months treatment",
    rating: 5,
    testimonial:
      "Invisible aligners meant nobody at work even knew I was straightening my teeth!",
    patient: "J.K., 28",
  },
  {
    id: 3,
    category: "Restorative",
    treatment: "Full Mouth Rehabilitation",
    before_image: "https://picsum.photos/seed/dba3/800/500",
    after_image: "https://picsum.photos/seed/daa3/800/500",
    result: "Function & aesthetics restored",
    duration: "6 months · multiple visits",
    rating: 5,
    testimonial:
      "I can eat properly for the first time in years. The implants feel completely natural.",
    patient: "T.A., 52",
  },
  {
    id: 4,
    category: "Cosmetic",
    treatment: "Teeth Whitening",
    before_image: "https://picsum.photos/seed/dba4/800/500",
    after_image: "https://picsum.photos/seed/daa4/800/500",
    result: "8 shades lighter",
    duration: "Single session · 90 min",
    rating: 5,
    testimonial:
      "The results were instant and dramatic. Everyone noticed the next day!",
    patient: "L.P., 29",
  },
  {
    id: 5,
    category: "Restorative",
    treatment: "Dental Implants",
    before_image: "https://picsum.photos/seed/dba5/800/500",
    after_image: "https://picsum.photos/seed/daa5/800/500",
    result: "Missing teeth replaced",
    duration: "3–6 months",
    rating: 5,
    testimonial:
      "The implants look and feel like my real teeth. Best decision I ever made.",
    patient: "R.S., 47",
  },
  {
    id: 6,
    category: "Orthodontic",
    treatment: "Traditional Braces",
    before_image: "https://picsum.photos/seed/dba6/800/500",
    after_image: "https://picsum.photos/seed/daa6/800/500",
    result: "Perfect alignment achieved",
    duration: "18 months treatment",
    rating: 5,
    testimonial:
      "Worth every visit. My bite is perfect and my confidence is through the roof.",
    patient: "A.C., 16",
  },
];

const CATEGORIES = ["All", "Cosmetic", "Orthodontic", "Restorative"];

const STATS = [
  { value: "2,400+", label: "Patients treated" },
  { value: "4.9★", label: "Average rating" },
  { value: "98%", label: "Satisfaction rate" },
];

function ComparisonSlider({
  before,
  after,
  height = 320,
}: {
  before: string;
  after: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const dragging = useRef(false);

  const move = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPct(
      Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100)),
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden cursor-col-resize select-none w-full rounded-2xl bg-slate-200"
      style={{ height }}
      onMouseDown={(e) => {
        dragging.current = true;
        move(e.clientX);
      }}
      onMouseMove={(e) => {
        if (dragging.current) move(e.clientX);
      }}
      onMouseUp={() => {
        dragging.current = false;
      }}
      onMouseLeave={() => {
        dragging.current = false;
      }}
      onTouchStart={(e) => {
        dragging.current = true;
        move(e.touches[0].clientX);
      }}
      onTouchMove={(e) => {
        if (dragging.current) move(e.touches[0].clientX);
      }}
      onTouchEnd={() => {
        dragging.current = false;
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={before}
        alt="Before"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={after}
        alt="After"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      />
      <span className="pointer-events-none absolute bottom-3 left-3 z-10 text-[10px] font-semibold uppercase tracking-widest bg-black/50 text-white px-2.5 py-1 rounded-full">
        Before
      </span>
      <span className="pointer-events-none absolute bottom-3 right-3 z-10 text-[10px] font-semibold uppercase tracking-widest bg-black/50 text-white px-2.5 py-1 rounded-full">
        After
      </span>
      <div
        className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white z-10"
        style={{ left: `${pct}%` }}
      />
      <div
        className="pointer-events-none absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
        style={{ left: `${pct}%` }}
      >
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
          <path
            d="M6 7H1M1 7L4 4M1 7L4 10"
            stroke="#0f172a"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 7H19M19 7L16 4M19 7L16 10"
            stroke="#0f172a"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="#FBBF24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
    </div>
  );
}

export default function BeforeAfter() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCase, setActiveCase] = useState<Case>(CASES[0]);

  const filtered =
    activeCategory === "All"
      ? CASES
      : CASES.filter((c) => c.category === activeCategory);

  return (
    <div className="bg-white font-sans">
      {/* HERO */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 pt-36 pb-20 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.15),transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto px-6">
          <span className="inline-block text-sky-400 text-[11px] uppercase tracking-[0.3em] mb-5 font-medium">
            Results Gallery
          </span>
          <h1 className="text-5xl md:text-6xl font-serif text-white leading-tight mb-5">
            Real Smiles, <em className="italic text-sky-400">Real Results</em>
          </h1>
          <p className="text-slate-400 text-lg">
            Drag the slider to reveal each patient transformation.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-slate-900 pb-14 pt-2">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-slate-800/60 border border-slate-700 rounded-2xl py-6 text-center"
              >
                <p className="text-3xl font-serif text-white mb-1">{s.value}</p>
                <p className="text-slate-400 text-xs uppercase tracking-widest">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 overflow-hidden border border-slate-100">
            <div className="flex flex-wrap items-start justify-between gap-4 px-8 py-6 border-b border-slate-100">
              <div>
                <span className="inline-block text-[10px] uppercase tracking-[0.18em] bg-sky-50 text-sky-600 border border-sky-100 px-3 py-1 rounded-full mb-2 font-medium">
                  {activeCase.category}
                </span>
                <h2 className="text-2xl font-serif text-slate-900">
                  {activeCase.treatment}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sky-600 font-semibold text-sm">
                  {activeCase.result}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {activeCase.duration}
                </p>
              </div>
            </div>
            <div className="px-4 pt-4">
              <ComparisonSlider
                before={activeCase.before_image}
                after={activeCase.after_image}
                height={340}
              />
            </div>
            <div className="px-8 py-6 flex items-start gap-4 bg-slate-50/50">
              <div className="flex-shrink-0 pt-0.5">
                <Stars count={activeCase.rating ?? 5} />
              </div>
              <div>
                <p className="text-slate-600 text-sm italic leading-relaxed">
                  &ldquo;{activeCase.testimonial}&rdquo;
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  — Patient {activeCase.patient}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sky-500 text-[11px] uppercase tracking-[0.25em] font-medium block mb-3">
              All Cases
            </span>
            <h2 className="text-4xl font-serif text-slate-900 mb-8">
              Browse Transformations
            </h2>
            <div className="flex justify-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm border transition-all duration-150 font-medium ${
                    activeCategory === cat
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-16">No cases found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveCase(c);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 bg-white shadow-sm hover:shadow-lg ${
                    activeCase.id === c.id
                      ? "border-sky-400 shadow-sky-100"
                      : "border-transparent hover:border-slate-200"
                  }`}
                >
                  <ComparisonSlider
                    before={c.before_image}
                    after={c.after_image}
                    height={180}
                  />
                  <div className="p-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-block text-[9px] uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full mb-1.5 font-medium">
                        {c.category}
                      </span>
                      <h3 className="font-serif text-base text-slate-900 leading-tight truncate">
                        {c.treatment}
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5 truncate">
                        {c.result}
                      </p>
                    </div>

                    <a
                      href="/book"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white text-xs rounded-xl hover:bg-slate-700 transition-colors font-medium"
                    >
                      Book
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-slate-900 to-sky-950 py-24">
        <div className="max-w-xl mx-auto px-6 text-center">
          <span className="text-sky-400 text-[11px] uppercase tracking-[0.25em] font-medium block mb-4">
            Get started
          </span>
          <h2 className="text-4xl font-serif text-white mb-4">
            Ready for your{" "}
            <em className="italic text-sky-400">transformation?</em>
          </h2>
          <p className="text-slate-400 mb-8 text-base leading-relaxed">
            Book a free consultation &mdash; no commitment, just a conversation
            about your smile.
          </p>

          <a
            href="/book"
            className="inline-flex items-center gap-2 px-8 py-4 bg-sky-400 text-slate-900 font-semibold rounded-2xl hover:bg-sky-300 transition-colors text-sm"
          >
            Book free consultation
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
