"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProtectedNav from "@/components/layout/ProtectedNavbar";

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  created_at: string;
}

interface ContactsApiResponse {
  data: ContactInquiry[];
}

const ITEMS_PER_PAGE = 10;

// FIX: Helper that always returns a ContactInquiry[] regardless of API shape
function normalizeContacts(raw: unknown): ContactInquiry[] {
  if (Array.isArray(raw)) return raw as ContactInquiry[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as ContactInquiry[];
    if (Array.isArray(obj.contacts)) return obj.contacts as ContactInquiry[];
  }
  return [];
}

export default function ContactsAdmin() {
  // FIX: Explicit initial state is [], so contacts is always an array
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewContact, setViewContact] = useState<ContactInquiry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth < 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      setLoading(true);
      const res = await fetch("/api/contacts");
      if (!res.ok) throw new Error("Failed to fetch contacts");

      const raw: unknown = await res.json();
      // FIX: Always resolves to ContactInquiry[] no matter what shape the API returns
      setContacts(normalizeContacts(raw));
    } catch (error) {
      console.error(error);
      setContacts([]); // FIX: Ensure contacts stays an array even on error
    } finally {
      setLoading(false);
    }
  }

  function openViewModal(contact: ContactInquiry) {
    setViewContact(contact);
    setViewOpen(true);
  }

  // FIX: contacts is guaranteed to be an array, so .filter() is always safe
  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.message && c.message.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <ProtectedNav userRole="admin" />

        <div
          className={`flex-1 flex items-center justify-center ${isDesktop ? "ml-0" : "ml-72"}`}
        >
          <div className="flex flex-col items-center gap-4 bg-white border border-slate-200 shadow-lg rounded-2xl px-8 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

            <div className="text-center">
              <p className="text-lg font-semibold text-slate-800">
                Loading Inquiries
              </p>
              <p className="text-sm text-slate-500">
                Please wait while we fetch data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className={`flex-1 min-w-0 ${isDesktop ? "ml-0" : "ml-72"}`}>
        <ProtectedNav userRole="admin" />

        <main className="mt-18 lg:mt-0 p-4 md:p-8 max-w-7xl mx-auto space-y-6">
          {/* HEADER */}
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Inquiries Management
            </h1>
            <p className="text-slate-500 text-sm md:text-base">
              View contact inquiries submitted via the website
            </p>
          </div>

          {/* CARD */}
          <Card className="gap-0 p-0 bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            {/* SEARCH HEADER */}
            <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
              <div className="my-5 relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search name, email, message..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 bg-white border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* EMPTY STATE */}
              {paginated.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No contacts found
                </div>
              ) : (
                <>
                  {/* TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Email</th>
                          <th className="text-left py-3 px-4">Subject</th>
                          <th className="text-left py-3 px-4">Message</th>
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginated.map((c) => (
                          <tr
                            key={c.id}
                            className="hover:bg-blue-50/40 transition"
                          >
                            <td className="py-3 px-4 font-medium text-slate-900">
                              {c.name}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {c.email}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {c.subject || "-"}
                            </td>
                            <td className="py-3 px-4 max-w-[220px] truncate text-slate-600">
                              {c.message}
                            </td>
                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                              {new Date(c.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openViewModal(c)}
                                className="hover:bg-blue-50 border-slate-200"
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
                      <span>
                        Showing {startIdx + 1}–
                        {Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)}{" "}
                        of {filtered.length}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                          className="border-slate-200"
                        >
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                          className="border-slate-200"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* MODAL */}
          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent className="max-w-lg bg-white border border-slate-200 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-slate-900">
                  Contact Details
                </DialogTitle>
                <DialogDescription className="text-slate-500">
                  Guest inquiry information
                </DialogDescription>
              </DialogHeader>

              {viewContact && (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border">
                      <p className="text-xs text-slate-500">Name</p>
                      <p className="font-medium text-slate-900">
                        {viewContact.name}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border">
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-medium text-slate-900 break-all">
                        {viewContact.email}
                      </p>
                    </div>

                    {viewContact.phone && (
                      <div className="p-3 rounded-xl bg-slate-50 border">
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-medium text-slate-900">
                          {viewContact.phone}
                        </p>
                      </div>
                    )}

                    {viewContact.subject && (
                      <div className="p-3 rounded-xl bg-slate-50 border">
                        <p className="text-xs text-slate-500">Subject</p>
                        <p className="font-medium text-slate-900">
                          {viewContact.subject}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border">
                    <p className="text-xs text-slate-500 mb-1">Message</p>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {viewContact.message}
                    </p>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 border-t pt-3">
                    <span>Date Submitted</span>
                    <span>
                      {new Date(viewContact.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
