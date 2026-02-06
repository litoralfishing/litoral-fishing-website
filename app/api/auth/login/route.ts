import { NextResponse } from "next/server"
import { validateCredentials, setSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!validateCredentials(username, password)) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 })
    }

    await setSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/auth/login error:", error)
    return NextResponse.json({ error: "Error al iniciar sesion" }, { status: 500 })
  }
}
