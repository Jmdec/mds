import { NextRequest } from "next/server"

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  const cookieToken = request.cookies.get("auth_token")?.value

  return authHeader?.replace("Bearer ", "") || cookieToken || null
}