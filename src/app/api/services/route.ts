import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

function getAuthToken(request: NextRequest): string | null {
    const authHeader = request.headers.get("authorization")
    const cookieToken = request.cookies.get("auth_token")?.value

    return authHeader?.replace("Bearer ", "") || cookieToken || null
}

// GET ALL
export async function GET(req: NextRequest) {
    try {
        const query = req.nextUrl.searchParams.toString()
        const token = getAuthToken(req)

        const res = await fetch(
            `${API_URL}/api/services?${query}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    ...(token && {
                        Authorization: `Bearer ${token}`,
                    }),
                },
                cache: "no-store",
            }
        )

        const data = await res.json()

        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        return NextResponse.json(
            { message: "GET services failed", err },
            { status: 500 }
        )
    }
}

// CREATE
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const token = getAuthToken(req)

        const res = await fetch(
            `${API_URL}/api/services`,
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    ...(token && {
                        Authorization: `Bearer ${token}`,
                    }),
                },
                body: formData,
            }
        )

        const data = await res.json()

        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        return NextResponse.json(
            { message: "CREATE service failed", err },
            { status: 500 }
        )
    }
}