import { cookies } from "next/headers"
import { decrypt, encrypt } from "@/lib/crypto"
import { jwtDecode } from "jwt-decode"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")?.value

    if (!sessionCookie) {
      return new Response(JSON.stringify({ detail: "No session" }), { status: 401 })
    }

    const session = await decrypt(sessionCookie)
    if (!session.refreshToken) {
      return new Response(JSON.stringify({ detail: "No refresh token" }), { status: 401 })
    }
    const response = await fetch(`${process.env.FAST_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ detail: "Refresh failed" }), { status: 401 })
    }

    const data = await response.json()
    const newAccessToken = data.access_token
    const decoded: any = jwtDecode(newAccessToken)
    const updatedSession = {
      ...session,
      token: newAccessToken,
      userId: decoded.sub,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }

    const encrypted = await encrypt(updatedSession)
    cookieStore.set({
      name: "session",
      value: encrypted,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
      domain: "unkit.site",
    })

    return new Response(JSON.stringify({ message: "Token refreshed" }), { status: 200 })
  } catch (err) {
    console.error("Refresh error:", err)
    return new Response(JSON.stringify({ detail: "Server error" }), { status: 500 })
  }
}
