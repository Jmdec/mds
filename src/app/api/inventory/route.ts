import { NextRequest, NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  console.warn("API_URL environment variable is not set")
}

// GET /api/inventory
export async function GET(req: NextRequest) {
  try {
    const token = getAuthToken(req)

    if (!API_URL) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      )
    }

    const res = await fetch(`${API_URL}/api/inventories`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      console.error(`Backend returned ${res.status} for GET /api/inventories`)
      return NextResponse.json(
        { message: "Failed to fetch inventory from backend" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      { message: "Failed to fetch inventory" },
      { status: 500 }
    )
  }
}

// POST /api/inventory
export async function POST(req: NextRequest) {
  try {
    const token = getAuthToken(req)
    const body = await req.json()

    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL is not configured")
      return NextResponse.json(
        { message: "Server not configured. Please set NEXT_PUBLIC_API_URL environment variable." },
        { status: 500 }
      )
    }

    // Basic validation
    if (!body.item_name || body.item_name.trim() === "") {
      return NextResponse.json(
        { message: "Item name is required" },
        { status: 400 }
      )
    }

    if (body.quantity === undefined || body.quantity === null) {
      return NextResponse.json(
        { message: "Quantity is required" },
        { status: 400 }
      )
    }

    console.log(`Posting to: ${API_URL}/api/inventories`, body)

    const res = await fetch(`${API_URL}/api/inventories`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const text = await res.text()
    let data

    try {
      data = JSON.parse(text)
    } catch {
      console.error(`Failed to parse response as JSON: ${text}`)
      data = { message: text || "Invalid response from backend" }
    }

    if (!res.ok) {
      console.error(
        `Backend returned ${res.status} for POST /api/inventories`,
        data
      )
      return NextResponse.json(
        data || { message: "Failed to create inventory item" },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Error creating inventory item:", errorMessage)
    return NextResponse.json(
      { message: `Failed to create inventory item: ${errorMessage}` },
      { status: 500 }
    )
  }
}