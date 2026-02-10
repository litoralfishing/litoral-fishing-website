import { NextResponse } from "next/server"
import { getDb, ensureIndexes } from "@/lib/mongodb"
import { isAuthenticated } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    await ensureIndexes()
    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const showHidden = searchParams.get("showHidden") === "true"

    const filter = showHidden ? {} : { hidden: { $ne: true } }

    // Only project the fields we need for the list view (exclude heavy image data)
    const listProjection = showHidden
      ? undefined // Admin needs all fields
      : { name: 1, code: 1, category: 1, description: 1, price: 1, image: 1, hidden: 1, createdAt: 1 }

    const products = await db
      .collection("products")
      .find(filter, listProjection ? { projection: listProjection } : {})
      .sort({ createdAt: -1 })
      .toArray()

    const response = NextResponse.json(
      products.map((p) => ({ ...p, _id: p._id.toString() }))
    )

    // Public catalog can be cached briefly; admin calls are dynamic
    if (!showHidden) {
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=30, stale-while-revalidate=60"
      )
    }

    return response
  } catch (error) {
    console.error("GET /api/products error:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const body = await request.json()

    if (!body.name?.trim() || !body.code?.trim()) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      )
    }

    const product = {
      name: body.name.trim(),
      code: body.code.trim(),
      category: body.category || "Indumentaria",
      description: body.description?.trim() || "",
      price: body.price ? Number(body.price) : undefined,
      image: body.image || undefined,
      hidden: body.hidden || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection("products").insertOne(product)

    return NextResponse.json(
      { ...product, _id: result.insertedId.toString() },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/products error:", error)
    const message =
      error instanceof Error && error.message.includes("duplicate key")
        ? "A product with that code already exists"
        : "Failed to create product"
    return NextResponse.json({ error: message }, { status: 500 })
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
    const { _id, ...updates } = body

    if (!_id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 })
    }

    updates.updatedAt = new Date().toISOString()
    if (updates.price !== undefined) {
      updates.price = updates.price ? Number(updates.price) : undefined
    }
    if (updates.name) updates.name = updates.name.trim()
    if (updates.code) updates.code = updates.code.trim()
    if (updates.description !== undefined) updates.description = updates.description.trim()

    await db
      .collection("products")
      .updateOne({ _id: new ObjectId(_id) }, { $set: updates })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/products error:", error)
    const message =
      error instanceof Error && error.message.includes("duplicate key")
        ? "A product with that code already exists"
        : "Failed to update product"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 })
    }

    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/products error:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
