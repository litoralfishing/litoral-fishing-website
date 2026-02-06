import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { isAuthenticated } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function PUT(request: Request) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const body = await request.json()
    const { ids, hidden } = body as { ids: string[]; hidden: boolean }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing product IDs" }, { status: 400 })
    }

    const objectIds = ids.map((id) => new ObjectId(id))

    await db.collection("products").updateMany(
      { _id: { $in: objectIds } },
      {
        $set: {
          hidden,
          updatedAt: new Date().toISOString(),
        },
      }
    )

    return NextResponse.json({ success: true, count: ids.length })
  } catch (error) {
    console.error("PUT /api/products/bulk error:", error)
    return NextResponse.json(
      { error: "Failed to update products" },
      { status: 500 }
    )
  }
}
