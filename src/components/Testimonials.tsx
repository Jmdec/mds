"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
} from "lucide-react";

interface Testimonial {
  id: number;
  client_name: string;
  client_email: string;
  rating: number;
  message: string;
  status: string;
  created_at: string;
}

const fade = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    message: "",
  });

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/testimonials?status=approved", {
          cache: "no-store",
        });
        const data = await res.json();
        // Laravel controller returns a plain array
        setTestimonials(Array.isArray(data) ? data : []);
      } catch {
        console.error("Failed to fetch testimonials");
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const next = () =>
    setCurrentIndex((prev) => (prev + 1) % (testimonials.length || 1));
  const prev = () =>
    setCurrentIndex(
      (prev) =>
        (prev - 1 + (testimonials.length || 1)) % (testimonials.length || 1),
    );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "message") setCharCount(value.length);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValid =
    formData.client_name.trim() &&
    formData.client_email.trim() &&
    formData.message.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Field names match Laravel controller validation rules exactly
        body: JSON.stringify({
          client_name: formData.client_name,
          client_email: formData.client_email,
          message: formData.message,
          rating,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
      setFormData({ client_name: "", client_email: "", message: "" });
      setRating(5);
      setCharCount(0);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const current = testimonials[currentIndex];

  return (
    <section className="bg-gradient-to-br from-slate-950 to-slate-900 py-24 px-4">
      <div className="max-w-7xl mx-auto">
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
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Stories From Our Patients
          </h2>
          <p className="text-slate-400 text-lg">
            Real results from real people who transformed their smile and
            confidence.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* LEFT — Carousel */}
          <motion.div {...fade}>
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              </div>
            )}

            {!loading && testimonials.length === 0 && (
              <div className="flex items-center justify-center py-20 rounded-2xl border border-slate-700 text-slate-400 text-center px-8">
                No testimonials yet — be the first to share your experience!
              </div>
            )}

            {!loading && testimonials.length > 0 && current && (
              <div className="relative">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 md:p-10 border border-blue-500/20"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i < current.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-600"
                        }
                      />
                    ))}
                  </div>

                  <p className="text-6xl text-blue-400/30 font-serif leading-none mb-2">
                    &ldquo;
                  </p>

                  <blockquote className="text-lg md:text-xl text-white mb-8 font-light leading-relaxed">
                    {current.message}
                  </blockquote>

                  <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-6" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">
                        {current.client_name}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {new Date(current.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    {/* Rating badge */}
                    <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1.5 rounded-full">
                      <Star
                        size={14}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span className="text-yellow-400 text-sm font-semibold">
                        {current.rating}/5
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Navigation */}
                {testimonials.length > 1 && (
                  <div className="flex items-center justify-center gap-6 mt-6">
                    <button
                      onClick={prev}
                      className="p-3 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-all"
                      aria-label="Previous"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="flex gap-2">
                      {testimonials.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
                          className={`h-2 rounded-full transition-all ${
                            i === currentIndex
                              ? "bg-blue-400 w-8"
                              : "bg-slate-600 hover:bg-slate-500 w-2"
                          }`}
                          aria-label={`Go to ${i + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={next}
                      className="p-3 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-all"
                      aria-label="Next"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* Counter */}
                {testimonials.length > 1 && (
                  <p className="text-center text-slate-500 text-sm mt-3">
                    {currentIndex + 1} / {testimonials.length}
                  </p>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-slate-700">
              {[
                { value: "98%", label: "Patient Satisfaction" },
                { value: "15K+", label: "Patients Treated" },
                { value: "10+", label: "Years of Excellence" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-serif text-blue-400 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Form */}
          <motion.div {...fade} transition={{ delay: 0.15 }}>
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-white text-xl font-semibold">
                    Thank You!
                  </h3>
                  <p className="text-slate-400 text-sm max-w-xs">
                    Your testimonial has been received and will appear after our
                    team reviews it.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-white text-2xl font-serif mb-2">
                    Share Your Experience
                  </h3>
                  <p className="text-slate-400 text-sm mb-8">
                    Help others discover quality dental care by sharing your
                    story.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="client_name"
                        value={formData.client_name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Maria Santos"
                        className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="client_email"
                        value={formData.client_email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition text-sm"
                      />
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Your Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              size={28}
                              className={
                                star <= (hoverRating || rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-600"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">
                          Your Experience
                        </label>
                        <span className="text-xs text-slate-500">
                          {charCount}/500
                        </span>
                      </div>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        maxLength={500}
                        placeholder="Tell us about your dental treatment — what procedure you had, how the team made you feel, and the results you experienced..."
                        className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition resize-none text-sm"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting || !isValid}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:cursor-not-allowed text-sm"
                    >
                      <Send size={16} />
                      {submitting ? "Submitting..." : "Submit Testimonial"}
                    </button>

                    <p className="text-xs text-slate-500 text-center">
                      ✓ Reviewed by our team before publishing
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
