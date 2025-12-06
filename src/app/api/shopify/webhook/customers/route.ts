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

    const customer = body

    // Create or update customer
    await prisma.customer.upsert({
      where: {
        tenantId_shopifyCustomerId: {
          tenantId: tenant.id,
          shopifyCustomerId: customer.id.toString()
        }
      },
      update: {
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        city: customer.default_address?.city,
        country: customer.default_address?.country,
      },
      create: {
        tenantId: tenant.id,
        shopifyCustomerId: customer.id.toString(),
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        city: customer.default_address?.city,
        country: customer.default_address?.country,
      }
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Customer webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
