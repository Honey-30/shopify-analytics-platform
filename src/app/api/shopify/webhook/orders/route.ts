import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get shop domain from headers (Shopify sends this)
    const shopDomain = request.headers.get('x-shopify-shop-domain')
    
    if (!shopDomain) {
      return NextResponse.json({ error: 'Missing shop domain' }, { status: 400 })
    }

    // Find tenant by shop domain
    const tenant = await prisma.tenant.findUnique({
      where: { shopDomain }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Process order webhook
    const order = body
    
    // Find or create customer
    let customer = null
    if (order.customer) {
      customer = await prisma.customer.upsert({
        where: {
          tenantId_shopifyCustomerId: {
            tenantId: tenant.id,
            shopifyCustomerId: order.customer.id.toString()
          }
        },
        update: {
          email: order.customer.email,
          firstName: order.customer.first_name,
          lastName: order.customer.last_name,
          phone: order.customer.phone,
        },
        create: {
          tenantId: tenant.id,
          shopifyCustomerId: order.customer.id.toString(),
          email: order.customer.email,
          firstName: order.customer.first_name,
          lastName: order.customer.last_name,
          phone: order.customer.phone,
        }
      })
    }

    // Create or update order
    await prisma.order.upsert({
      where: {
        tenantId_shopifyOrderId: {
          tenantId: tenant.id,
          shopifyOrderId: order.id.toString()
        }
      },
      update: {
        orderNumber: order.order_number?.toString() || order.name,
        customerId: customer?.id,
        customerEmail: order.email,
        totalPrice: parseFloat(order.total_price),
        subtotalPrice: parseFloat(order.subtotal_price),
        totalTax: parseFloat(order.total_tax || 0),
        currency: order.currency,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        lineItemsCount: order.line_items?.length || 0,
        orderDate: new Date(order.created_at),
      },
      create: {
        tenantId: tenant.id,
        shopifyOrderId: order.id.toString(),
        orderNumber: order.order_number?.toString() || order.name,
        customerId: customer?.id,
        customerEmail: order.email,
        totalPrice: parseFloat(order.total_price),
        subtotalPrice: parseFloat(order.subtotal_price),
        totalTax: parseFloat(order.total_tax || 0),
        currency: order.currency,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        lineItemsCount: order.line_items?.length || 0,
        orderDate: new Date(order.created_at),
      }
    })

    // Update customer stats if customer exists
    if (customer) {
      const stats = await prisma.order.aggregate({
        where: {
          tenantId: tenant.id,
          customerId: customer.id,
          financialStatus: 'paid'
        },
        _sum: {
          totalPrice: true
        },
        _count: true
      })

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          totalSpent: stats._sum.totalPrice || 0,
          ordersCount: stats._count
        }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
