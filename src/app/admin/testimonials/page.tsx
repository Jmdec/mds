"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Search, Plus, Eye, Edit, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAdminRoute } from "@/hooks/use-protected-route"
import ProtectedNav from "@/components/layout/ProtectedNavbar"

interface Testimonial {
  id: number
  client_name: string
  client_email: string
  rating: number
  message: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export default function TestimonialsAdmin() {
  useAdminRoute()

  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)

  const [viewTestimonial, setViewTestimonial] = useState<Testimonial | null>(null)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)

  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    rating: 1,
    message: "",
    status: "pending" as "pending" | "approved" | "rejected",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [isDesktop, setIsDesktop] = useState(false)

  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/testimonials")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setTestimonials(Array.isArray(data) ? data : data.data || [])
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch testimonials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({ title: "Deleted", description: "Testimonial removed" })
      fetchTestimonials()
    } catch {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      })
    } finally {
      setDeleteOpen(false)
      setDeleteId(null)
    }
  }

  function openViewModal(t: Testimonial) {
    setViewTestimonial(t)
    setViewOpen(true)
  }

  function openEditModal(t: Testimonial) {
    setEditingTestimonial(t)
    setFormData({
      client_name: t.client_name,
      client_email: t.client_email,
      rating: t.rating,
      message: t.message,
      status: t.status,
    })
    setFormOpen(true)
  }

  async function handleSave() {
    setIsSubmitting(true)
    try {
      const method = editingTestimonial ? "PUT" : "POST"
      const url = editingTestimonial
        ? `/api/testimonials/${editingTestimonial.id}`
        : "/api/testimonials"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.message || data.error || JSON.stringify(data) || "Failed to save testimonial",
        )
      }

      toast({
        title: "Success",
        description: editingTestimonial ? "Updated" : "Created",
      })

      setFormOpen(false)
      setEditingTestimonial(null)
      fetchTestimonials()
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = testimonials.filter(
    (t) =>
      t.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.message.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-white">
        <ProtectedNav userRole="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 bg-white border border-blue-100 shadow-xl px-8 py-8 rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-800 font-semibold">Loading Testimonials</p>
            <p className="text-sm text-slate-500">Preparing your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <ProtectedNav userRole="admin" />

      <div className={`flex-1 min-w-0 ${isDesktop ? "ml-0" : "ml-72"}`}>
        <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Testimonials Management
            </h1>
            <p className="text-slate-600">Manage customer feedback in a clean dashboard</p>
          </div>

          <Card className="gap-0 p-0 border border-blue-100 shadow-lg rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200" />
                  <Input
                    placeholder="Search testimonials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white text-slate-900 placeholder:text-slate-400 border-0 focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <Button
                  onClick={() => {
                    setEditingTestimonial(null)
                    setFormData({
                      client_name: "",
                      client_email: "",
                      rating: 1,
                      message: "",
                      status: "pending",
                    })
                    setFormOpen(true)
                  }}
                  className="bg-white text-blue-700 hover:bg-blue-50 shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Testimonial
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-blue-50 border-b border-blue-100 text-slate-700">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Rating</th>
                    <th className="text-left p-4">Message</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-slate-100 hover:bg-blue-50/40 transition"
                    >
                      <td className="p-4 font-medium text-slate-900">{t.client_name}</td>
                      <td className="p-4 text-slate-600">{t.client_email}</td>
                      <td className="p-4 text-blue-600 font-semibold">{"★".repeat(t.rating)}</td>
                      <td className="p-4 text-slate-600 truncate max-w-[220px]">{t.message}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 capitalize">
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 flex gap-2">
                        <Button size="sm" className="bg-transparent" onClick={() => openViewModal(t)}>
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button size="sm" className="bg-transparent" onClick={() => openEditModal(t)}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => {
                            setDeleteId(t.id)
                            setDeleteOpen(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </main>

        {/* View Modal */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border-0 shadow-2xl p-0 text-gray-950">
            <div className="sticky top-0 z-10 bg-[#162A3A] px-6 py-5 rounded-t-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Testimonial Details</DialogTitle>
                <p className="text-white/50 text-sm mt-0.5">View testimonial information</p>
              </DialogHeader>
            </div>
            <div className="p-5 space-y-4 bg-[#f5f0e8]">
              {viewTestimonial && (
                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="px-5 py-3 bg-gradient-to-r from-[#162A3A] to-[#1e3a50]" />
                  <div className="p-5 bg-white space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">Client Name</p>
                      <p className="text-gray-700">{viewTestimonial.client_name}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-700">{viewTestimonial.client_email}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Rating</p>
                      <p className="text-yellow-500">{"★".repeat(viewTestimonial.rating)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Message</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{viewTestimonial.message}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Status</p>
                      <p className="capitalize text-gray-700">{viewTestimonial.status}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Date</p>
                      <p className="text-gray-700">{new Date(viewTestimonial.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pb-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 text-gray-600 border-gray-300 bg-white"
                  onClick={() => setViewOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Modal */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border-0 shadow-2xl p-0 text-gray-950">
            <div className="sticky top-0 z-10 bg-[#162A3A] px-6 py-5 rounded-t-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">
                  {editingTestimonial ? "Update Testimonial" : "New Testimonial"}
                </DialogTitle>
                <p className="text-white/50 text-sm mt-0.5">
                  {editingTestimonial ? "Update testimonial details" : "Add a new testimonial"}
                </p>
              </DialogHeader>
            </div>
            <div className="p-5 space-y-4 bg-[#f5f0e8]">
              <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-5 py-3 bg-gradient-to-r from-[#162A3A] to-[#1e3a50]" />
                <div className="p-5 bg-white space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name" className="text-gray-900 font-semibold">Client Name</Label>
                    <Input
                      id="client_name"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="border-gray-300 focus:border-[#162A3A]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_email" className="text-gray-900 font-semibold">Client Email</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                      className="border-gray-300 focus:border-[#162A3A]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-900 font-semibold">Rating</Label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          type="button"
                          size="sm"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className={
                            formData.rating >= star
                              ? "bg-yellow-400 hover:bg-amber-500"
                              : "bg-gray-200 hover:bg-yellow-400"
                          }
                        >
                          ★
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-900 font-semibold">Message</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="border-gray-300 focus:border-[#162A3A]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-gray-900 font-semibold">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val: Testimonial["status"]) =>
                        setFormData({ ...formData, status: val })
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#162A3A]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pb-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 text-gray-600 border-gray-300 bg-white"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-10 bg-[#162A3A] hover:bg-[#1e3a50] text-white rounded-xl font-semibold shadow-md"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  {editingTestimonial ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-black">Delete Testimonial</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this testimonial? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteOpen(false)
                  setDeleteId(null)
                }}
                className="bg-transparent text-black"
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}