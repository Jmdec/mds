import { getAuthToken } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// GET ALL CASES
export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)

    const res = await fetch(`${API_URL}/api/cases`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch cases", err },
      { status: 500 }
    )
  }
}

// CREATE CASE
export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    const formData = await request.formData()

    const res = await fetch(`${API_URL}/api/cases`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to create case", err },
      { status: 500 }
    )
  }
}