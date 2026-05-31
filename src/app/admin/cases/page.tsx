"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"

import ProtectedNav from "@/components/layout/ProtectedNavbar"

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
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

type FormState = {
  category: string
  treatment: string
  before_image: File | null
  after_image: File | null
  result: string
  duration: string
  rating: string
  testimonial: string
  patient: string
}

type Pagination = {
  current_page: number
  last_page: number
  total: number
}

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const CATEGORIES = ["All", "Dental", "Aesthetic"]

const EMPTY_FORM: FormState = {
  category: "Dental",
  treatment: "",
  before_image: null,
  after_image: null,
  result: "",
  duration: "",
  rating: "5",
  testimonial: "",
  patient: "",
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")

  const [modal, setModal] = useState<
    "create" | "edit" | "view" | "delete" | null
  >(null)

  const [selected, setSelected] = useState<Case | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [pagination, setPagination] = useState<Pagination | null>(null)

  /* ───────────────── fetch ───────────────── */
  // FIX 1: Wrap fetchCases in useCallback so it's stable across renders,
  // allowing it to be safely listed as a useEffect dependency.
  const fetchCases = useCallback(async () => {
    setLoading(true)

    const params = new URLSearchParams({
      search,
      category: category === "All" ? "" : category,
      page: String(page),
    })

    const res = await fetch(`/api/cases?${params}`)
    const data = await res.json()

    setCases(data.data || [])
    setPagination({
      current_page: data.current_page || 1,
      last_page: data.last_page || 1,
      total: data.total || 0,
    })

    setLoading(false)
  }, [search, category, page])

  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  /* ───────────────── CRUD ───────────────── */
  const buildFormData = () => {
    const fd = new FormData()

    fd.append("category", form.category)
    fd.append("treatment", form.treatment)
    fd.append("result", form.result)
    fd.append("duration", form.duration)
    fd.append("rating", form.rating)
    fd.append("testimonial", form.testimonial)
    fd.append("patient", form.patient)

    if (form.before_image) fd.append("before_image", form.before_image)
    if (form.after_image) fd.append("after_image", form.after_image)

    return fd
  }

  const handleCreate = async () => {
    await fetch("/api/cases", {
      method: "POST",
      body: buildFormData(),
    })

    closeModal()
    fetchCases()
  }

  const handleUpdate = async () => {
    if (!selected) return

    await fetch(`/api/cases/${selected.id}`, {
      method: "PUT",
      body: buildFormData(),
    })

    closeModal()
    fetchCases()
  }

  const handleDelete = async () => {
    if (!selected) return

    await fetch(`/api/cases/${selected.id}`, {
      method: "DELETE",
    })

    closeModal()
    fetchCases()
  }

  const closeModal = () => {
    setModal(null)
    setSelected(null)
    setForm(EMPTY_FORM)
  }

  /* ───────────────── UI ───────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white text-slate-800">
      <ProtectedNav userRole="admin" />

      <main className="lg:ml-72 px-4 pt-20 pb-24">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Cases Management
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage before & after transformations and patient success stories
            </p>
          </div>

          <button
            onClick={() => {
              setForm(EMPTY_FORM)
              setModal("create")
            }}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/20 text-white font-medium flex items-center gap-2"
          >
            <Plus size={18} />
            Add Case
          </button>
        </div>

        {/* FILTERS */}
        <div className="bg-white/80 backdrop-blur-xl border border-blue-100 rounded-3xl p-5 shadow-sm mb-6">
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
              placeholder="Search treatment or patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                  category === c
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* LIST */}
        <div className="bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl shadow-sm overflow-hidden">
          {/* TOP */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-900">Case Records</h2>

              <p className="text-sm text-slate-500">
                {pagination?.total || 0} total cases
              </p>
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="p-16 text-center text-slate-500">
              Loading cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Search className="text-blue-500" />
              </div>

              <h3 className="font-semibold text-slate-800 mb-1">
                No Cases Found
              </h3>

              <p className="text-sm text-slate-500">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cases.map((c) => (
                <div
                  key={c.id}
                  className="group px-6 py-5 hover:bg-blue-50/50 transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* LEFT */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                        <Eye className="text-blue-600" size={20} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900 text-lg">
                            {c.treatment}
                          </h3>

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              c.category === "Dental"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-cyan-100 text-cyan-700"
                            }`}
                          >
                            {c.category}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 mt-1">
                          Patient: {c.patient || "Unknown"}
                        </p>

                        <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                          {c.result}
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelected(c)
                          setModal("view")
                        }}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-blue-100 hover:text-blue-700 transition flex items-center justify-center"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setSelected(c)
                          setForm({
                            category: c.category,
                            treatment: c.treatment,
                            before_image: null,
                            after_image: null,
                            result: c.result,
                            duration: c.duration || "",
                            rating: String(c.rating || 5),
                            testimonial: c.testimonial || "",
                            patient: c.patient || "",
                          })
                          setModal("edit")
                        }}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-blue-100 hover:text-blue-700 transition flex items-center justify-center"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setSelected(c)
                          setModal("delete")
                        }}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-600 transition flex items-center justify-center"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition flex items-center gap-2 text-sm font-medium"
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          <div className="bg-white border border-slate-200 rounded-xl px-5 h-11 flex items-center text-sm font-medium shadow-sm">
            Page {pagination?.current_page || 1} of {pagination?.last_page || 1}
          </div>

          <button
            onClick={() => setPage((p) => p + 1)}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition flex items-center gap-2 text-sm font-medium"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </main>

      {/* MODALS */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-blue-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {modal === "create" && "Create Case"}
                  {modal === "edit" && "Edit Case"}
                  {modal === "view" && "Case Details"}
                  {modal === "delete" && "Delete Case"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Manage patient transformation records
                </p>
              </div>

              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 transition flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="p-6">
              {/* VIEW */}
              {modal === "view" && selected && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    {/* FIX 2 & 3: Replace <img> with Next.js <Image /> and add descriptive alt props */}
                    <div className="relative h-48 rounded-2xl overflow-hidden border">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${selected.before_image}`}
                        alt={`Before photo for ${selected.treatment} – ${selected.patient ?? "patient"}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 280px"
                      />
                    </div>

                    {/* FIX 4 & 5: Replace <img> with Next.js <Image /> and add descriptive alt props */}
                    <div className="relative h-48 rounded-2xl overflow-hidden border">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${selected.after_image}`}
                        alt={`After photo for ${selected.treatment} – ${selected.patient ?? "patient"}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 280px"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-slate-400">Treatment</p>
                      <p className="font-medium">{selected.treatment}</p>
                    </div>

                    <div>
                      <p className="text-slate-400">Patient</p>
                      <p className="font-medium">{selected.patient}</p>
                    </div>

                    <div>
                      <p className="text-slate-400">Result</p>
                      <p>{selected.result}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* FORM */}
              {(modal === "create" || modal === "edit") && (
                <div className="space-y-5">
                  {/* TREATMENT */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Treatment
                    </label>

                    <input
                      placeholder="Enter treatment name"
                      className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
                      value={form.treatment}
                      onChange={(e) =>
                        setForm({ ...form, treatment: e.target.value })
                      }
                    />
                  </div>

                  {/* PATIENT */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Patient Name
                    </label>

                    <input
                      placeholder="Enter patient name"
                      className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
                      value={form.patient}
                      onChange={(e) =>
                        setForm({ ...form, patient: e.target.value })
                      }
                    />
                  </div>

                  {/* RESULT */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Result Description
                    </label>

                    <textarea
                      placeholder="Describe the treatment result..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition min-h-[120px]"
                      value={form.result}
                      onChange={(e) =>
                        setForm({ ...form, result: e.target.value })
                      }
                    />
                  </div>

                  {/* IMAGE UPLOADS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* BEFORE */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Before Image
                      </label>

                      <label className="block border-2 border-dashed border-slate-200 rounded-2xl p-5 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40 transition cursor-pointer">
                        <div className="mb-3">
                          <p className="text-sm font-medium text-slate-700">
                            Upload Before Photo
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            JPG, PNG up to 5MB
                          </p>
                        </div>

                        <input
                          type="file"
                          className="text-sm text-slate-500"
                          onChange={(e) =>
                            setForm({
                              ...form,
                              before_image: e.target.files?.[0] || null,
                            })
                          }
                        />
                      </label>
                    </div>

                    {/* AFTER */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        After Image
                      </label>

                      <label className="block border-2 border-dashed border-slate-200 rounded-2xl p-5 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40 transition cursor-pointer">
                        <div className="mb-3">
                          <p className="text-sm font-medium text-slate-700">
                            Upload After Photo
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            JPG, PNG up to 5MB
                          </p>
                        </div>

                        <input
                          type="file"
                          className="text-sm text-slate-500"
                          onChange={(e) =>
                            setForm({
                              ...form,
                              after_image: e.target.files?.[0] || null,
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* DELETE */}
              {modal === "delete" && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                    <Trash2 className="text-red-600" />
                  </div>

                  <h3 className="font-semibold text-lg text-slate-900 mb-2">
                    Delete Case?
                  </h3>

                  <p className="text-sm text-slate-500">
                    This action cannot be undone.
                  </p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="px-6 py-5 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="h-11 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>

              {modal === "create" && (
                <button
                  onClick={handleCreate}
                  className="h-11 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/20 text-white font-medium transition"
                >
                  Create Case
                </button>
              )}

              {modal === "edit" && (
                <button
                  onClick={handleUpdate}
                  className="h-11 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/20 text-white font-medium transition"
                >
                  Update Case
                </button>
              )}

              {modal === "delete" && (
                <button
                  onClick={handleDelete}
                  className="h-11 px-5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-medium transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}