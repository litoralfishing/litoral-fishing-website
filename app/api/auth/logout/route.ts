import { NextResponse } from "next/server"
import { clearSession } from "@/lib/auth"

export async function POST() {
  try {
    await clearSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/auth/logout error:", error)
    return NextResponse.json({ error: "Error al cerrar sesion" }, { status: 500 })
  }
}
