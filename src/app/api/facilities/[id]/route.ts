// app/api/facilities/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken(req: NextRequest): string | null {
  return req.headers.get("authorization")?.replace("Bearer ", "") ?? null;
}

type Params = { params: { id: string } };

/* ── GET /api/facilities/:id ── */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const res = await fetch(`${API_URL}/api/facilities/${params.id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[GET /api/facilities/${params.id}]`, err);
    return NextResponse.json(
      { message: "Server Error", detail: String(err) },
      { status: 500 },
    );
  }
}

/* ── POST /api/facilities/:id ── (Laravel _method=PUT spoofing) */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json(
        { message: "Unauthenticated." },
        { status: 401 },
      );
    }

    const formData = await req.formData();

    const res = await fetch(`${API_URL}/api/facilities/${params.id}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const text = await res.text();
    console.log(`[POST/PUT /api/facilities/${params.id}] status:`, res.status);
    console.log(`[POST/PUT /api/facilities/${params.id}] response:`, text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[POST/PUT /api/facilities/${params.id}]`, err);
    return NextResponse.json(
      { message: "Server Error", detail: String(err) },
      { status: 500 },
    );
  }
}

/* ── DELETE /api/facilities/:id ── */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json(
        { message: "Unauthenticated." },
        { status: 401 },
      );
    }

    const res = await fetch(`${API_URL}/api/facilities/${params.id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await res.text();
    console.log(`[DELETE /api/facilities/${params.id}] status:`, res.status);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[DELETE /api/facilities/${params.id}]`, err);
    return NextResponse.json(
      { message: "Server Error", detail: String(err) },
      { status: 500 },
    );
  }
}
