import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const shopDomain = request.headers.get('x-shopify-shop-domain')
    
    if (!shopDomain) {
      return NextResponse.json({ error: 'Missing shop domain' }, { status: 400 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { shopDomain }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const product = body

    // Create or update product
    await prisma.product.upsert({
      where: {
        tenantId_shopifyProductId: {
          tenantId: tenant.id,
          shopifyProductId: product.id.toString()
        }
      },
      update: {
        title: product.title,
        description: product.body_html,
        vendor: product.vendor,
        productType: product.product_type,
        price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : 0,
        compareAtPrice: product.variants?.[0]?.compare_at_price ? parseFloat(product.variants[0].compare_at_price) : null,
        inventory: product.variants?.[0]?.inventory_quantity || 0,
        sku: product.variants?.[0]?.sku,
        imageUrl: product.image?.src,
        status: product.status,
      },
      create: {
        tenantId: tenant.id,
        shopifyProductId: product.id.toString(),
        title: product.title,
        description: product.body_html,
        vendor: product.vendor,
        productType: product.product_type,
        price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : 0,
        compareAtPrice: product.variants?.[0]?.compare_at_price ? parseFloat(product.variants[0].compare_at_price) : null,
        inventory: product.variants?.[0]?.inventory_quantity || 0,
        sku: product.variants?.[0]?.sku,
        imageUrl: product.image?.src,
        status: product.status,
      }
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Product webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
