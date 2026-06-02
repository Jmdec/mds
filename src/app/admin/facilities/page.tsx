"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Save,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  ImageIcon,
  Wind,
  ShieldCheck,
  Droplets,
  HeartPulse,
  ScanLine,
  Zap,
} from "lucide-react";

import ProtectedNav from "@/components/layout/ProtectedNavbar";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type Facility = {
  id: number;
  icon_name: string;
  label: string;
  name: string;
  description: string;
  bullets: string[];
  accent: "cyan" | "blue";
  image_url: string | null;
  sort_order: number;
};

type FacilityForm = {
  icon_name: string;
  label: string;
  name: string;
  description: string;
  bullets: string[];
  accent: "cyan" | "blue";
  sort_order: number;
  image: File | null;
};

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const ICON_OPTIONS = [
  { value: "Wind", label: "Wind (Air Quality)", Icon: Wind },
  { value: "Zap", label: "Zap (Ventilation)", Icon: Zap },
  {
    value: "ShieldCheck",
    label: "ShieldCheck (Sterilization)",
    Icon: ShieldCheck,
  },
  { value: "Droplets", label: "Droplets (Aerosol)", Icon: Droplets },
  { value: "HeartPulse", label: "HeartPulse (Health)", Icon: HeartPulse },
  { value: "ScanLine", label: "ScanLine (Digital)", Icon: ScanLine },
];

const ICON_MAP: Record<string, React.ElementType> = {
  Wind,
  Zap,
  ShieldCheck,
  Droplets,
  HeartPulse,
  ScanLine,
};

const EMPTY_FORM: FacilityForm = {
  icon_name: "Wind",
  label: "",
  name: "",
  description: "",
  bullets: [""],
  accent: "cyan",
  sort_order: 0,
  image: null,
};

/* ─────────────────────────────────────────
   AUTH HELPER
───────────────────────────────────────── */
function getToken(): string {
  return localStorage.getItem("auth_token") ?? "";
}
function authHeader(): Record<string, string> {
  return { Authorization: `Bearer ${getToken()}` };
}
function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  return imagePath.startsWith("http") ? imagePath : `${baseUrl}${imagePath}`;
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Facility | null>(null);
  const [form, setForm] = useState<FacilityForm>(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Facility | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/facilities", { cache: "no-store" });
      const data = await res.json();
      const facilitiesArray = Array.isArray(data) ? data : (data?.data ?? []);
      setFacilities(facilitiesArray);
    } catch (e) {
      console.error(e);
      showToast("Failed to load facilities.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Open modals ── */
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setImagePreview(null);
    setSelected(null);
    setModal("create");
  };

  const openEdit = (f: Facility) => {
    setSelected(f);
    setForm({
      icon_name: f.icon_name,
      label: f.label,
      name: f.name,
      description: f.description,
      bullets: f.bullets?.length ? f.bullets : [""],
      accent: f.accent,
      sort_order: f.sort_order,
      image: null,
    });
    setImagePreview(f.image_url);
    setModal("edit");
  };

  const openDelete = (f: Facility) => {
    setDeleteTarget(f);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setDeleteTarget(null);
    setForm(EMPTY_FORM);
    setImagePreview(null);
  };

  /* ── Build FormData ── */
  const buildFormData = (isEdit = false): FormData => {
    const fd = new FormData();
    fd.append("icon_name", form.icon_name);
    fd.append("label", form.label);
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("bullets", JSON.stringify(form.bullets.filter(Boolean)));
    fd.append("accent", form.accent);
    fd.append("sort_order", String(form.sort_order));
    if (form.image instanceof File) fd.append("image", form.image);
    if (isEdit) fd.append("_method", "PUT");
    return fd;
  };

  /* ── Create ── */
  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/facilities", {
        method: "POST",
        headers: { ...authHeader() },
        body: buildFormData(),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Create failed: ${res.statusText}`,
        );
      }
      showToast("Facility created successfully!");
      closeModal();
      fetchData();
    } catch (e) {
      console.error(e);
      showToast("Failed to create facility.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Update ── */
  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/facilities/${selected.id}`, {
        method: "POST", // Laravel with _method=PUT via FormData
        headers: { ...authHeader() },
        body: buildFormData(true),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Update failed: ${res.statusText}`,
        );
      }
      showToast("Facility updated successfully!");
      closeModal();
      fetchData();
    } catch (e) {
      console.error(e);
      showToast("Failed to update facility.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/facilities/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { ...authHeader() },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Delete failed: ${res.statusText}`,
        );
      }
      showToast("Facility deleted.");
      closeModal();
      fetchData();
    } catch (e) {
      console.error(e);
      showToast("Failed to delete facility.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Bullet helpers ── */
  const addBullet = () =>
    setForm((f) => ({ ...f, bullets: [...f.bullets, ""] }));
  const removeBullet = (i: number) =>
    setForm((f) => ({
      ...f,
      bullets: f.bullets.filter((_, idx) => idx !== i),
    }));
  const updateBullet = (i: number, val: string) =>
    setForm((f) => {
      const bullets = [...f.bullets];
      bullets[i] = val;
      return { ...f, bullets };
    });

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <ProtectedNav userRole="admin" />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg transition-all ${
            toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <main className="lg:ml-72 px-4 sm:px-6 lg:px-8 pt-20 lg:pt-8 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Facilities
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage all facility cards shown on the Facilities page
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center"
          >
            <Plus size={15} /> Add Facility
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {facilities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <ImageIcon size={36} className="opacity-40" />
              <p className="text-sm">No facilities yet. Add your first one.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs w-16">
                    Image
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs hidden md:table-cell">
                    Label
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs hidden lg:table-cell">
                    Description
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs w-20 hidden sm:table-cell">
                    Accent
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs w-16 hidden sm:table-cell">
                    Order
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {facilities
                  .slice()
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((f) => {
                    const Icon = ICON_MAP[f.icon_name] ?? Wind;
                    return (
                      <tr
                        key={f.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Thumbnail */}
                        <td className="px-5 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200">
                            {f.image_url ? (
                              <Image
                                src={getImageUrl(f.image_url) || ""}
                                alt={f.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Icon size={16} />
                              </div>
                            )}
                          </div>
                        </td>
                        {/* Name */}
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <Icon
                              size={14}
                              className={
                                f.accent === "cyan"
                                  ? "text-cyan-500"
                                  : "text-blue-500"
                              }
                            />
                            {f.name}
                          </div>
                        </td>
                        {/* Label */}
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                            {f.label}
                          </span>
                        </td>
                        {/* Description */}
                        <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate hidden lg:table-cell">
                          {f.description}
                        </td>
                        {/* Accent */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                              f.accent === "cyan"
                                ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {f.accent}
                          </span>
                        </td>
                        {/* Sort order */}
                        <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                          {f.sort_order}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <ActionBtn
                              icon={<Pencil size={14} />}
                              label="Edit"
                              onClick={() => openEdit(f)}
                            />
                            <ActionBtn
                              icon={<Trash2 size={14} />}
                              label="Delete"
                              onClick={() => openDelete(f)}
                              danger
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ── Create / Edit Modal ── */}
      {(modal === "create" || modal === "edit") && (
        <Modal
          title={modal === "create" ? "Add Facility" : "Edit Facility"}
          onClose={closeModal}
          size="lg"
        >
          <div className="flex flex-col gap-5">
            {/* Image Upload */}
            <Card title="Photo">
              <div className="flex items-start gap-5 flex-wrap">
                <div className="w-28 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative">
                  {imagePreview ? (
                    <Image
                      src={
                        imagePreview.startsWith("blob:") ||
                        imagePreview.startsWith("http")
                          ? imagePreview
                          : getImageUrl(imagePreview) || ""
                      }
                      alt="Facility"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon size={22} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setForm({ ...form, image: file });
                      if (file) setImagePreview(URL.createObjectURL(file));
                    }}
                    className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Recommended: 4:3 ratio. Saved to public/images/facilities/
                  </p>
                </div>
              </div>
            </Card>

            {/* Basic Info */}
            <Card title="Basic Info">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Icon">
                  <select
                    value={form.icon_name}
                    onChange={(e) =>
                      setForm({ ...form, icon_name: e.target.value })
                    }
                    className={inputCls}
                  >
                    {ICON_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Accent Color">
                  <select
                    value={form.accent}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        accent: e.target.value as "cyan" | "blue",
                      })
                    }
                    className={inputCls}
                  >
                    <option value="cyan">Cyan</option>
                    <option value="blue">Blue</option>
                  </select>
                </Field>
                <Field label="Label (short, e.g. Air Quality)">
                  <input
                    value={form.label}
                    onChange={(e) =>
                      setForm({ ...form, label: e.target.value })
                    }
                    className={inputCls}
                    placeholder="Air Quality"
                  />
                </Field>
                <Field label="Sort Order">
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm({ ...form, sort_order: Number(e.target.value) })
                    }
                    className={inputCls}
                    min={0}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Name (full heading)">
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className={inputCls}
                      placeholder="Medical-Grade Air Purifier"
                    />
                  </Field>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card title="Description">
              <Field label="Short Description">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className={textareaCls}
                  placeholder="Brief paragraph shown under the heading…"
                />
              </Field>
            </Card>

            {/* Bullets */}
            <Card title="Bullet Points">
              <div className="space-y-2 mb-3">
                {form.bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={b}
                      onChange={(e) => updateBullet(i, e.target.value)}
                      className={inputCls}
                      placeholder={`Bullet point ${i + 1}`}
                    />
                    {form.bullets.length > 1 && (
                      <button
                        onClick={() => removeBullet(i)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors shrink-0"
                        title="Remove bullet"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addBullet}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                + Add Bullet
              </button>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={modal === "create" ? handleCreate : handleUpdate}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {modal === "create" ? "Create" : "Save"}
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Modal ── */}
      {modal === "delete" && deleteTarget && (
        <Modal title="Delete Facility?" onClose={closeModal}>
          <div className="space-y-5">
            <div className="flex gap-4">
              <AlertTriangle className="text-red-500 shrink-0" size={28} />
              <div>
                <p className="font-medium text-slate-900">
                  Are you sure? This cannot be undone.
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Deleting &quot;{deleteTarget.name}&quot; will remove it from
                  all pages.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
              >
                {saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────── */

const inputCls =
  "w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-slate-900";
const textareaCls =
  "w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-sans resize-none text-slate-900";

type FieldProps = {
  label: string;
  children: React.ReactNode;
};
function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
        {label}
      </span>
      {children}
    </label>
  );
}

type CardProps = {
  title: string;
  children: React.ReactNode;
};
function Card({ title, children }: CardProps) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
      <h3 className="text-xs uppercase font-bold text-slate-600 tracking-wide mb-4 block">
        {title}
      </h3>
      {children}
    </div>
  );
}

type ActionBtnProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
};
function ActionBtn({ icon, label, onClick, danger }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-1.5 rounded-lg transition-colors ${
        danger
          ? "hover:bg-red-50 text-red-600"
          : "hover:bg-blue-50 text-blue-600"
      }`}
    >
      {icon}
    </button>
  );
}

type ModalProps = {
  title: string;
  onClose: () => void;
  size?: "md" | "lg";
  children: React.ReactNode;
};
function Modal({ title, onClose, size = "md", children }: ModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[110]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto ${
            size === "lg" ? "w-full max-w-2xl" : "w-full max-w-md"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  );
}
