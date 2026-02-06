import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

const SEED_PRODUCTS = [
  // ── Pesca ──
  {
    name: "Cana Telescopica Marine Sport 3.60m",
    code: "PES-001",
    category: "Pesca",
    description: "Cana telescopica de fibra de vidrio, 7 tramos. Ideal para pesca en rio y laguna. Accion media.",
    price: 28500,
    hidden: false,
  },
  {
    name: "Reel Frontal Shimano FX 2500",
    code: "PES-002",
    category: "Pesca",
    description: "Reel frontal con 3 rulemanes, carrete de grafito. Capacidad 0.25mm/200m. Freno delantero.",
    price: 45000,
    hidden: false,
  },
  {
    name: "Multifilamento Power Pro 0.23mm x 275m",
    code: "PES-003",
    category: "Pesca",
    description: "Linea multifilamento trenzada de alta resistencia. Resistencia 15kg. Color verde musgo.",
    price: 32000,
    hidden: false,
  },
  {
    name: "Anzuelos Mustad Serie 92611 Caja x100",
    code: "PES-004",
    category: "Pesca",
    description: "Anzuelos niquelados punta quimica. Tamano 2/0. Ideales para variada y dorado.",
    price: 8900,
    hidden: false,
  },
  {
    name: "Señuelo Rapala X-Rap 10cm",
    code: "PES-005",
    category: "Pesca",
    description: "Señuelo de pesca suspending, cuerpo internamente pesado. Profundidad 0.9-1.5m. Accion errática.",
    price: 18500,
    hidden: false,
  },
  // ── Caza ──
  {
    name: "Mira Telescopica Bushnell 3-9x40",
    code: "CAZ-001",
    category: "Caza",
    description: "Mira telescopica con reticula duplex iluminada. Tubo de 25mm con tratamiento multi-coated.",
    price: 125000,
    hidden: false,
  },
  {
    name: "Chaleco de Caza Camuflado Realtree",
    code: "CAZ-002",
    category: "Caza",
    description: "Chaleco con patron camuflado Realtree Edge. Multiples bolsillos. Tela ripstop respirable.",
    price: 35000,
    hidden: false,
  },
  {
    name: "Binocular Vortex Crossfire 10x42",
    code: "CAZ-003",
    category: "Caza",
    description: "Binocular compacto con optica multi-coated. Campo visual 100m. Resistente al agua y niebla.",
    price: 185000,
    hidden: false,
  },
  {
    name: "Cuchillo de Monte Tramontina 8 Pulgadas",
    code: "CAZ-004",
    category: "Caza",
    description: "Cuchillo con hoja de acero inoxidable y cabo de madera natural. Funda de cuero incluida.",
    price: 22000,
    hidden: false,
  },
  // ── Camping ──
  {
    name: "Carpa Iglu Waterdog 4 Personas",
    code: "CAM-001",
    category: "Camping",
    description: "Carpa iglu doble techo, 3000mm columna de agua. Varillas de fibra de vidrio. Bolso incluido.",
    price: 95000,
    hidden: false,
  },
  {
    name: "Bolsa de Dormir Doite -5C Compact",
    code: "CAM-002",
    category: "Camping",
    description: "Bolsa de dormir momia con relleno sintetico. Temperatura confort 0C, extrema -5C. Peso 1.2kg.",
    price: 68000,
    hidden: false,
  },
  {
    name: "Cocinilla Camping Gas Doble Hornalla",
    code: "CAM-003",
    category: "Camping",
    description: "Cocinilla portatil a gas con doble hornalla. Encendido piezoelectrico. Incluye maletin.",
    price: 42000,
    hidden: false,
  },
  {
    name: "Conservadora Termica Coleman 28L",
    code: "CAM-004",
    category: "Camping",
    description: "Conservadora rigida con aislacion de espuma PU. Mantiene frio hasta 48hs. Tapa con portavasos.",
    price: 55000,
    hidden: false,
  },
  {
    name: "Mesa Plegable Aluminio 120x60cm",
    code: "CAM-005",
    category: "Camping",
    description: "Mesa plegable ultraliviana de aluminio con bolso de transporte. Altura regulable.",
    price: 48000,
    hidden: false,
  },
  // ── Outdoor ──
  {
    name: "Linterna Frontal LED Recargable 800lm",
    code: "OUT-001",
    category: "Outdoor",
    description: "Linterna frontal con sensor de movimiento. 5 modos de luz. Bateria recargable USB-C 1200mAh.",
    price: 15500,
    hidden: false,
  },
  {
    name: "Mochila Trekking 55L Impermeable",
    code: "OUT-002",
    category: "Outdoor",
    description: "Mochila de trekking con espaldar ventilado, cobertor de lluvia y multiples compartimentos.",
    price: 78000,
    hidden: false,
  },
  {
    name: "Kit de Supervivencia 15 en 1",
    code: "OUT-003",
    category: "Outdoor",
    description: "Kit compacto con brujula, pedernal, silbato, sierra, manta termica y mas. Estuche waterproof.",
    price: 12000,
    hidden: false,
  },
  {
    name: "Botella Termica Acero Inox 1L",
    code: "OUT-004",
    category: "Outdoor",
    description: "Botella de doble pared en acero inoxidable. Mantiene frio 24hs y caliente 12hs. Libre de BPA.",
    price: 18000,
    hidden: false,
  },
]

export async function POST() {
  try {
    const db = await getDb()
    const existing = await db.collection("products").countDocuments()

    if (existing > 0) {
      return NextResponse.json(
        { message: `Ya existen ${existing} productos en la base de datos. Seed cancelado.`, seeded: false },
        { status: 200 }
      )
    }

    const now = new Date().toISOString()
    const docs = SEED_PRODUCTS.map((p) => ({
      ...p,
      createdAt: now,
      updatedAt: now,
    }))

    const result = await db.collection("products").insertMany(docs)

    return NextResponse.json({
      message: `${result.insertedCount} productos creados exitosamente.`,
      seeded: true,
      count: result.insertedCount,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: "Error al crear productos de ejemplo" },
      { status: 500 }
    )
  }
}
