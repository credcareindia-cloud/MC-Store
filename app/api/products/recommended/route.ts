import { NextRequest, NextResponse } from "next/server"
import { getRelatedProducts } from "@/lib/services/product-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const excludeId = searchParams.get('excludeId')
    const limit = parseInt(searchParams.get('limit') || '8')

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const products = await getRelatedProducts(
      Number(categoryId),
      excludeId ? Number(excludeId) : 0,
      limit
    )

    return NextResponse.json({ 
      products,
      total: products.length 
    })
  } catch (error) {
    console.error('Error fetching recommended products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommended products' },
      { status: 500 }
    )
  }
}
