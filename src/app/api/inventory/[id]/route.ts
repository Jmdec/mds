import { NextRequest, NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  console.warn("API_URL environment variable is not set")
}

type Context = {
  params: Promise<{ id: string }>
}

// GET /api/inventory/:id
export async function GET(req: NextRequest, { params }: Context) {
  try {
    const token = getAuthToken(req)
    const { id } = await params

    if (!API_URL) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      )
    }

    if (!id) {
      return NextResponse.json(
        { message: "Item ID is required" },
        { status: 400 }
      )
    }

    const res = await fetch(`${API_URL}/api/inventories/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { message: "Inventory item not found" },
          { status: 404 }
        )
      }
      console.error(`Backend returned ${res.status} for GET /api/inventories/${id}`)
      return NextResponse.json(
        { message: "Failed to fetch inventory item" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    return NextResponse.json(
      { message: "Failed to fetch inventory item" },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/:id
export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const token = getAuthToken(req)
    const { id } = await params
    const body = await req.json()

    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL is not configured")
      return NextResponse.json(
        { message: "Server not configured. Please set NEXT_PUBLIC_API_URL environment variable." },
        { status: 500 }
      )
    }

    if (!id) {
      return NextResponse.json(
        { message: "Item ID is required" },
        { status: 400 }
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

    console.log(`Putting to: ${API_URL}/api/inventories/${id}`, body)

    const res = await fetch(`${API_URL}/api/inventories/${id}`, {
      method: "PUT",
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
      if (res.status === 404) {
        return NextResponse.json(
          { message: "Inventory item not found" },
          { status: 404 }
        )
      }
      console.error(
        `Backend returned ${res.status} for PUT /api/inventories/${id}`,
        data
      )
      return NextResponse.json(
        data || { message: "Failed to update inventory item" },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Error updating inventory item:", errorMessage)
    return NextResponse.json(
      { message: `Failed to update inventory item: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/:id
export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const token = getAuthToken(req)
    const { id } = await params

    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL is not configured")
      return NextResponse.json(
        { message: "Server not configured. Please set NEXT_PUBLIC_API_URL environment variable." },
        { status: 500 }
      )
    }

    if (!id) {
      return NextResponse.json(
        { message: "Item ID is required" },
        { status: 400 }
      )
    }

    console.log(`Deleting: ${API_URL}/api/inventories/${id}`)

    const res = await fetch(`${API_URL}/api/inventories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
    })

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { message: "Inventory item not found" },
          { status: 404 }
        )
      }
      const text = await res.text()
      let error
      try {
        error = JSON.parse(text)
      } catch {
        error = { message: text || "Failed to delete item" }
      }
      console.error(
        `Backend returned ${res.status} for DELETE /api/inventories/${id}`,
        error
      )
      return NextResponse.json(
        error || { message: "Failed to delete inventory item" },
        { status: res.status }
      )
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Error deleting inventory item:", errorMessage)
    return NextResponse.json(
      { message: `Failed to delete inventory item: ${errorMessage}` },
      { status: 500 }
    )
  }
}