// app/api/facilities/route.ts

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken(req: NextRequest): string | null {
  return req.headers.get("authorization")?.replace("Bearer ", "") ?? null;
}

/* ── GET /api/facilities ── */
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/facilities`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[GET /api/facilities]", err);
    return NextResponse.json(
      { message: "Server Error", detail: String(err) },
      { status: 500 },
    );
  }
}

/* ── POST /api/facilities ── (create) */
export async function POST(req: NextRequest) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json(
        { message: "Unauthenticated." },
        { status: 401 },
      );
    }

    const formData = await req.formData();

    const res = await fetch(`${API_URL}/api/facilities`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const text = await res.text();
    console.log("[POST /api/facilities] status:", res.status);
    console.log("[POST /api/facilities] response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[POST /api/facilities]", err);
    return NextResponse.json(
      { message: "Server Error", detail: String(err) },
      { status: 500 },
    );
  }
}
