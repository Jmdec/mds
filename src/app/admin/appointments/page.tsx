"use client"

import { useState, useEffect, useCallback } from "react";
import {
  Calendar, Clock, CheckCircle, XCircle, Plus, ChevronLeft, ChevronRight,
  Mail, AlertCircle, Stethoscope, Search, Filter, RefreshCw, ChevronDown,
  User, Phone, FileText, Eye, Trash2
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const KEYS = ["token", "auth_token", "access_token", "sanctum_token", "bearerToken"];
  for (const k of KEYS) {
    const v = localStorage.getItem(k) ?? sessionStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  approved:  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  pending:   { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   border: "border-amber-200"   },
  new:       { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   border: "border-amber-200"   },
  cancelled: { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     border: "border-red-200"     },
  rejected:  { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     border: "border-red-200"     },
};

interface Booking {
  id?: number | string;
  user_id?: number;
  service_id?: number;
  booking_date?: string | null;
  status?: string;
  notes?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status?: string }) {
  const s = STATUS_STYLES[status as string] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status ?? "pending"}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-5 right-5 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm
      ${type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
      {type === "success"
        ? <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
        : <AlertCircle size={16} className="text-red-500 flex-shrink-0" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><XCircle size={14} /></button>
    </div>
  );
}

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────
function ConfirmDeleteDialog({ booking, onConfirm, onCancel }: {
  booking: Booking | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!booking) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-red-100 rounded-2xl max-w-sm w-full p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Delete Booking</h3>
            <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-5">
          Are you sure you want to delete the booking for{" "}
          <span className="font-semibold text-slate-800">{booking.name ?? "this patient"}</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Action Modal ─────────────────────────────────────────────────────────────
type ActionModalState = {
  open: boolean; type: string | null; booking: Booking | null; notes: string; submitting: boolean;
};

function ActionModal({ modal, onClose, onSubmit, onChange }: {
  modal: ActionModalState; onClose: () => void; onSubmit: () => void; onChange: (v: string) => void;
}) {
  if (!modal.open || !modal.booking) return null;
  const isApprove = modal.type === "approve";
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-blue-100 rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isApprove ? "bg-emerald-50" : "bg-red-50"}`}>
              {isApprove ? <CheckCircle size={18} className="text-emerald-600" /> : <XCircle size={18} className="text-red-600" />}
            </div>
            <h3 className="font-semibold text-slate-800">{isApprove ? "Approve Booking" : "Reject Booking"}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <XCircle size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="bg-[#f4f8ff] border border-blue-100 rounded-xl p-4 mb-4 grid grid-cols-2 gap-3">
          {[
            ["Name",    modal.booking.name],
            ["Email",   modal.booking.email],
            ["Date",    modal.booking.booking_date ? new Date(modal.booking.booking_date).toLocaleDateString() : "—"],
            ["Service", modal.booking.notes?.replace("Service: ", "") || "—"],
          ].map(([label, val]) => (
            <div key={label}>
              <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
              <div className="text-sm text-slate-700 font-medium truncate">{val}</div>
            </div>
          ))}
        </div>

        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
            {isApprove ? "Message to Client" : "Reason for Rejection"} <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3} value={modal.notes} onChange={e => onChange(e.target.value)}
            placeholder={isApprove
              ? "We are pleased to confirm your appointment. We look forward to seeing you."
              : "Unfortunately we cannot accommodate this time. Please rebook at a different slot."}
            className="w-full px-3.5 py-2.5 bg-[#f4f8ff] border border-blue-100 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 resize-none text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} disabled={modal.submitting}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm">
            Cancel
          </button>
          <button onClick={onSubmit} disabled={modal.submitting}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 ${
              isApprove ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
            }`}>
            {modal.submitting ? "Processing…" : isApprove ? "Approve & Notify" : "Reject & Notify"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── New Booking Modal ────────────────────────────────────────────────────────
function NewBookingModal({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: () => void;
}) {
  type F = { name: string; email: string; phone: string; date: string; time: string; service: string; notes: string };
  const blank: F = { name: "", email: "", phone: "", date: "", time: "", service: "", notes: "" };
  const [form, setForm] = useState<F>(blank);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const TIME_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"];

  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.date || !form.time) {
      setError("Please fill in all required fields."); return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone,
          date: form.date, time: form.time, package: form.service, notes: form.notes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message || "Failed to create booking.");
      onSuccess(); onClose(); setForm(blank);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof F, type: string, ph: string) => (
    <div key={key}>
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={ph}
        className="w-full px-3.5 py-2.5 bg-[#f4f8ff] border border-blue-100 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 text-sm" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-blue-100 rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <h3 className="font-semibold text-slate-800">New Booking</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <XCircle size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {field("Full Name *", "name",  "text",  "Juan dela Cruz")}
            {field("Email *",     "email", "email", "juan@example.com")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("Phone",   "phone",   "tel",  "+63 912 345 6789")}
            {field("Service", "service", "text", "e.g. Dental Implants")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Date *</label>
              <input type="date" value={form.date} min={new Date().toISOString().split("T")[0]}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#f4f8ff] border border-blue-100 rounded-xl text-slate-700 focus:outline-none focus:border-blue-400 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Time *</label>
              <select value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#f4f8ff] border border-blue-100 rounded-xl text-slate-700 focus:outline-none focus:border-blue-400 text-sm">
                <option value="">Select time</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Any additional notes…"
              className="w-full px-3.5 py-2.5 bg-[#f4f8ff] border border-blue-100 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 text-sm resize-none" />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm disabled:opacity-50">
              {loading ? "Creating…" : "Create Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── View Detail Modal ────────────────────────────────────────────────────────
function ViewModal({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  if (!booking) return null;
  const dateObj = booking.booking_date ? new Date(booking.booking_date) : null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-blue-100 rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-blue-600" />
            <h3 className="font-semibold text-slate-800">Booking Details</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <XCircle size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-0">
          <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Status</span>
            <StatusBadge status={booking.status} />
          </div>
          {[
            { icon: <User size={14} />,     label: "Name",    val: booking.name ?? "—" },
            { icon: <Mail size={14} />,     label: "Email",   val: booking.email ?? "—" },
            { icon: <Phone size={14} />,    label: "Phone",   val: booking.phone ?? "—" },
            { icon: <Calendar size={14} />, label: "Date",    val: dateObj ? dateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—" },
            { icon: <Clock size={14} />,    label: "Time",    val: dateObj ? dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—" },
            { icon: <FileText size={14} />, label: "Service", val: booking.notes?.replace("Service: ", "") ?? "—" },
          ].map(({ icon, label, val }) => (
            <div key={label} className="flex items-start justify-between py-2.5 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-500 flex items-center gap-2">{icon}{label}</span>
              <span className="text-sm text-slate-700 font-medium text-right max-w-[58%] break-words">{val}</span>
            </div>
          ))}
        </div>

        <button onClick={onClose}
          className="mt-5 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm">
          Close
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminBookingsTable() {
  const [bookings,     setBookings]     = useState<Booking[]>([]);
  const [meta,         setMeta]         = useState<PaginationMeta | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [fetchError,   setFetchError]   = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [perPage,      setPerPage]      = useState(15);
  const [search,       setSearch]       = useState("");
  const [searchInput,  setSearchInput]  = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [viewBooking,  setViewBooking]  = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [toast,        setToast]        = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [actionModal,  setActionModal]  = useState<ActionModalState>({
    open: false, type: null, booking: null, notes: "", submitting: false,
  });

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const params = new URLSearchParams({
        page:     String(currentPage),
        per_page: String(perPage),
        ...(search       ? { search }              : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });

      const res = await fetch(`${API_URL}/api/bookings?${params}`, {
        headers: { Accept: "application/json", ...authHeaders() },
      });

      if (res.status === 401) {
        setFetchError("401 Unauthorized — you may need to log in again.");
        return;
      }

      const data = await res.json().catch(() => ({}));

      let list: Booking[] = [];
      let metaData: PaginationMeta | null = null;

      if (Array.isArray(data?.data?.data)) {
        list = data.data.data;
        metaData = { current_page: data.data.current_page, last_page: data.data.last_page, per_page: data.data.per_page, total: data.data.total, from: data.data.from ?? 1, to: data.data.to ?? list.length };
      } else if (Array.isArray(data?.data)) {
        list = data.data;
        metaData = { current_page: data.current_page ?? 1, last_page: data.last_page ?? 1, per_page: data.per_page ?? perPage, total: data.total ?? list.length, from: data.from ?? 1, to: data.to ?? list.length };
      } else if (Array.isArray(data)) {
        list = data;
      }

      setBookings(list);
      setMeta(metaData);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Network error — check NEXT_PUBLIC_API_URL.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, perPage, search, statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, perPage]);

  // ── approve / reject ──────────────────────────────────────────────────────
  const openActionModal = (type: string, booking: Booking) =>
    setActionModal({ open: true, type, booking, notes: "", submitting: false });

  const handleActionSubmit = async () => {
    const { type, booking, notes } = actionModal;
    if (!notes.trim()) {
      showToast("Please add a note before submitting.", "error");
      return;
    }
    setActionModal(p => ({ ...p, submitting: true }));
    try {
      const status = type === "approve" ? "confirmed" : "cancelled";
      const res = await fetch(`${API_URL}/api/bookings/${booking?.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { message?: string }).message || `HTTP ${res.status}`);
      }
      setActionModal({ open: false, type: null, booking: null, notes: "", submitting: false });
      showToast(`Booking ${type === "approve" ? "approved" : "rejected"} successfully.`, "success");
      fetchBookings();
    } catch (err) {
      showToast("Error: " + errMsg(err), "error");
      setActionModal(p => ({ ...p, submitting: false }));
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirmed = async () => {
    const id = deleteTarget?.id;
    setDeleteTarget(null);
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", ...authHeaders() },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { message?: string }).message || `HTTP ${res.status}`);
      }
      showToast("Booking deleted.", "success");
      fetchBookings();
    } catch (err) {
      showToast("Delete failed: " + errMsg(err), "error");
    }
  };

  // ── derived ───────────────────────────────────────────────────────────────
  const safeBookings   = Array.isArray(bookings) ? bookings : [];
  const totalPages     = meta?.last_page ?? 1;
  const pendingCount   = safeBookings.filter(b => b.status === "pending" || b.status === "new").length;
  const confirmedCount = safeBookings.filter(b => b.status === "confirmed" || b.status === "approved").length;

  return (
    <main className="min-h-screen bg-[#f4f8ff] pt-[88px] pb-12 px-4">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            <h1 className="text-lg font-semibold text-slate-800">All Bookings</h1>
            {meta && (
              <span className="ml-2 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-semibold">
                {meta.total} total
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchBookings}
              className="w-9 h-9 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl flex items-center justify-center transition-colors">
              <RefreshCw size={14} className="text-slate-500" />
            </button>
            <button onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
              <Plus size={15} /> New Booking
            </button>
          </div>
        </div>

        {/* Clinic Banner */}
        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-5 mb-5 flex flex-wrap items-center gap-4">
          <div className="w-[52px] h-[52px] rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
            <Stethoscope size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800">MDS Dental & Aesthetic Clinic</p>
            <p className="text-sm text-slate-500">Admin Dashboard · All patient appointments</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "Total",     val: meta?.total ?? safeBookings.length,         color: "bg-slate-50 text-slate-700 border-slate-200"      },
              { label: "Pending",   val: pendingCount,                                color: "bg-amber-50 text-amber-700 border-amber-200"       },
              { label: "Confirmed", val: confirmedCount,                              color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { label: "Page",      val: `${meta?.current_page ?? 1}/${totalPages}`, color: "bg-blue-50 text-blue-700 border-blue-200"          },
            ].map(s => (
              <div key={s.label} className={`flex flex-col items-center px-3 py-1.5 rounded-xl border text-xs font-medium ${s.color}`}>
                <span className="text-base font-bold leading-tight">{s.val}</span>
                <span className="opacity-70">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error banner */}
        {fetchError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Failed to load bookings</p>
              <p className="text-xs text-red-500 mt-0.5">{fetchError}</p>
              <p className="text-xs text-red-400 mt-1">
                Check DevTools → Application → Local Storage for the correct token key and update <code>getToken()</code> in this file.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setSearch(searchInput)}
                placeholder="Search name, email, notes…"
                className="w-full pl-9 pr-4 py-2.5 bg-[#f4f8ff] border border-blue-100 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 text-sm"
              />
            </div>
            <button onClick={() => setSearch(searchInput)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Search
            </button>
          </div>

          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-[#f4f8ff] border border-blue-100 rounded-xl text-slate-700 focus:outline-none focus:border-blue-400 text-sm appearance-none">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={perPage} onChange={e => setPerPage(Number(e.target.value))}
              className="pl-3 pr-8 py-2.5 bg-[#f4f8ff] border border-blue-100 rounded-xl text-slate-700 focus:outline-none focus:border-blue-400 text-sm appearance-none">
              {[10, 15, 25, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {(search || statusFilter) && (
            <button onClick={() => { setSearch(""); setSearchInput(""); setStatusFilter(""); }}
              className="px-3 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm transition-colors">
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-100 bg-[#f4f8ff]">
                  {["#", "Patient", "Contact", "Date & Time", "Service", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${55 + (j * 7) % 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : safeBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <Calendar size={40} className="mx-auto mb-3 text-slate-200" />
                      <p className="text-slate-400 font-medium">No bookings found</p>
                      <p className="text-slate-300 text-xs mt-1">Try adjusting filters or create a new booking</p>
                    </td>
                  </tr>
                ) : (
                  safeBookings.map((b, idx) => {
                    const rowNum = meta ? (meta.current_page - 1) * meta.per_page + idx + 1 : idx + 1;
                    const dateObj = b.booking_date ? new Date(b.booking_date) : null;
                    const isPending = b.status === "pending" || b.status === "new";
                    const isActive  = isPending || b.status === "confirmed" || b.status === "approved";
                    return (
                      <tr key={b.id ?? idx} className="border-b border-slate-100 hover:bg-[#f9fbff] transition-colors group">
                        <td className="px-4 py-3 text-slate-400 text-xs font-mono">{rowNum}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                              {(b.name ?? "?")[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800 whitespace-nowrap">{b.name ?? "—"}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-slate-600 text-xs">{b.email ?? "—"}</div>
                          {b.phone && <div className="text-slate-400 text-xs mt-0.5">{b.phone}</div>}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {dateObj ? (
                            <>
                              <div className="text-slate-700 font-medium text-xs">
                                {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </div>
                              <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                                <Clock size={10} />
                                {dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </>
                          ) : <span className="text-slate-300">—</span>}
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-slate-600 text-xs line-clamp-2 max-w-[150px]">
                            {b.notes?.replace(/^Service:\s*/i, "") ?? "—"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewBooking(b)} title="View"
                              className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
                              <Eye size={13} className="text-blue-600" />
                            </button>
                            {isPending && (
                              <button onClick={() => openActionModal("approve", b)} title="Approve"
                                className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                <CheckCircle size={13} className="text-emerald-600" />
                              </button>
                            )}
                            {isActive && (
                              <button onClick={() => openActionModal("reject", b)} title="Reject / Cancel"
                                className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                                <XCircle size={13} className="text-red-500" />
                              </button>
                            )}
                            <button onClick={() => setDeleteTarget(b)} title="Delete"
                              className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-red-50 flex items-center justify-center transition-colors">
                              <Trash2 size={13} className="text-slate-400 group-hover:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{meta.from}–{meta.to}</span> of{" "}
              <span className="font-semibold text-slate-700">{meta.total}</span> bookings
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={15} className="text-slate-500" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…"
                    ? <span key={`el-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>
                    : (
                      <button key={p} onClick={() => setCurrentPage(p as number)}
                        className={`w-9 h-9 rounded-xl border text-sm font-medium transition-colors ${
                          currentPage === p
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200"
                        }`}>
                        {p}
                      </button>
                    )
                )}

              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={15} className="text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewBookingModal open={showNewModal} onClose={() => setShowNewModal(false)} onSuccess={fetchBookings} />
      <ViewModal booking={viewBooking} onClose={() => setViewBooking(null)} />
      <ActionModal
        modal={actionModal}
        onClose={() => setActionModal({ open: false, type: null, booking: null, notes: "", submitting: false })}
        onSubmit={handleActionSubmit}
        onChange={val => setActionModal(p => ({ ...p, notes: val }))}
      />
      <ConfirmDeleteDialog
        booking={deleteTarget}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  );
}