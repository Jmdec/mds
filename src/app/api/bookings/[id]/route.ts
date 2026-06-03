import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Params = {
  params: Promise<{ id: string }>;
};

/** Read token from Authorization header OR cookie — whichever is present */
function extractToken(request: NextRequest): string {
  // 1. Authorization: Bearer <token> header (sent by frontend fetch calls)
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) return authHeader;

  // 2. Fallback: cookie named "token" or "auth_token"
  const cookie =
    request.cookies.get("token")?.value ||
    request.cookies.get("auth_token")?.value ||
    "";
  if (cookie) return `Bearer ${cookie}`;

  return "";
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = extractToken(request);

    const res = await fetch(`${API_URL}/api/bookings/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: token,
      },
      cache: "no-store",
    });

    const data = (await res.json()) as Record<string, unknown>;
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to get booking";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = extractToken(request);
    const formData = await request.formData();

    formData.append("_method", "PUT");

    const res = await fetch(`${API_URL}/api/bookings/${id}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: token,
      },
      body: formData,
    });

    const data = (await res.json()) as Record<string, unknown>;
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update booking";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = extractToken(request);
    const body = (await request.json()) as Record<string, unknown>;

    const response = await fetch(`${API_URL}/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as Record<string, unknown>;
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to update booking status";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = extractToken(request);

    const response = await fetch(`${API_URL}/api/bookings/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: token,
      },
    });

    const data = (await response.json()) as Record<string, unknown>;
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete booking";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
