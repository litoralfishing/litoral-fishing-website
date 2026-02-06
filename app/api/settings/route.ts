import { NextResponse } from "next/server"
import { getDb, ensureIndexes } from "@/lib/mongodb"
import { isAuthenticated } from "@/lib/auth"

export async function GET() {
  try {
    await ensureIndexes()
    const db = await getDb()
    const settings = await db.collection("settings").findOne({ type: "site" })

    const response = NextResponse.json(
      settings || { logoUrl: "", whatsappNumber: "" }
    )
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    )
    return response
  } catch (error) {
    console.error("GET /api/settings error:", error)
    return NextResponse.json(
      { logoUrl: "", whatsappNumber: "" },
      { status: 200 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const body = await request.json()

    await db.collection("settings").updateOne(
      { type: "site" },
      {
        $set: {
          ...body,
          type: "site",
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/settings error:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
