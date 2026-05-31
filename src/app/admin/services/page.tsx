"use client"

import { useEffect, useState, useCallback } from "react"
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
  Stethoscope,
  Sparkles,
  AlertTriangle,
} from "lucide-react"

import ProtectedNav from "@/components/layout/ProtectedNavbar"

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type Service = {
  id: number
  name: string
  category: string
  duration?: string
  price: number
  status: "Active" | "Draft" | "Inactive"
  description?: string
  image?: string | null   // URL from API
}

type FormState = {
  name: string
  category: string
  price: string
  status: string
  description: string
  image: File | null
}

type Pagination = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const CATEGORIES = ["All", "Dental", "Aesthetic"]

const EMPTY_FORM: FormState = {
  name: "",
  category: "Dental",
  price: "",
  status: "Active",
  description: "",
  image: null,
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function statusStyle(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200"
    case "Draft":
      return "bg-amber-50 text-amber-700 border border-amber-200"
    default:
      return "bg-red-50 text-red-700 border border-red-200"
  }
}

function categoryIcon(category: string) {
  return category === "Dental" ? (
    <Stethoscope size={14} className="inline mr-1 opacity-60" />
  ) : (
    <Sparkles size={14} className="inline mr-1 opacity-60" />
  )
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function ServicesPage() {
  /* data */
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<Pagination | null>(null)

  /* filters */
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [page, setPage] = useState(1)

  /* modals */
  const [modal, setModal] = useState<"create" | "edit" | "view" | "delete" | null>(null)
  const [selected, setSelected] = useState<Service | null>(null)

  /* form */
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  // FIX 1: Wrap fetchServices in useCallback so it has a stable reference
  // and can be safely listed as a useEffect dependency.
  const fetchServices = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      search,
      category: selectedCategory === "All" ? "" : selectedCategory,
      page: String(page),
    })
    try {
      const res = await fetch(`/api/services?${params}`, { cache: "no-store" })
      const data = await res.json()
      setServices(data.data || [])
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || 10,
        total: data.total || 0,
      })
    } catch (error) {
      console.error("Failed to fetch services:", error)
      setServices([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, page])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  /* ── crud ── */
  const buildFormData = () => {
    const fd = new FormData()
    // FIX 2: Replace `v as any` with a typed guard — FormData.append only
    // accepts string | Blob, so we handle File (a Blob subtype) and string separately.
    Object.entries(form).forEach(([k, v]) => {
      if (v === null || v === "") return
      if (v instanceof File) {
        fd.append(k, v)
      } else {
        fd.append(k, String(v))
      }
    })
    return fd
  }

  const handleCreate = async () => {
    await fetch("/api/services", { method: "POST", body: buildFormData() })
    closeModal()
    fetchServices()
  }

  const handleUpdate = async () => {
    if (!selected) return
    await fetch(`/api/services/${selected.id}`, { method: "PUT", body: buildFormData() })
    closeModal()
    fetchServices()
  }

  const handleDelete = async () => {
    if (!selected) return
    await fetch(`/api/services/${selected.id}`, { method: "DELETE" })
    closeModal()
    fetchServices()
  }

  /* ── modal helpers ── */
  const openCreate = () => {
    setForm(EMPTY_FORM)
    setModal("create")
  }

 const openEdit = (s: Service) => {
  setSelected(s)

  setForm({
    ...s,
    price: String(s.price),
    description: s.description ?? "",
    image: null,
  })

  setModal("edit")
}

  const openView = (s: Service) => {
    setSelected(s)
    setModal("view")
  }

  const openDelete = (s: Service) => {
    setSelected(s)
    setModal("delete")
  }

  const closeModal = () => {
    setModal(null)
    setSelected(null)
    setForm(EMPTY_FORM)
  }

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <ProtectedNav userRole="admin" />

      <main className="lg:ml-72 px-4 sm:px-6 lg:px-8 pt-20 lg:pt-8 pb-24">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Services
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage dental &amp; aesthetic clinic services
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                       bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                       text-white text-sm font-semibold shadow-sm
                       transition-colors w-full sm:w-auto justify-center"
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search services…"
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50
                         pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition"
            />
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => { setSelectedCategory(c); setPage(1) }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${selectedCategory === c
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table / Cards ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
              Loading services…
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Search size={32} strokeWidth={1.5} />
              <p className="text-sm">No services found</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-sm table-fixed">
                  <colgroup>
                    <col className="w-[35%]" />
                    <col className="w-[18%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[17%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">Service</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">Category</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">Price</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">Status</th>
                      <th className="text-right px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {services.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* FIX 3: Replace <img> with Next.js <Image /> */}
                            {s.image ? (
                              <div className="relative w-9 h-9 shrink-0">
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_API_URL}${s.image}`}
                                  alt={s.name}
                                  fill
                                  className="rounded-lg object-cover border border-slate-100"
                                  sizes="36px"
                                />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center text-slate-400">
                                <Stethoscope size={16} />
                              </div>
                            )}
                            <span className="font-medium text-slate-900 truncate">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {categoryIcon(s.category)}{s.category}
                        </td>
                        <td className="px-4 py-4 text-slate-800 font-semibold">
                          ₱{Number(s.price).toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(s.status)}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <ActionBtn icon={<Eye size={15} />} label="View" onClick={() => openView(s)} />
                            <ActionBtn icon={<Pencil size={15} />} label="Edit" onClick={() => openEdit(s)} />
                            <ActionBtn icon={<Trash2 size={15} />} label="Delete" onClick={() => openDelete(s)} danger />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {services.map((s) => (
                  <div key={s.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* FIX 4: Replace <img> with Next.js <Image /> */}
                        {s.image ? (
                          <div className="relative w-10 h-10 shrink-0">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL}${s.image}`}
                              alt={s.name}
                              fill
                              className="rounded-lg object-cover border border-slate-100"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center text-slate-400">
                            <Stethoscope size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{s.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {categoryIcon(s.category)}{s.category}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(s.status)}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-blue-600 font-semibold text-sm">
                        ₱{Number(s.price).toLocaleString()}
                      </span>
                      <div className="flex gap-1">
                        <ActionBtn icon={<Eye size={15} />} label="View" onClick={() => openView(s)} />
                        <ActionBtn icon={<Pencil size={15} />} label="Edit" onClick={() => openEdit(s)} />
                        <ActionBtn icon={<Trash2 size={15} />} label="Delete" onClick={() => openDelete(s)} danger />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                         border border-slate-200 bg-white text-slate-700
                         hover:bg-slate-50 hover:border-slate-300
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors shadow-sm"
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            <span className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-700">{page}</span>
              {pagination && pagination.last_page > 0 && (
                <> of <span className="font-semibold text-slate-700">{pagination.last_page}</span></>
              )}
            </span>

            <button
              disabled={loading || !pagination || page >= (pagination.last_page || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                         border border-slate-200 bg-white text-slate-700
                         hover:bg-slate-50 hover:border-slate-300
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors shadow-sm"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────
          MODALS
      ───────────────────────────────────────── */}

      {modal === "create" && (
        <Modal title="Add New Service" onClose={closeModal}>
          <ServiceForm form={form} setForm={setForm} />
          <ModalFooter>
            <OutlineBtn onClick={closeModal}>Cancel</OutlineBtn>
            <PrimaryBtn onClick={handleCreate}>Create Service</PrimaryBtn>
          </ModalFooter>
        </Modal>
      )}

      {modal === "edit" && selected && (
        <Modal title="Edit Service" onClose={closeModal}>
          <ServiceForm form={form} setForm={setForm} />
          <ModalFooter>
            <OutlineBtn onClick={closeModal}>Cancel</OutlineBtn>
            <PrimaryBtn onClick={handleUpdate}>Save Changes</PrimaryBtn>
          </ModalFooter>
        </Modal>
      )}

      {modal === "view" && selected && (
        <Modal title="Service Details" onClose={closeModal}>
          <ViewService service={selected} />
          <ModalFooter>
            <PrimaryBtn onClick={closeModal}>Close</PrimaryBtn>
          </ModalFooter>
        </Modal>
      )}

      {modal === "delete" && selected && (
        <Modal title="Delete Service" onClose={closeModal} size="sm">
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <div>
              {/* FIX 5 & 6: Escape the raw " characters around the service name */}
              <p className="font-semibold text-slate-900">Delete &quot;{selected.name}&quot;?</p>
              <p className="text-sm text-slate-500 mt-1">This action cannot be undone.</p>
            </div>
          </div>
          <ModalFooter>
            <OutlineBtn onClick={closeModal}>Cancel</OutlineBtn>
            <DangerBtn onClick={handleDelete}>Delete</DangerBtn>
          </ModalFooter>
        </Modal>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   SHARED UI COMPONENTS
───────────────────────────────────────── */

function Modal({
  title,
  children,
  onClose,
  size = "md",
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  size?: "sm" | "md"
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full
          ${size === "sm" ? "max-w-sm" : "max-w-lg"}
          max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-base">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-slate-100">
      {children}
    </div>
  )
}

function PrimaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white
                 text-sm font-semibold transition-colors"
    >
      {children}
    </button>
  )
}

function OutlineBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50
                 text-slate-700 text-sm font-medium transition-colors"
    >
      {children}
    </button>
  )
}

function DangerBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white
                 text-sm font-semibold transition-colors"
    >
      {children}
    </button>
  )
}

function ActionBtn({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
        ${danger
          ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
          : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
        }`}
    >
      {icon}
    </button>
  )
}

/* ─────────────────────────────────────────
   SERVICE FORM
───────────────────────────────────────── */
function ServiceForm({
  form,
  setForm,
}: {
  form: FormState
  setForm: (f: FormState) => void
}) {
  const field = (label: string, node: React.ReactNode) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {node}
    </div>
  )

  const inputCls =
    "w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"

  return (
    <div className="flex flex-col gap-4">
      {field(
        "Service Name",
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Teeth Whitening"
          className={inputCls}
        />
      )}

      {field(
        "Price (₱)",
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="0.00"
          className={inputCls}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        {field(
          "Category",
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputCls}
          >
            <option>Dental</option>
            <option>Aesthetic</option>
          </select>
        )}

        {field(
          "Status",
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={inputCls}
          >
            <option>Active</option>
            <option>Draft</option>
            <option>Inactive</option>
          </select>
        )}
      </div>

      {field(
        "Description",
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description of the service…"
          rows={3}
          className={`${inputCls} h-auto py-2 resize-none`}
        />
      )}

      {field(
        "Image",
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, image: e.target.files?.[0] ?? null })}
          className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-4
                     file:rounded-lg file:border-0 file:text-sm file:font-medium
                     file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                     cursor-pointer"
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   VIEW SERVICE (read-only detail)
───────────────────────────────────────── */
function ViewService({ service }: { service: Service }) {
  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between items-start gap-4 py-3 border-b border-slate-50 last:border-0">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">
        {label}
      </span>
      <span className="text-sm text-slate-800 text-right">{value}</span>
    </div>
  )

  return (
    <div>
      {/* FIX 7: Replace <img> with Next.js <Image /> in ViewService */}
      {service.image && (
        <div className="relative w-full h-44 mb-5">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${service.image}`}
            alt={service.name}
            fill
            className="object-cover rounded-xl border border-slate-100"
            sizes="(max-width: 768px) 100vw, 512px"
          />
        </div>
      )}
      {row("Name", <span className="font-semibold">{service.name}</span>)}
      {row("Category", <>{categoryIcon(service.category)}{service.category}</>)}
      {row("Price", <span className="font-semibold text-blue-600">₱{Number(service.price).toLocaleString()}</span>)}
      {row(
        "Status",
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(service.status)}`}>
          {service.status}
        </span>
      )}
      {service.description && row("Description", service.description)}
    </div>
  )
}