import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";

  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  if (!API_URL) {
    return NextResponse.json(
      { success: false, message: "NEXT_PUBLIC_API_URL is not configured." },
      { status: 500 },
    );
  }

  try {
    // ✅ Hits the ADMIN endpoint — returns ALL bookings, not just the current user's
    const response = await fetch(`${API_URL}/api/bookings`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Failed to fetch bookings.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, ...data }, { status: 200 });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch bookings.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
