import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    const db = await getDb()

    const filePath = path.join(process.cwd(), "data", "products.json")
    const rawProducts = JSON.parse(fs.readFileSync(filePath, "utf8"))

    // eliminar duplicados por code
    const seen = new Set()
    const products = rawProducts.filter(p => {
      if (!p.code) return false
      if (seen.has(p.code)) return false
      seen.add(p.code)
      return true
    })

    console.log("Productos originales:", rawProducts.length)
    console.log("Productos únicos:", products.length)


    // borrar productos existentes
    await db.collection("products").deleteMany({})

    // insertar nuevos
    if (products.length > 0) {
      await db.collection("products").insertMany(products)
    }
    // Convertir Fechas
    products.forEach(p => {
      p.createdAt = new Date()
      p.updatedAt = new Date()
    })


    return NextResponse.json({
      success: true,
      inserted: products.length,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Seed failed" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST()
}


