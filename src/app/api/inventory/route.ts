import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/inventory
export async function GET(req: NextRequest) {
  if (!API_URL) {
    console.error("[inventory] NEXT_PUBLIC_API_URL is not set");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 },
    );
  }

  const token = getAuthToken(req);
  console.log(
    "[inventory GET] token:",
    token ?? "null — check cookie name in DevTools",
  );

  try {
    const res = await fetch(`${API_URL}/api/inventories`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    console.log(`[inventory GET] backend ${res.status}:`, text.slice(0, 300));

    if (!res.ok) {
      return NextResponse.json(
        { message: `Backend error: ${res.status}`, detail: text },
        { status: res.status },
      );
    }

    const data = JSON.parse(text);
    return NextResponse.json(Array.isArray(data) ? data : [], { status: 200 });
  } catch (err) {
    console.error("[inventory GET] fetch failed:", err);
    return NextResponse.json(
      { message: "Could not reach backend", detail: String(err) },
      { status: 502 },
    );
  }
}

// POST /api/inventory
export async function POST(req: NextRequest) {
  if (!API_URL) {
    console.error("[inventory] NEXT_PUBLIC_API_URL is not set");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 },
    );
  }

  const token = getAuthToken(req);
  console.log("[inventory POST] token:", token ?? "null");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }

  const { item_name, quantity } = body as Record<string, unknown>;

  if (!item_name || String(item_name).trim() === "") {
    return NextResponse.json(
      { message: "Item name is required" },
      { status: 400 },
    );
  }
  if (quantity === undefined || quantity === null) {
    return NextResponse.json(
      { message: "Quantity is required" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${API_URL}/api/inventories`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log(`[inventory POST] backend ${res.status}:`, text.slice(0, 300));

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text || "Invalid response from backend" };
    }

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[inventory POST] fetch failed:", err);
    return NextResponse.json(
      { message: "Could not reach backend", detail: String(err) },
      { status: 502 },
    );
  }
}
