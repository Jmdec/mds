"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  AlertTriangle,
  FlaskConical,
  Tag,
  CalendarDays,
  Layers,
  DollarSign,
  ShoppingCart,
} from "lucide-react"

import ProtectedNav from "@/components/layout/ProtectedNavbar"
import { useToast } from "@/hooks/use-toast"

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type InventoryItem = {
  id: number
  item_name: string
  category: string | null
  quantity: number
  unit: string | null
  expiry_date: string | null
  cost_price: number | null
  selling_price: number | null
}

type FormState = {
  item_name: string
  category: string
  quantity: string
  unit: string
  expiry_date: string
  cost_price: string
  selling_price: string
}

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const CATEGORIES = ["All", "Dental Supplies", "Aesthetic Supplies", "Medications", "Equipment", "Consumables"]
const FORM_CATEGORIES = ["Dental Supplies", "Aesthetic Supplies", "Medications", "Equipment", "Consumables"]

const EMPTY_FORM: FormState = {
  item_name: "",
  category: "Dental Supplies",
  quantity: "",
  unit: "",
  expiry_date: "",
  cost_price: "",
  selling_price: "",
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function stockBadge(qty: number) {
  if (qty === 0)
    return { label: "Out of Stock", cls: "bg-red-50 text-red-700 border border-red-200" }
  if (qty <= 10)
    return { label: "Low Stock", cls: "bg-amber-50 text-amber-700 border border-amber-200" }
  return { label: "In Stock", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" }
}

function formatPrice(val: number | null) {
  if (val === null || val === undefined) return "—"
  return `₱${Number(val).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
}

function formatDate(val: string | null) {
  if (!val) return "—"
  return new Date(val).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
}

function isExpiringSoon(val: string | null) {
  if (!val) return false
  const diff = (new Date(val).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 30
}

function isExpired(val: string | null) {
  if (!val) return false
  return new Date(val).getTime() < Date.now()
}

function categoryColor(cat: string | null) {
  switch (cat) {
    case "Dental Supplies": return "bg-blue-50 text-blue-700 border-blue-200"
    case "Aesthetic Supplies": return "bg-purple-50 text-purple-700 border-purple-200"
    case "Medications": return "bg-teal-50 text-teal-700 border-teal-200"
    case "Equipment": return "bg-slate-100 text-slate-700 border-slate-200"
    case "Consumables": return "bg-orange-50 text-orange-700 border-orange-200"
    default: return "bg-slate-100 text-slate-600 border-slate-200"
  }
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function InventoryPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const [modal, setModal] = useState<"create" | "edit" | "view" | "delete" | null>(null)
  const [selected, setSelected] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  /* ── filtered/paginated client-side since controller returns all ── */
  const filtered = items.filter((i) => {
    const matchSearch = i.item_name.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategory === "All" || i.category === selectedCategory
    return matchSearch && matchCat
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  /* ── validation ── */
  const validateForm = (): boolean => {
    if (!form.item_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Item name is required",
        variant: "destructive",
      })
      return false
    }
    if (!form.quantity) {
      toast({
        title: "Validation Error",
        description: "Quantity is required",
        variant: "destructive",
      })
      return false
    }
    if (isNaN(parseInt(form.quantity)) || parseInt(form.quantity) < 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be a positive number",
        variant: "destructive",
      })
      return false
    }
    if (form.cost_price && (isNaN(parseFloat(form.cost_price)) || parseFloat(form.cost_price) < 0)) {
      toast({
        title: "Validation Error",
        description: "Cost price must be a positive number",
        variant: "destructive",
      })
      return false
    }
    if (form.selling_price && (isNaN(parseFloat(form.selling_price)) || parseFloat(form.selling_price) < 0)) {
      toast({
        title: "Validation Error",
        description: "Selling price must be a positive number",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  // FIX 1: Wrap fetchItems in useCallback so it has a stable reference
  // and can be safely listed as a useEffect dependency.
  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/inventory", { cache: "no-store" })
      if (!res.ok) {
        throw new Error(`Failed to fetch inventory: ${res.status}`)
      }
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch inventory:", err)
      toast({
        title: "Error",
        description: "Failed to load inventory items",
        variant: "destructive",
      })
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchItems() }, [fetchItems])

  /* reset page on filter change */
  useEffect(() => { setPage(1) }, [search, selectedCategory])

  /* ── crud ── */
  const buildPayload = () => ({
    item_name: form.item_name.trim(),
    category: form.category || null,
    quantity: parseInt(form.quantity) || 0,
    unit: form.unit || null,
    expiry_date: form.expiry_date || null,
    cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
    selling_price: form.selling_price ? parseFloat(form.selling_price) : null,
  })

  const handleCreate = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || `Failed to create item: ${res.status}`)
      }

      toast({
        title: "Success",
        description: "Inventory item created successfully",
      })
      closeModal()
      fetchItems()
    } catch (err) {
      console.error("Create error:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create inventory item",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selected || !validateForm()) return

    setSaving(true)
    try {
      const res = await fetch(`/api/inventory/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || `Failed to update item: ${res.status}`)
      }

      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      })
      closeModal()
      fetchItems()
    } catch (err) {
      console.error("Update error:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update inventory item",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return

    setSaving(true)
    try {
      const res = await fetch(`/api/inventory/${selected.id}`, { method: "DELETE" })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || `Failed to delete item: ${res.status}`)
      }

      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      })
      closeModal()
      fetchItems()
    } catch (err) {
      console.error("Delete error:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete inventory item",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  /* ── modal helpers ── */
  const openCreate = () => { setForm(EMPTY_FORM); setModal("create") }
  const openEdit = (i: InventoryItem) => {
    setSelected(i)
    setForm({
      item_name: i.item_name,
      category: i.category ?? "Dental Supplies",
      quantity: String(i.quantity),
      unit: i.unit ?? "",
      expiry_date: i.expiry_date ? i.expiry_date.split("T")[0] : "",
      cost_price: i.cost_price !== null ? String(i.cost_price) : "",
      selling_price: i.selling_price !== null ? String(i.selling_price) : "",
    })
    setModal("edit")
  }
  const openView = (i: InventoryItem) => { setSelected(i); setModal("view") }
  const openDelete = (i: InventoryItem) => { setSelected(i); setModal("delete") }
  const closeModal = () => { setModal(null); setSelected(null); setForm(EMPTY_FORM) }

  /* ── summary stats ── */
  const totalItems = items.length
  const lowStock = items.filter((i) => i.quantity > 0 && i.quantity <= 10).length
  const outOfStock = items.filter((i) => i.quantity === 0).length
  const expiringSoon = items.filter((i) => isExpiringSoon(i.expiry_date)).length

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f0f4ff] font-sans">
      <ProtectedNav userRole="admin" />

      <main className="lg:ml-72 px-4 sm:px-6 lg:px-8 pt-20 lg:pt-8 pb-24">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Inventory
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track clinic supplies, medications &amp; equipment
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
            Add Item
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Items" value={totalItems} icon={<Package size={18} />} color="blue" />
          <StatCard label="Low Stock" value={lowStock} icon={<Layers size={18} />} color="amber" />
          <StatCard label="Out of Stock" value={outOfStock} icon={<AlertTriangle size={18} />} color="red" />
          <StatCard label="Expiring Soon" value={expiringSoon} icon={<CalendarDays size={18} />} color="orange" />
        </div>

        {/* ── Filters ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory…"
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50
                         pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors
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

        {/* ── Table ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-sm gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              Loading inventory…
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <Package size={36} strokeWidth={1.2} />
              <p className="text-sm">No items found</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      {["Item", "Category", "Quantity", "Unit", "Expiry", "Cost Price", "Selling Price", "Status", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginated.map((item) => {
                      const stock = stockBadge(item.quantity)
                      const expired = isExpired(item.expiry_date)
                      const expiring = isExpiringSoon(item.expiry_date)
                      return (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <FlaskConical size={14} className="text-blue-500" />
                              </div>
                              <span className="font-medium text-slate-900 truncate max-w-[160px]">{item.item_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {item.category ? (
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${categoryColor(item.category)}`}>
                                {item.category}
                              </span>
                            ) : <span className="text-slate-400">—</span>}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-900">{item.quantity}</td>
                          <td className="px-4 py-3.5 text-slate-500">{item.unit ?? "—"}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {item.expiry_date ? (
                              <span className={`text-sm font-medium ${expired ? "text-red-600" : expiring ? "text-amber-600" : "text-slate-600"}`}>
                                {expired && "⚠ "}{expiring && !expired && ""}{formatDate(item.expiry_date)}
                              </span>
                            ) : <span className="text-slate-400">—</span>}
                          </td>
                          <td className="px-4 py-3.5 text-slate-700 font-medium">{formatPrice(item.cost_price)}</td>
                          <td className="px-4 py-3.5 text-blue-700 font-semibold">{formatPrice(item.selling_price)}</td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${stock.cls}`}>
                              {stock.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                              <ActionBtn icon={<Eye size={15} />} label="View" onClick={() => openView(item)} />
                              <ActionBtn icon={<Pencil size={15} />} label="Edit" onClick={() => openEdit(item)} />
                              <ActionBtn icon={<Trash2 size={15} />} label="Delete" onClick={() => openDelete(item)} danger />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {paginated.map((item) => {
                  const stock = stockBadge(item.quantity)
                  const expired = isExpired(item.expiry_date)
                  const expiring = isExpiringSoon(item.expiry_date)
                  return (
                    <div key={item.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <FlaskConical size={15} className="text-blue-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{item.item_name}</p>
                            {item.category && (
                              <span className={`inline-flex mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium border ${categoryColor(item.category)}`}>
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${stock.cls}`}>
                          {stock.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Qty / Unit</p>
                          <p className="font-semibold text-slate-800">{item.quantity} {item.unit ?? ""}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Expiry</p>
                          <p className={`font-medium ${expired ? "text-red-600" : expiring ? "text-amber-600" : "text-slate-700"}`}>
                            {formatDate(item.expiry_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Cost Price</p>
                          <p className="font-medium text-slate-700">{formatPrice(item.cost_price)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Selling Price</p>
                          <p className="font-semibold text-blue-700">{formatPrice(item.selling_price)}</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1">
                        <ActionBtn icon={<Eye size={15} />} label="View" onClick={() => openView(item)} />
                        <ActionBtn icon={<Pencil size={15} />} label="Edit" onClick={() => openEdit(item)} />
                        <ActionBtn icon={<Trash2 size={15} />} label="Delete" onClick={() => openDelete(item)} danger />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                         border border-slate-200 bg-white text-slate-700
                         hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors shadow-sm"
            >
              <ChevronLeft size={15} /> Previous
            </button>
            <span className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-700">{page}</span> of{" "}
              <span className="font-semibold text-slate-700">{totalPages}</span>
              <span className="ml-2 text-slate-400">({filtered.length} items)</span>
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                         border border-slate-200 bg-white text-slate-700
                         hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors shadow-sm"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </main>

      {/* ── Modals ── */}
      {modal === "create" && (
        <Modal title="Add Inventory Item" onClose={closeModal}>
          <InventoryForm form={form} setForm={setForm} />
          <ModalFooter>
            <OutlineBtn onClick={closeModal}>Cancel</OutlineBtn>
            <PrimaryBtn onClick={handleCreate} loading={saving}>Add Item</PrimaryBtn>
          </ModalFooter>
        </Modal>
      )}

      {modal === "edit" && selected && (
        <Modal title="Edit Item" onClose={closeModal}>
          <InventoryForm form={form} setForm={setForm} />
          <ModalFooter>
            <OutlineBtn onClick={closeModal}>Cancel</OutlineBtn>
            <PrimaryBtn onClick={handleUpdate} loading={saving}>Save Changes</PrimaryBtn>
          </ModalFooter>
        </Modal>
      )}

      {modal === "view" && selected && (
        <Modal title="Item Details" onClose={closeModal}>
          <ViewItem item={selected} />
          <ModalFooter>
            <OutlineBtn onClick={closeModal}>Close</OutlineBtn>
            <PrimaryBtn onClick={() => { closeModal(); openEdit(selected) }}>Edit Item</PrimaryBtn>
          </ModalFooter>
        </Modal>
      )}

      {modal === "delete" && selected && (
        <Modal title="Delete Item" onClose={closeModal} size="sm">
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <div>
              {/* FIX 2 & 3: Replace raw " characters with &quot; entities */}
              <p className="font-semibold text-slate-900 text-base">Delete &quot;{selected.item_name}&quot;?</p>
              <p className="text-sm text-slate-500 mt-1">This action cannot be undone.</p>
            </div>
          </div>
          <ModalFooter>
            <OutlineBtn onClick={closeModal}>Cancel</OutlineBtn>
            <DangerBtn onClick={handleDelete} loading={saving}>Delete Item</DangerBtn>
          </ModalFooter>
        </Modal>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: "blue" | "amber" | "red" | "orange"
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    red: "bg-red-50 text-red-600 border-red-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 leading-tight">{label}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   MODAL WRAPPER
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
        className={`bg-white rounded-2xl shadow-2xl w-full
          ${size === "sm" ? "max-w-sm" : "max-w-xl"}
          max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package size={15} className="text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-900 text-base">{title}</h2>
          </div>
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

/* ─────────────────────────────────────────
   BUTTONS
───────────────────────────────────────── */
function PrimaryBtn({
  onClick,
  children,
  loading,
}: {
  onClick: () => void
  children: React.ReactNode
  loading?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white
                 text-sm font-semibold transition-colors disabled:opacity-60 inline-flex items-center gap-2"
    >
      {loading && <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
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

function DangerBtn({
  onClick,
  children,
  loading,
}: {
  onClick: () => void
  children: React.ReactNode
  loading?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white
                 text-sm font-semibold transition-colors disabled:opacity-60 inline-flex items-center gap-2"
    >
      {loading && <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
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
   INVENTORY FORM
───────────────────────────────────────── */
function InventoryForm({
  form,
  setForm,
}: {
  form: FormState
  setForm: (f: FormState) => void
}) {
  const inputCls =
    "w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"

  const field = (
    label: string,
    icon: React.ReactNode,
    node: React.ReactNode,
    hint?: string
  ) => (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
        <span className="text-blue-400">{icon}</span>
        {label}
      </label>
      {node}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {field(
        "Item Name",
        <FlaskConical size={12} />,
        <input
          value={form.item_name}
          onChange={(e) => setForm({ ...form, item_name: e.target.value })}
          placeholder="e.g. Dental Floss"
          className={inputCls}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        {field(
          "Category",
          <Tag size={12} />,
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputCls}
          >
            {FORM_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        )}

        {field(
          "Unit",
          <Layers size={12} />,
          <input
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="e.g. pcs, boxes, ml"
            className={inputCls}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field(
          "Quantity",
          <Package size={12} />,
          <input
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="0"
            className={inputCls}
          />
        )}

        {field(
          "Expiry Date",
          <CalendarDays size={12} />,
          <input
            type="date"
            value={form.expiry_date}
            onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
            className={inputCls}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field(
          "Cost Price (₱)",
          <DollarSign size={12} />,
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.cost_price}
            onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
            placeholder="0.00"
            className={inputCls}
          />
        )}

        {field(
          "Selling Price (₱)",
          <ShoppingCart size={12} />,
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.selling_price}
            onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
            placeholder="0.00"
            className={inputCls}
          />
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   VIEW ITEM (read-only)
───────────────────────────────────────── */
function ViewItem({ item }: { item: InventoryItem }) {
  const stock = stockBadge(item.quantity)
  const expired = isExpired(item.expiry_date)
  const expiring = isExpiringSoon(item.expiry_date)

  const row = (
    label: string,
    icon: React.ReactNode,
    value: React.ReactNode
  ) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 gap-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">
        <span className="text-blue-400">{icon}</span>
        {label}
      </div>
      <span className="text-sm text-slate-800 text-right">{value}</span>
    </div>
  )

  return (
    <div>
      {/* Item header card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-5 border border-blue-100 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-white border border-blue-100 flex items-center justify-center shadow-sm shrink-0">
          <FlaskConical size={24} className="text-blue-500" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg leading-tight">{item.item_name}</p>
          {item.category && (
            <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColor(item.category)}`}>
              {item.category}
            </span>
          )}
        </div>
        <div className="ml-auto">
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${stock.cls}`}>
            {stock.label}
          </span>
        </div>
      </div>

      <div className="bg-slate-50/60 rounded-xl px-4 divide-y divide-slate-100 border border-slate-100">
        {row("Quantity", <Package size={13} />,
          <span className="font-bold text-slate-900 text-base">{item.quantity} {item.unit ?? ""}</span>
        )}
        {row("Expiry Date", <CalendarDays size={13} />,
          item.expiry_date ? (
            <span className={`font-medium ${expired ? "text-red-600" : expiring ? "text-amber-600" : "text-slate-700"}`}>
              {expired ? "⚠ EXPIRED — " : expiring ? "⏳ Expiring — " : ""}{formatDate(item.expiry_date)}
            </span>
          ) : <span className="text-slate-400">No expiry date</span>
        )}
        {row("Cost Price", <DollarSign size={13} />,
          <span className="font-semibold text-slate-800">{formatPrice(item.cost_price)}</span>
        )}
        {row("Selling Price", <ShoppingCart size={13} />,
          <span className="font-bold text-blue-700 text-base">{formatPrice(item.selling_price)}</span>
        )}
        {item.cost_price && item.selling_price && row("Margin", <Tag size={13} />,
          (() => {
            const margin = ((item.selling_price - item.cost_price) / item.selling_price) * 100
            return (
              <span className={`font-semibold ${margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {margin.toFixed(1)}%
              </span>
            )
          })()
        )}
      </div>
    </div>
  )
}