import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64 and store in MongoDB
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = file.type
    const dataUrl = `data:${mimeType};base64,${base64}`

    // Store in MongoDB images collection
    const db = await getDb()
    const result = await db.collection("images").insertOne({
      filename: file.name,
      mimeType,
      data: dataUrl,
      createdAt: new Date().toISOString(),
    })

    const imageUrl = `/api/images/${result.insertedId.toString()}`

    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error("POST /api/upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
