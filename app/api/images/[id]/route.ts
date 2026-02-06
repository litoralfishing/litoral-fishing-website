import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()
    const image = await db.collection("images").findOne({ _id: new ObjectId(id) })

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Parse data URL
    const matches = image.data.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 500 })
    }

    const mimeType = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, "base64")

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("GET /api/images/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
  }
}
