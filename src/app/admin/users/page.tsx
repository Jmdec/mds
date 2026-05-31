"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Eye,
  Search,
  Loader2,
  ArrowUpDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UsersIcon,
  User2,
} from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAdminRoute } from "@/hooks/use-protected-route"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table"
import { Playfair_Display, DM_Sans } from "next/font/google"
import ProtectedNav from "@/components/layout/ProtectedNavbar"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
})

interface User {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  zip_code?: string
  role: string
  created_at: string
  updated_at: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-indigo-100 text-indigo-700",
  "bg-sky-100 text-sky-700",
  "bg-cyan-100 text-cyan-700",
  "bg-violet-100 text-violet-700",
]
function getAvatarColor(id: number) {
  return avatarColors[id % avatarColors.length]
}

export default function UsersAdminPage() {
  useAdminRoute()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/login")
        return
      }

      let url = "/api/users?per_page=100&role=customer"
      if (globalFilter) url += `&search=${encodeURIComponent(globalFilter)}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth_token")
          router.push("/login")
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        const usersData = result.data || []
        setUsers(Array.isArray(usersData) ? usersData : [])
      } else throw new Error(result.message || "Failed to fetch users")
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [globalFilter, router, toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers()
    }, 500)
    return () => clearTimeout(t)
  }, [globalFilter, fetchUsers])

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-semibold text-slate-500 hover:text-blue-700 text-xs uppercase tracking-wide"
        >
          ID <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-slate-400 text-sm font-mono">
          #{row.original.id}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-semibold text-slate-500 hover:text-blue-700 text-xs uppercase tracking-wide"
        >
          Customer <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${getAvatarColor(row.original.id)}`}
          >
            {getInitials(row.original.name)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 truncate text-sm">
              {row.original.name}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {row.original.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: () => (
        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wide hidden lg:block">
          Phone
        </span>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-slate-600 hidden lg:block">
          {row.original.phone || <span className="text-slate-300">—</span>}
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: () => (
        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wide hidden lg:block">
          City
        </span>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-slate-600 hidden lg:block">
          {row.original.city || <span className="text-slate-300">—</span>}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-semibold text-slate-500 hover:text-blue-700 text-xs uppercase tracking-wide hidden lg:flex"
        >
          Joined <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-slate-500 hidden lg:block">
          {new Date(row.original.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => null,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(user)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>

              <DialogContent className="w-[95vw] sm:max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-blue-100 shadow-2xl p-0 bg-white">
                {selectedUser && (
                  <>
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-6 rounded-t-2xl relative overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)",
                        }}
                      />
                      <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-lg border border-white/30">
                            {getInitials(selectedUser.name)}
                          </div>
                          <div>
                            <DialogTitle className="text-xl font-bold text-white leading-tight">
                              {selectedUser.name}
                            </DialogTitle>
                            <p className="text-blue-200 text-sm capitalize">
                              {selectedUser.role}
                            </p>
                          </div>
                        </div>
                      </DialogHeader>
                    </div>

                    <div className="p-6 space-y-4 bg-slate-50">
                      <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                        <div className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-medium">
                              Email Address
                            </p>
                            <p className="text-sm font-medium text-slate-800">
                              {selectedUser.email}
                            </p>
                          </div>
                        </div>

                        {selectedUser.phone && (
                          <div className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                              <Phone className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-medium">
                                Phone
                              </p>
                              <p className="text-sm font-medium text-slate-800">
                                {selectedUser.phone}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedUser.address && (
                          <div className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 font-medium">
                                Address
                              </p>
                              <p className="text-sm font-medium text-slate-800">
                                {selectedUser.address}
                              </p>
                              {selectedUser.city && selectedUser.zip_code && (
                                <p className="text-xs text-slate-500">
                                  {selectedUser.city}, {selectedUser.zip_code}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-medium">
                              Member Since
                            </p>
                            <p className="text-sm font-medium text-slate-800">
                              {new Date(
                                selectedUser.created_at,
                              ).toLocaleDateString("en-US", {
                                month: "long",
                                day: "2-digit",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl h-10"
                        onClick={() => setSelectedUser(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { columnFilters, globalFilter, rowSelection },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
  })

  if (loading) {
    return (
      <div className={`flex min-h-screen w-full bg-slate-50 ${dmSans.className}`}>
        <ProtectedNav userRole="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 bg-white rounded-2xl border border-blue-100 shadow-xl px-10 py-10">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-slate-800">
                Loading Customers
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Fetching customer data...
              </p>
            </div>
            <div className="flex gap-1.5 mt-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen w-full bg-slate-50 ${dmSans.className}`}>
      <ProtectedNav userRole="admin" />
      <div className={`flex-1 min-w-0 ${isDesktop ? "ml-0" : "ml-72"}`}>
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-full space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-6 rounded-full bg-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                    Admin Panel
                  </span>
                </div>
                <h1 className={`${playfair.className} text-3xl font-bold text-slate-900`}>
                  Customer Management
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  View and manage all customer accounts
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-xl border border-blue-100 shadow-sm px-5 py-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <UsersIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium leading-none mb-0.5">
                    Total Customers
                  </p>
                  <p className="text-xl font-bold text-blue-700 leading-none">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search customers..."
                    value={globalFilter || ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:border-blue-400 text-slate-700 placeholder:text-slate-400"
                  />
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {table.getFilteredRowModel().rows.length} of {users.length} shown
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      {table.getHeaderGroups().map((hg) =>
                        hg.headers.map((header) => (
                          <th key={header.id} className="text-left px-5 py-3">
                            {header.isPlaceholder
                              ? null
                              : typeof header.column.columnDef.header === "function"
                                ? header.column.columnDef.header(header.getContext())
                                : header.column.columnDef.header}
                          </th>
                        )),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row, i) => (
                      <tr
                        key={row.id}
                        className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors duration-150 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-5 py-3.5">
                            {typeof cell.column.columnDef.cell === "function"
                              ? cell.column.columnDef.cell(cell.getContext())
                              : (cell.getValue() as React.ReactNode)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {table.getRowModel().rows.length === 0 && (
                <div className="flex flex-col items-center py-16 text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <User2 className="w-7 h-7 text-blue-300" />
                  </div>
                  <p className="font-semibold text-slate-600">No customers found</p>
                  {globalFilter && (
                    <p className="text-sm text-slate-400 mt-1">
                      Try a different search term
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}