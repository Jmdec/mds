import { getAuthToken } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const token = getAuthToken(request)

    const res = await fetch(`${API_URL}/api/bookings/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    })

    const data = await res.json() as Record<string, unknown>
    return NextResponse.json(data, { status: res.status })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to get bookings"
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const token = getAuthToken(request)
    const formData = await request.formData()

    formData.append("_method", "PUT")

    const res = await fetch(`${API_URL}/api/bookings/${id}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    })

    const data = await res.json() as Record<string, unknown>
    return NextResponse.json(data, { status: res.status })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update bookings"
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = getAuthToken(request)
    const body = await request.json() as Record<string, unknown>

    const response = await fetch(`${API_URL}/api/bookings/${params.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json() as Record<string, unknown>
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ message: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = getAuthToken(request)

    const response = await fetch(`${API_URL}/api/bookings/${params.id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    })

    const data = await response.json() as Record<string, unknown>
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ message: "Failed to delete booking" }, { status: 500 })
  }
}