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
} from "lucide-react";

import ProtectedNav from "@/components/layout/ProtectedNavbar";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type Credential = { icon: string; label: string; value: string; sub: string };

type DoctorForm = {
  name: string;
  title: string;
  role: string;
  bio: string;
  quote: string;
  location: string;
  since_year: string;
  credentials: Credential[];
  image: File | null;
};

type Stat = { value: string; label: string };

type SettingsForm = { mission: string; vision: string; stats: Stat[] };

type TimelineItem = {
  id: number;
  year: string;
  title: string;
  description: string;
  sort_order: number;
};

type TechItem = {
  id: number;
  icon_name: string;
  name: string;
  description: string;
  sort_order: number;
};

type AboutData = {
  hero_heading: string;
  hero_subheading: string;
  mission: string;
  vision: string;
  cta_heading: string;
  cta_subheading: string;
  stats: Stat[];
  doctor: {
    name: string;
    title: string;
    role: string;
    bio: string;
    quote: string;
    location: string;
    since_year: string;
    image_url: string | null;
    credentials: Credential[];
  };
  timeline: TimelineItem[];
  tech: TechItem[];
};

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const ICON_OPTIONS = [
  "GraduationCap",
  "Stethoscope",
  "Star",
  "Award",
  "Microscope",
  "Cpu",
  "ScanLine",
  "HeartPulse",
];

const EMPTY_DOCTOR: DoctorForm = {
  name: "",
  title: "",
  role: "",
  bio: "",
  quote: "",
  location: "",
  since_year: "",
  credentials: [],
  image: null,
};

const EMPTY_SETTINGS: SettingsForm = {
  mission: "",
  vision: "",
  stats: [
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ],
};

const EMPTY_TIMELINE: Omit<TimelineItem, "id"> = {
  year: "",
  title: "",
  description: "",
  sort_order: 0,
};

const EMPTY_TECH: Omit<TechItem, "id"> = {
  icon_name: "Stethoscope",
  name: "",
  description: "",
  sort_order: 0,
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

/* ─────────────────────────────────────────
   TABS
───────────────────────────────────────── */
type Tab = "settings" | "doctor" | "timeline" | "tech";
const TABS: { key: Tab; label: string }[] = [
  { key: "settings", label: "Page Settings" },
  { key: "doctor", label: "Doctor Profile" },
  { key: "timeline", label: "Timeline" },
  { key: "tech", label: "Technology" },
];

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function AdminAboutPage() {
  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [settings, setSettings] = useState<SettingsForm>(EMPTY_SETTINGS);
  const [doctor, setDoctor] = useState<DoctorForm>(EMPTY_DOCTOR);
  const [doctorImagePreview, setDoctorImagePreview] = useState<string | null>(
    null,
  );
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [tech, setTech] = useState<TechItem[]>([]);

  const [modal, setModal] = useState<
    | "timeline-create"
    | "timeline-edit"
    | "tech-create"
    | "tech-edit"
    | "delete"
    | null
  >(null);
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineItem | null>(
    null,
  );
  const [selectedTech, setSelectedTech] = useState<TechItem | null>(null);
  const [timelineForm, setTimelineForm] =
    useState<Omit<TimelineItem, "id">>(EMPTY_TIMELINE);
  const [techForm, setTechForm] = useState<Omit<TechItem, "id">>(EMPTY_TECH);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "timeline" | "tech";
    id: number;
    name: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/about", { cache: "no-store" });
      const data: AboutData = await res.json();

      setSettings({
        mission: data.mission ?? "",
        vision: data.vision ?? "",
        stats: data.stats ?? EMPTY_SETTINGS.stats,
      });

      // ✅ Guard against null doctor
      if (data.doctor) {
        setDoctor({
          name: data.doctor.name ?? "",
          title: data.doctor.title ?? "",
          role: data.doctor.role ?? "",
          bio: data.doctor.bio ?? "",
          quote: data.doctor.quote ?? "",
          location: data.doctor.location ?? "",
          since_year: data.doctor.since_year ?? "",
          credentials: data.doctor.credentials ?? [],
          image: null,
        });
        setDoctorImagePreview(data.doctor.image_url ?? null);
      }

      setTimeline(data.timeline ?? []);
      setTech(data.tech ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Save settings + doctor ── */
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("stats", JSON.stringify(settings.stats));
      fd.append("mission", settings.mission);
      fd.append("vision", settings.vision);
      fd.append("doctor_name", doctor.name);
      fd.append("doctor_title", doctor.title);
      fd.append("doctor_role", doctor.role);
      fd.append("doctor_bio", doctor.bio);
      fd.append("doctor_quote", doctor.quote);
      fd.append("doctor_location", doctor.location);
      fd.append("doctor_since_year", doctor.since_year);
      fd.append("credentials", JSON.stringify(doctor.credentials));
      if (doctor.image instanceof File) fd.append("doctor_image", doctor.image);

      const res = await fetch("/api/about", {
        method: "POST",
        headers: { ...authHeader() },
        body: fd,
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("Saved successfully!");
      fetchData();
    } catch (e) {
      console.error(e);
      showToast("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Timeline CRUD ── */
  const handleCreateTimeline = async () => {
    await fetch("/api/about/timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(timelineForm),
    });
    closeModal();
    fetchData();
    showToast("Timeline item added.");
  };

  const handleUpdateTimeline = async () => {
    if (!selectedTimeline) return;
    await fetch(`/api/about/timeline/${selectedTimeline.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(timelineForm),
    });
    closeModal();
    fetchData();
    showToast("Timeline item updated.");
  };

  /* ── Tech CRUD ── */
  const handleCreateTech = async () => {
    await fetch("/api/about/tech", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(techForm),
    });
    closeModal();
    fetchData();
    showToast("Technology item added.");
  };

  const handleUpdateTech = async () => {
    if (!selectedTech) return;
    await fetch(`/api/about/tech/${selectedTech.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(techForm),
    });
    closeModal();
    fetchData();
    showToast("Technology item updated.");
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const url =
      deleteTarget.type === "timeline"
        ? `/api/about/timeline/${deleteTarget.id}`
        : `/api/about/tech/${deleteTarget.id}`;
    await fetch(url, { method: "DELETE", headers: { ...authHeader() } });
    closeModal();
    fetchData();
    showToast("Item deleted.");
  };

  /* ── Modal helpers ── */
  const closeModal = () => {
    setModal(null);
    setSelectedTimeline(null);
    setSelectedTech(null);
    setTimelineForm(EMPTY_TIMELINE);
    setTechForm(EMPTY_TECH);
    setDeleteTarget(null);
  };

  const openTimelineCreate = () => {
    setTimelineForm(EMPTY_TIMELINE);
    setModal("timeline-create");
  };
  const openTimelineEdit = (t: TimelineItem) => {
    setSelectedTimeline(t);
    setTimelineForm({
      year: t.year,
      title: t.title,
      description: t.description,
      sort_order: t.sort_order,
    });
    setModal("timeline-edit");
  };
  const openTechCreate = () => {
    setTechForm(EMPTY_TECH);
    setModal("tech-create");
  };
  const openTechEdit = (t: TechItem) => {
    setSelectedTech(t);
    setTechForm({
      icon_name: t.icon_name,
      name: t.name,
      description: t.description,
      sort_order: t.sort_order,
    });
    setModal("tech-edit");
  };
  const openDelete = (type: "timeline" | "tech", id: number, name: string) => {
    setDeleteTarget({ type, id, name });
    setModal("delete");
  };

  /* ── Credential helpers ── */
  const addCredential = () =>
    setDoctor((d) => ({
      ...d,
      credentials: [
        ...d.credentials,
        { icon: "Award", label: "", value: "", sub: "" },
      ],
    }));
  const removeCredential = (i: number) =>
    setDoctor((d) => ({
      ...d,
      credentials: d.credentials.filter((_, idx) => idx !== i),
    }));
  const updateCredential = (i: number, field: keyof Credential, val: string) =>
    setDoctor((d) => {
      const creds = [...d.credentials];
      creds[i] = { ...creds[i], [field]: val };
      return { ...d, credentials: creds };
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

      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-emerald-600 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <main className="lg:ml-72 px-4 sm:px-6 lg:px-8 pt-20 lg:pt-8 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              About Page
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage all content on the About page
            </p>
          </div>
          {(activeTab === "settings" || activeTab === "doctor") && (
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Save Changes
            </button>
          )}
          {activeTab === "timeline" && (
            <button
              onClick={openTimelineCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center"
            >
              <Plus size={15} /> Add Timeline Item
            </button>
          )}
          {activeTab === "tech" && (
            <button
              onClick={openTechCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center"
            >
              <Plus size={15} /> Add Technology
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-full sm:w-fit flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Page Settings ── */}
        {activeTab === "settings" && (
          <div className="space-y-5 max-w-3xl">
            <Card title="Stats (4 items)">
              <div className="grid grid-cols-2 gap-3">
                {settings.stats.map((s, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2"
                  >
                    <Field label="Value">
                      <input
                        value={s.value}
                        onChange={(e) => {
                          const stats = [...settings.stats];
                          stats[i] = { ...stats[i], value: e.target.value };
                          setSettings({ ...settings, stats });
                        }}
                        className={inputCls}
                        placeholder="e.g. 15K+"
                      />
                    </Field>
                    <Field label="Label">
                      <input
                        value={s.label}
                        onChange={(e) => {
                          const stats = [...settings.stats];
                          stats[i] = { ...stats[i], label: e.target.value };
                          setSettings({ ...settings, stats });
                        }}
                        className={inputCls}
                        placeholder="e.g. Patients Treated"
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Mission & Vision">
              <Field label="Mission">
                <textarea
                  value={settings.mission}
                  onChange={(e) =>
                    setSettings({ ...settings, mission: e.target.value })
                  }
                  rows={3}
                  className={textareaCls}
                />
              </Field>
              <Field label="Vision">
                <textarea
                  value={settings.vision}
                  onChange={(e) =>
                    setSettings({ ...settings, vision: e.target.value })
                  }
                  rows={3}
                  className={textareaCls}
                />
              </Field>
            </Card>
          </div>
        )}

        {/* ── Doctor Profile ── */}
        {activeTab === "doctor" && (
          <div className="space-y-5 max-w-3xl">
            <Card title="Photo">
              <div className="flex items-start gap-5 flex-wrap">
                <div className="w-28 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative">
                  {doctorImagePreview ? (
                    <Image
                      src={doctorImagePreview}
                      alt="Doctor"
                      fill
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Upload New Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setDoctor({ ...doctor, image: file });
                      if (file)
                        setDoctorImagePreview(URL.createObjectURL(file));
                    }}
                    className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Recommended: portrait ratio (3:4), min 600px wide
                  </p>
                </div>
              </div>
            </Card>
            <Card title="Basic Info">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <input
                    value={doctor.name}
                    onChange={(e) =>
                      setDoctor({ ...doctor, name: e.target.value })
                    }
                    className={inputCls}
                    placeholder="Dr. Maria Regina Mari..."
                  />
                </Field>
                <Field label="Title Line">
                  <input
                    value={doctor.title}
                    onChange={(e) =>
                      setDoctor({ ...doctor, title: e.target.value })
                    }
                    className={inputCls}
                    placeholder="DMD · Oral Surgery · Orthodontics"
                  />
                </Field>
                <Field label="Role / Position">
                  <input
                    value={doctor.role}
                    onChange={(e) =>
                      setDoctor({ ...doctor, role: e.target.value })
                    }
                    className={inputCls}
                    placeholder="Founder & Practice Owner, MDS..."
                  />
                </Field>
                <Field label="Location">
                  <input
                    value={doctor.location}
                    onChange={(e) =>
                      setDoctor({ ...doctor, location: e.target.value })
                    }
                    className={inputCls}
                    placeholder="Mabini, Philippines"
                  />
                </Field>
                <Field label="Practice Since (Year)">
                  <input
                    value={doctor.since_year}
                    onChange={(e) =>
                      setDoctor({ ...doctor, since_year: e.target.value })
                    }
                    className={inputCls}
                    placeholder="2007"
                  />
                </Field>
              </div>
            </Card>
            <Card title="Quote">
              <Field label="Pull Quote">
                <textarea
                  value={doctor.quote}
                  onChange={(e) =>
                    setDoctor({ ...doctor, quote: e.target.value })
                  }
                  rows={3}
                  className={textareaCls}
                  placeholder="Dedicated to creating healthier, more confident smiles…"
                />
              </Field>
            </Card>
            <Card title="Biography">
              <Field label="Bio Paragraph">
                <textarea
                  value={doctor.bio}
                  onChange={(e) =>
                    setDoctor({ ...doctor, bio: e.target.value })
                  }
                  rows={5}
                  className={textareaCls}
                  placeholder="With over 18 years of practice…"
                />
              </Field>
            </Card>
            <Card title="Credentials">
              <div className="space-y-3 mb-3">
                {doctor.credentials.map((c, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 relative"
                  >
                    <button
                      onClick={() => removeCredential(i)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <X size={13} />
                    </button>
                    <Field label="Icon">
                      <select
                        value={c.icon}
                        onChange={(e) =>
                          updateCredential(i, "icon", e.target.value)
                        }
                        className={inputCls}
                      >
                        {ICON_OPTIONS.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Label">
                      <input
                        value={c.label}
                        onChange={(e) =>
                          updateCredential(i, "label", e.target.value)
                        }
                        className={inputCls}
                        placeholder="Education"
                      />
                    </Field>
                    <Field label="Value">
                      <input
                        value={c.value}
                        onChange={(e) =>
                          updateCredential(i, "value", e.target.value)
                        }
                        className={inputCls}
                        placeholder="Doctor of Dental Medicine"
                      />
                    </Field>
                    <Field label="Sub">
                      <input
                        value={c.sub}
                        onChange={(e) =>
                          updateCredential(i, "sub", e.target.value)
                        }
                        className={inputCls}
                        placeholder="Centro Escolar University"
                      />
                    </Field>
                  </div>
                ))}
              </div>
              <button
                onClick={addCredential}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={14} /> Add Credential
              </button>
            </Card>
          </div>
        )}

        {/* ── Timeline ── */}
        {activeTab === "timeline" && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden max-w-3xl">
            {timeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                <p className="text-sm">No timeline items yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs w-20">
                      Year
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs hidden md:table-cell">
                      Description
                    </th>
                    <th className="text-right px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {timeline.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-cyan-600 text-sm font-semibold">
                          {t.year}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {t.title}
                      </td>
                      <td className="px-4 py-4 text-slate-500 text-xs max-w-xs truncate hidden md:table-cell">
                        {t.description}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <ActionBtn
                            icon={<Pencil size={14} />}
                            label="Edit"
                            onClick={() => openTimelineEdit(t)}
                          />
                          <ActionBtn
                            icon={<Trash2 size={14} />}
                            label="Delete"
                            onClick={() =>
                              openDelete("timeline", t.id, t.title)
                            }
                            danger
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Technology ── */}
        {activeTab === "tech" && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden max-w-3xl">
            {tech.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                <p className="text-sm">No technology items yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs hidden md:table-cell">
                      Description
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs w-28">
                      Icon
                    </th>
                    <th className="text-right px-5 py-3 font-semibold text-slate-500 uppercase tracking-wide text-xs w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tech.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {t.name}
                      </td>
                      <td className="px-4 py-4 text-slate-500 text-xs max-w-xs truncate hidden md:table-cell">
                        {t.description}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                          {t.icon_name}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <ActionBtn
                            icon={<Pencil size={14} />}
                            label="Edit"
                            onClick={() => openTechEdit(t)}
                          />
                          <ActionBtn
                            icon={<Trash2 size={14} />}
                            label="Delete"
                            onClick={() => openDelete("tech", t.id, t.name)}
                            danger
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {modal === "timeline-create" && (
        <Modal title="Add Timeline Item" onClose={closeModal}>
          <TimelineFormFields form={timelineForm} setForm={setTimelineForm} />
          <ModalFooter>
            <OutlineBtn onClick={closeModal}>Cancel</OutlineBtn>
            <PrimaryBtn onClick={handleCreateTimeline}>Add Item</PrimaryBtn>
          </ModalFooter>
        </Modal>
      )}
      {modal === "timeline-edit" && (
        <Modal title="Edit Timeline Item" onClose={closeModal}>
          <TimelineFormFields form={timelineForm} setForm={setTimelineForm} />
          <ModalFooter>
            <OutlineBtn onClick={closeModal}>Cancel</OutlineBtn>
            <PrimaryBtn onClick={handleUpdateTimeline}>Save Changes</PrimaryBtn>
          </ModalFooter>
        </Modal>
      )}
      {modal === "tech-create" && (
        <Modal title="Add Technology" onClose={closeModal}>
          <TechFormFields form={techForm} setForm={setTechForm} />
          <ModalFooter>
            <OutlineBtn onClick={closeModal}>Cancel</OutlineBtn>
            <PrimaryBtn onClick={handleCreateTech}>Add Technology</PrimaryBtn>
          </ModalFooter>
        </Modal>
      )}
      {modal === "tech-edit" && (
        <Modal title="Edit Technology" onClose={closeModal}>
          <TechFormFields form={techForm} setForm={setTechForm} />
          <ModalFooter>
            <OutlineBtn onClick={closeModal}>Cancel</OutlineBtn>
            <PrimaryBtn onClick={handleUpdateTech}>Save Changes</PrimaryBtn>
          </ModalFooter>
        </Modal>
      )}
      {modal === "delete" && deleteTarget && (
        <Modal title="Delete Item" onClose={closeModal} size="sm">
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                Delete &quot;{deleteTarget.name}&quot;?
              </p>
              <p className="text-sm text-slate-500 mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <ModalFooter>
            <OutlineBtn onClick={closeModal}>Cancel</OutlineBtn>
            <DangerBtn onClick={handleDelete}>Delete</DangerBtn>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   FORM FIELDS
───────────────────────────────────────── */
const inputCls =
  "w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

const textareaCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function TimelineFormFields({
  form,
  setForm,
}: {
  form: Omit<TimelineItem, "id">;
  setForm: (f: Omit<TimelineItem, "id">) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Year">
          <input
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            className={inputCls}
            placeholder="2007"
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
          />
        </Field>
      </div>
      <Field label="Title">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputCls}
          placeholder="Clinic Founded"
        />
      </Field>
      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className={textareaCls}
          placeholder="Brief description…"
        />
      </Field>
    </div>
  );
}

function TechFormFields({
  form,
  setForm,
}: {
  form: Omit<TechItem, "id">;
  setForm: (f: Omit<TechItem, "id">) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Icon">
          <select
            value={form.icon_name}
            onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
            className={inputCls}
          >
            {ICON_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="Sort Order">
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) =>
              setForm({ ...form, sort_order: Number(e.target.value) })
            }
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Name">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputCls}
          placeholder="3D Cone Beam CT"
        />
      </Field>
      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className={textareaCls}
          placeholder="Brief description…"
        />
      </Field>
    </div>
  );
}

/* ── Shared UI ── */
function Modal({
  title,
  children,
  onClose,
  size = "md",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: "sm" | "md";
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${size === "sm" ? "max-w-sm" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-base">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-slate-100">
      {children}
    </div>
  );
}

function PrimaryBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
    >
      {children}
    </button>
  );
}

function OutlineBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
    >
      {children}
    </button>
  );
}

function DangerBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
    >
      {children}
    </button>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${danger ? "text-slate-400 hover:text-red-600 hover:bg-red-50" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}
    >
      {icon}
    </button>
  );
}
